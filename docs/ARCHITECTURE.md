# 🏗️ AgriBharat / Krishi Darpan — System Architecture

## 1. System Topology

```mermaid
graph TB
    subgraph ClientLayer["Client Layer (Cross-Device)"]
        Browser[Modern Mobile & Desktop Browsers\nPWA-Ready / Next.js]
        WA[Twilio WhatsApp Messaging Channel]
    end

    subgraph FrontendTier["Frontend Tier (Vercel Edge / Serverless)"]
        NextApp[Next.js 16 App Router\nTurbopack Engine]
        FarmerPortal["/farmer (Scan, Result, Chat, Passport)"]
        OfficerPortal["/officer (Queue, Outbreak Map, Reports)"]
        NextApi["/api/* (Scan Proxy, Chat, Health Ping)"]
        NextApp --> FarmerPortal
        NextApp --> OfficerPortal
        NextApp --> NextApi
    end

    subgraph BackendTier["Backend Gateway (Render Web Service)"]
        ExpressApp[Node.js 22 + Express 5\nTypeScript REST API]
        AuthModule[JWT Auth & RBAC Middleware\nFarmer / Officer Roles]
        ScanModule[Scan Service & Auto-Persistence]
        OfficerModule[Officer Review Queue & Map Aggregate]
        TwilioModule[Twilio WhatsApp Webhook Handler]
        ExpressApp --> AuthModule
        ExpressApp --> ScanModule
        ExpressApp --> OfficerModule
        ExpressApp --> TwilioModule
    end

    subgraph DatabaseTier["Database Tier (Neon Cloud PostgreSQL)"]
        NeonDB[(Neon Serverless Postgres\nManaged Connection Pooler)]
        ExpressApp -->|Prisma 7 ORM / SSL| NeonDB
    end

    subgraph MLTier["AI & Inference Tier (Render Web Service)"]
        FastAPIApp[Python FastAPI Service\nUvicorn / Docker]
        ResNetEngine[PyTorch ResNet-34 + Grad-CAM]
        RAGEngine[ChromaDB + SentenceTransformers\nGovernment CIBRC & TNAU Knowledge Base]
        FastAPIApp --> ResNetEngine
        FastAPIApp --> RAGEngine
    end

    subgraph ExternalServices["External Cloud Integrations"]
        Gemini[Google Gemini 1.5 Flash API\nVision & Natural Language]
        Weather[OpenWeatherMap API\nClimate Pest Index]
    end

    Browser -->|HTTPS| NextApp
    WA -->|Webhook POST| ExpressApp
    NextApi -->|REST API| ExpressApp
    NextApi -->|Direct Vision / Chat| Gemini
    ExpressApp -->|HTTP /predict| FastAPIApp
    ExpressApp -->|Context API| Weather
    FastAPIApp -->|Grounding / Fallback| Gemini
```

---

## 2. Tier Specifications

### A. Frontend Tier (Vercel)
* **Framework:** Next.js 16 (React 19) with Turbopack.
* **Styling:** Custom Vanilla CSS Design System with warm sunrise aesthetic, dynamic cards, glassmorphism, responsive dock, and mobile bottom navigation.
* **Bilingual Engine:** First-class Hindi, Marathi, and English support across all interactive widgets and reports.
* **Offline-Resilient Scanning:** Built with a 3-tier cascade (`/api/scan/analyze` ➔ backend proxy ➔ Gemini Vision ➔ client-side agronomic engine) ensuring the scan feature never fails, even during cold starts.

### B. Backend Tier (Render)
* **Runtime:** Node.js 22 with Express 5 and strict TypeScript compilation.
* **Database Access:** Prisma 7 with Postgres driver adapters.
* **Security:** JWT authentication with 7-day expiration, bcrypt password hashing, and role-based route guards (`FARMER`, `OFFICER`, `ADMIN`).
* **Officer Review Queue:** Scans with low confidence (<65%) or severe pathogen stages are automatically routed into the agricultural extension officer's triage queue.

### C. Database Tier (Neon PostgreSQL)
* **Provider:** Neon Serverless PostgreSQL with autoscaling and branching.
* **Schema Core Tables:**
  * `user`: Authentication records and role designations.
  * `farm`: Geo-tagged parcels, crop species, and acreage.
  * `scan`: Image references, coordinates, timestamps, and triage status.
  * `diseaseResult`: Diagnosed pathogens, confidence, foliar damage, and recommendations.
  * `review`: Officer feedback, verification badges, and adjusted spray instructions.
  * `chatMessage`: Multi-turn conversational history.

### D. Machine Learning Tier (Render / Python)
* **Framework:** PyTorch 2.6, FastAPI, and Uvicorn.
* **Core Tasks:**
  1. Leaf verification and non-foliage rejection (YOLOv8 + CIELAB).
  2. Multi-class crop disease classification (ResNet-34).
  3. Visual Explainable AI (Grad-CAM).
  4. Foliar damage percentage estimation.
  5. Vector retrieval-augmented generation (ChromaDB + SentenceTransformers).
