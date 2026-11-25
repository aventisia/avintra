# IMPORTANT NOTE: the lockfile holds only linux-x64 native packages, so build with --platform linux/amd64.
FROM node:22-bookworm-slim AS deps
WORKDIR /src/clients/web-apps
COPY clients/web-apps/ ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM deps AS build-frontend
ARG BUILD_MODE=production
RUN npx turbo run build --filter=accounts --filter=workspace --filter=studio -- --mode=${BUILD_MODE}

FROM deps AS build-global-admin
ARG BUILD_MODE=production
RUN npx turbo run build --filter=global-admin -- --mode=${BUILD_MODE}

FROM nginxinc/nginx-unprivileged:1.27-alpine AS frontend
COPY deploy/docker/nginx/frontend.conf /etc/nginx/conf.d/default.conf
COPY deploy/nginx/common_chat_preview_headers.conf /etc/nginx/snippets/
COPY --from=build-frontend /src/clients/web-apps/apps/accounts/dist/ /usr/share/nginx/html/accounts/
COPY --from=build-frontend /src/clients/web-apps/apps/workspace/dist/ /usr/share/nginx/html/workspace/
COPY --from=build-frontend /src/clients/web-apps/apps/studio/dist/ /usr/share/nginx/html/studio/

FROM nginxinc/nginx-unprivileged:1.27-alpine AS global-admin-app
COPY deploy/docker/nginx/spa-root.conf /etc/nginx/conf.d/default.conf
COPY --from=build-global-admin /src/clients/web-apps/apps/global-admin/dist/ /usr/share/nginx/html/

FROM nginx:1.27-alpine AS edge
RUN rm /etc/nginx/conf.d/default.conf
COPY deploy/nginx/nginx.conf /etc/nginx/nginx.conf
COPY deploy/nginx/common_map.conf /etc/nginx/conf.d/
COPY deploy/nginx/common_api_config.conf deploy/nginx/common_headers.conf deploy/nginx/common_ssl.conf deploy/nginx/common_chat_preview_headers.conf /etc/nginx/snippets/
COPY deploy/nginx/sites-available/avintra.app.conf /etc/nginx/conf.d/
COPY deploy/nginx/404.html deploy/nginx/502.html /usr/share/nginx/html/
COPY --from=build-frontend /src/clients/web-apps/apps/accounts/dist/ /usr/share/nginx/html/accounts/
COPY --from=build-frontend /src/clients/web-apps/apps/workspace/dist/ /usr/share/nginx/html/workspace/
COPY --from=build-frontend /src/clients/web-apps/apps/studio/dist/ /usr/share/nginx/html/studio/
COPY --chmod=755 deploy/nginx/docker-entrypoint.sh /usr/local/bin/
EXPOSE 80 443
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
