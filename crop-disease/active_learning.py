import os
import json
import shutil
from datetime import datetime

FEEDBACK_DIR = "./active_learning_dataset"
os.makedirs(os.path.join(FEEDBACK_DIR, "images"), exist_ok=True)
os.makedirs(os.path.join(FEEDBACK_DIR, "labels"), exist_ok=True)
LOG_FILE = os.path.join(FEEDBACK_DIR, "feedback_registry.json")

def register_officer_correction(
    image_file_path: str, 
    predicted_class: str, 
    corrected_class: str, 
    officer_id: str,
    bbox_coordinates: list = None
):
    """
    Captures a misclassified or corrected drone image, saves it to the 
    active learning bucket, and logs metadata for the next YOLO fine-tuning epoch.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_name = f"correction_{timestamp}_{officer_id}"
    
    # 1. Save Image
    dest_img_path = os.path.join(FEEDBACK_DIR, "images", f"{base_name}.jpg")
    if os.path.exists(image_file_path):
        shutil.copy(image_file_path, dest_img_path)
    
    # 2. Format YOLO label file if bounding box exists
    label_path = os.path.join(FEEDBACK_DIR, "labels", f"{base_name}.txt")
    if bbox_coordinates:
        # Assuming normalized YOLO format: [class_id, x_center, y_center, width, height]
        with open(label_path, "w") as f:
            f.write(f"{bbox_coordinates[0]} {bbox_coordinates[1]} {bbox_coordinates[2]} {bbox_coordinates[3]} {bbox_coordinates[4]}\n")
            
    # 3. Log into registry
    log_entry = {
        "id": base_name,
        "timestamp": datetime.now().isoformat(),
        "officer_id": officer_id,
        "predicted": predicted_class,
        "corrected_to": corrected_class,
        "image_path": dest_img_path
    }
    
    registry = []
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, "r") as f:
                registry = json.load(f)
        except Exception:
            registry = []
            
    registry.append(log_entry)
    with open(LOG_FILE, "w") as f:
        json.dump(registry, f, indent=4)
        
    return {
        "status": "success",
        "message": "Correction registered to Active Learning Queue.",
        "total_retraining_samples": len(registry),
        log_file_id: base_name
    }