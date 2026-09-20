import os
import json
from fastapi.testclient import TestClient
import main

client = TestClient(main.app)

images = [
    {
        "name": "Tomato Early Blight",
        "path": r"C:\Users\risha\.gemini\antigravity-ide\brain\07d27b04-ef3f-4929-915c-60a606aeec66\tomato_early_blight_1788900094075.jpg",
        "crop": "Tomato"
    },
    {
        "name": "Potato Late Blight",
        "path": r"C:\Users\risha\.gemini\antigravity-ide\brain\07d27b04-ef3f-4929-915c-60a606aeec66\potato_late_blight_1788900114082.jpg",
        "crop": "Potato"
    },
    {
        "name": "Corn Common Rust",
        "path": r"C:\Users\risha\.gemini\antigravity-ide\brain\07d27b04-ef3f-4929-915c-60a606aeec66\corn_common_rust_1788900133758.jpg",
        "crop": "Corn"
    },
    {
        "name": "Chilli Bacterial Spot",
        "path": r"C:\Users\risha\.gemini\antigravity-ide\brain\07d27b04-ef3f-4929-915c-60a606aeec66\chilli_bacterial_spot_1788900155823.jpg",
        "crop": "Chilli"
    }
]

print("=" * 65)
print("     AGRICULTURAL ML MODEL BATCH TESTING REPORT")
print("=" * 65)

results = []

for idx, item in enumerate(images, 1):
    print(f"\n[{idx}/4] Testing Sample: {item['name']}")
    print(f"File: {os.path.basename(item['path'])}")

    with open(item['path'], "rb") as f:
        response = client.post(
            "/predict",
            files={"image": ("crop.jpg", f, "image/jpeg")},
            data={"crop_name": item["crop"], "latitude": 19.9975, "longitude": 73.7898}
        )
    
    if response.status_code == 200:
        data = response.json()
        pred_disease = data.get("predicted_disease")
        conf = data.get("confidence", 0) * 100
        damage = data.get("foliar_damage_percent", 0)
        etl = data.get("economic_threshold_status")
        badge = data.get("etl_badge_color")
        risk = data.get("pest_outbreak_risk")
        top3 = data.get("top_predictions", [])
        has_cam = bool(data.get("explainability", {}).get("heatmap_base64"))
        advisory = data.get("recommended_solution", {})

        print(f"  ✓ Predicted Disease      : {pred_disease}")
        print(f"  ✓ Model Confidence       : {conf:.2f}%")
        print(f"  ✓ Foliar Damage Area     : {damage}%")
        print(f"  ✓ Economic Threshold     : {etl} ({badge})")
        print(f"  ✓ Climate Outbreak Risk  : {risk}")
        print(f"  ✓ Grad-CAM Heatmap       : {'Generated Successfully' if has_cam else 'Failed'}")
        print(f"  ✓ Top Candidates         : {', '.join([f'{t['class']} ({t['confidence']*100:.1f}%)' for t in top3])}")
        
        remedy = advisory.get("remedy") or advisory.get("immediate_action") or advisory.get("organic_alternative") or str(advisory)[:90]
        print(f"  ✓ Advisory Recommendation : {str(remedy)[:100]}...")

        results.append({
            "sample": item["name"],
            "prediction": pred_disease,
            "confidence": f"{conf:.2f}%",
            "damage": f"{damage}%",
            "threshold": etl,
            "heatmap": "Generated" if has_cam else "No"
        })
    else:
        print(f"  ✗ Error {response.status_code}: {response.text}")

print("\n" + "=" * 65)
print("TEST SUMMARY TABLE:")
print(f"{'Crop Sample':<24} | {'Predicted Disease':<22} | {'Confidence':<10} | {'Damage %':<8} | {'ETL Status'}")
print("-" * 80)
for r in results:
    print(f"{r['sample']:<24} | {r['prediction']:<22} | {r['confidence']:<10} | {r['damage']:<8} | {r['threshold']}")
print("=" * 65)
