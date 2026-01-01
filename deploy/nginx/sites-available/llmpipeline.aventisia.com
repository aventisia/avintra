server
{
	listen 80;
	server_name llmpipeline.aventisia.com dev-llmpipeline.aventisia.com uat-llmpipeline.aventisia.com;
	return 301 https://$host$request_uri;
}

server
{
	listen 443 ssl;
	http2 on;
	server_name llmpipeline.aventisia.com dev-llmpipeline.aventisia.com uat-llmpipeline.aventisia.com;
	
	# Include common config
	include /etc/nginx/conf.d/common_ssl.conf;
	include /etc/nginx/conf.d/common_headers.conf;

	# API (first)
	location /api/ {
		proxy_pass http://localhost:4003;
		include /etc/nginx/conf.d/common_api_config.conf;
	}

	# Client (second)
}