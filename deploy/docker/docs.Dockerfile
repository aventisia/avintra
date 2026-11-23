FROM node:22-bookworm-slim AS build
ARG BUILD_MODE=production
WORKDIR /src
COPY clients/docs/ ./
RUN --mount=type=cache,target=/root/.npm npm ci
RUN npm run build:${BUILD_MODE}

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY deploy/docker/nginx/static-root.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/out/ /usr/share/nginx/html/
