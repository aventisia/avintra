# Stage 1: Build stage
FROM node:22-slim AS builder
WORKDIR /build

COPY package.json package-lock.json* ./
# IMPORTANT NOTE: --force is required; the @corsair-dev plugins have conflicting zod peer ranges (same as Jenkins).
RUN npm ci --force

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

RUN CORSAIR_CONFIG_DIR=/seed/corsair-configs npm run generate:configs

# Stage 2: Final runtime stage
FROM node:22-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4006
ENV PYTHONUNBUFFERED=1

# Runtime configuration is injected via environment variables at deploy time
# (see .env.example). APP_BASE_URL, CORSAIR_KEK and the
# POSTGRESQL_* values must be provided by the orchestrator/deployment.

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --force

COPY --from=builder /build/dist ./dist

COPY --from=builder /seed/corsair-configs /seed/corsair-configs

# Read by dist/seed-corsair-tools.js when seeding runs inside this image.
COPY src/data/popular-tools.json ./dist/data/popular-tools.json

# migration.sql is read at runtime by dist/migrate.js (resolved relative to the
# compiled file, which sits at /app/dist/migrate.js -> /app/migration.sql).
COPY migration.sql ./

EXPOSE 4006

# Run the (idempotent) migration, then start the app.
# IMPORTANT NOTE: exec lets node receive SIGTERM from docker stop.
CMD ["sh", "-c", "node dist/migrate.js && exec node dist/main.js"]
