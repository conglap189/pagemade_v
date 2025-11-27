# 🚀 PageMade Production Deployment Guide

## VPS Information
- **IP**: 36.50.55.21
- **User**: root
- **Port**: 22
- **Password**: Conglap1892001@

---

## 📋 Quick Deployment (3 Steps)

### Step 1: Create & Upload Package (Local)
```bash
cd /home/helios/ver1.1

# Create deployment package
tar -czf /tmp/pagemade-deploy.tar.gz \
    --exclude='*.pyc' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='grapesjs' \
    --exclude='backend/.venv' \
    --exclude='*.backup*' \
    --exclude='*.log' \
    backend/ docs/ README.md

# Upload to VPS
scp -P 22 /tmp/pagemade-deploy.tar.gz root@36.50.55.21:/tmp/
# Password: Conglap1892001@
```

### Step 2: SSH to VPS & Setup
```bash
# SSH to VPS
ssh -p 22 root@36.50.55.21
# Password: Conglap1892001@

# Once connected to VPS:

# Create directory
mkdir -p /var/www/pagemade
cd /var/www/pagemade

# Extract package
tar -xzf /tmp/pagemade-deploy.tar.gz

# Setup Python environment
cd backend
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Setup database
python3 -c "from app import db, create_app; app = create_app(); app.app_context().push(); db.create_all(); print('Database created!')"

# Test run
python3 run.py
# Press Ctrl+C to stop after verifying it works
```

### Step 3: Setup Production Services

#### A. Create Systemd Service
```bash
# Create service file
cat > /etc/systemd/system/pagemade.service << 'EOF'
[Unit]
Description=PageMade Flask Application
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/pagemade/backend
Environment="PATH=/var/www/pagemade/backend/venv/bin"
ExecStart=/var/www/pagemade/backend/venv/bin/python run.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable pagemade
systemctl start pagemade
systemctl status pagemade
```

#### B. Setup Nginx
```bash
# Install Nginx (if not installed)
apt update
apt install -y nginx

# Create Nginx config
cat > /etc/nginx/sites-available/pagemade << 'EOF'
server {
    listen 80;
    server_name 36.50.55.21 pagemade.site www.pagemade.site;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /var/www/pagemade/backend/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Subdomain storage
    location /storage {
        alias /var/www/pagemade/backend/storage;
        expires 7d;
        add_header Cache-Control "public";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/pagemade /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
systemctl status nginx
```

#### C. Setup Firewall (if needed)
```bash
# Allow HTTP and SSH
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

---

## 🔄 Update/Redeploy

When you need to update code:

```bash
# On local machine
cd /home/helios/ver1.1
tar -czf /tmp/pagemade-update.tar.gz \
    --exclude='*.pyc' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='grapesjs' \
    backend/

scp -P 22 /tmp/pagemade-update.tar.gz root@36.50.55.21:/tmp/

# On VPS
ssh -p 22 root@36.50.55.21

cd /var/www/pagemade
tar -xzf /tmp/pagemade-update.tar.gz
systemctl restart pagemade
systemctl status pagemade
```

---

## 🧪 Testing

### Check if app is running:
```bash
curl http://localhost:5000
curl http://36.50.55.21
```

### Check logs:
```bash
# App logs
journalctl -u pagemade -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Check services status:
```bash
systemctl status pagemade
systemctl status nginx
```

---

## 🔧 Troubleshooting

### Service won't start:
```bash
# Check logs
journalctl -u pagemade -n 50

# Check if port 5000 is already in use
netstat -tlnp | grep 5000

# Kill existing process if needed
pkill -f "python.*run.py"
systemctl restart pagemade
```

### Nginx errors:
```bash
# Check config syntax
nginx -t

# Check logs
tail -f /var/log/nginx/error.log

# Restart nginx
systemctl restart nginx
```

### Database issues:
```bash
cd /var/www/pagemade/backend
source venv/bin/activate
python3 -c "from app import db, create_app; app = create_app(); app.app_context().push(); db.create_all()"
```

---

## 🌐 Domain Setup (Optional)

If you have a domain (e.g., pagemade.site):

1. Point DNS A record to: 36.50.55.21
2. Update Nginx config:
   ```bash
   server_name pagemade.site www.pagemade.site;
   ```
3. Install SSL certificate:
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d pagemade.site -d www.pagemade.site
   ```

---

## 📊 Monitoring

### Check system resources:
```bash
# CPU and Memory
htop

# Disk space
df -h

# Check app memory usage
ps aux | grep python | grep run.py
```

### Restart all services:
```bash
systemctl restart pagemade
systemctl restart nginx
```

---

## ✅ Checklist

- [ ] Package uploaded to VPS
- [ ] Python environment created
- [ ] Dependencies installed
- [ ] Database initialized
- [ ] Systemd service created and running
- [ ] Nginx configured and running
- [ ] Firewall configured
- [ ] App accessible via browser (http://36.50.55.21)
- [ ] Static files loading correctly
- [ ] Logo and favicon displaying
- [ ] Login/Register working
- [ ] Dashboard accessible
- [ ] PageMaker editor working

---

## 📝 Production URLs

After deployment:
- **Main site**: http://36.50.55.21
- **Dashboard**: http://36.50.55.21/dashboard
- **Login**: http://36.50.55.21/auth/login
- **Editor**: http://36.50.55.21/editor/{page_id}

---

## 🆘 Support Commands

```bash
# View all logs
journalctl -u pagemade --since "1 hour ago"

# Restart everything
systemctl restart pagemade nginx

# Check what's running on port 5000
lsof -i :5000

# Full system status
systemctl status pagemade nginx
```

---

**Ready to deploy?** Follow Step 1-3 above! 🚀
