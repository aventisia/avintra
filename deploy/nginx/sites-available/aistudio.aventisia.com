server
{
	listen 80;
	server_name aistudio.aventisia.com dev-aistudio.aventisia.com uat-aistudio.aventisia.com;
	return 301 https://$host$request_uri;
}

server
{
	listen 443 ssl;
	http2 on;
	server_name aistudio.aventisia.com uat-aistudio.aventisia.com dev-aistudio.aventisia.com docker-aistudio.aventisia.com;
	
	# Include common config
	include /etc/nginx/conf.d/common_ssl.conf;
	include /etc/nginx/conf.d/common_headers.conf;

	# API (first)
	location /api/ {
		proxy_pass http://localhost:4002;
		include /etc/nginx/conf.d/common_api_config.conf;
	}

	# Client (second)
	location / {
		root /usr/share/nginx/html/aistudio;
		try_files $uri $uri.html $uri/ /index.html =404;
	}
}