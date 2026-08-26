# Stage 1: Build stage
FROM node:22-slim AS builder
WORKDIR /build

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2: Final runtime stage
FROM node:22-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3456
ENV PYTHONUNBUFFERED=1

# Runtime configuration is injected via environment variables at deploy time
# (see .env.example). APP_URL, CORSAIR_KEK, CORSAIR_API_KEY and the
# POSTGRESQL_* values must be provided by the orchestrator/deployment.

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /build/dist ./dist

# migration.sql is read at runtime by dist/migrate.js (resolved relative to the
# compiled file, which sits at /app/dist/migrate.js -> /app/migration.sql).
COPY migration.sql ./

EXPOSE 3456

# Run the (idempotent) migration before starting the app.
CMD ["sh", "-c", "node dist/migrate.js && node dist/main.js"]
