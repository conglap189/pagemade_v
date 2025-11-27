#!/bin/bash

echo "🚀 PageMade.site Production Deployment - Direct Upload"

VPS_IP="36.50.55.21"
VPS_USER="root"
APP_DIR="/var/www/pagemade"

echo "🧹 Removing old files that might conflict..."
rm -f app.py models.py

echo "📦 Preparing production files..."

# Create wsgi.py for production
cat > wsgi.py << 'EOF'
import os
import sys

# Add project directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app

# Create production app
app = create_app('production')

if __name__ == "__main__":
    app.run()
EOF

# Update requirements.txt for production
cat > requirements.txt << 'EOF'
Flask==2.3.3
Flask-SQLAlchemy==3.0.5
Flask-Login==0.6.3
Flask-Migrate==4.0.5
Authlib==1.2.1
requests==2.31.0
python-dotenv==1.0.0
gunicorn==21.2.0
psycopg2-binary==2.9.7
EOF

echo "📤 Uploading files to VPS..."

# Create temporary directory on VPS
ssh -o PasswordAuthentication=yes $VPS_USER@$VPS_IP "mkdir -p /tmp/pagemade_deploy"

# Upload application files
scp -o PasswordAuthentication=yes -r app/ $VPS_USER@$VPS_IP:/tmp/pagemade_deploy/
scp -o PasswordAuthentication=yes config.py $VPS_USER@$VPS_IP:/tmp/pagemade_deploy/
scp -o PasswordAuthentication=yes wsgi.py $VPS_USER@$VPS_IP:/tmp/pagemade_deploy/
scp -o PasswordAuthentication=yes requirements.txt $VPS_USER@$VPS_IP:/tmp/pagemade_deploy/
scp -o PasswordAuthentication=yes create_demo_data.py $VPS_USER@$VPS_IP:/tmp/pagemade_deploy/

# Upload templates
scp -o PasswordAuthentication=yes -r templates/ $VPS_USER@$VPS_IP:/tmp/pagemade_deploy/

echo "⚙️ Setting up production environment on VPS..."

ssh -o PasswordAuthentication=yes $VPS_USER@$VPS_IP << 'REMOTE_SCRIPT'
    echo "🔧 Starting VPS setup..."
    
    # Update system
    echo "📦 Updating system packages..."
    apt update && apt upgrade -y
    
    # Install dependencies
    echo "🐍 Installing dependencies..."
    apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib git ufw curl
    
    # Setup PostgreSQL
    echo "🗄️ Setting up PostgreSQL..."
    sudo -u postgres psql << 'PSQL_SCRIPT'
CREATE DATABASE pagemade;
CREATE USER pagemade_user WITH ENCRYPTED PASSWORD 'PageMade2025SecurePass!';
GRANT ALL PRIVILEGES ON DATABASE pagemade TO pagemade_user;
ALTER USER pagemade_user CREATEDB;
\q
PSQL_SCRIPT
    
    # Setup application directory
    echo "📁 Setting up application..."
    rm -rf /var/www/pagemade
    mkdir -p /var/www/pagemade
    
    # Move files from temp to production directory
    cp -r /tmp/pagemade_deploy/* /var/www/pagemade/
    cd /var/www/pagemade
    
    # Create virtual environment
    echo "🔧 Setting up Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    
    # Install Python packages
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Create production environment file
    cat > .env << 'ENV_FILE'
# Flask Configuration
SECRET_KEY=PageMadeProductionSecretKey2025VerySecureRandomString!
FLASK_ENV=production
FLASK_DEBUG=0

# Database Configuration
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://pagemade_user:PageMade2025SecurePass!@localhost/pagemade

# Domain Configuration
DOMAIN=pagemade.site

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
ENV_FILE

    # Create storage directory
    mkdir -p storage
    
    # Set proper permissions
    chown -R www-data:www-data /var/www/pagemade
    chmod -R 755 /var/www/pagemade
    chmod 644 /var/www/pagemade/.env

    # Initialize database and create demo data
    echo "🗄️ Initializing database..."
    source venv/bin/activate
    export FLASK_APP=wsgi.py
    python create_demo_data.py
    
    echo "✅ Application setup completed!"
REMOTE_SCRIPT

echo "🔧 Configuring services..."

ssh -o PasswordAuthentication=yes $VPS_USER@$VPS_IP << 'SERVICE_CONFIG'
    cd /var/www/pagemade
    
    # Create Gunicorn configuration
    cat > gunicorn.conf.py << 'EOF'
bind = "127.0.0.1:8000"
workers = 3
worker_class = "sync"
timeout = 120
keepalive = 5
max_requests = 1000
max_requests_jitter = 100
preload_app = True
user = "www-data"
group = "www-data"
EOF
    
    # Create systemd service
    cat > /etc/systemd/system/pagemade.service << 'EOF'
[Unit]
Description=PageMade.site Production Application
After=network.target postgresql.service
Requires=postgresql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/pagemade
Environment="PATH=/var/www/pagemade/venv/bin"
EnvironmentFile=/var/www/pagemade/.env
ExecStart=/var/www/pagemade/venv/bin/gunicorn --config gunicorn.conf.py wsgi:app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

    # Create Nginx configuration
    cat > /etc/nginx/sites-available/pagemade << 'EOF'
server {
    listen 80;
    server_name pagemade.site www.pagemade.site;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle large uploads
        client_max_body_size 50M;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Serve static files directly
    location /static/ {
        alias /var/www/pagemade/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Serve uploaded files
    location /storage/ {
        alias /var/www/pagemade/storage/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

    # Enable the site
    ln -sf /etc/nginx/sites-available/pagemade /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    nginx -t

    # Configure firewall
    ufw allow 22
    ufw allow 80
    ufw allow 443
    ufw --force enable

    echo "✅ Service configuration completed!"
SERVICE_CONFIG

echo "🚀 Starting services..."

ssh -o PasswordAuthentication=yes $VPS_USER@$VPS_IP << 'START_SERVICES'
    # Start services
    systemctl daemon-reload
    systemctl enable pagemade
    systemctl start pagemade
    systemctl restart nginx

    echo "✅ Services started!"
START_SERVICES

echo "🔐 Installing SSL certificate..."

ssh -o PasswordAuthentication=yes $VPS_USER@$VPS_IP << 'SSL_INSTALL'
    # Install certbot
    apt install -y certbot python3-certbot-nginx
    
    # Get SSL certificate (non-interactive)
    certbot --nginx -d pagemade.site -d www.pagemade.site --non-interactive --agree-tos --email admin@pagemade.site --redirect
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    echo "✅ SSL certificate installed!"
SSL_INSTALL

echo "🔍 Final health check..."

ssh -o PasswordAuthentication=yes $VPS_USER@$VPS_IP << 'HEALTH_CHECK'
    echo "📊 Service Status:"
    systemctl is-active pagemade && echo "✅ PageMade service: Running" || echo "❌ PageMade service: Failed"
    systemctl is-active nginx && echo "✅ Nginx: Running" || echo "❌ Nginx: Failed"
    systemctl is-active postgresql && echo "✅ PostgreSQL: Running" || echo "❌ PostgreSQL: Failed"
    
    echo ""
    echo "🌐 Network Status:"
    netstat -tlnp | grep :80 && echo "✅ Port 80: Open" || echo "❌ Port 80: Not available"
    netstat -tlnp | grep :443 && echo "✅ Port 443: Open" || echo "❌ Port 443: Not available"
    netstat -tlnp | grep :8000 && echo "✅ Port 8000: Open" || echo "❌ Port 8000: Not available"
    
    echo ""
    echo "🗄️ Database Status:"
    sudo -u postgres psql -c "\l" | grep pagemade && echo "✅ Database: Created" || echo "❌ Database: Missing"
    
    echo ""
    echo "📁 File Status:"
    ls -la /var/www/pagemade/wsgi.py && echo "✅ WSGI file: Present" || echo "❌ WSGI file: Missing"
    ls -la /var/www/pagemade/.env && echo "✅ Environment file: Present" || echo "❌ Environment file: Missing"
    ls -la /var/www/pagemade/app/ && echo "✅ App directory: Present" || echo "❌ App directory: Missing"
    ls -la /var/www/pagemade/templates/ && echo "✅ Templates: Present" || echo "❌ Templates: Missing"
    
    echo ""
    echo "🔍 Service Logs (last 10 lines):"
    journalctl -u pagemade -n 10 --no-pager
HEALTH_CHECK

# Cleanup
echo "🧹 Cleaning up temporary files..."
ssh -o PasswordAuthentication=yes $VPS_USER@$VPS_IP "rm -rf /tmp/pagemade_deploy"

echo ""
echo "🎉 Production Deployment Complete!"
echo ""
echo "🌐 Your production site is available at:"
echo "   https://pagemade.site"
echo "   https://www.pagemade.site"
echo ""
echo "🔧 Management commands:"
echo "   ssh $VPS_USER@$VPS_IP"
echo "   systemctl status pagemade"
echo "   journalctl -u pagemade -f"
echo "   systemctl restart pagemade"
echo ""
echo "📝 Next steps:"
echo "   1. Update Google OAuth credentials in /var/www/pagemade/.env"
echo "   2. Test all features on https://pagemade.site"
echo "   3. Monitor logs for any issues"
echo ""
echo "🔐 Features enabled:"
echo "   ✅ SSL Certificate (HTTPS)"
echo "   ✅ PostgreSQL Database"
echo "   ✅ Demo data with admin account"
echo "   ✅ Production-optimized configuration"
echo "   ✅ Auto-restart and monitoring"
echo ""
echo "🎯 Test the admin account:"
echo "   Go to: https://pagemade.site/auth/create-test-account"
echo "   Email: admin@autolandingpage.com"
echo ""