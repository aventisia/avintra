#!/bin/sh
set -e

# Check if APP_BASE_URL is provided
if [ -z "$APP_BASE_URL" ]; then
    echo "ERROR: APP_BASE_URL environment variable is required"
    echo "Usage example: docker run -e APP_BASE_URL=avintra.your-domain.com ..."
    exit 1
fi

echo "Configuring nginx for domain: $APP_BASE_URL"

# Set CSP values based on ENABLE_RAZORPAY flag
if [ "$ENABLE_RAZORPAY" = "true" ]; then
    echo "Enabling Razorpay integration in CSP"
    CSP_SCRIPT_SRC=" https://checkout.razorpay.com"
    CSP_FRAME_SRC=" https://api.razorpay.com"
    CSP_CONNECT_SRC=" https://lumberjack.razorpay.com"
else
    echo "Razorpay integration disabled"
    CSP_SCRIPT_SRC=""
    CSP_FRAME_SRC=""
    CSP_CONNECT_SRC=""
fi

# Replace placeholders in config files
sed -i "s|\${APP_BASE_URL}|$APP_BASE_URL|g" /etc/nginx/conf.d/aventisia.avplatform.conf
sed -i "s|\${APP_BASE_URL}|$APP_BASE_URL|g" /etc/nginx/conf.d/common_headers.conf
sed -i "s|\${CSP_SCRIPT_SRC}|$CSP_SCRIPT_SRC|g" /etc/nginx/conf.d/common_headers.conf
sed -i "s|\${CSP_FRAME_SRC}|$CSP_FRAME_SRC|g" /etc/nginx/conf.d/common_headers.conf
sed -i "s|\${CSP_CONNECT_SRC}|$CSP_CONNECT_SRC|g" /etc/nginx/conf.d/common_headers.conf

# Execute the default nginx entrypoint
exec /docker-entrypoint.sh "$@"