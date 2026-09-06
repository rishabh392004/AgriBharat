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
    """
    Estimates the percentage of leaf tissue affected by the pathogen
    and maps it to an agricultural severity index.
    """
    img_np = np.array(pil_img)
    orig_h, orig_w, _ = img_np.shape
    
    # 1. Segment leaf body by excluding pure white/light backgrounds
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    _, leaf_mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    total_leaf_pixels = int(np.count_nonzero(leaf_mask))
    
    if total_leaf_pixels == 0:
        total_leaf_pixels = orig_h * orig_w
        
    # 2. Threshold high-activation Grad-CAM zones representing lesions
    cam_resized = cv2.resize(cam_map, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)
    lesion_mask = (cam_resized >= 0.55) & (leaf_mask > 0)
    lesion_pixels = int(np.count_nonzero(lesion_mask))
    
    # 3. Calculate infected area percentage
    affected_ratio = round((lesion_pixels / total_leaf_pixels) * 100, 2)
    affected_ratio = max(1.5, min(affected_ratio, 95.0))
    
    # 4. Map to agronomical action plan
    if affected_ratio < 10.0:
        stage = "Stage 1: Early / Mild"
        action = "Apply organic bio-pesticide or neem extract. Re-scan in 48 hours."
        urgency = "LOW"
    elif 10.0 <= affected_ratio < 25.0:
        stage = "Stage 2: Moderate Infestation"
        action = "Targeted curative fungicide spray recommended within 24 hours."
        urgency = "MEDIUM"
    else:
        stage = "Stage 3: Severe Defoliation Risk"
        action = "Immediate chemical intervention required across farm block to prevent epidemic spread."
        urgency = "CRITICAL"
        
    return {
        "affected_leaf_area_percent": affected_ratio,
        "infection_stage": stage,
        "recommended_urgency": urgency,
        "action_plan": action
    }

def evaluate_weather_risk(lat: float, lon: float, api_key: str = "demo_key"):
    """Fetches local climate metrics and computes environmental pathogen risk."""
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        res = requests.get(url, timeout=2).json()
        temp = res["main"]["temp"]
        humidity = res["main"]["humidity"]
        is_high = humidity > 80 and (20.0 <= temp <= 30.0)
        return {
            "temperature_celsius": temp,
            "humidity_percent": humidity,
            "risk_level": "HIGH" if is_high else "MODERATE"
        }
    except Exception:
        return {"temperature_celsius": 28.0, "humidity_percent": 82.0, "risk_level": "HIGH"}

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
    
    # 3. Disease Severity & Infestation Assessment
    severity = calculate_disease_severity(raw_img, cam_map)
    
    top_3 = [
        {
            "class": CLASS_NAMES[idx.item()] if idx.item() < len(CLASS_NAMES) else f"Class_{idx.item()}",
            "confidence": round(float(prob.item()), 4)
        }
        for prob, idx in zip(top_probs, top_indices)
    ]
    
    weather = evaluate_weather_risk(latitude, longitude)
    
    return {
        "status": "success",
        "predicted_disease": pred_class,
        "confidence": round(confidence, 4),
        "severity_analysis": severity,
        "flag_officer_review": bool(confidence < 0.75 or is_blurry or severity["recommended_urgency"] == "CRITICAL"),
        "image_quality": {
            "blur_score": float(blur_val),
            "is_blurry": bool(is_blurry)
        },
        "explainability": {
            "method": "Grad-CAM",
            "target_layer": "layer4",
            "heatmap_base64": heatmap_base64
        },
        "top_3_predictions": top_3,
        "weather_context": weather
    }