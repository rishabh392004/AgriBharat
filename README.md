# 🌾 AgriBharat (कृषि दर्पण / Krishi Darpan)

> **Multilingual AI Agricultural Intelligence, Explainable Crop Diagnostics & Grounded RAG Advisory Platform for Indian Farmers.**  
> Built for the Smart India Hackathon (SIH 2026).

---

## 🌟 Live Production Deployments

* **Frontend (Vercel):** [https://agri-bharat-pgpc.vercel.app](https://agri-bharat-pgpc.vercel.app) *(Publicly accessible, no login wall)*
* **Officer Portal:** [https://agri-bharat-pgpc.vercel.app/officer](https://agri-bharat-pgpc.vercel.app/officer) *(1-Click Demo Officer Access)*
* **Farmer Diagnostics:** [https://agri-bharat-pgpc.vercel.app/farmer/scan](https://agri-bharat-pgpc.vercel.app/farmer/scan) *(Real-time scan with Grad-CAM)*
* **Kisan AI Chat:** [https://agri-bharat-pgpc.vercel.app/farmer/chat](https://agri-bharat-pgpc.vercel.app/farmer/chat) *(Multilingual RAG Advisor)*
* **System Status API:** [https://agri-bharat-pgpc.vercel.app/api/backend-status](https://agri-bharat-pgpc.vercel.app/api/backend-status)

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["User Interface & Channels"]
        Web[Farmer & Officer Web App\nNext.js 16 PWA-Ready]
        WA[Twilio WhatsApp Inbound Channel]
    end

    subgraph Vercel["Frontend Tier (Vercel Serverless)"]
        NextCore[App Router + Turbopack]
        ScanProxy["/api/scan/analyze\n(3-Tier Cascade Engine)"]
        ChatProxy["/api/chat\n(Multilingual Chaining)"]
        StatusPing["/api/backend-status"]
    end

    subgraph RenderBackend["Backend Gateway (Render Web Service)"]
        ExpressApp[Node.js 22 + Express 5\nTypeScript REST API]
        AuthModule[JWT Auth & Role Guards]
        OfficerQueue[Triage Queue & GIS Aggregation]
        WhatsAppBot[Twilio Webhook Handler]
    end

    subgraph RenderML["AI & Inference Tier (Render Web Service)"]
        FastAPICore[Python FastAPI\nUvicorn / Docker]
        ResNet34[PyTorch ResNet-34\nFoliar Disease Classifier]
        GradCAM[Grad-CAM Attribution\nLayer 4 Heatmap Generator]
        RAGChroma[ChromaDB Vector Store\nCIBRC & TNAU Government PDFs]
    end

    subgraph NeonDB["Database Tier (Neon Serverless PostgreSQL)"]
        PostgresDB[(PostgreSQL 16\nConnection Pooling & SSL)]
    end

    subgraph ExternalAPIs["Cloud AI Services"]
        Gemini[Google Gemini 1.5 Flash\nVision AI & Multilingual Generation]
        Weather[OpenWeatherMap API\nClimate Pest Risk]
    end

    Web --> NextCore
    NextCore --> ScanProxy
    NextCore --> ChatProxy
    NextCore --> StatusPing

    ScanProxy -->|Tier 1| ExpressApp
    ScanProxy -->|Tier 2| Gemini
    ChatProxy -->|Direct Cloud| Gemini
    ChatProxy -->|Vector RAG| FastAPICore

    WA --> WhatsAppBot
    ExpressApp --> PostgresDB
    ExpressApp --> FastAPICore
    ExpressApp --> Weather

    FastAPICore --> ResNet34
    FastAPICore --> GradCAM
    FastAPICore --> RAGChroma
    FastAPICore --> Gemini
```

---

## 🚀 Key Modules & Capabilities

### 1. 🔬 Explainable Crop Disease Vision Engine
* **ResNet-34 Deep CNN**: Trained across 16 major Indian crops (Wheat, Tomato, Potato, Cotton, Rice, Onion, Sugarcane, Soybean, etc.).
* **Grad-CAM Visual Heatmaps**: Generates localized heatmaps overlaid on genuine leaf photos to visually explain why a pathogen was diagnosed.
* **Economic Threshold Level (ETL)**: Automatically segments necrotic tissue percentage and determines whether chemical spraying is economically warranted (`Normal`, `Approaching ETL`, `ETL Breached`).
* **Non-Foliage Guard**: Dual YOLOv8 + CIELAB chromatic dispersion filter that immediately detects and rejects non-plant images (documents, clothing, tools).

### 2. 🤖 Kisan Salahkar RAG Chatbot
* **Authoritative Grounding**: Vector index built from Central Insecticides Board & Registration Committee (CIBRC) approved chemical schedules, bio-pesticides, and TNAU Packages of Practices.
* **Dense Retrieval**: Embedded with `all-MiniLM-L6-v2` into an HNSW cosine Chroma vector store.
* **Google Gemini 1.5 Flash Prompt Chaining**: Retrieved government dosage instructions are injected into Gemini for natural, fluent responses.
* **11 Indian Languages**: Fully fluent in Hindi (हिन्दी), Marathi (मराठी), Gujarati (ગુજરાતી), Bengali (বাংলা), Tamil (தமிழ்), Telugu (తెలుగు), Punjabi (ਪੰਜਾਬੀ), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Assamese (অসমীয়া), and English.

### 3. 🛡️ Agriculture Extension Officer Portal
* **Automated Triage Queue**: Flagging scans with low confidence (<65%) or severe disease stages for manual agronomist review.
* **1-Click Demo Officer Mode**: Instantly access as Dr. A. Patil without authentication barriers for evaluation.
* **Regional Outbreak Heatmap**: Aggregates verified diagnoses into a GIS interactive map to trace localized disease outbreaks.

### 4. 📲 Rural & Multi-Channel Access
* **Twilio WhatsApp Integration**: Farmers can photograph infected leaves and receive diagnoses and spray dosages directly on WhatsApp.
* **Batch QR Crop Health Passport**: Generates verifiable digital passports for harvested produce to increase mandi auction value.

---

## 📁 Repository Structure

```text
AgriBharat/
├── frontend/                # Next.js 16 Web Application
│   ├── app/                 # App Router (farmer, officer, login, scan, chat)
│   │   └── api/             # Serverless Routes (scan/analyze, chat, backend-status)
│   ├── components/          # Design system, Krishi Darpan Logo, Officer & Farmer Shells
│   ├── lib/                 # Centralized API client, Auth store, i18n
│   ├── services/            # CropService, ChatbotService, FarmService
│   └── public/              # Icons, standalone landing page, assets
│
├── backend/                 # Node.js Express Gateway
│   ├── src/                 # TypeScript source
│   │   ├── auth/            # JWT authentication & role-based middleware
│   │   ├── chatbot/         # Chatbot proxy & fallback advisory engine
│   │   ├── diagnosis/       # Diagnosis provider cascade (ML + Mock)
│   │   ├── farm/            # Farm parcel management
│   │   ├── officer/         # Triage review queue & GIS metrics
│   │   ├── scan/            # Scan persistence & ML dispatch
│   │   └── whatsapp/        # Twilio inbound WhatsApp webhook
│   ├── create_tables.sql    # Complete PostgreSQL schema for Neon
│   └── Dockerfile           # Production container build
│
├── crop-disease/            # Python ML & RAG Microservice
│   ├── main.py              # FastAPI inference service (ResNet-34 + Grad-CAM)
│   ├── faq_bot.py           # RAG Chatbot API with ChromaDB & Gemini
│   ├── build_rag_index.py   # PDF chunking & vector embedding pipeline
│   ├── rag_chroma_db/       # Persistent Chroma vector store
│   ├── best_resnet34.pth    # Fine-tuned PyTorch ResNet-34 model weights
│   ├── yolov8n.pt           # Upstream foliage validator weights
│   └── Dockerfile           # CPU-optimized PyTorch container
│
├── docs/                    # Deep Technical Documentation
│   ├── ARCHITECTURE.md      # Detailed system architecture & interaction flows
│   ├── RAG_CHATBOT.md       # RAG pipeline, chunking, and embedding specs
│   ├── ML_MODELS.md         # Computer Vision, Grad-CAM, & ETL specs
│   └── API_REFERENCE.md     # Complete REST API reference
│
├── Dockerfile               # Root Dockerfile for Monorepo Render deployment
└── README.md                # Main documentation
```

---

## ⚙️ Environment Variables Reference

### Frontend (Vercel)
| KEY | EXAMPLE VALUE | PURPOSE |
|---|---|---|
| `BACKEND_API_URL` | `https://agribharat-backend.onrender.com/api/v1` | Node.js backend endpoint |
| `NEXT_ML_URL` | `https://crop-disease-ml.onrender.com` | Python FastAPI ML endpoint |
| `GEMINI_API_KEY` | `AIzaSy...` | Direct Google Gemini Vision & Chat |

### Backend (Render)
| KEY | EXAMPLE VALUE | PURPOSE |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host/neondb?sslmode=require` | Neon PostgreSQL connection string |
| `FRONTEND_URL` | `https://agri-bharat-pgpc.vercel.app` | CORS authorization for frontend |
| `NEXT_ML_URL` | `https://crop-disease-ml.onrender.com` | Downstream ML prediction service |
| `JWT_SECRET` | `agribharat-super-secret-jwt-key-minimum-32chars` | Auth token encryption key |
| `GEMINI_API_KEY` | `AIzaSy...` | Optional advisory fallback |

### ML Microservice (Render)
| KEY | EXAMPLE VALUE | PURPOSE |
|---|---|---|
| `GEMINI_API_KEY` | `AIzaSy...` | Google AI Studio API Key |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model identifier |
| `OPENWEATHER_API_KEY` | `9614ffd4009a64c652eeeba4e2da1e4b` | Climate pest outbreak forecasting |

---

## 🛠️ Local Development Quickstart

### 1. Prerequisites
* **Node.js**: v20 or v22
* **Python**: v3.10 or v3.11
* **PostgreSQL** or **Neon cloud database**

### 2. Run Backend
```bash
cd backend
npm install
npm run build
npm start
```

### 3. Run ML Service
```bash
cd crop-disease
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Technical Documentation Directory

For deeper implementation specifications, please refer to the documents in [`docs/`](file:///c:/Users/risha/sih/AgriBharat/docs):
* 📖 [**Architecture Guide**](docs/ARCHITECTURE.md)
* 📖 [**RAG Agronomic Chatbot Specifications**](docs/RAG_CHATBOT.md)
* 📖 [**Computer Vision & ML Model Guide**](docs/ML_MODELS.md)
* 📖 [**REST API Reference**](docs/API_REFERENCE.md)

---

## 📜 License
Distributed under the MIT License. Developed for Indian Agricultural Prosperity.