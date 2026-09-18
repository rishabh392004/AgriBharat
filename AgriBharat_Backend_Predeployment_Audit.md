# AgriBharat Backend — Pre-Deployment Audit
*Senior backend review · based on direct inspection of the uploaded zip, `npm run build`, and `npm test`*

**Verified environment facts:**
- `npx tsc --noEmit` → **passes clean**, zero type errors.
- `npx vitest run` → **17 passed, 1 suite failed** (`src/routes.integration.test.ts` — crashes at import time because `src/config/env.ts` throws a ZodError for missing `FRONTEND_URL`/`JWT_SECRET`; no `.env` is present for the test run and nothing stubs these vars).
- No `Dockerfile`, `docker-compose.yml`, or any deployment manifest exists anywhere in the repo.
- Stack: Express 5.2.1, a Prisma-family contract ORM (`@prisma/orm-postgres`), Zod 4, JWT + bcryptjs, `express-rate-limit`, Helmet.

---

## CRITICAL — must fix before deployment

### C1. Migration history does not match the application's schema
**Where:** `backend/migrations/app/` vs `backend/src/prisma/contract.prisma`

`contract.prisma` defines `Scan.cropName`, `Scan.latitude`, `Scan.longitude`, and the entire `DiseaseResult`, `Message`, and `OfficerProfile` models. I grepped every migration file (`migrations/app/*/migration.ts`, `*.json`) for these names — **zero matches**. The last tracked migration (`20260905T2103_add_scan_farm_relation`) only adds the `Scan → Farm` foreign key; `refs/db.json` confirms this is the latest applied migration (hash `0dea0b671eaf...`).

**Why it's a problem:** anyone provisioning a fresh database using the tracked migrations gets a DB missing three entire tables and three columns the code writes to on every request.

**Deployment impact:** `createScan` (writes `cropName`/`latitude`/`longitude`), `diagnoseScan` (writes to `DiseaseResult`), `sendMessage` (writes to `Message`), and `createOfficerProfile` (writes to `OfficerProfile`) will all fail with a raw Postgres "column/relation does not exist" error on a freshly migrated database. Only auth, farm CRUD, and bare scan creation (minus 3 columns) would work.

**Fix:** generate the missing migration(s) before anything else:
```bash
cd backend
npx prisma contract emit   # regenerate contract.json/contract.d.ts from contract.prisma
# then generate + apply a migration that brings the DB up to the current contract —
# follow whatever this ORM's migration-diff command is (see prisma-next.md in the repo);
# do NOT hand-write DDL for this — let the tool diff contract.prisma against the last snapshot.
```
Then verify `refs/db.json`'s hash matches the snapshot generated from the current `contract.prisma`.

---

### C2. `create_tables.sql` is stale and will silently produce a broken database
**Where:** `backend/create_tables.sql`

This file creates `user`, `farm`, `scan`, `officerProfile` — but is missing `message` and `disease_result` entirely, and its `scan` table has no `cropName`/`latitude`/`longitude` columns.

**Why it's a problem:** it looks like a legitimate "run this to set up your DB" script (it's even commented that way), but it's out of sync with the real schema — same root cause as C1.

**Fix:** delete this file and document the real migration path (`npx prisma contract emit` + the migration runner) as the only supported way to provision a database, or regenerate it from the current contract if you want to keep a plain-SQL option.

---

### C3. SSRF via unrestricted `imageUrl` in the ML diagnosis pipeline
**Where:** `backend/src/scan/scan.schema.ts:5` (`imageUrl: z.string().trim().url()`) → `backend/src/diagnosis/diagnosis.provider.ts:222` (`fetch(input.imageUrl, ...)`)

Any authenticated user can create a scan with an arbitrary `imageUrl` — including `http://169.254.169.254/...` (cloud metadata service), `http://localhost:5432`, or any internal-network address. `realMlProvider.diagnose()` runs `fetch()` on that URL **from the backend server itself**, with no scheme restriction, no private/reserved-IP blocking, and no host allowlist.

**Why it's a problem:** this is textbook SSRF. The backend becomes a proxy an attacker can use to probe your internal network, hit cloud metadata endpoints (potentially leaking IAM credentials on AWS/GCP), or port-scan internal services — success/failure and timing differences leak information even without the response body being returned directly.

**Deployment impact:** critical security hole, exploitable by any registered user (farmer account is enough — no elevated role needed).

**Fix — validate before every server-side fetch of a user-supplied URL:**
```ts
import { isIP } from "node:net";
import dns from "node:dns/promises";

const BLOCKED_HOSTS = new Set(["localhost", "0.0.0.0"]);

function isPrivateOrReservedIp(ip: string): boolean {
  // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16, ::1, fc00::/7
  return (
    /^10\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^127\./.test(ip) ||
    /^169\.254\./.test(ip) ||
    ip === "::1" ||
    /^fc[0-9a-f]{2}:/i.test(ip)
  );
}

export async function assertPublicHttpUrl(rawUrl: string): Promise<void> {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new AppError("Only http/https image URLs are allowed", 400);
  }
  if (BLOCKED_HOSTS.has(url.hostname)) {
    throw new AppError("This image URL is not allowed", 400);
  }
  if (isIP(url.hostname) && isPrivateOrReservedIp(url.hostname)) {
    throw new AppError("This image URL is not allowed", 400);
  }
  if (!isIP(url.hostname)) {
    const { address } = await dns.lookup(url.hostname);
    if (isPrivateOrReservedIp(address)) {
      throw new AppError("This image URL is not allowed", 400);
    }
  }
}
```
Call this in `createScan` (fail fast, before ever hitting the DB) **and again** immediately before the `fetch()` in `diagnosis.provider.ts` (DNS can change between scan-creation time and diagnosis time — this is a TOCTOU/DNS-rebinding consideration, not just a one-time check). Stronger option if your image hosting is fixed: skip all of this and only accept URLs from a known host allowlist (e.g. your own S3/Cloudinary bucket domain).

---

### C4. Unauthenticated, unrated proxy to a paid external AI API
**Where:** `backend/src/chatbot/chatbot.routes.ts:20`

`POST /api/v1/chatbot/ask` has no `authMiddleware` and no rate limiter — it's explicitly commented as intentionally public. It proxies straight to a Gemini-backed Python service.

**Why it's a problem:** this is an open, free relay to a metered external AI API. Anyone on the internet can script requests against it with no cap.

**Deployment impact:** direct cost exposure (Gemini API billing) and quota exhaustion that would take down the chatbot for legitimate users — a classic cost-based DoS, and the easiest one for someone to stumble into by accident, not even maliciously.

**Fix (minimum, before deploy):**
```ts
import rateLimit from "express-rate-limit";

const chatbotRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many questions. Please wait a moment and try again." },
});

router.post("/ask", chatbotRateLimit, askController);
```
If keeping it public is a deliberate product decision (farmers without accounts should be able to ask questions), the rate limit above is the non-negotiable minimum. Consider a stricter per-IP-and-day cap on top given it's paid-API-backed.

---

### C5. Test suite fails in its current state
**Where:** `src/config/env.ts:27` via `src/routes.integration.test.ts`

`env.ts` runs `envSchema.parse(process.env)` at module-import time with no defaults for `FRONTEND_URL`/`JWT_SECRET`. There's no `.env.test`, no `vi.stubEnv` setup, and no test-specific env bootstrapping — so the integration test file crashes before a single test runs.

**Deployment impact:** `npm test` does not pass out of the box. If this is gated in CI before deploy (it should be), the pipeline is currently red.

**Fix:** add a `vitest.setup.ts` that stubs the required env vars for tests, wire it into `vitest.config.ts`'s `setupFiles`, or create a checked-in `.env.test` loaded via `dotenv` before imports run. Simplest version:
```ts
// vitest.setup.ts
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.FRONTEND_URL ??= "http://localhost:3000";
process.env.JWT_SECRET ??= "test-secret-at-least-32-characters-long";
```

---

### C6. No deployment configuration exists
**Where:** repo root / `backend/`

No `Dockerfile`, no `docker-compose.yml`, no process manager config (PM2, systemd unit), no platform config (`render.yaml`, `railway.json`, `Procfile`). `package.json`'s `start` script (`node dist/server.js`) assumes a `build` step ran first, but nothing documents the actual deploy sequence.

**Fix:** minimum viable Dockerfile before shipping:
```dockerfile
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/src/prisma/contract.json ./src/prisma/contract.json
EXPOSE 5000
CMD ["node", "dist/server.js"]
```
(Verify `contract.json`/`contract.d.ts` are actually needed at runtime by `db.ts` — they are imported directly, so they must ship in the image; I can't verify the exact runtime file layout this ORM expects without its docs, so treat the COPY paths above as a starting point to test, not a guarantee.)

---

## HIGH — strongly recommended before deployment

### H1. No size limit on server-side image download
**Where:** `diagnosis.provider.ts:233` — `imageBuffer = await imageRes.arrayBuffer();`

No `Content-Length` check before buffering the whole response into memory. A large or malicious URL (even a legitimate but huge file) can exhaust server memory under concurrent scans.
**Fix:** check `imageRes.headers.get("content-length")` against a cap (e.g. 10 MB) before calling `.arrayBuffer()`, and reject early if it's missing or over the limit; stream-read with a manual size guard if the host doesn't send `Content-Length`.

### H2. `trust proxy` is not set
**Where:** `server.ts`

No `app.set("trust proxy", ...)` anywhere. Any deployment behind a load balancer, reverse proxy, or PaaS (Render, Railway, Fly.io, nginx — virtually every realistic deployment target) means Express sees the proxy's IP for every request.
**Deployment impact:** `express-rate-limit` on `/auth/register`, `/auth/login`, and anywhere else IP-based limiting is used will either throw (newer versions detect this misconfiguration and error) or silently rate-limit all users as one shared bucket.
**Fix:** `app.set("trust proxy", 1);` (or the specific number of proxy hops your platform sits behind) before registering the rate limiters.

### H3. No way to create an OFFICER-role user
**Where:** `auth.service.ts:36` (registration always uses the DB default `role="USER"`) + `officer.service.ts:38` (`createOfficerProfile` requires `role === "OFFICER"`)

There is no endpoint anywhere in the codebase that sets a user's role to `OFFICER` (or `ADMIN`). The officer-review feature the product depends on is currently unreachable without a manual `UPDATE "user" SET role='OFFICER'` in the database.
**Fix:** either a seed script for known officer accounts, or a minimal admin-only endpoint (`PATCH /api/v1/admin/users/:id/role`, gated by the currently-unused `authorize` middleware) to promote a user.

### H4. `authorize` RBAC middleware is defined but never used
**Where:** `auth/authorize.middleware.ts` — zero call sites anywhere in `src/`

Role checks that do exist (e.g. officer profile creation) are done manually inside service functions instead of consistently at the route layer via `authorize(...)`. This isn't broken today, but it means every new route has to remember to add its own manual role check — one missed check is a silent authorization bug.
**Fix:** apply `authorize(OFFICER_ROLE)` at the route level for officer-only endpoints, `authorize(ADMIN_ROLE)` for admin ones, and reserve service-layer checks for cases that need data (not just role) to decide.

### H5. Scans can get permanently stuck in `PROCESSING`
**Where:** `diagnosis.service.ts:53` + `38-40`

If the process crashes or restarts between `setScanStatus(scanId, "PROCESSING")` and the ML call completing, the scan is stuck — `diagnoseScan` explicitly refuses to re-run diagnosis while status is `PROCESSING` (409), and nothing ever resets that state.
**Fix:** add a timeout-based reconciliation — either a periodic job that resets `PROCESSING` scans older than N minutes back to a retryable state, or record a `processingStartedAt` timestamp and let `diagnoseScan` treat a stale `PROCESSING` (older than your ML timeout) as retryable instead of permanently blocked.

---

## MEDIUM

| # | Where | Issue | Fix |
|---|---|---|---|
| M1 | `scan.service.ts:88-101` `getScansByUser` | N+1 query — one `Scan.where({farmId})` per farm in a loop | Single query: `Scan.where({ farmId: { in: farmIds } })` if the query builder supports `in`, else at minimum batch/parallelize with `Promise.all` |
| M2 | `contract.prisma` — every `@relation` | No `onDelete` behavior specified anywhere (Scan→Farm, Farm→User, Message→User×2, DiseaseResult→Scan, OfficerProfile→User) | Deleting a Farm with existing Scans (or a User with existing Farms/Messages) will hit a raw Postgres FK-violation, surfaced by `errorMiddleware` as a generic 500 instead of a clean "cannot delete: has dependent records" 409. Decide `onDelete: Restrict` vs `Cascade` per relation explicitly, and catch the FK-violation error in the delete service functions to return a proper 409 |
| M3 | `officer.routes.ts:34`, `officer.controller.ts` | `GET /profile/:userId` has no role restriction — any authenticated user (farmer or officer) can look up any officer's phone number and office address | Confirm this is intentional; if only farmers should discover officers (per the `message` module's `GET /officers`), restrict the fuller profile (phone/address) or add `authorize` |
| M4 | `server.ts:19` | `http://localhost:3000`/`127.0.0.1:3000` are permanently in the CORS allowlist, including in production | Gate the localhost origins behind `process.env.NODE_ENV !== "production"` |
| M5 | `error.middleware.ts` | Malformed JSON body (`express.json()` parse failure) isn't special-cased — falls through to the generic 500 instead of 400 | Add a check: `if (error instanceof SyntaxError && "body" in error) return res.status(400).json({ message: "Malformed JSON body" })` |
| M6 | `contract.prisma` — `DiseaseResult.actions/precautions/top3Predictions/weatherContext` | Structured data stored as `String` (JSON.stringify'd) rather than a native JSON column | Not urgent for MVP scale, but not queryable as-is, and `getDiagnosis`'s parse failures are silently swallowed into defaults — worth a native `Json` column if the ORM supports one |
| M7 | `server.ts:34-39` | `/health` always returns 200 regardless of DB or ML-service reachability | Add an actual readiness check: attempt a lightweight DB query and (optionally) the ML service's own `/health`, return 503 if either is down |
| M8 | `server.ts` | No `SIGTERM`/`SIGINT` handler — no graceful shutdown | Wrap `app.listen()` result, and on signal: stop accepting new connections, close the DB client, then exit |

---

## LOW

- `mockDiagnosisProvider` stays exported from `diagnosis.provider.ts` even though `getDiagnosisProvider()` always returns `realMlProvider` now — harmless (used directly by tests), but worth a comment noting it's test-only, not a runtime fallback.
- Mixed CRLF/LF line endings still present in some files (e.g. `auth.middleware.ts`) despite `.gitattributes` existing — cosmetic, but keeps causing noisy diffs; confirm `.gitattributes` actually has `* text=auto` and that everyone's re-committed through it once.
- `updateScanStatusSchema` in `scan.schema.ts` is defined but no route uses it anymore — safe dead code, fine to delete (and worth noting: this also means the earlier arbitrary-status-PATCH issue from an older version of this module is now resolved by removing that route entirely).
- `.agents/`, `.claude/`, `.cursor/`, `.devin/` skill directories are committed inside `backend/` — not a runtime risk, just repo hygiene.

---

## Cannot verify from this codebase alone
- Actual runtime behavior of `@prisma/orm-postgres` (rc package) around connection pooling, retry behavior, and what exactly `db.ts` needs present at deploy time beyond `contract.json`/`contract.d.ts` — I don't have reliable documentation for an rc-tagged package; test this explicitly in a staging deploy rather than trusting the Dockerfile sketch in C6 as final.
- Whether `ML_SERVICE_URL` in a real deployment points to a service reachable from wherever this Node backend is hosted (network/firewall reachability) — infrastructure-dependent, not visible in code.
- Whether `DATABASE_URL` in the real production environment enforces TLS (`sslmode=require`) — not set in `.env.example`, worth confirming with whichever Postgres host you use (many require or strongly recommend it).

---

## Must fix before deployment
C1, C2, C3, C4, C5, C6 — every Critical above. C1/C2 mean the app is **non-functional** on a fresh database today, independent of any security concern.

## Strongly recommended (fix this week, ideally before or immediately after first deploy)
H1–H5, plus M2 and M4 (quick, high-value fixes).

## Post-deployment improvements
M1, M3, M5, M6, M7, M8, all Low items.

---

## Prioritized remediation checklist
1. Generate the missing migration for `DiseaseResult`/`Message`/`OfficerProfile`/new `Scan` columns; delete or regenerate `create_tables.sql` (C1, C2)
2. Add SSRF guard on `imageUrl` — at scan-creation time and again at diagnosis time (C3)
3. Rate-limit `POST /api/v1/chatbot/ask` (C4)
4. Fix the test suite's env bootstrapping so `npm test` is green (C5)
5. Write a Dockerfile and document the actual deploy/build/start sequence (C6)
6. Add `app.set("trust proxy", ...)` (H2) — cheap, high-impact, easy to forget
7. Add a size cap to the ML-provider image download (H1)
8. Decide and implement officer-account creation path (H3)
9. Wire `authorize` into officer/admin-only routes (H4)
10. Add stale-`PROCESSING` reconciliation (H5)
11. Work through the Medium table as time allows

## Verification commands
```bash
# Build must be clean
npm run build

# Tests must pass (fix C5 first)
npm test

# Confirm migration parity with contract.prisma (after fixing C1)
npx prisma contract emit
git diff --stat src/prisma/contract.json src/prisma/contract.d.ts   # should be empty after a correct migration

# Confirm authorize() actually gets used somewhere
grep -rn "authorize(" src --include=*.ts | grep -v test

# Manual SSRF check (after fix) — should be rejected, not attempted
curl -X POST http://localhost:5000/api/v1/scans \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"farmId":1,"imageUrl":"http://169.254.169.254/latest/meta-data/"}'

# Manual chatbot rate-limit check (after fix) — 11th request in a minute should 429
for i in $(seq 1 11); do curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  http://localhost:5000/api/v1/chatbot/ask -H "Content-Type: application/json" \
  -d '{"question":"test"}'; done
```

## Go / No-Go
**No-Go.**

The blocking reason isn't primarily security — it's that **C1/C2 mean this backend cannot function correctly on a freshly provisioned database right now.** Diagnosis results, messaging, and officer profiles will all fail on first use outside your current dev database, because the tracked migrations never caught up to `contract.prisma`. On top of that, C3 and C4 are real, exploitable issues (SSRF and an unmetered paid-API proxy) that shouldn't ship regardless of the schema problem.

Fix C1–C6, re-run the verification commands above, and this becomes a reasonable Go for an MVP-scale deployment — the architecture underneath (ownership checks, layered validation, a genuinely well-built ML response schema with Zod) is solid. The gaps are specific and fixable, not systemic.
