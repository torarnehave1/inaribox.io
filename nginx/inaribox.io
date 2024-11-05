server {
    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot

    server_name inaribox.io www.inaribox.io;

    root /var/www/html/inaribox.io;
    index index.html index.htm index.nginx-debian.html;

    ssl_certificate /etc/letsencrypt/live/inaribox.io/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/inaribox.io/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    access_log /var/log/nginx/inaribox.access.log;
    error_log /var/log/nginx/inaribox.error.log;

    # Main location serving static files
    location / {
        try_files $uri $uri/ =404;
    }

    # Optional: Proxy requests to Node.js app on port 3004
    location /api {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Custom error page for 404s
    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}

server {
    listen 80;
    listen [::]:80;

    server_name inaribox.io www.inaribox.io;

    # Redirect all HTTP requests to HTTPS
    return 301 https://$host$request_uri;
}
