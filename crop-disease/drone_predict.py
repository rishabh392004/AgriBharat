import os
import cv2
import numpy as np
from PIL import Image
from sahi import AutoDetectionModel
from sahi.predict import get_sliced_prediction

# 1. Path configurations
MODEL_WEIGHTS = "best.pt"
OUTPUT_DIR = "./drone_outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 2. Initialize SAHI AutoDetectionModel with YOLOv8
if not os.path.exists(MODEL_WEIGHTS):
    print(f"[Warning] '{MODEL_WEIGHTS}' not found in current folder! Fallback to yolov8n.pt")
    model_file = "yolov8n.pt"
else:
    model_file = MODEL_WEIGHTS

print(f"[Loading] Initializing SAHI with {model_file}...")
detection_model = AutoDetectionModel.from_pretrained(
    model_type="yolov8",
    model_path=model_file,
    confidence_threshold=0.30,
    device="cpu"  # Runs on your laptop CPU (set 'cuda:0' if you have NVIDIA GPU)
)


def compute_vari_stress_mask(image_bgr: np.ndarray) -> float:
    """
    Visible Atmospherically Resistant Index (VARI):
    VARI = (Green - Red) / (Green + Red - Blue)
    Healthy foliage produces high positive values (> 0.1).
    Dead/chlorotic canopy stress drops below 0.
    Returns the estimated percentage of stressed canopy area.
    """
    img_float = image_bgr.astype(np.float32)
    b, g, r = cv2.split(img_float)

    denom = g + r - b
    denom[denom == 0] = 1e-5
    vari = (g - r) / denom

    # Chlorotic or necrotic vegetation
    stressed_pixels = np.sum(vari < 0.0)
    total_pixels = vari.size
    stress_percentage = (stressed_pixels / total_pixels) * 100.0
    return round(float(stress_percentage), 2)


def predict_drone_image(image_path: str, slice_size: int = 640, overlap: float = 0.2):
    """
    Slices large drone photos into manageable tiles, performs localized YOLO
    detections, merges overlapping boxes, and generates an executive diagnostic summary.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Input image not found: {image_path}")

    print(f"\n[Processing] Running Sliced Aided Hyper Inference (SAHI) on {image_path}...")
    
    # Run SAHI sliced prediction
    result = get_sliced_prediction(
        image_path,
        detection_model,
        slice_height=slice_size,
        slice_width=slice_size,
        overlap_height_ratio=overlap,
        overlap_width_ratio=overlap,
        perform_standard_pred=False,
        verbose=1
    )

    # Save visual prediction image
    base_name = os.path.splitext(os.path.basename(image_path))[0]
    out_filename = f"{base_name}_annotated"
    result.export_visuals(
        export_dir=OUTPUT_DIR,
        file_name=out_filename
    )
    annotated_image_path = os.path.join(OUTPUT_DIR, f"{out_filename}.png")

    # Read original image to compute vegetative stress
    orig_bgr = cv2.imread(image_path)
    canopy_stress_pct = compute_vari_stress_mask(orig_bgr)

    # Aggregate detection clusters
    detections = []
    for pred in result.object_prediction_list:
        bbox = pred.bbox.to_xyxy()
        detections.append({
            "class_name": pred.category.name,
            "confidence": round(float(pred.score.value), 3),
            "bbox": [int(coord) for coord in bbox]
        })

    # Executive triage summary
    cluster_count = len(detections)
    if cluster_count == 0:
        status = "HEALTHY / NO INFESTATION"
        severity = "LOW"
    elif cluster_count < 10:
        status = "EARLY CANOPY BLIGHT SPOTS"
        severity = "MEDIUM"
    else:
        status = "CRITICAL FIELD OUTBREAK (BREACHED ETL)"
        severity = "HIGH"

    summary = {
        "source_image": image_path,
        "annotated_output": annotated_image_path,
        "detected_infestation_clusters": cluster_count,
        "canopy_stress_vari_percent": f"{canopy_stress_pct}%",
        "triage_status": status,
        "intervention_severity": severity,
        "detections": detections
    }

    return summary


if __name__ == "__main__":
    import sys

    # Quick interactive test in PowerShell
    if len(sys.argv) > 1:
        img_input = sys.argv[1]
    else:
        img_input = input("Enter path to a drone image (e.g., test_drone.jpg): ").strip()

    if not img_input:
        print("No image provided. Exiting.")
        sys.exit(0)

    res = predict_drone_image(img_input)

    print("\n" + "=" * 55)
    print("--- EXECUTIVE DRONE SURVEILLANCE REPORT ---")
    print(f"Status:              {res['triage_status']}")
    print(f"Severity:            {res['intervention_severity']}")
    print(f"Disease Clusters:    {res['detected_infestation_clusters']}")
    print(f"Canopy Stress (VARI):{res['canopy_stress_vari_percent']}")
    print(f"Annotated Map Saved: {res['annotated_output']}")
    print("=" * 55 + "\n")