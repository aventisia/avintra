
FROM nginx:alpine

# Copy main nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy all common config files
COPY common_api_config.conf /etc/nginx/conf.d/common_api_config.conf
COPY common_headers.conf /etc/nginx/conf.d/common_headers.conf
COPY common_map.conf /etc/nginx/conf.d/common_map.conf
COPY common_ssl.conf /etc/nginx/conf.d/common_ssl.conf

# In Docker, Nginx loads configs from conf.d/ (not sites-available/sites-enabled as on VPS). Copy site config directly:
COPY sites-available/accounts.aventisia.com /etc/nginx/conf.d/accounts.aventisia.com.conf

# (Optional) Copy static files for accounts client if needed
# COPY ../reactjs/apps/accounts/dist /usr/share/nginx/html/accounts
