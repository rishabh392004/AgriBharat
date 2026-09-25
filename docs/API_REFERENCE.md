# 📡 AgriBharat API Reference

Comprehensive documentation of all REST API endpoints available across the Frontend, Backend, and ML services.

---

## 1. Frontend Serverless API (Next.js)

Base URL: `https://agri-bharat-pgpc.vercel.app/api`

### `POST /api/scan/analyze`
Submits a crop leaf image for multi-tier analysis (Backend ➔ Gemini 1.5 Flash Vision ➔ Agronomic Expert Engine).

**Request Body:**
```json
{
  "imageUrl": "data:image/jpeg;base64,...",
  "cropName": "Wheat",
  "latitude": 19.9975,
  "longitude": 73.7898
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "diagnosis": {
    "scanId": 46407,
    "disease": "Wheat - Leaf Rust (Puccinia triticina)",
    "confidence": 93,
    "severity": "Moderate",
    "foliarDamagePercent": 18.5,
    "economicThresholdStatus": "Approaching ETL (15-20% leaf coverage)",
    "etlBadgeColor": "amber",
    "explainability": {
      "method": "Grad-CAM-ResNet34-Integrated"
    },
    "recommendation": {
      "actions": [
        "Apply systemic fungicide: Propiconazole 25% EC (Tilt) @ 1 ml/L",
        "Spray Mancozeb 75% WP @ 2.5 g/L if lesions are localized"
      ],
      "precautions": [
        "Avoid high-dose nitrogen top-dressing during active humid weather"
      ]
    },
    "provider": "resnet34-fastapi"
  }
}
```

---

### `POST /api/chat`
Conversational advisory endpoint supporting 11 Indian languages with automatic language detection and prompt grounding.

**Request Body:**
```json
{
  "question": "गेंहू में पीला रतुआ आ गया है, क्या दवा डालें?",
  "locale": "hi",
  "contextDisease": "Leaf Rust"
}
```

---

### `GET /api/backend-status`
Returns real-time health and latency telemetry for both the Node backend and Python ML service.

---

## 2. Express Backend API (Node.js)

Base URL: `https://<backend-service>.onrender.com/api/v1`

### Authentication (`/auth`)
* `POST /auth/register` — Register a new Farmer or Agriculture Extension Officer.
* `POST /auth/login` — Authenticate and receive a signed JWT token.
* `GET /auth/me` — Retrieve the current user's profile and assigned role.

### Farms (`/farms`)
* `GET /farms` — List farms owned by the authenticated farmer.
* `POST /farms` — Create a new geo-tagged agricultural parcel.
* `GET /farms/:id` — Retrieve specific parcel metrics and scan history.

### Crop Scans (`/scans`)
* `POST /scans/analyze` — Run full diagnosis, calculate foliar damage, and persist scan record into PostgreSQL.
* `GET /scans` — Paginated history of farmer's previous scans.
* `GET /scans/:id` — Detailed diagnostic report with Grad-CAM heatmap and ETL stage.

### Officer Portal (`/officer`)
* `GET /officer/review-queue` — Scans flagged for manual officer validation (<65% confidence or severe stage).
* `POST /officer/review/:scanId` — Submit official recommendation, badge verification, or dosage adjustment.
* `GET /officer/metrics` — Aggregate regional disease outbreak statistics.
* `GET /officer/map` — Geo-coordinates of active disease clusters for GIS mapping.

### WhatsApp Webhook (`/whatsapp`)
* `POST /whatsapp/webhook` — Twilio inbound webhook handler allowing farmers to send leaf photos via WhatsApp and receive instant AI diagnosis.

---

## 3. ML Inference API (FastAPI)

Base URL: `https://<ml-service>.onrender.com`

* `POST /predict` — Accepts `multipart/form-data` image file, outputs disease classification, confidence, foliar damage, and Grad-CAM base64.
* `POST /ask` — Multi-turn RAG retrieval endpoint querying government package of practices.
* `GET /health` — Service readiness and PyTorch execution device (`cpu`/`cuda`).
