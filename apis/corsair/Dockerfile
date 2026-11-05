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
ENV PORT=4006
ENV PYTHONUNBUFFERED=1

# Runtime configuration is injected via environment variables at deploy time
# (see .env.example). APP_BASE_URL, CORSAIR_KEK and the
# POSTGRESQL_* values must be provided by the orchestrator/deployment.

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /build/dist ./dist

# Read by dist/seed-corsair-tools.js when seeding runs inside this image.
COPY src/data/popular-tools.json ./dist/data/popular-tools.json

# migration.sql is read at runtime by dist/migrate.js (resolved relative to the
# compiled file, which sits at /app/dist/migrate.js -> /app/migration.sql).
COPY migration.sql ./

EXPOSE 4006

# Run the (idempotent) migration, then start the app.
# NOTE: Corsair config artifacts are generated in the monorepo (npm run
# generate:configs). The mapping + sibling artifacts are committed into the
# Workspace API codebase ConfigFiles folder and deploy with the Workspace API;
# the thousands of per-plugin configs are rsynced to the shared server files
# path by Jenkins. The sidecar container does not generate them at runtime.
CMD ["sh", "-c", "node dist/migrate.js && node dist/main.js"]
