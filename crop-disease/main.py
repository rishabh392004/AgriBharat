import os
import io
import json
import base64
import requests
import cv2
import numpy as np
from PIL import Image
from dotenv import load_dotenv

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from google import genai
from google.genai import types
from ultralytics import YOLO

# --- ENVIRONMENT & API SETUP ---
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print("Loaded Key Prefix:", GEMINI_API_KEY[:8] if GEMINI_API_KEY else "KEY NOT FOUND")

ai_client = genai.Client(api_key=GEMINI_API_KEY)

# --- YOLO UPSTREAM DETECTOR ---
print("Initializing YOLO upstream validator...")
yolo_detector = YOLO("yolov8n.pt")
print("YOLO validator ready!")


# --- LOCAL PURE-CV LEAF VS. TEXTILE / TOWEL VALIDATOR ---
def is_organic_leaf_texture(pil_img: Image.Image) -> tuple[bool, str]:
    """
    Pure local rejection using CIELAB chromatic dispersion and Fourier frequency.
    Zero external APIs, runs in <5ms on CPU.
    """
    img_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    h, w, _ = img_bgr.shape

    # 1. CIELAB Chromatic Dispersion
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)

    a_std = float(np.std(a))
    b_std = float(np.std(b))

    # Towels/shirts have unnaturally flat chroma standard deviations
    if a_std < 3.2 and b_std < 4.5:
        return False, f"Flat synthetic dye detected (a_std: {a_std:.2f}, b_std: {b_std:.2f})"

    # 2. Textile Grid Detection via 2D Fast Fourier Transform (FFT)
    # Fabrics (towels, shirts) have repeating woven yarn loops or stitch patterns.
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    resized_gray = cv2.resize(gray, (256, 256))

    f_transform = np.fft.fft2(resized_gray)
    f_shift = np.fft.fftshift(f_transform)
    magnitude_spectrum = 20 * np.log(np.abs(f_shift) + 1)

    # Mask out the DC component (low frequencies at the center)
    center = 128
    magnitude_spectrum[center - 10:center + 10, center - 10:center + 10] = 0

    # Periodic woven grid creates unnatural high-frequency spikes
    threshold = np.mean(magnitude_spectrum) + 3.2 * np.std(magnitude_spectrum)
    peak_count = int(np.count_nonzero(magnitude_spectrum > threshold))

    if peak_count > 100:
        return False, f"Periodic woven fabric grid detected via FFT (peaks: {peak_count})"

    # 3. Chlorophyll Spectrum Dispersion
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    h_channel = hsv[:, :, 0]
    green_pixels = h_channel[(h_channel >= 25) & (h_channel <= 85)]

    if len(green_pixels) > 0:
        # Natural leaves have a broad chlorophyll hue spread; dyed cloths peak sharply
        if np.std(green_pixels) < 4.2:
            return False, f"Monochromatic synthetic dye hue spread (hue_std: {np.std(green_pixels):.2f})"

    return True, "Valid organic foliage"


def verify_and_crop_leaf_yolo(pil_img: Image.Image) -> tuple[bool, Image.Image, dict]:
    """
    Tier-1 Guard: Rejects towels, clothing, backgrounds, and non-leaf objects.
    Extracts leaf bounding box if detected.
    """
    img_np = np.array(pil_img)
    img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
    h, w, _ = img_np.shape

    # 1. First Pass: Color & Texture Filter (Rejects Towels, Cloths, Monochromatic Surfaces)
    is_organic, texture_reason = is_organic_leaf_texture(pil_img)
    if not is_organic:
        return False, pil_img, {
            "rejection_reason": texture_reason,
            "stage": "organic_texture_filter"
        }

    # 2. Second Pass: Green Foliage Coverage Check
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    foliage_mask = cv2.inRange(hsv, np.array([20, 30, 25]), np.array([95, 255, 255]))
    foliage_coverage = float(np.count_nonzero(foliage_mask) / (h * w))

    if foliage_coverage < 0.08:
        return False, pil_img, {
            "rejection_reason": "Insufficient plant foliage detected in image frame.",
            "foliage_coverage": round(foliage_coverage, 3),
            "stage": "foliage_coverage_check"
        }

    # 3. Third Pass: YOLO Bounding Check & Rejection of Distractors (People, Furniture)
    results = yolo_detector(img_bgr, verbose=False)[0]
    detected_classes = [int(cls) for cls in results.boxes.cls.tolist()] if results.boxes else []

    # If YOLO clearly finds a person or furniture with minimal foliage, reject
    if (0 in detected_classes) and foliage_coverage < 0.20:
        return False, pil_img, {
            "rejection_reason": "Human or clothing detected as primary subject.",
            "stage": "yolo_object_check"
        }

    # 4. Optional Crop if Potted Plant (COCO ID: 58) is isolated
    target_img = pil_img
    crop_applied = False
    if len(results.boxes) > 0:
        for box, cls_id in zip(results.boxes.xyxy.tolist(), detected_classes):
            if cls_id == 58:
                x1, y1, x2, y2 = map(int, box)
                pad_x = int((x2 - x1) * 0.08)
                pad_y = int((y2 - y1) * 0.08)
                nx1 = max(0, x1 - pad_x)
                ny1 = max(0, y1 - pad_y)
                nx2 = min(w, x2 + pad_x)
                ny2 = min(h, y2 + pad_y)

                if (nx2 - nx1) > 60 and (ny2 - ny1) > 60:
                    target_img = pil_img.crop((nx1, ny1, nx2, ny2))
                    crop_applied = True
                    break

    return True, target_img, {
        "status": "valid_foliage",
        "foliage_coverage": round(foliage_coverage, 3),
        "yolo_crop_applied": crop_applied
    }


# --- GRAD-CAM ENGINE ---
class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output

        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0]

        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_full_backward_hook(backward_hook)

    def generate_heatmap(self, input_tensor, target_class_idx):
        self.model.zero_grad()
        output = self.model(input_tensor)

        one_hot = torch.zeros_like(output)
        one_hot[0][target_class_idx] = 1.0
        output.backward(gradient=one_hot, retain_graph=True)

        weights = torch.mean(self.gradients, dim=(2, 3), keepdim=True)
        cam = torch.sum(weights * self.activations, dim=1).squeeze()
        cam = F.relu(cam)

        cam_np = cam.detach().cpu().numpy()
        cam_min, cam_max = np.min(cam_np), np.max(cam_np)

        if cam_max - cam_min > 1e-8:
            cam_np = (cam_np - cam_min) / (cam_max - cam_min)
        else:
            cam_np = np.zeros_like(cam_np)

        return cam_np


# --- IMAGE PROCESSING & SEVERITY HELPERS ---
def load_image_safely(byte_data: bytes) -> Image.Image:
    try:
        pil_img = Image.open(io.BytesIO(byte_data))
        pil_img.load()
        return pil_img.convert("RGB")
    except Exception:
        pass

    try:
        nparr = np.frombuffer(byte_data, np.uint8)
        cv_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if cv_img is not None:
            cv_rgb = cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB)
            return Image.fromarray(cv_rgb)
    except Exception:
        pass

    raise HTTPException(status_code=400, detail="Unable to decode image. Please upload a standard JPG, PNG, or WebP file.")


def process_and_validate_image(pil_img: Image.Image):
    img_np = np.array(pil_img)

    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    is_blurry = bool(blur_score < 40.0)

    lab = cv2.cvtColor(img_np, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_eq = clahe.apply(l)
    enhanced_lab = cv2.merge((l_eq, a, b))
    enhanced_pil = Image.fromarray(cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2RGB))

    return enhanced_pil, is_blurry, round(blur_score, 2)


def generate_cam_overlay_base64(pil_img: Image.Image, cam_map: np.ndarray) -> str:
    img_np = np.array(pil_img)
    orig_h, orig_w, _ = img_np.shape

    heatmap = cv2.resize(cam_map, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)
    heatmap = np.uint8(255 * heatmap)
    heatmap_colored = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    overlay = cv2.addWeighted(img_np, 0.65, heatmap_colored, 0.35, 0)
    _, buffer = cv2.imencode('.jpg', cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 90])
    base64_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{base64_str}"


def calculate_disease_severity(pil_img: Image.Image, cam_map: np.ndarray) -> dict:
    img_np = np.array(pil_img)
    orig_h, orig_w, _ = img_np.shape

    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    _, leaf_mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    total_leaf_pixels = int(np.count_nonzero(leaf_mask))
    if total_leaf_pixels == 0:
        total_leaf_pixels = orig_h * orig_w

    cam_resized = cv2.resize(cam_map, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)
    lesion_mask = (cam_resized >= 0.55) & (leaf_mask > 0)
    lesion_pixels = int(np.count_nonzero(lesion_mask))

    affected_ratio = round((lesion_pixels / total_leaf_pixels) * 100, 2)
    affected_ratio = max(1.5, min(affected_ratio, 95.0))

    if affected_ratio < 5.0:
        etl_status = "Below ETL (Monitoring Stage)"
        etl_color = "Green"
        urgency = "LOW"
        action = "Deploy yellow/blue sticky traps. Apply Neem formulation 10,000 PPM (3 ml/L)."
    elif 5.0 <= affected_ratio < 18.0:
        etl_status = "Approaching ETL (Warning Threshold)"
        etl_color = "Amber"
        urgency = "MEDIUM"
        action = "Foliar spray of entomopathogenic bio-pesticides (Beauveria bassiana or Bt) within 36 hours."
    else:
        etl_status = "Breached ETL (Action Threshold)"
        etl_color = "Red"
        urgency = "CRITICAL"
        action = "Immediate targeted chemical insecticide/fungicide spray required across affected crop block."

    return {
        "foliar_damage_percent": affected_ratio,
        "affected_leaf_area_percent": affected_ratio,
        "economic_threshold_status": etl_status,
        "etl_badge_color": etl_color,
        "recommended_urgency": urgency,
        "action_plan": action
    }


def evaluate_weather_risk(lat: float, lon: float, api_key: str = "demo_key"):
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        res = requests.get(url, timeout=2).json()
        temp = res["main"]["temp"]
        humidity = res["main"]["humidity"]
    except Exception:
        temp, humidity = 29.0, 78.0

    sucking_pest_active = (24.0 <= temp <= 34.0) and (40.0 <= humidity <= 70.0)
    borer_vector_active = (22.0 <= temp <= 30.0) and (humidity > 75.0)

    if borer_vector_active:
        outbreak_risk = "HIGH_BORER_VECTOR_RISK"
        forecast = "Warm and humid conditions accelerate caterpillar hatching and vector transmission."
    elif sucking_pest_active:
        outbreak_risk = "ELEVATED_SUCKING_PEST_RISK"
        forecast = "Moderate humidity favors sap-sucking insects like aphids, whiteflies, and thrips."
    else:
        outbreak_risk = "LOW_MONITORING_RISK"
        forecast = "Microclimate is not conducive to rapid pest swarming."

    return {
        "temperature_celsius": temp,
        "humidity_percent": humidity,
        "pest_outbreak_risk": outbreak_risk,
        "climate_pest_forecast": forecast
    }


def generate_gemini_advisory(pred_disease: str, severity_stage: str, weather_risk: str) -> dict:
    prompt = f"""
    You are an expert agricultural entomologist.
    Diagnosed condition: '{pred_disease}'.
    Infestation status: '{severity_stage}'.
    Weather risk: '{weather_risk}'.

    Return an IPM advisory strictly as JSON with this exact key structure:
    {{
      "vernacular_name": "Local Indian common name",
      "pest_vector": "Primary pest or insect vector causing/spreading this (e.g. Whiteflies, Fruit Borer, Aphids)",
      "biological_control": "Organic or biological measure (e.g. Neem oil 10,000 PPM, Trichoderma, pheromone traps)",
      "chemical_control": "Commercial active ingredient with exact water dilution dosage (e.g. Imidacloprid 17.8% SL @ 0.5 ml/L)",
      "mechanical_control": "Field cultural practices (e.g. sticky cards, pruning infected branches)"
    }}
    """
    try:
        response = ai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        return json.loads(response.text)
    except Exception as e:
        return {
            "vernacular_name": pred_disease.replace("_", " "),
            "pest_vector": "Foliar feeding vector / Fungal spores",
            "biological_control": "Neem oil 10,000 PPM @ 3ml/L water spray.",
            "chemical_control": "Consult local KVK for recommended active ingredient.",
            "mechanical_control": "Deploy yellow sticky traps and rogue heavily infected leaves.",
            "fallback_notice": str(e)
        }


# --- ZERO-SHOT FALLBACK FOR LOW CONFIDENCE & OOD CROPS (ONION, SUGARCANE) ---
def fallback_gemini_vision(pil_img: Image.Image) -> dict:
    """Invoked when ResNet confidence is low (< 0.78) to handle regional Indian cash crops."""
    buffered = io.BytesIO()
    pil_img.save(buffered, format="JPEG", quality=85)
    img_bytes = buffered.getvalue()

    prompt = """
    Analyze this crop leaf as an Indian agricultural extension specialist.
    1. Identify exact crop and condition (e.g. Sugarcane___Red_Rot, Onion___Purple_Blotch, Tomato___Late_Blight).
    2. Estimate foliar damage percentage (0.0 to 100.0).
    3. Categorize ETL: 'Below ETL', 'Approaching ETL', or 'Breached ETL'.
    
    Return strictly JSON:
    {
      "predicted_disease": "Crop___Condition",
      "confidence": 0.94,
      "foliar_damage_percent": 18.5,
      "economic_threshold_status": "Approaching ETL",
      "etl_badge_color": "Amber"
    }
    """
    try:
        response = ai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"), prompt],
            config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.1)
        )
        return json.loads(response.text)
    except Exception:
        return None


# --- APPLICATION INITIALIZATION ---
app = FastAPI(title="AgriScan ML Inference Engine with Robust Rejection", version="2.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cpu")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. Model Checkpoint Loading
resnet_filenames = ["best_resnet34.pth", "best_resnet32.pth", "resnet34.pth"]
weights_path = None

for name in resnet_filenames:
    p = os.path.join(BASE_DIR, name)
    if os.path.exists(p):
        weights_path = p
        break

if not weights_path:
    raise FileNotFoundError(f"Could not find ResNet weights inside {BASE_DIR}")

print(f"Loading checkpoint: {weights_path}")
checkpoint = torch.load(weights_path, map_location=DEVICE)
state_dict = checkpoint if isinstance(checkpoint, dict) and any("fc" in k for k in checkpoint.keys()) else checkpoint.get("state_dict", checkpoint)

if "fc.1.weight" in state_dict:
    num_classes_in_model = state_dict["fc.1.weight"].shape[0]
elif "fc.weight" in state_dict:
    num_classes_in_model = state_dict["fc.weight"].shape[0]
else:
    num_classes_in_model = 18

print(f"Detected {num_classes_in_model} output classes in model checkpoint.")

# 2. Classes Resolution
classes_file = os.path.join(BASE_DIR, "classes.json")
if os.path.exists(classes_file):
    with open(classes_file, "r") as f:
        CLASS_NAMES = json.load(f)
else:
    CLASS_NAMES = [f"Class_{i}" for i in range(num_classes_in_model)]

if len(CLASS_NAMES) < num_classes_in_model:
    for i in range(len(CLASS_NAMES), num_classes_in_model):
        CLASS_NAMES.append(f"Class_{i}")

# 3. Model Setup
model = models.resnet34(weights=None)
in_features = model.fc.in_features

if "fc.1.weight" in state_dict:
    model.fc = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, num_classes_in_model)
    )
else:
    model.fc = nn.Linear(in_features, num_classes_in_model)

model.load_state_dict(state_dict)
model.to(DEVICE)
model.eval()

grad_cam = GradCAM(model=model, target_layer=model.layer4)
print("ResNet model and Grad-CAM loaded successfully!")

preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


# --- ENDPOINTS ---
@app.get("/health")
def health():
    return {
        "status": "online",
        "yolo_detector": "YOLOv8n",
        "classifier_model": "ResNet-34",
        "classes_loaded": len(CLASS_NAMES)
    }


@app.post("/predict")
async def predict(
    image: UploadFile = File(...),
    crop_name: str = Form("Auto"),  # <-- NEW: e.g. "Potato", "Tomato", "Sugarcane", "Auto"
    latitude: float = Form(19.9975),
    longitude: float = Form(73.7898)
):
    contents = await image.read()
    if not contents or len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    raw_img = load_image_safely(contents)

    # --- STAGE 1: LOCAL TEXTILE / NON-LEAF FILTER ---
    is_valid_leaf, target_img, yolo_meta = verify_and_crop_leaf_yolo(raw_img)
    if not is_valid_leaf:
        return JSONResponse(
            status_code=400,
            content={
                "status": "rejected",
                "error_code": "INVALID_FOLIAGE_DETECTED",
                "message": "No genuine crop leaf detected.",
                "verification_details": yolo_meta
            }
        )

    # --- STAGE 2: PREPROCESSING ---
    enhanced_img, is_blurry, blur_val = process_and_validate_image(target_img)
    tensor = preprocess(enhanced_img).unsqueeze(0).to(DEVICE)
    tensor.requires_grad = True

    # --- STAGE 3: RESNET FORWARD PASS WITH LOGIT MASKING ---
    logits = model(tensor)  # shape: [1, num_classes]

    # If the user specified a crop (not "Auto"), mask out all other crops
    selected_crop_clean = crop_name.strip().lower()
    matched_indices = []

    if selected_crop_clean and selected_crop_clean != "auto":
        for idx, name in enumerate(CLASS_NAMES):
            # Check if crop name matches the start or part of the class folder name
            if selected_crop_clean in name.lower():
                matched_indices.append(idx)

        # Apply mask if matching classes exist in the model
        if len(matched_indices) > 0:
            masked_logits = torch.full_like(logits, fill_value=float("-inf"))
            masked_logits[0, matched_indices] = logits[0, matched_indices]
            logits = masked_logits
        else:
            print(f"Warning: No trained classes matched crop '{crop_name}'. Using raw logits.")

    # Convert masked logits to probabilities
    probabilities = F.softmax(logits, dim=1)[0]

    # Available count of classes after masking
    k_val = min(3, len(matched_indices)) if len(matched_indices) > 0 else min(3, num_classes_in_model)
    top_probs, top_indices = torch.topk(probabilities, k=k_val)

    pred_idx = top_indices[0].item()
    pred_class = CLASS_NAMES[pred_idx] if pred_idx < len(CLASS_NAMES) else f"Class_{pred_idx}"
    confidence = float(top_probs[0].item())

    # --- STAGE 4: EXPLAINABLE AI (GRAD-CAM) ---
    cam_map = grad_cam.generate_heatmap(tensor, pred_idx)
    heatmap_base64 = generate_cam_overlay_base64(target_img, cam_map)

    # --- STAGE 5: SEVERITY CALCULATION ---
    severity = calculate_disease_severity(target_img, cam_map)

    # --- STAGE 6: OOD / LOW-CONFIDENCE FALLBACK ---
    if confidence < 0.78:
        vlm_result = fallback_gemini_vision(target_img)
        if vlm_result:
            pred_class = vlm_result.get("predicted_disease", pred_class)
            confidence = vlm_result.get("confidence", confidence)
            severity["foliar_damage_percent"] = vlm_result.get("foliar_damage_percent", severity["foliar_damage_percent"])
            severity["economic_threshold_status"] = vlm_result.get("economic_threshold_status", severity["economic_threshold_status"])
            severity["etl_badge_color"] = vlm_result.get("etl_badge_color", severity["etl_badge_color"])

    # --- STAGE 7: CLIMATE & DYNAMIC IPM ADVISORY ---
    weather = evaluate_weather_risk(latitude, longitude)
    recommended_solution = generate_gemini_advisory(
        pred_disease=pred_class,
        severity_stage=severity.get("economic_threshold_status", "Approaching ETL"),
        weather_risk=weather.get("pest_outbreak_risk", "LOW_MONITORING_RISK")
    )

    top_3 = [
        {
            "class": CLASS_NAMES[idx.item()] if idx.item() < len(CLASS_NAMES) else f"Class_{idx.item()}",
            "confidence": round(float(prob.item()), 4)
        }
        for prob, idx in zip(top_probs, top_indices)
    ]

    return {
        "status": "success",
        "selected_crop_input": crop_name,
        "predicted_disease": pred_class,
        "confidence": round(confidence, 4),
        "foliar_damage_percent": severity.get("foliar_damage_percent", 0.0),
        "economic_threshold_status": severity.get("economic_threshold_status", "Below ETL"),
        "etl_badge_color": severity.get("etl_badge_color", "Green"),
        "pest_outbreak_risk": weather.get("pest_outbreak_risk", "LOW_MONITORING_RISK"),
        "pest_vector_profile": recommended_solution,
        "recommended_solution": recommended_solution,
        "severity_analysis": severity,
        "weather_context": weather,
        "explainability": {
            "method": "Grad-CAM",
            "target_layer": "layer4",
            "heatmap_base64": heatmap_base64
        },
        "top_predictions": top_3
    }