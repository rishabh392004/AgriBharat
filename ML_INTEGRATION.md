# ML Model Integration Documentation
## AgriBharat — Crop Disease Detection

---

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [ML Model Details](#ml-model-details)
4. [How the Integration Works](#how-the-integration-works)
5. [File Changes Made](#file-changes-made)
6. [Environment Setup](#environment-setup)
7. [Running Both Services](#running-both-services)
8. [API Reference](#api-reference)
9. [Testing the Integration](#testing-the-integration)
10. [Error Handling](#error-handling)

---

## Overview

The AgriBharat backend integrates a **ResNet-34 deep learning model** for crop disease detection.
The ML model runs as a **separate Python FastAPI service** and the **Node.js backend calls it via HTTP** whenever a new scan is submitted.

The two services communicate over a simple REST API — no message queues or special infrastructure needed.

---

## Architecture

```
+----------------------------------------------------------+
|                    AgriBharat Stack                      |
|                                                          |
|  Frontend (Next.js)           :3000                      |
|       |                                                  |
|       |  POST /api/scans  { farmId, imageUrl }           |
|       v                                                  |
|  Node.js Backend (Express)    :5000                      |
|       |  1. Saves scan to PostgreSQL DB                  |
|       |  2. Calls ML service (async, non-blocking)       |
|       |                                                  |
|       |  POST /predict  (multipart image)                |
|       v                                                  |
|  Python FastAPI ML Service    :8000                      |
|       |  - ResNet-34 model (best_resnet34.pth)           |
|       |  - Grad-CAM heatmap generation                   |
|       |  - Disease severity analysis                     |
|       |                                                  |
|       |  Returns JSON prediction                         |
|       v                                                  |
|  PostgreSQL Database                                     |
|       - Scan record saved immediately                    |
|       - Diagnosis result saved after ML responds         |
+----------------------------------------------------------+
```

---

## ML Model Details

| Property | Value |
|---|---|
| **Model architecture** | ResNet-34 |
| **Weights file** | `crop-disease/best_resnet34.pth` (~81 MB) |
| **Classes** | 18 (7 crops, 11 diseases + healthy variants) |
| **Input size** | 224 x 224 pixels |
| **Framework** | PyTorch |
| **Explainability** | Grad-CAM heatmap overlay |

### Supported Crops & Diseases

| Crop | Classes |
|---|---|
| Chilli | Bacterial Spot, Healthy |
| Corn | Common Rust, Healthy |
| Cotton | Bacterial Blight |
| Grape | Black Rot, Esca, Healthy, Leaf Blight |
| Potato | Early Blight, Healthy, Late Blight |
| Rice | Blast |
| Tomato | Bacterial Spot, Early Blight, Healthy, Late Blight |
| Sugarcane | Healthy |

---

## How the Integration Works

### Step-by-Step Flow

#### 1. Frontend submits a scan
```http
POST http://localhost:5000/api/scans
Content-Type: application/json
Authorization: Bearer <JWT>

{
  "farmId": 1,
  "imageUrl": "https://storage.example.com/scan123.jpg"
}
```

#### 2. Node backend saves the scan immediately
```typescript
// backend/src/scan/scan.service.ts
const scan = await db.orm.public.Scan.create({
  farmId,
  imageUrl,
});
// API responds instantly — scan is saved
```

#### 3. ML call runs asynchronously (non-blocking)
```typescript
// Runs in background — does NOT delay the API response
callMlModel(imageUrl).then(async (prediction) => {
  if (!prediction) return;
  await db.orm.public.Diagnosis.create({ ... });
});
```

The key design decision: **the user gets an instant response** with `mlStatus: "processing"`,
and the ML result is saved to DB in the background.

#### 4. callMlModel() — How Node calls Python
```typescript
async function callMlModel(imageUrl: string) {
  // Step A: Download the image from its URL
  const imageRes = await fetch(imageUrl);
  const imageBuffer = await imageRes.arrayBuffer();

  // Step B: Build multipart/form-data
  const { FormData, Blob } = await import("formdata-node");
  const form = new FormData();
  form.set("image", new Blob([imageBuffer], { type: "image/jpeg" }), "scan.jpg");

  // Step C: POST to Python FastAPI /predict endpoint
  const mlRes = await fetch("http://localhost:8000/predict", {
    method: "POST",
    body: form,
  });

  return await mlRes.json();
}
```

#### 5. Python ML processes the image
```python
# crop-disease/main.py
@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    # 1. Decode image (PIL fallback to OpenCV)
    # 2. Apply CLAHE contrast enhancement
    # 3. Run ResNet-34 forward pass
    # 4. Generate Grad-CAM heatmap
    # 5. Calculate disease severity %
    # 6. Return JSON response
```

#### 6. Node saves the ML result to the Diagnosis table
```typescript
await db.orm.public.Diagnosis.create({
  scanId: scan.id,
  disease: prediction.predicted_disease,
  confidence: prediction.confidence,
  severityPercent: prediction.severity_analysis.affected_leaf_area_percent,
  infectionStage: prediction.severity_analysis.infection_stage,
  urgency: prediction.severity_analysis.recommended_urgency,
  actionPlan: prediction.severity_analysis.action_plan,
  top3Predictions: JSON.stringify(prediction.top_3_predictions),
  flagReview: prediction.flag_officer_review,
});
```

---

## File Changes Made

### Modified Files

#### `backend/src/scan/scan.service.ts`
- Added `ML_SERVICE_URL` constant (reads from env)
- Added `callMlModel(imageUrl)` async helper function
- Updated `createScan()` to call ML after saving scan
- Added `mlStatus: "processing"` in the response

#### `crop-disease/requirements.txt`
- Updated `torch==2.2.1` to `torch>=2.9.0` (Python 3.14 compatibility)
- Updated `torchvision==0.17.1` to `torchvision>=0.20.0`
- Added `opencv-python>=4.9.0`
- Added `numpy>=1.26.0`

#### `backend/.env` and `backend/.env.example`
- Added `ML_SERVICE_URL="http://localhost:8000"`

#### `backend/package.json`
- Added `formdata-node` dependency (for multipart uploads in Node.js)

### New Files

#### `crop-disease/test_integration.py`
- Integration test that verifies ML service health, backend health, and a full `/predict` call

---

## Environment Setup

### Prerequisites
- Node.js 18+
- Python 3.14+
- PostgreSQL 15+

### 1. Install Node.js dependencies
```bash
cd backend
npm install
```

### 2. Install Python dependencies
```bash
cd crop-disease
pip install -r requirements.txt
```

> PyTorch is ~124 MB. First install will take several minutes.

### 3. Configure environment variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="your-secret-key-minimum-32-chars"
JWT_EXPIRES_IN="7d"
PORT=5000

# Python ML service URL
ML_SERVICE_URL="http://localhost:8000"
```

---

## Running Both Services

Open **two separate terminals**:

### Terminal 1 — Python ML Service
```bash
cd crop-disease
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Expected output:
```
Loading checkpoint: best_resnet34.pth
Detected 18 output classes in model checkpoint.
ResNet model and Grad-CAM loaded successfully!
INFO: Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2 — Node.js Backend
```bash
cd backend
npm run dev
```

---

## API Reference

### ML Service Endpoints

#### GET /health
Checks if ML service is running.
```json
{
  "status": "online",
  "model": "ResNet-34",
  "classes_loaded": 18
}
```

#### POST /predict
Runs disease detection on an uploaded image.

**Request:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| `image` | File (JPG/PNG/WebP) | Yes |
| `latitude` | float | No (default: 19.9975) |
| `longitude` | float | No (default: 73.7898) |

**Response:**
```json
{
  "status": "success",
  "predicted_disease": "Tomato_Late_Blight",
  "confidence": 0.9141,
  "severity_analysis": {
    "affected_leaf_area_percent": 53.86,
    "infection_stage": "Stage 3: Severe Defoliation Risk",
    "recommended_urgency": "CRITICAL",
    "action_plan": "Immediate chemical intervention required."
  },
  "flag_officer_review": true,
  "image_quality": {
    "blur_score": 142.3,
    "is_blurry": false
  },
  "explainability": {
    "method": "Grad-CAM",
    "target_layer": "layer4",
    "heatmap_base64": "data:image/jpeg;base64,..."
  },
  "top_3_predictions": [
    { "class": "Tomato_Late_Blight", "confidence": 0.9141 },
    { "class": "Tomato_Early_Blight", "confidence": 0.0348 },
    { "class": "Potato_Late_Blight", "confidence": 0.0178 }
  ],
  "weather_context": {
    "temperature_celsius": 28.0,
    "humidity_percent": 82.0,
    "risk_level": "HIGH"
  }
}
```

### Backend Endpoint

#### POST /api/scans
Creates a scan and triggers ML analysis in the background.

**Response:**
```json
{
  "message": "Scan created successfully",
  "scan": {
    "id": 42,
    "farmId": 1,
    "imageUrl": "https://...",
    "status": "pending",
    "createdAt": "2026-09-07T15:00:00.000Z",
    "mlStatus": "processing"
  }
}
```

---

## Testing the Integration

Run the integration test script:

```bash
cd crop-disease
python test_integration.py
```

Expected output:
```
--- Test 1: ML Service Health ---
  [PASS] Status: online
  [PASS] Model: ResNet-34
  [PASS] Classes loaded: 18

--- Test 2: Backend Health ---
  [PASS] Status: OK

--- Test 3: ML /predict with a generated test image ---
  [PASS] Predicted disease : Corn_Healthy
  [PASS] Confidence        : 91.41%
  [PASS] Infection stage   : Stage 3: Severe Defoliation Risk
  [PASS] Urgency           : CRITICAL
  [PASS] Affected area     : 53.86%
  [PASS] Top 3 predictions : [...]
  [PASS] Heatmap returned  : Yes
```

---

## Error Handling

The integration is designed to **fail gracefully** — if the ML service is down, scans are still saved normally.

| Scenario | Behavior |
|---|---|
| ML service is down | Scan saved, no diagnosis created, no crash |
| Image URL unreachable | `callMlModel` returns null, scan still saved |
| ML returns non-200 | `callMlModel` returns null, scan still saved |
| DB save for diagnosis fails | Logged silently, scan unaffected |

```typescript
// Errors caught silently — scan always saved regardless of ML status
callMlModel(imageUrl)
  .then(async (prediction) => { ... })
  .catch(() => { /* silently ignore ML errors */ });
```

> Tip: During development, replace `.catch(() => {})` with `.catch(console.error)` to see ML errors in your terminal.

---

## Ports Summary

| Service | Port | URL |
|---|---|---|
| Frontend | 3000 | http://localhost:3000 |
| Node.js Backend | 5000 | http://localhost:5000 |
| Python ML Service | 8000 | http://localhost:8000 |
| PostgreSQL | 5432 | localhost:5432 |
