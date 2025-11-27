# Deployment Guide

Production deployment guide for the PageMaker application.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Server Requirements](#server-requirements)
3. [VPS Deployment](#vps-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Database Setup](#database-setup)
6. [Nginx Configuration](#nginx-configuration)
7. [SSL/HTTPS Setup](#sslhttps-setup)
8. [Environment Configuration](#environment-configuration)
9. [Deployment Process](#deployment-process)
10. [Post-Deployment](#post-deployment)
11. [Monitoring & Maintenance](#monitoring--maintenance)
12. [Backup & Recovery](#backup--recovery)
13. [Scaling](#scaling)
14. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Preparation

- [ ] All tests passing (`pytest`)
- [ ] Code coverage > 80%
- [ ] No security vulnerabilities
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Static assets compiled
- [ ] Dependencies updated
- [ ] Documentation updated

### Security

- [ ] Change SECRET_KEY
- [ ] Strong database passwords
- [ ] SSL certificates obtained
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Debug mode disabled
- [ ] Error pages customized

### Performance

- [ ] Database indexed
- [ ] Static files optimized
- [ ] Caching configured
- [ ] CDN setup (optional)
- [ ] Compression enabled

---

## Server Requirements

### Minimum Specifications

- **CPU:** 2 cores
- **RAM:** 2GB
- **Storage:** 20GB SSD
- **OS:** Ubuntu 22.04 LTS (recommended)
- **Python:** 3.9+
- **PostgreSQL:** 14+
- **Redis:** 7+ (optional)
- **Nginx:** 1.18+

### Recommended Specifications

- **CPU:** 4 cores
- **RAM:** 4GB
- **Storage:** 50GB SSD
- **Bandwidth:** 1TB/month

---

## VPS Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3-pip python3-venv postgresql postgresql-contrib \
    nginx redis-server git curl supervisor

# Create application user
sudo useradd -m -s /bin/bash pagemaker
sudo passwd pagemaker
```

### 2. Install Application

```bash
# Switch to application user
sudo su - pagemaker

# Clone repository
git clone https://github.com/conglap189/pagemade_v.git
cd pagemade_v/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
```

### 3. Configure Application

```bash
# Create production environment file
nano .env.production
```

**Production .env:**

```env
# Flask
FLASK_APP=run.py
FLASK_ENV=production
SECRET_KEY=CHANGE-THIS-TO-RANDOM-STRING-AT-LEAST-32-CHARS

# Database
DATABASE_URL=postgresql://pagemaker:STRONG_PASSWORD@localhost/pagemaker_prod

# Redis
REDIS_URL=redis://localhost:6379/0

# Upload Settings
UPLOAD_FOLDER=/home/pagemaker/pagemade_v/backend/storage/uploads
MAX_UPLOAD_SIZE=10485760

# Session
SESSION_TYPE=redis
PERMANENT_SESSION_LIFETIME=2592000  # 30 days

# Security
SESSION_COOKIE_SECURE=True
SESSION_COOKIE_HTTPONLY=True
SESSION_COOKIE_SAMESITE=Lax

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Performance
SQLALCHEMY_POOL_SIZE=10
SQLALCHEMY_MAX_OVERFLOW=20

# Debug (MUST BE FALSE)
DEBUG=False
TESTING=False
```

### 4. Initialize Database

```bash
# Create directories
mkdir -p storage/uploads logs instance

# Run migrations
source venv/bin/activate
flask db upgrade

# Create admin user
python manage_admin.py create admin admin@yourdomain.com STRONG_PASSWORD
```

### 5. Gunicorn Configuration

Create `gunicorn.conf.py`:

```python
"""Gunicorn configuration for production."""

import multiprocessing

# Server socket
bind = '127.0.0.1:5000'
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'sync'
worker_connections = 1000
timeout = 30
keepalive = 2

# Logging
accesslog = '/home/pagemaker/pagemade_v/backend/logs/gunicorn_access.log'
errorlog = '/home/pagemaker/pagemade_v/backend/logs/gunicorn_error.log'
loglevel = 'info'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = 'pagemaker'

# Server mechanics
daemon = False
pidfile = '/home/pagemaker/pagemade_v/backend/gunicorn.pid'
user = 'pagemaker'
group = 'pagemaker'
tmp_upload_dir = None

# SSL (if terminating SSL at app level)
# keyfile = '/path/to/key.pem'
# certfile = '/path/to/cert.pem'
```

### 6. Supervisor Configuration

Create `/etc/supervisor/conf.d/pagemaker.conf`:

```ini
[program:pagemaker]
command=/home/pagemaker/pagemade_v/backend/venv/bin/gunicorn -c gunicorn.conf.py wsgi:app
directory=/home/pagemaker/pagemade_v/backend
user=pagemaker
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/home/pagemaker/pagemade_v/backend/logs/supervisor_error.log
stdout_logfile=/home/pagemaker/pagemade_v/backend/logs/supervisor_access.log
environment=PATH="/home/pagemaker/pagemade_v/backend/venv/bin"
```

**Reload Supervisor:**

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start pagemaker
sudo supervisorctl status pagemaker
```

---

## Docker Deployment

### 1. Dockerfile

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs storage/uploads instance

# Expose port
EXPOSE 5000

# Run gunicorn
CMD ["gunicorn", "-c", "gunicorn.conf.py", "wsgi:app"]
```

### 2. Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: pagemaker_app
    restart: always
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=postgresql://pagemaker:password@db:5432/pagemaker
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./storage:/app/storage
      - ./logs:/app/logs
    depends_on:
      - db
      - redis
    networks:
      - pagemaker_network

  db:
    image: postgres:14
    container_name: pagemaker_db
    restart: always
    environment:
      - POSTGRES_USER=pagemaker
      - POSTGRES_PASSWORD=STRONG_PASSWORD
      - POSTGRES_DB=pagemaker
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - pagemaker_network

  redis:
    image: redis:7
    container_name: pagemaker_redis
    restart: always
    networks:
      - pagemaker_network

  nginx:
    image: nginx:latest
    container_name: pagemaker_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./storage:/app/storage
    depends_on:
      - app
    networks:
      - pagemaker_network

volumes:
  postgres_data:

networks:
  pagemaker_network:
    driver: bridge
```

### 3. Deploy with Docker

```bash
# Build and start containers
docker-compose up -d

# Check logs
docker-compose logs -f app

# Run migrations
docker-compose exec app flask db upgrade

# Create admin user
docker-compose exec app python manage_admin.py create admin admin@example.com password

# Restart services
docker-compose restart
```

---

## Database Setup

### PostgreSQL Installation

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE USER pagemaker WITH PASSWORD 'STRONG_PASSWORD';
CREATE DATABASE pagemaker_prod OWNER pagemaker;
GRANT ALL PRIVILEGES ON DATABASE pagemaker_prod TO pagemaker;
\q
```

### Database Tuning

Edit `/etc/postgresql/14/main/postgresql.conf`:

```ini
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB

# Connection settings
max_connections = 100

# Logging
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d.log'
log_statement = 'mod'
log_duration = on
log_min_duration_statement = 1000  # Log queries > 1s

# Performance
checkpoint_completion_target = 0.9
wal_buffers = 16MB
```

**Restart PostgreSQL:**

```bash
sudo systemctl restart postgresql
```

---

## Nginx Configuration

### Create Nginx Config

Create `/etc/nginx/sites-available/pagemaker`:

```nginx
# Upstream to app server
upstream pagemaker_app {
    server 127.0.0.1:5000 fail_timeout=0;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logging
    access_log /var/log/nginx/pagemaker_access.log;
    error_log /var/log/nginx/pagemaker_error.log;
    
    # Max upload size
    client_max_body_size 10M;
    
    # Static files
    location /static {
        alias /home/pagemaker/pagemade_v/backend/app/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Uploaded files
    location /uploads {
        alias /home/pagemaker/pagemade_v/backend/storage/uploads;
        expires 7d;
        add_header Cache-Control "public";
    }
    
    # Proxy to app server
    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_redirect off;
        
        proxy_pass http://pagemaker_app;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}
```

### Enable Site

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/pagemaker /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run

# Add cron job for renewal
echo "0 0 * * * root certbot renew --quiet" | sudo tee -a /etc/crontab
```

---

## Environment Configuration

### Production Environment Variables

```env
# Flask
FLASK_APP=run.py
FLASK_ENV=production
SECRET_KEY=YOUR_RANDOM_SECRET_KEY_MIN_32_CHARS

# Database
DATABASE_URL=postgresql://user:password@localhost/dbname

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SESSION_COOKIE_SECURE=True
SESSION_COOKIE_HTTPONLY=True
WTF_CSRF_ENABLED=True

# Debug (MUST BE FALSE)
DEBUG=False
TESTING=False

# Performance
SQLALCHEMY_POOL_SIZE=10
SQLALCHEMY_POOL_RECYCLE=3600

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
```

---

## Deployment Process

### Manual Deployment

```bash
# 1. SSH to server
ssh pagemaker@yourserver.com

# 2. Navigate to app directory
cd /home/pagemaker/pagemade_v/backend

# 3. Activate virtual environment
source venv/bin/activate

# 4. Pull latest code
git pull origin main

# 5. Install dependencies
pip install -r requirements.txt

# 6. Run migrations
flask db upgrade

# 7. Collect static files (if needed)
# flask collect-static

# 8. Restart application
sudo supervisorctl restart pagemaker

# 9. Check status
sudo supervisorctl status pagemaker

# 10. Check logs
tail -f logs/gunicorn_error.log
```

### Automated Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️ Running database migrations..."
flask db upgrade

# Restart application
echo "🔄 Restarting application..."
sudo supervisorctl restart pagemaker

# Check status
echo "✅ Checking application status..."
sudo supervisorctl status pagemaker

echo "🎉 Deployment complete!"
```

Make executable:
```bash
chmod +x deploy.sh
```

Run deployment:
```bash
./deploy.sh
```

---

## Post-Deployment

### Verify Deployment

```bash
# Check application status
sudo supervisorctl status pagemaker

# Check logs
tail -f logs/gunicorn_error.log

# Test endpoints
curl https://yourdomain.com/health
curl https://yourdomain.com/api/sites

# Monitor processes
htop
```

### Create Admin User

```bash
python manage_admin.py create admin admin@yourdomain.com STRONG_PASSWORD
```

### Test Critical Paths

- [ ] User registration
- [ ] User login
- [ ] Create site
- [ ] Create page
- [ ] Upload asset
- [ ] Publish site
- [ ] View published site

---

## Monitoring & Maintenance

### Log Monitoring

```bash
# Application logs
tail -f logs/app.log
tail -f logs/errors.log

# Gunicorn logs
tail -f logs/gunicorn_access.log
tail -f logs/gunicorn_error.log

# Nginx logs
sudo tail -f /var/log/nginx/pagemaker_access.log
sudo tail -f /var/log/nginx/pagemaker_error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Performance Monitoring

**Install monitoring tools:**

```bash
sudo apt install htop iotop nethogs
```

**Monitor resources:**

```bash
# CPU and memory
htop

# Disk I/O
iotop

# Network
nethogs

# Database connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

### Health Checks

Create health check endpoint:

```python
# app/routes/health.py
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'database': check_database(),
        'redis': check_redis(),
        'timestamp': datetime.now().isoformat()
    })
```

---

## Backup & Recovery

### Database Backups

**Automated backup script:**

Create `/home/pagemaker/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/home/pagemaker/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="pagemaker_prod"
DB_USER="pagemaker"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz storage/uploads/

# Delete backups older than 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

**Schedule with cron:**

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/pagemaker/backup.sh >> /home/pagemaker/backup.log 2>&1
```

### Restore from Backup

```bash
# Restore database
gunzip < backups/db_20251117.sql.gz | psql -U pagemaker pagemaker_prod

# Restore uploads
tar -xzf backups/uploads_20251117.tar.gz
```

---

## Scaling

### Horizontal Scaling

**Load Balancer Configuration:**

```nginx
upstream pagemaker_cluster {
    least_conn;
    server 192.168.1.10:5000 weight=3;
    server 192.168.1.11:5000 weight=3;
    server 192.168.1.12:5000 weight=2;
}

server {
    location / {
        proxy_pass http://pagemaker_cluster;
    }
}
```

### Database Scaling

**Read Replicas:**

- Primary: Write operations
- Replicas: Read operations

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
tail -f logs/gunicorn_error.log

# Check supervisor status
sudo supervisorctl status pagemaker

# Restart application
sudo supervisorctl restart pagemaker
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U pagemaker -d pagemaker_prod

# Check connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

### High Memory Usage

```bash
# Check memory
free -h

# Find memory-intensive processes
ps aux --sort=-%mem | head

# Restart application
sudo supervisorctl restart pagemaker
```

---

**Last Updated:** November 17, 2025  
**Version:** 1.0.0
