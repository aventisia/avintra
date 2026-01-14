FROM nginx:alpine

# Remove default site config to avoid serving the default Nginx welcome page
RUN rm /etc/nginx/conf.d/default.conf || true

# Copy main nginx config
COPY deploy/nginx/nginx.conf /etc/nginx/nginx.conf

# Copy all common config files
COPY deploy/nginx/common_api_config.conf /etc/nginx/conf.d/common_api_config.conf
COPY deploy/nginx/common_headers.conf /etc/nginx/conf.d/common_headers.conf
COPY deploy/nginx/common_map.conf /etc/nginx/conf.d/common_map.conf
COPY deploy/nginx/common_ssl.conf /etc/nginx/conf.d/common_ssl.conf

# In Docker, Nginx loads configs from conf.d/ (not sites-available/sites-enabled as on VPS). Copy site config directly:
COPY deploy/nginx/sites-available/worc.app /etc/nginx/conf.d/worc.app.conf

# Copy static files for reactjs clients
COPY clients/worc-web-legacy/accounts/dist /usr/share/nginx/html/accounts
COPY clients/worc-web-legacy/workspace/dist /usr/share/nginx/html/worc
COPY clients/worc-web-legacy/studio/dist /usr/share/nginx/html/agentbuilder
COPY clients/worc-web-legacy/ml-model-builder/dist /usr/share/nginx/html/aistudio