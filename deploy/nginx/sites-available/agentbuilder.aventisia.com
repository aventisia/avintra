server
{
	listen 80;
	server_name agentbuilder.aventisia.com dev-agentbuilder.aventisia.com uat-agentbuilder.aventisia.com;
	return 301 https://$host$request_uri;
}

server
{
	listen 443 ssl;
	http2 on;
	server_name agentbuilder.aventisia.com dev-agentbuilder.aventisia.com uat-agentbuilder.aventisia.com;
	
	# Include common config
	include /etc/nginx/conf.d/common_ssl.conf;
	include /etc/nginx/conf.d/common_headers.conf;

	# API (first)
	
	# Client (second)
	location / {
		root /usr/share/nginx/html/agentbuilder;
		try_files $uri $uri.html $uri/ /index.html =404;
	}
}