# ==========================================
# Multi-stage Dockerfile for AgriBharat Backend
# ==========================================

# Stage 1: Build & TypeScript compilation
FROM node:22-slim AS builder

WORKDIR /app

# Copy package manifests and configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma.config.ts ./

# Install all dependencies (including devDependencies required for compilation and Prisma contract)
RUN npm ci

# Copy application source, migrations, and reference snapshots
COPY src/ ./src/
COPY migrations/ ./migrations/
COPY refs/ ./refs/

# Generate Prisma contract and compile TypeScript to JavaScript in dist/
RUN npm run contract:emit && npm run build

# Stage 2: Production dependencies only
FROM node:22-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 3: Lightweight production runtime
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000

# Run as non-root unprivileged node user
USER node

# Copy production node_modules and manifests
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json

# Copy compiled application code and Prisma artifacts
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/src/prisma/contract.json ./src/prisma/contract.json
COPY --chown=node:node --from=builder /app/migrations ./migrations

EXPOSE 5000

# Healthcheck checking the active process via readiness endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 5000) + '/ready').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "dist/server.js"]
