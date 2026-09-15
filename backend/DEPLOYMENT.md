# AgriBharat Backend — Production Deployment & Operations Guide

This guide documents the production deployment, database provisioning, environment configuration, security hardening, and operational maintenance for the AgriBharat backend service.

---

## 1. System Architecture & Tech Stack

- **Runtime:** Node.js 22+ (ES Modules, TypeScript 5.8+)
- **Framework:** Express 5.2+
- **Database:** PostgreSQL 15+ / 16+
- **ORM / Contract Layer:** `@prisma/orm-postgres` (8.0.0-rc.8) with contract-based schema emission
- **Security & Reliability:**
  - Helmet for security headers
  - Express Rate Limit (Auth endpoints: 10/min, Chatbot: 10/min)
  - SSRF protection against private IP ranges and cloud metadata endpoints
  - Request body size caps (10MB) and streaming limits on external image fetches
  - Reverse proxy trust (`trust proxy: 1`)
  - Strict CORS origin gating for production
  - Graceful connection termination on `SIGINT`/`SIGTERM`
  - Active readiness (`/ready`) and liveness (`/health`) probes

```
                      +-----------------------------+
                      |   Frontend (Next.js / Vite) |
                      +--------------+--------------+
                                     |
                                     v HTTPS
                      +-----------------------------+
                      | Reverse Proxy / Load Balancer| (Nginx, AWS ALB, Cloudflare)
                      +--------------+--------------+
                                     |
                                     v HTTP (trust proxy = 1)
                      +-----------------------------+
                      |   AgriBharat Backend (Node) |
                      +--+-----------+-----------+--+
                         |           |           |
            +------------+           |           +------------+
            |                        |                        |
            v                        v                        v
+-----------------------+ +--------------------+ +------------------------+
| PostgreSQL Database   | | ML Diagnosis Service| | Chatbot Service (RAG)  |
| (AgriBharat Schema)   | | (PyTorch / FastAPI)| | (Gemini 2.5)           |
+-----------------------+ +--------------------+ +------------------------+
```

---

## 2. Environment Variables Reference

All environment variables are validated at startup using Zod schemas (`src/config/env.ts`). If any required variable is missing or invalid, the process terminates immediately with an informative schema error.

| Variable Name | Required | Default | Description | Example / Recommendations |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Optional | `development` | Runtime mode. Set to `production` in production environments to restrict CORS and hide stack traces. | `production` |
| `PORT` | Optional | `5000` | Port on which the HTTP server listens. | `5000` |
| `DATABASE_URL` | **Required** | None | PostgreSQL connection URI. In cloud environments, append `?sslmode=require`. | `postgresql://user:pass@db.example.com:5432/agribharat?sslmode=require` |
| `JWT_SECRET` | **Required** | None | Secret key used to sign and verify authentication JWTs. Must be at least 32 characters long. | `e9f8a3b2c1d0...` (Generate using `openssl rand -hex 32`) |
| `FRONTEND_URL` | **Required** | None | Allowed CORS origin for web clients. Must be a valid URL format. | `https://agribharat.com` |
| `ML_SERVICE_URL` | Optional | `http://localhost:8000` | URL for the upstream ML inference crop disease detection service. | `https://ml.internal.agribharat.com` |
| `CHATBOT_SERVICE_URL` | Optional | `http://localhost:8001` | URL for the upstream RAG/Gemini chatbot service. | `https://bot.internal.agribharat.com` |
| `CHATBOT_TIMEOUT_MS` | Optional | `15000` | Upstream request timeout in milliseconds for the chatbot proxy. | `15000` |

---

## 3. Database Provisioning & Schema Migration

The database schema encompasses 6 tables:
1. `user` — User accounts (roles: `USER`, `OFFICER`, `ADMIN`)
2. `farm` — Farms linked to users
3. `scan` — Crop scans linked to users and farms with crop details and geolocation
4. `diseaseResult` — ML diagnosis results linked to scans (1-to-1)
5. `officerProfile` — Agricultural officer profiles and contact verification
6. `message` — Messages exchanged between farmers and officers

### Primary Method: Prisma Next Migrations Workflow

The schema is defined in `src/prisma/contract.prisma`. All migrations are managed through `@prisma/orm-postgres`:

1. **Verify migration history:**
   ```bash
   npx prisma migration check
   ```
2. **Apply migrations to the target database:**
   Execute migrations against your target `DATABASE_URL`:
   ```bash
   npx prisma migration apply
   ```

### Fallback Method: Raw SQL Execution (`create_tables.sql`)

For fresh staging or production PostgreSQL instances where direct DDL is preferred:
```bash
psql "$DATABASE_URL" -f create_tables.sql
```
The `create_tables.sql` script creates all 6 tables, primary keys, indexes, and foreign key constraints with proper types.

---

## 4. Officer & Admin Provisioning Runbook

By default, newly registered users via `/api/v1/auth/register` receive the `USER` role. To initialize agricultural officers and administrative users:

### Option 1: Automated Seeding Script (Initial Officer Provisioning)

Run the built-in seed CLI script with the required environment variables:

```bash
OFFICER_NAME="Dr. Ramesh Sharma" \
OFFICER_EMAIL="ramesh.officer@agribharat.gov.in" \
OFFICER_PASSWORD="SecureOfficerPassword123!" \
OFFICER_PHONE="+919876543210" \
OFFICER_SPECIALIZATION="Agronomy & Plant Pathology" \
OFFICER_DISTRICT="Pune" \
OFFICER_STATE="Maharashtra" \
npm run seed:officer
```

The script will:
1. Validate input fields.
2. Create or find the user with role `OFFICER`.
3. Create the corresponding `officerProfile` with verified status.
4. Output the created user ID and profile details.

### Option 2: Admin API Role Promotion

An existing administrator can promote any registered user via the REST API:

```bash
curl -X PATCH https://api.agribharat.com/api/v1/auth/users/<TARGET_USER_ID>/role \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"role": "OFFICER"}'
```

Supported roles: `USER`, `OFFICER`, `ADMIN`.

---

## 5. Docker Deployment

### Multi-Stage Dockerfile Overview

The provided `Dockerfile` utilizes a three-stage build process based on `node:22-slim`:
- **Stage 1 (builder):** Installs all dependencies, runs `prisma contract emit`, and builds TypeScript into `dist/`.
- **Stage 2 (deps):** Installs clean production dependencies with `--omit=dev`.
- **Stage 3 (runner):** Copies only compiled artifacts, production node_modules, and contract metadata. Executes as the non-root `node` user with a built-in healthcheck probe.

### Building and Running the Image

```bash
# Build the Docker image
docker build -t agribharat-backend:latest .

# Run container with environment variables
docker run -d \
  --name agribharat-backend \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/agribharat?sslmode=require" \
  -e JWT_SECRET="your-32-byte-secret-key-here" \
  -e FRONTEND_URL="https://agribharat.com" \
  agribharat-backend:latest
```

### Local / Staging Orchestration via Docker Compose

A complete `docker-compose.yml` is provided for running PostgreSQL alongside the backend:

```bash
# Start all services in the background
docker compose up -d

# View backend container logs
docker compose logs -f backend

# Verify health status
docker compose ps
```

The compose setup automatically mounts `create_tables.sql` into PostgreSQL's initialization directory to bootstrap a fresh database.

---

## 6. Cloud Platform Deployment Guidelines

### Render / Railway / Fly.io

1. **Build Command:** `npm run build`
2. **Start Command:** `npm run start`
3. **Environment Variables:** Set all required variables (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`).
4. **Health Check Path:** `/health` (Liveness) and `/ready` (Readiness).

### Kubernetes / AWS ECS

Configure your deployment with:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 5
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /ready
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 15
```

---

## 7. Security Hardening & Monitoring

1. **SSRF Guard:** Image URLs submitted for crop scans undergo DNS resolution and private/reserved IP checks (blocking loopback, RFC 1918, RFC 6598, RFC 3927, RFC 4193, and AWS/GCP metadata `169.254.169.254`).
2. **Rate Limiting:**
   - Auth endpoints (`/auth/register`, `/auth/login`): 10 requests per minute per IP.
   - Public Chatbot ask endpoint (`/chatbot/ask`): 10 requests per minute per IP.
3. **Graceful Shutdown:** The server traps `SIGTERM` and `SIGINT`, ceases accepting new HTTP requests, closes active PostgreSQL connections, and terminates cleanly within a 10-second window.
4. **Readiness Probe (`/ready`):** Returns `200 OK` with database ping latency, or `503 Service Unavailable` if PostgreSQL connection is severed.
