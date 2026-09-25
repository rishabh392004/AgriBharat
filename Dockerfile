# ==========================================
# Root Dockerfile for AgriBharat Backend
# ==========================================

# Stage 1: Build & TypeScript compilation
FROM node:22-slim AS builder

WORKDIR /app

# Copy backend package manifests and configuration
COPY backend/package*.json ./
COPY backend/tsconfig.json ./
COPY backend/prisma.config.ts ./

# Install all dependencies
RUN npm ci

# Copy backend source and migrations
COPY backend/src/ ./src/
COPY backend/migrations/ ./migrations/

# Generate Prisma contract and compile TypeScript to JavaScript in dist/
RUN npm run contract:emit && npm run build

# Stage 2: Production dependencies only
FROM node:22-slim AS deps

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 3: Lightweight production runtime
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000

USER node

COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/src/prisma/contract.json ./src/prisma/contract.json

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:5000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"]

CMD ["node", "dist/server.js"]
