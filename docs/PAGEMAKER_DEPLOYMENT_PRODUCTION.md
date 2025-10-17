# 🚀 PageMaker - Production Deployment Guide

## 📋 Tổng quan

Hướng dẫn deploy PageMaker lên VPS production lần đầu và các lần sau.

---

## 🎯 **Câu hỏi quan trọng: Có cần deploy folder `grapesjs/` không?**

### ❌ **KHÔNG CẦN!**

**Lý do:**
1. Folder `grapesjs/` chỉ cần để **customize và build** trên local
2. Production chỉ cần **file đã build** (`pagemaker.min.js` + `pagemaker.min.css`)
3. Tiết kiệm dung lượng (folder `grapesjs/` + `node_modules/` rất nặng ~500MB)
4. Tăng tốc độ deploy

---

## 📦 **So sánh Local vs Production:**

### **Local (Development):**
```
/home/helios/ver1.1/
├── grapesjs/                    ← ✅ CẦN (để customize)
│   ├── packages/core/src/       ← Edit source code
│   ├── node_modules/            ← ~400MB
│   └── dist/                    ← Build output
│
├── backend/
│   ├── static/pagemaker/
│   │   ├── pagemaker.min.js     ← Build output (1.1MB)
│   │   └── pagemaker.min.css    ← Build output (60KB)
│   └── ...
│
├── build-grapesjs.sh            ← ✅ CẦN (script build)
└── .gitignore                   ← Ignore grapesjs/
```

### **Production (VPS):**
```
/var/www/pagemade/
├── backend/
│   ├── static/pagemaker/
│   │   ├── pagemaker.min.js     ← ✅ DEPLOY (file đã build)
│   │   └── pagemaker.min.css    ← ✅ DEPLOY (file đã build)
│   ├── app/
│   ├── templates/
│   └── requirements.txt
│
└── NO grapesjs/ needed!         ← ❌ KHÔNG CẦN
```

---

## 🔄 **Workflow Deployment**

### **A. Lần Đầu Tiên Deploy:**

#### **1. Trên Local - Chuẩn bị code:**

```bash
cd /home/helios/ver1.1

# Đảm bảo đã build PageMaker mới nhất
./build-grapesjs.sh

# Check file đã có
ls -lh backend/static/pagemaker/pagemaker.min.*

# Add .gitignore
git add .gitignore

# Commit file build
git add backend/static/pagemaker/pagemaker.min.js
git add backend/static/pagemaker/pagemaker.min.css
git commit -m "build: add PageMaker custom build v1.0"

# Push lên Git
git push origin main
```

#### **2. Trên VPS - Deploy:**

```bash
# SSH vào VPS
ssh user@your-vps-ip

# Tạo thư mục project
sudo mkdir -p /var/www/pagemade
sudo chown $USER:$USER /var/www/pagemade

# Clone repository
cd /var/www/pagemade
git clone https://github.com/conglap189/pademade.git .

# Check file PageMaker đã có
ls -lh backend/static/pagemaker/
# Output:
# pagemaker.min.js  (1.1MB)
# pagemaker.min.css (60KB)

# Cài đặt Python dependencies
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup database
flask db upgrade

# Tạo thư mục cần thiết
sudo mkdir -p /var/www/subdomains
sudo chown www-data:www-data /var/www/subdomains

# Start application
gunicorn --bind 0.0.0.0:8000 wsgi:app
```

---

### **B. Update Code Sau Khi Customize:**

#### **1. Trên Local - Customize & Build:**

```bash
cd /home/helios/ver1.1

# 1. Customize GrapesJS
nano grapesjs/packages/core/src/...

# 2. Build lại PageMaker
./build-grapesjs.sh

# 3. Test local
# http://localhost:5000/editor/16

# 4. Commit file build mới
git add backend/static/pagemaker/pagemaker.min.js
git add backend/static/pagemaker/pagemaker.min.css
git commit -m "build: update PageMaker - add custom blocks"
git push origin main
```

#### **2. Trên VPS - Pull update:**

```bash
# SSH vào VPS
ssh user@your-vps-ip

# Pull code mới
cd /var/www/pagemade
git pull origin main

# Restart application
sudo systemctl restart pagemade
# hoặc
sudo supervisorctl restart pagemade

# Clear browser cache nếu cần
# Ctrl + F5 trên trình duyệt
```

**✅ XONG! Không cần build lại trên VPS!**

---

## 📝 **File cần deploy:**

### ✅ **Cần deploy:**
- `backend/` - Toàn bộ folder backend
  - `app/` - Flask app
  - `templates/` - HTML templates
  - `static/` - Static files (bao gồm `pagemaker.min.js`)
  - `requirements.txt`
  - `wsgi.py`
- `README.md`
- `.gitignore`

### ❌ **KHÔNG cần deploy:**
- `grapesjs/` - Source code GrapesJS
- `build-grapesjs.sh` - Script build
- `node_modules/` - Node dependencies
- `backend/.venv/` - Python virtual env
- `*.backup_*` - Backup files
- `GRAPESJS_CUSTOMIZE_GUIDE.md` - Dev docs (optional)

---

## 🔍 **Verify Deploy Thành Công:**

### **1. Check file tồn tại:**

```bash
# Trên VPS
ls -lh /var/www/pagemade/backend/static/pagemaker/

# Output mong đợi:
# pagemaker.min.js   (1.1MB)
# pagemaker.min.css  (60KB)
```

### **2. Check trong browser:**

```javascript
// Mở console (F12) trên production site
console.log(window.pagemaker);
// Output: Object { init: function, version: "0.22.13", ... }

console.log(pagemaker.version);
// Output: "0.22.13"
```

### **3. Test editor:**

```
https://your-domain.com/editor/16
```

- Editor load thành công
- Kéo thả blocks hoạt động
- Lưu/xuất bản hoạt động

---

## ⚡ **Tối ưu Production:**

### **1. Enable Gzip compression (Nginx):**

```nginx
# /etc/nginx/sites-available/pagemade.conf

server {
    # ... other config

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript;
    gzip_min_length 1000;
    gzip_comp_level 6;

    location /static/ {
        alias /var/www/pagemade/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### **2. Cache static files:**

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
}
```

### **3. CDN (Optional):**

Nếu traffic cao, có thể upload `pagemaker.min.js` lên CDN:

```html
<!-- Thay vì: -->
<script src="{{ url_for('static', filename='pagemaker/pagemaker.min.js') }}"></script>

<!-- Dùng CDN: -->
<script src="https://cdn.your-domain.com/pagemaker.min.js"></script>
```

---

## 🐛 **Troubleshooting:**

### **Lỗi: `pagemaker is not defined`**

**Nguyên nhân:** File `pagemaker.min.js` không load được

**Giải pháp:**
```bash
# Check file tồn tại
ls -lh /var/www/pagemade/backend/static/pagemaker/pagemaker.min.js

# Check permissions
chmod 644 /var/www/pagemade/backend/static/pagemaker/pagemaker.min.js

# Check Nginx serving static files
curl -I https://your-domain.com/static/pagemaker/pagemaker.min.js
# HTTP/1.1 200 OK
```

### **Lỗi: Editor không load**

**Nguyên nhân:** Browser cache cũ

**Giải pháp:**
```bash
# Hard refresh
Ctrl + Shift + R (Chrome/Firefox)
Cmd + Shift + R (Mac)

# Hoặc clear cache trong DevTools
F12 → Network tab → Disable cache
```

### **Lỗi: Custom blocks không hiển thị**

**Nguyên nhân:** File build cũ chưa update

**Giải pháp:**
```bash
# Trên local: Rebuild
./build-grapesjs.sh

# Commit + push
git add backend/static/pagemaker/pagemaker.min.js
git commit -m "build: update custom blocks"
git push

# Trên VPS: Pull
git pull origin main
sudo systemctl restart pagemade
```

---

## 📊 **Deployment Checklist:**

### **Trước khi deploy:**
- [ ] Build PageMaker local: `./build-grapesjs.sh`
- [ ] Test local: `http://localhost:5000/editor/16`
- [ ] Commit file build vào Git
- [ ] Push lên repository

### **Trên VPS:**
- [ ] Pull code mới: `git pull`
- [ ] Check file tồn tại: `ls backend/static/pagemaker/pagemaker.min.*`
- [ ] Restart app: `sudo systemctl restart pagemade`
- [ ] Test production: `https://your-domain.com/editor/16`
- [ ] Clear browser cache nếu cần

### **Sau deploy:**
- [ ] Test editor load
- [ ] Test kéo thả blocks
- [ ] Test lưu/xuất bản
- [ ] Check console không có errors

---

## 💡 **Best Practices:**

### **1. Version Control:**

```bash
# Tag mỗi lần build mới
git tag -a v1.0.0 -m "PageMaker v1.0.0 - Initial release"
git push origin v1.0.0

# Deploy theo tag
git checkout v1.0.0
```

### **2. Rollback nhanh:**

```bash
# Nếu deploy lỗi, rollback ngay
git checkout HEAD~1
sudo systemctl restart pagemade
```

### **3. Monitor logs:**

```bash
# Xem logs Flask
tail -f /var/www/pagemade/backend/logs/flask.log

# Xem logs Nginx
tail -f /var/log/nginx/error.log
```

---

## 📚 **Tài liệu liên quan:**

- **Build Guide**: `PAGEMAKER_BUILD_GUIDE.md`
- **Customize Guide**: `GRAPESJS_CUSTOMIZE_GUIDE.md`
- **Deployment Script**: `backend/deploy_production.sh`

---

## 🎯 **Tóm tắt:**

✅ **Cần deploy:**
- File đã build: `pagemaker.min.js` + `pagemaker.min.css`
- Backend code: `app/`, `templates/`, `static/`

❌ **KHÔNG cần deploy:**
- Folder `grapesjs/` (source code)
- Script `build-grapesjs.sh`
- Dev dependencies

🔄 **Workflow:**
1. Local: Customize → Build → Commit → Push
2. VPS: Pull → Restart → Test
3. **KHÔNG CẦN build lại trên VPS!**

---

**Last updated**: 2025-10-17  
**Version**: 1.0  
**For**: PageMaker Production Deployment
