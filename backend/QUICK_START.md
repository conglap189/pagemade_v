# Quick Start Guide - PageMade Backend

## 🚀 Chạy Backend Local

### 1. Kích hoạt Virtual Environment
```bash
source venv/bin/activate
```

### 2. Chạy Server
```bash
# Development mode (debug ON)
python run.py --local

# Hoặc production mode (debug OFF)
python run.py
```

### 3. Truy cập Editor
- **URL**: http://localhost:5000
- **Login**: Đăng nhập với tài khoản có sẵn
- **Dashboard**: http://localhost:5000/dashboard
- **Editor**: http://localhost:5000/editor/{page_id}

---

## 🛠️ Các URL Test

### Frontend Pages
- **Homepage**: http://localhost:5000/ (redirect to frontend)
- **Dashboard**: http://localhost:5000/dashboard
- **Editor**: http://localhost:5000/editor/{page_id}

### Static Files Test
- **Bundle**: http://localhost:5000/static/dist/pagemaker-editor.bundle.js
- **Source**: http://localhost:5000/static/src/index.js
- **Examples**: http://localhost:5000/static/examples/basic-usage.html

### API Endpoints
- **Login**: POST http://localhost:5000/api/login
- **Save Page**: POST http://localhost:5000/api/page/{id}/save
- **Upload Asset**: POST http://localhost:5000/api/upload

---

## 🐛 Common Issues & Solutions

### Issue 1: Template Not Found
**Error**: `jinja2.exceptions.TemplateNotFound: editor_pagemaker_v2.html`

**Solution**: ✅ **ĐÃ FIX** - Đã update route để dùng `editor_pagemaker_v3.html`

### Issue 2: Unauthorized Access
**Error**: `401 Unauthorized`

**Solution**: 
- Đăng nhập trước khi truy cập editor
- Tạo tài khoản admin: `python create_admin.py`

### Issue 3: Bundle Not Loading
**Error**: 404 khi load bundle

**Solution**: 
- Bundle đã có sẵn: `/static/dist/pagemaker-editor.bundle.js`
- Check URL: http://localhost:5000/static/dist/pagemaker-editor.bundle.js

---

## 📝 Test Workflow

### 1. Test Basic Functionality
```bash
# 1. Start server
source venv/bin/activate
python run.py --local

# 2. Test in browser
# - Mở http://localhost:5000
# - Đăng nhập
# - Vào dashboard
# - Tạo site mới
# - Tạo page mới
# - Mở editor
```

### 2. Test Editor Loading
```bash
# Test bundle accessibility
curl http://localhost:5000/static/dist/pagemaker-editor.bundle.js

# Test source files
curl http://localhost:5000/static/src/index.js

# Test example page
curl http://localhost:5000/static/examples/basic-usage.html
```

### 3. Test Editor Features
- **Production Bundle**: `editor_modular_v3.html`
- **Development Mode**: `editor_pagemaker_v3.html`
- **Legacy**: `editor_pagemaker_v2.html` (moved to folder)

---

## 🔧 Development Commands

### Build Bundle (nếu cần)
```bash
cd static/
npm install
npm run build
```

### Database Operations
```bash
# Create admin user
python create_admin.py

# Run migrations
flask db upgrade

# Clear cache
python clear_cache.py clear
```

### Debug Mode
```bash
# Enable debug mode
python run.py --local

# Check logs
tail -f logs/flask.log
```

---

## 📁 File Structure (Relevant)

```
backend/
├── app/routes/pages.py          # ✅ Đã fix template name
├── templates/
│   ├── editor_pagemaker_v3.html # ✅ Development version
│   ├── editor_modular_v3.html   # ✅ Production version
│   └── pagemakerv2-do-not-use/ # Legacy version
├── static/
│   ├── dist/pagemaker-editor.bundle.js  # ✅ Production bundle
│   ├── src/index.js                    # ✅ Development source
│   └── examples/basic-usage.html       # ✅ Test page
└── venv/                     # Virtual environment
```

---

## 🎯 Next Steps

1. **Test Editor**: Mở http://localhost:5000/editor/{page_id}
2. **Check Bundle**: Verify bundle loads correctly
3. **Test Features**: Try save, publish, asset upload
4. **Debug**: Use browser console for errors

---

*Last updated: November 2024*