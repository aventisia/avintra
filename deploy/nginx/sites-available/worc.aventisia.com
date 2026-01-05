server
{
	listen 80;
	server_name worc.aventisia.com uat-worc.aventisia.com dev-worc.aventisia.com docker-worc.aventisia.com;
	return 301 https://$host$request_uri;
}

server
{
	listen 443 ssl;
	http2 on;
	server_name worc.aventisia.com uat-worc.aventisia.com dev-worc.aventisia.com docker-worc.aventisia.com;
	
	# Include common config
	include /etc/nginx/conf.d/common_ssl.conf;
	include /etc/nginx/conf.d/common_headers.conf;

	# Sensitive endpoints — TURN OFF compression
    location ~ ^/api/(app-secret) {
        gzip off;
		proxy_pass http://worc-apis:4001;
		include /etc/nginx/conf.d/common_api_config.conf;
    }
	
	# API (first)
	location /api/ {
		proxy_pass http://worc-apis:4001;
		include /etc/nginx/conf.d/common_api_config.conf;
	}

	# Client (second)
	location / {
		root /usr/share/nginx/html/worc;
		try_files $uri $uri.html $uri/ /index.html =404;
	}
}