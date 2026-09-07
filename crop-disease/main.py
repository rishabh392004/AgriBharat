import os
import io
import json
import base64
import requests
import cv2
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

# Load key-value pairs from .env into os.environ
load_dotenv()

# Verify your key is picked up
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print("Loaded Key Prefix:", GEMINI_API_KEY[:8] if GEMINI_API_KEY else "KEY NOT FOUND")

from google import genai
ai_client = genai.Client(api_key=GEMINI_API_KEY)

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

# --- IMAGE PROCESSING & SEVERITY SCORING HELPERS ---
def load_image_safely(byte_data: bytes) -> Image.Image:
    """Decodes image bytes using a dual-engine fallback (PIL -> OpenCV)."""
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
    """Calculates blur score and applies CLAHE contrast enhancement."""
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
    """Overlays high-activation zones directly on the leaf."""
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
    
    # ETL (Economic Threshold Level) Classification
    if affected_ratio < 5.0:
        etl_status = "Below ETL"
        etl_color = "Green"
        urgency = "LOW"
        action = "Deploy sticky traps and spray Neem formulation (3ml/L)."
    elif 5.0 <= affected_ratio < 15.0:
        etl_status = "Approaching ETL"
        etl_color = "Amber"
        urgency = "MEDIUM"
        action = "Apply bio-insecticide (Beauveria bassiana or Bt) within 36 hours."
    else:
        etl_status = "Breached ETL"
        etl_color = "Red"
        urgency = "CRITICAL"
        action = "Immediate chemical spray required to prevent full defoliation."
        
    return {
        "foliar_damage_percent": affected_ratio,
        "economic_threshold_status": etl_status,
        "etl_badge_color": etl_color,
        "recommended_urgency": urgency,
        "pest_management_action": action
    }

def calculate_disease_severity(pil_img: Image.Image, cam_map: np.ndarray) -> dict:
    img_np = np.array(pil_img)
    orig_h, orig_w, _ = img_np.shape
    
    # 1. Segment foliage area
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    _, leaf_mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    total_leaf_pixels = int(np.count_nonzero(leaf_mask))
    if total_leaf_pixels == 0:
        total_leaf_pixels = orig_h * orig_w
        
    # 2. Extract feeding punctures / necrotic lesions via Grad-CAM
    cam_resized = cv2.resize(cam_map, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)
    lesion_mask = (cam_resized >= 0.55) & (leaf_mask > 0)
    lesion_pixels = int(np.count_nonzero(lesion_mask))
    
    affected_ratio = round((lesion_pixels / total_leaf_pixels) * 100, 2)
    affected_ratio = max(1.5, min(affected_ratio, 95.0))
    
    # 3. Agronomic ETL Mapping for Pest Control
    if affected_ratio < 5.0:
        etl_status = "Below ETL (Monitoring Stage)"
        action = "Deploy yellow/blue sticky traps and pheromone lures. Apply Neem oil 10,000 PPM (3 ml/L)."
        urgency = "LOW"
    elif 5.0 <= affected_ratio < 18.0:
        etl_status = "Approaching ETL (Warning Threshold)"
        action = "Foliar application of entomopathogenic bio-pesticides (Beauveria bassiana or Bacillus thuringiensis) within 36 hours."
        urgency = "MEDIUM"
    else:
        etl_status = "Breached ETL (Action Threshold)"
        action = "Immediate targeted chemical insecticide/acaricide application required across crop block."
        urgency = "CRITICAL"
        
    return {
        "foliar_damage_percent": affected_ratio,
        "affected_leaf_area_percent": affected_ratio,
        "economic_threshold_status": etl_status,
        "infection_stage": etl_status,
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
            "pest_vector": "Insect puncture vector / Foliar feeding pests",
            "biological_control": "Neem seed extract 5% or Neem oil 10,000 PPM @ 3ml/L.",
            "chemical_control": "Consult local KVK for verified active pesticide formulation.",
            "mechanical_control": "Deploy yellow sticky traps (15 traps/acre) and rogue infected leaves.",
            "fallback_notice": str(e)
        }
# --- APPLICATION INITIALIZATION ---
app = FastAPI(title="AgriScan ML Inference Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cpu")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. Checkpoint loading
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

# 2. Classes resolution
classes_file = os.path.join(BASE_DIR, "classes.json")
if os.path.exists(classes_file):
    with open(classes_file, "r") as f:
        CLASS_NAMES = json.load(f)
else:
    CLASS_NAMES = [f"Class_{i}" for i in range(num_classes_in_model)]

if len(CLASS_NAMES) < num_classes_in_model:
    for i in range(len(CLASS_NAMES), num_classes_in_model):
        CLASS_NAMES.append(f"Class_{i}")

# 3. Architecture setup
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
    return {"status": "online", "model": "ResNet-34", "classes_loaded": len(CLASS_NAMES)}

@app.post("/predict")
async def predict(
    image: UploadFile = File(...),
    latitude: float = Form(19.9975),
    longitude: float = Form(73.7898)
):
    contents = await image.read()
    if not contents or len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    raw_img = load_image_safely(contents)
    enhanced_img, is_blurry, blur_val = process_and_validate_image(raw_img)
    
    tensor = preprocess(enhanced_img).unsqueeze(0).to(DEVICE)
    tensor.requires_grad = True

    # 1. Forward Pass
    logits = model(tensor)
    probabilities = F.softmax(logits, dim=1)[0]
    
    top_probs, top_indices = torch.topk(probabilities, k=min(3, num_classes_in_model))
    pred_idx = top_indices[0].item()
    pred_class = CLASS_NAMES[pred_idx] if pred_idx < len(CLASS_NAMES) else f"Class_{pred_idx}"
    confidence = float(top_probs[0].item())
    
    # 2. Grad-CAM Activation Map
    cam_map = grad_cam.generate_heatmap(tensor, pred_idx)
    heatmap_base64 = generate_cam_overlay_base64(raw_img, cam_map)
    
    # 3. Disease Severity Assessment
    severity = calculate_disease_severity(raw_img, cam_map)
    
    # 4. Regional Climate Risk
    weather = evaluate_weather_risk(latitude, longitude)
    
    # 5. Dynamic Gemini Solution (zero manual chatting needed by farmer)
    # 5. Dynamic Gemini Solution
    recommended_solution = generate_gemini_advisory(
        pred_disease=pred_class,
        severity_stage=severity.get("economic_threshold_status", severity.get("infection_stage", "Moderate")),
        weather_risk=weather.get("pest_outbreak_risk", weather.get("risk_level", "MODERATE"))
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
        "predicted_disease": pred_class,
        "confidence": round(confidence, 4),
        "foliar_damage_percent": severity.get("foliar_damage_percent", severity.get("affected_leaf_area_percent", 0.0)),
        "economic_threshold_status": severity.get("economic_threshold_status", "Below ETL"),
        "etl_badge_color": severity.get("etl_badge_color", "Green"),
        "pest_outbreak_risk": weather.get("pest_outbreak_risk", "LOW_MONITORING_RISK"),
        "pest_vector_profile": recommended_solution,
        "recommended_solution": recommended_solution,
        "severity_analysis": severity,
        "weather_context": weather,
        "flag_officer_review": bool(
            confidence < 0.75 or 
            is_blurry or 
            severity.get("recommended_urgency") == "CRITICAL"
        ),
        "image_quality": {
            "blur_score": float(blur_val),
            "is_blurry": bool(is_blurry)
        },
        "explainability": {
            "method": "Grad-CAM",
            "target_layer": "layer4",
            "heatmap_base64": heatmap_base64
        },
        "top_3_predictions": top_3
    }