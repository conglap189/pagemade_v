#!/bin/bash
# Setup Cloudflare Origin Certificate for Full SSL mode

echo "🔐 Cloudflare Origin Certificate Setup"
echo "========================================"
echo ""
echo "This script will setup Full SSL mode with Cloudflare Origin Certificate"
echo ""
echo "Prerequisites:"
echo "1. You need certificate from: Cloudflare Dashboard → SSL/TLS → Origin Server"
echo "2. Create certificate with default settings (RSA 2048, 15 years)"
echo "3. Have the certificate and private key ready to paste"
echo ""

read -p "Do you have the certificate ready? (y/n): " ready
if [ "$ready" != "y" ]; then
    echo "Please get the certificate first from Cloudflare Dashboard"
    exit 1
fi

echo ""
echo "📝 Paste the Origin Certificate (including -----BEGIN CERTIFICATE----- and -----END CERTIFICATE-----)"
echo "Press Ctrl+D when done:"
cat > /tmp/cert.pem

echo ""
echo "📝 Paste the Private Key (including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)"
echo "Press Ctrl+D when done:"
cat > /tmp/key.pem

echo ""
echo "📤 Uploading certificates to VPS..."

scp -P 22 /tmp/cert.pem root@36.50.55.21:/etc/ssl/cloudflare/pagemade.site.pem
scp -P 22 /tmp/key.pem root@36.50.55.21:/etc/ssl/cloudflare/pagemade.site.key

echo ""
echo "🔧 Updating Nginx configuration..."

ssh -p 22 root@36.50.55.21 << 'ENDSSH'
# Set permissions
chmod 644 /etc/ssl/cloudflare/pagemade.site.pem
chmod 600 /etc/ssl/cloudflare/pagemade.site.key

# Update Nginx config
cat > /etc/nginx/sites-available/pagemade << 'NGINX'
# HTTP redirect to HTTPS
server {
    listen 80;
    server_name pagemade.site www.pagemade.site;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name pagemade.site www.pagemade.site;

    # SSL Certificate (Cloudflare Origin)
    ssl_certificate /etc/ssl/cloudflare/pagemade.site.pem;
    ssl_certificate_key /etc/ssl/cloudflare/pagemade.site.key;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    client_max_body_size 50M;

    # Real IP from Cloudflare
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    real_ip_header CF-Connecting-IP;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/pagemade/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /storage/ {
        alias /var/www/pagemade/backend/storage/;
        expires 1d;
    }
}
NGINX

# Test and reload
nginx -t && systemctl reload nginx

echo "✅ SSL setup complete!"
echo ""
echo "Now set Cloudflare SSL mode to FULL (not Flexible)"
ENDSSH

# Cleanup
rm -f /tmp/cert.pem /tmp/key.pem

echo ""
echo "========================================="
echo "✅ DONE!"
echo "========================================="
echo ""
echo "Final steps in Cloudflare Dashboard:"
echo "1. Go to SSL/TLS settings"
echo "2. Change encryption mode to: FULL (not Flexible)"
echo "3. Test https://pagemade.site"
echo ""
