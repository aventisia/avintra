server
{
	listen 80;
	server_name docs.aventisia.com dev-docs.aventisia.com uat-docs.aventisia.com;
	return 301 https://$host$request_uri;
}

server
{
	listen 443 ssl;
	http2 on;
	server_name docs.aventisia.com dev-docs.aventisia.com uat-docs.aventisia.com;
	
	# Include common config
	include /etc/nginx/conf.d/common_ssl.conf;
	include /etc/nginx/conf.d/common_headers.conf;

	# API (first)
	
	# Client (second)
	location / {
		root /usr/share/nginx/html/docs;
		try_files $uri $uri.html $uri/ /index.html =404;
	}
}