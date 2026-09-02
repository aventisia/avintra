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
# Generated config artifacts are written here at startup. Mount this as a
# shared volume so the Workspace API can read them from its own
# <UploadDirectory>/config/corsair path.
ENV CORSAIR_CONFIG_DIR=/app/config/corsair
# The global Cloud Connector mapping is owned by the Workspace API codebase,
# which is not present in this container. Point cleanup at the shared volume.
ENV CORSAIR_GLOBAL_MAPPING_FILE=/app/config/corsair/CloudConnectorActionSelectorMappingFile.json

# Runtime configuration is injected via environment variables at deploy time
# (see .env.example). APP_URL, CORSAIR_KEK and the
# POSTGRESQL_* values must be provided by the orchestrator/deployment.

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /build/dist ./dist

# migration.sql is read at runtime by dist/migrate.js (resolved relative to the
# compiled file, which sits at /app/dist/migrate.js -> /app/migration.sql).
COPY migration.sql ./

EXPOSE 3456

# Run the (idempotent) migration, generate config artifacts, then start the app.
CMD ["sh", "-c", "node dist/migrate.js && node dist/generate-corsair-configs.js && node dist/main.js"]
