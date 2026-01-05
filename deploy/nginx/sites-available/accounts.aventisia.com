server
{
	listen 80;
	server_name accounts.aventisia.com uat-accounts.aventisia.com dev-accounts.aventisia.com docker-accounts.aventisia.com;
	return 301 https://$host$request_uri;
}

server
{
	listen 443 ssl;
	http2 on;
	server_name accounts.aventisia.com uat-accounts.aventisia.com dev-accounts.aventisia.com docker-accounts.aventisia.com;
	
	# Include common config
	include /etc/nginx/conf.d/common_ssl.conf;
	include /etc/nginx/conf.d/common_headers.conf;

	# Sensitive endpoints — TURN OFF compression
    location ~ ^/api/(auth|me) {
        gzip off;
		proxy_pass http://worc-accounts-apis:4000;
		include /etc/nginx/conf.d/common_api_config.conf;
    }
	
	# API (first)
	location /api/ {
		proxy_pass http://worc-accounts-apis:4000;
		include /etc/nginx/conf.d/common_api_config.conf;
	}

	# Client (second)
	location / {
		root /usr/share/nginx/html/accounts;
		try_files $uri $uri.html $uri/ /index.html =404;
	}
}