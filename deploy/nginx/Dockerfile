FROM nginx:alpine

# Remove default site config to avoid serving the default Nginx welcome page
#RUN rm /etc/nginx/conf.d/default.conf || true

# Copy custom entrypoint script
COPY deploy/nginx/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy main nginx config
COPY deploy/nginx/nginx.conf /etc/nginx/nginx.conf

# Copy all common config files
COPY deploy/nginx/common_*.conf /etc/nginx/conf.d/

# In Docker, Nginx loads configs from conf.d/ (not sites-available/sites-enabled as on VPS). Copy site config directly:
COPY deploy/nginx/sites-available/aventisia.avplatform /etc/nginx/conf.d/aventisia.avplatform.conf

# Copy custom error pages
COPY deploy/nginx/404.html /usr/share/nginx/html/404.html
COPY deploy/nginx/502.html /usr/share/nginx/html/502.html

# Copy static files for reactjs clients
COPY clients/worc-web-legacy/accounts/dist /usr/share/nginx/html/accounts
COPY clients/worc-web-legacy/workspace/dist /usr/share/nginx/html/workspace
COPY clients/worc-web-legacy/studio/dist /usr/share/nginx/html/studio

# Create necessary directories
RUN mkdir -p /var/log/nginx

# Expose ports
EXPOSE 80 443

# Start nginx
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]