# Production Deployment Summary - pagemade.site

**Deployment Date**: October 17, 2025  
**Status**: ✅ **LIVE**

## 🌐 URLs
- **Production**: http://pagemade.site (currently HTTP, HTTPS setup pending)
- **IP Address**: http://36.50.55.21
- **Admin**: admin@pagemade.site

---

## 📊 Infrastructure

### VPS Details
```
IP: 36.50.55.21
OS: Ubuntu 22.04.1 LTS
Python: 3.10.12
Memory: 2GB (19-24% usage)
Disk: 29.44GB (14.3% used)
```

### Services Running
```bash
✅ Gunicorn (port 5000)
   - 4 workers
   - Auto-restart on failure
   - Service: /etc/systemd/system/pagemade.service

✅ Nginx (port 80)
   - Reverse proxy to Gunicorn
   - Static files caching (30 days)
   - Real IP detection (Cloudflare)
   - Config: /etc/nginx/sites-available/pagemade
```

### Database
```
Type: SQLite
Location: /var/www/pagemade/backend/app.db
Size: 28KB
```

---

## 🎨 Logo & Branding Deployed

All logo files successfully deployed:
```
/var/www/pagemade/backend/static/images/branding/
├── logo.png (41KB) - Used in navbar at 120px
├── logo.svg (9KB) - Available but not used
└── favicon/
    ├── favicon.ico
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    ├── apple-touch-icon.png
    ├── android-chrome-192x192.png
    └── android-chrome-512x512.png
```

**Logo Display**: 120px height in navbar (56px navbar height with overflow visible)

---

## 🔐 SSL/HTTPS Setup (To Do)

### Current Status
- ✅ HTTP working: http://pagemade.site
- ⚠️ HTTPS redirect: Cloudflare shows 403
- 📝 Action needed: Configure SSL

### Option 1: Cloudflare Flexible SSL (Quick)
**Current active method - works immediately**

1. Go to Cloudflare Dashboard
2. Select `pagemade.site`
3. Navigate to: **SSL/TLS** → **Overview**
4. Set encryption mode to: **Flexible**
5. Test: https://pagemade.site ✅

**Flow**: Browser (HTTPS) → Cloudflare (HTTPS) → VPS (HTTP)

### Option 2: Cloudflare Full SSL (Recommended)
**Use script: `./setup_cloudflare_ssl.sh`**

1. Go to: **SSL/TLS** → **Origin Server**
2. Click: **Create Certificate**
3. Settings: Default (RSA 2048, 15 years)
4. Copy certificate and private key
5. Run: `./setup_cloudflare_ssl.sh`
6. Paste certificate and key when prompted
7. In Cloudflare, set mode to: **Full**

**Flow**: Browser (HTTPS) → Cloudflare (HTTPS) → VPS (HTTPS)

---

## 📦 Deployment Package

**Package**: `/tmp/pagemade-deploy.tar.gz` (1.3MB)

### What's Included
```
✅ backend/ - Flask application
✅ static/ - Logo, CSS, JS, PageMaker files
✅ templates/ - All HTML templates
✅ storage/ - User sites storage directory
✅ docs/ - Documentation
✅ README.md
✅ LOGO_FAVICON_IMPLEMENTATION.md
```

### What's Excluded
```
❌ .git/
❌ node_modules/
❌ .venv/
❌ *.pyc, __pycache__/
❌ *.log, logs/
❌ *.db (database files)
```

---

## 🔧 Server Configuration

### Systemd Service
**File**: `/etc/systemd/system/pagemade.service`

```ini
[Unit]
Description=PageMade Flask Application
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/pagemade/backend
Environment="PATH=/var/www/pagemade/backend/venv/bin"
ExecStart=/var/www/pagemade/backend/venv/bin/gunicorn --bind 127.0.0.1:5000 --workers 4 wsgi:app
Restart=always

[Install]
WantedBy=multi-user.target
```

**Commands**:
```bash
systemctl status pagemade   # Check status
systemctl restart pagemade  # Restart application
systemctl stop pagemade     # Stop application
systemctl start pagemade    # Start application
journalctl -u pagemade -f   # View logs
```

### Nginx Configuration
**File**: `/etc/nginx/sites-available/pagemade`

```nginx
server {
    listen 80;
    server_name pagemade.site www.pagemade.site 36.50.55.21;

    client_max_body_size 50M;

    # Real IP from Cloudflare
    set_real_ip_from 173.245.48.0/20;
    # ... (Cloudflare IP ranges)
    real_ip_header CF-Connecting-IP;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
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
```

**Commands**:
```bash
nginx -t                    # Test configuration
systemctl reload nginx      # Reload config
systemctl restart nginx     # Restart Nginx
```

---

## 🐍 Python Environment

### Dependencies Installed
```
Flask==2.3.3
Flask-SQLAlchemy==3.0.5
Flask-Login==0.6.3
Flask-Migrate==4.0.5
Authlib==1.2.1
requests==2.31.0
python-dotenv==1.0.0
gunicorn==21.2.0
psycopg2-binary==2.9.7
flask-cors==6.0.1
redis==5.0.0
```

### Environment Variables
**File**: `/var/www/pagemade/backend/.env`

```bash
DATABASE_URL=sqlite:////var/www/pagemade/backend/app.db
SECRET_KEY=production-secret-key-change-this-in-real-deployment
FLASK_ENV=production
```

---

## 📁 Directory Structure

```
/var/www/pagemade/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── migrations/
│   ├── static/
│   │   ├── css/
│   │   ├── images/branding/ ← Logo files here
│   │   ├── pagemaker/
│   │   └── manifest.json
│   ├── storage/
│   │   └── sites/
│   ├── templates/
│   ├── venv/
│   ├── app.db ← Database
│   ├── .env
│   └── wsgi.py
└── docs/
```

---

## 🚀 Deployment Commands Reference

### Upload New Version
```bash
# On local machine
cd /home/helios/ver1.1
tar -czf /tmp/pagemade-deploy.tar.gz \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='backend/.venv' \
    --exclude='*.pyc' \
    backend/ docs/ README.md

./upload_to_vps.sh
```

### On VPS - Extract and Restart
```bash
ssh root@36.50.55.21

cd /var/www/pagemade
tar -xzf /tmp/pagemade-deploy.tar.gz

cd backend
source venv/bin/activate
pip install -r requirements.txt  # If dependencies changed

systemctl restart pagemade
```

---

## 🔍 Troubleshooting

### Check Application Status
```bash
ssh root@36.50.55.21

# Service status
systemctl status pagemade
systemctl status nginx

# Test local access
curl -I http://localhost:5000/

# Check logs
journalctl -u pagemade -n 50
tail -f /var/log/nginx/error.log
```

### Common Issues

**1. Site not loading**
```bash
# Check if Gunicorn is running
systemctl status pagemade

# Check Nginx
systemctl status nginx
nginx -t
```

**2. Database errors**
```bash
# Check database permissions
ls -lh /var/www/pagemade/backend/app.db

# Reinitialize if needed
cd /var/www/pagemade/backend
source venv/bin/activate
python3 << EOF
from app import create_app, db
app = create_app()
with app.app_context():
    db.create_all()
EOF
```

**3. Static files not loading**
```bash
# Check Nginx static paths
ls -lah /var/www/pagemade/backend/static/

# Check Nginx config
cat /etc/nginx/sites-available/pagemade
```

---

## 📝 Next Steps

### Immediate (To make HTTPS work)
- [ ] Configure Cloudflare SSL mode (Flexible or Full)
- [ ] Test https://pagemade.site

### Recommended
- [ ] Change SECRET_KEY in .env to a random secure value
- [ ] Setup database backups
- [ ] Configure Cloudflare Page Rules
- [ ] Enable Cloudflare caching for static assets
- [ ] Setup monitoring (uptime checks)

### Optional
- [ ] Add admin user creation script
- [ ] Setup automated backups to S3/B2
- [ ] Configure rate limiting
- [ ] Add Cloudflare WAF rules
- [ ] Setup CI/CD pipeline

---

## 📞 Support Information

**VPS Access**:
```
Host: 36.50.55.21
User: root
Port: 22
Password: (stored securely)
```

**Services**:
- Application: Port 5000 (internal)
- Nginx: Port 80 (HTTP)
- Nginx: Port 443 (HTTPS - when configured)

**Key Files**:
- Nginx config: `/etc/nginx/sites-available/pagemade`
- Systemd service: `/etc/systemd/system/pagemade.service`
- Application: `/var/www/pagemade/backend/`
- Database: `/var/www/pagemade/backend/app.db`
- Logs: `journalctl -u pagemade -f`

---

**Document Version**: 1.0  
**Last Updated**: October 17, 2025  
**Status**: Production Live (HTTP), HTTPS pending SSL configuration
