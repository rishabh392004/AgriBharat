# AgriBharat — Frontend & Backend Integration Guide

Complete technical guide on how the **Next.js Frontend**, **Node.js/Express Backend**, **Python ResNet-34 ML Engine**, and **Gemini Kisan Salahkar Chatbot** are integrated.

---

## 1. Architecture Overview

```
                      ┌─────────────────────────────────┐
                      │    Next.js 16 (Turbopack) UI    │
                      │      http://localhost:3000      │
                      └───────────────┬─────────────────┘
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       │                              │                              │
       ▼                              ▼                              ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│   Node Express   │        │   Node Express   │        │    Python ML     │
│  Auth & Officer  │        │ Chatbot Gateway  │        │    ResNet-34     │
│     Backend      │        │     Backend      │        │  (FastAPI :8000) │
│      (:5000)     │        │      (:5000)     │        └──────────────────┘
└────────┬─────────┘        └────────┬─────────┘                 ▲
         │                           │                           │
         ▼                           ▼                           │
┌──────────────────┐        ┌──────────────────┐                 │
│    PostgreSQL    │        │  Kisan Salahkar  │                 │
│     Database     │        │  Gemini FAQ Bot  │                 │
│     (:5432)      │        │ (FastAPI :8001)  │                 │
└──────────────────┘        └──────────────────┘                 │
         │                                                       │
         └───────────── Fallback / Diagnosis Sync ───────────────┘
```

---

## 2. Ports & Services Summary

| Service | Technology | Port | Directory | Start Command |
|---|---|---|---|---|
| **Frontend UI** | Next.js 16, React 19, Tailwind | `:3000` | `frontend/` | `npm run dev` |
| **Main Backend** | Node.js, Express, Prisma, TypeScript | `:5000` | `backend/` | `npm run dev` |
| **Crop Disease ML** | PyTorch, ResNet-34, OpenCV, FastAPI | `:8000` | `crop-disease/` | `uvicorn main:app --port 8000` |
| **Kisan FAQ Bot** | Google Gemini 2.5 Flash, FastAPI | `:8001` | `crop-disease/` | `uvicorn faq_bot:app --port 8001` |

---

## 3. Resilient Hybrid Design Pattern

All frontend services follow a **fail-safe hybrid pattern**:
1. **Primary**: Attempt the real live API request to the backend or ML microservice.
2. **Fallback**: If any service is temporarily offline, down, or if demo buttons are used, the frontend **automatically and silently falls back** to the built-in mock knowledge base and simulation.
3. **Benefit**: The UI will **never crash, spin indefinitely, or display a blank screen** during presentations, hackathons, or offline demos.

---

## 4. Feature-by-Feature Integration

### A. AI Crop Disease Diagnosis (`/farmer/scan`)
- **Frontend Caller:** [`frontend/services/cropService.ts`](file:///c:/Users/risha/sih/AgriBharat/frontend/services/cropService.ts) `predictCrop(image, crop)`
- **Endpoint:** `POST http://localhost:8000/predict` (or via `NEXT_PUBLIC_ML_URL`)
- **Payload:** `multipart/form-data` with `image: File/Blob`, `latitude`, `longitude`.
- **Response Handling:**
  - Extracts detected disease and crop from `predicted_disease` (e.g. `Wheat___Yellow_Rust`).
  - Converts confidence float into percentage (e.g. `0.94` ➔ `94%`).
  - Evaluates foliar damage to compute `severity` (`Mild`, `Moderate`, `Severe`).
  - Parses dynamic Gemini advisory for chemical, biological, and mechanical solutions.
  - Automatically loads Grad-CAM heatmap visualization if available.

### B. Kisan Salahkar Multilingual Chatbot (`/farmer/chat`)
- **Frontend Caller:** [`frontend/services/chatbotService.ts`](file:///c:/Users/risha/sih/AgriBharat/frontend/services/chatbotService.ts) `sendChatMessage(...)`
- **Frontend UI:** [`frontend/app/farmer/chat/page.tsx`](file:///c:/Users/risha/sih/AgriBharat/frontend/app/farmer/chat/page.tsx)
- **Endpoint:** `POST http://localhost:5000/api/v1/chatbot/ask`
- **Payload:**
  ```json
  {
    "question": "[Crop Disease Context: Yellow Rust, Language: hi] दवा की सही मात्रा क्या है?",
    "chat_history": [
      { "role": "user", "content": "What disease affects wheat?" },
      { "role": "model", "content": "Yellow rust is common in cool weather..." }
    ]
  }
  ```
- **Backend Flow:** Node backend verifies the request and proxies it to Python `faq_bot.py` on port `:8001`, which queries Gemini 2.5 Flash with the agricultural system prompt.
- **Languages Supported:** Hindi, Marathi, English, Gujarati, Bengali, Tamil, Telugu, Punjabi.

### C. Authentication & Session Management
- **Frontend Caller:** [`frontend/services/authService.ts`](file:///c:/Users/risha/sih/AgriBharat/frontend/services/authService.ts)
- **Endpoints:**
  - `POST /api/v1/auth/login` (body: `{ email, password }`)
  - `POST /api/v1/auth/register` (body: `{ email, password, name }`)
- **Token Management:**
  - On successful response, stores JWT token in `localStorage` under key `agribharat-token`.
  - Automatically attaches `Authorization: Bearer <token>` to subsequent API requests via [`frontend/lib/api-client.ts`](file:///c:/Users/risha/sih/AgriBharat/frontend/lib/api-client.ts).
- **Demo Mode:** "Demo Farmer" and "Demo Officer" buttons remain functional without requiring active database credentials.

### D. Centralized HTTP Client
- **File:** [`frontend/lib/api-client.ts`](file:///c:/Users/risha/sih/AgriBharat/frontend/lib/api-client.ts)
- Exposes `apiHttp.get()`, `apiHttp.post()`, `apiHttp.put()`, `apiHttp.delete()`.
- Automatically prepends `NEXT_PUBLIC_API_URL`.
- Automatically appends query parameters and `Content-Type: application/json`.
- Safely parses and surfaces backend error messages.

---

## 5. Configuration & Environment Variables

### Frontend: `frontend/.env.local`
```env
# AgriBharat Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Direct Python ML Disease Detection Service URL
NEXT_PUBLIC_ML_URL=http://localhost:8000
```

### Backend: `backend/.env`
```env
DATABASE_URL="postgresql://postgres:392004@localhost:5432/postgres"
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="agribharat-super-secret-jwt-key-minimum-32chars"
JWT_EXPIRES_IN="7d"
PORT=5000

# Python ML inference service
ML_SERVICE_URL="http://localhost:8000"

# Python Gemini FAQ chatbot service
CHATBOT_SERVICE_URL="http://localhost:8001"
```

### ML & Chatbot: `crop-disease/.env`
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

---

## 6. How to Run Everything (Quick Start)

Open 4 terminal windows and run:

### Terminal 1: Python ML Server
```bash
cd crop-disease
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Terminal 2: Python Chatbot Server
```bash
cd crop-disease
python -m uvicorn faq_bot:app --host 0.0.0.0 --port 8001
```

### Terminal 3: Node.js Backend Server
```bash
cd backend
npm run dev
```

### Terminal 4: Next.js Frontend UI
```bash
cd frontend
npm run dev
```

Visit **`http://localhost:3000`** in your browser!
