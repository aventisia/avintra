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
ENV APP_URL=http://localhost:3456
ENV PYTHONUNBUFFERED=1

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /build/dist ./dist

EXPOSE 3456

CMD ["node", "dist/main.js"]
