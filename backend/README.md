# AgriBharat Backend — presentation-ready MVP

## Stack
- Express 5 + TypeScript
- PostgreSQL via Prisma ORM (Prisma 8 contract workflow)
- JWT + bcrypt authentication
- Zod request validation
- Python FastAPI ResNet-34 diagnosis service

## Local setup
1. Copy `.env.example` to `.env` and fill in the real PostgreSQL URL and JWT secret.
2. Install dependencies:
   `npm install`
3. Generate the ORM contract and compile:
   `npm run build`
4. If your database does not yet contain the newer `diseaseResult`, `message`, or `officerProfile` tables, run `create_tables.sql` once in pgAdmin/psql.
5. Start the backend:
   `npm run dev`
6. Backend health: `GET http://localhost:5000/health`
7. FastAPI health: `GET http://localhost:8000/health`

## Diagnosis flow
- `POST /api/v1/scans` creates a PENDING scan.
- `POST /api/v1/scans/:id/diagnosis` calls FastAPI `/predict`, validates the response, applies the backend recommendation knowledge base, stores `DiseaseResult`, and marks the scan COMPLETED.
- `GET /api/v1/scans/:id/diagnosis` returns the stored diagnosis.
- If FastAPI is unavailable, diagnosis fails clearly with HTTP 502; the backend does not fabricate a disease result.

## Presentation smoke test
Register → login → create farm → create scan → start diagnosis → fetch diagnosis.
Keep the FastAPI process running separately on port 8000.
