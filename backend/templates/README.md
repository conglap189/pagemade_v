# Editor Templates - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan

Có 3 phiên bản editor template với mục đích sử dụng khác nhau:

### 🚫 **KHÔNG SỬ DỤNG** - Legacy Version
- `editor_pagemaker_v2.html` - Bản cũ, architecture monolithic
- **Trạng thái**: Deprecated

---

## ✅ **PRODUCTION VERSION** - Bundle Ready

### `editor_modular_v3.html`
- **Mục đích**: Production deployment
- **Architecture**: Modular (sử dụng bundle)
- **Bundle**: `/static/dist/pagemaker-editor.bundle.js`
- **Features**: 
  - Production-ready
  - Optimized bundle
  - Loading states
  - Error handling
  - Fast loading

**Khi nào sử dụng:**
- Deploy cho user thực tế
- Production environment
- Cần performance tối ưu

---

## 🔧 **DEVELOPMENT VERSION** - ES6 Modules

### `editor_pagemaker_v3.html`
- **Mục đích**: Development & Debugging
- **Architecture**: Modular (sử dụng ES6 modules)
- **Source**: `/static/src/index.js`
- **Features**:
  - Development mode
  - Real-time debugging
  - Source maps available
  - Module-level debugging

**Khi nào sử dụng:**
- Phát triển tính năng mới
- Debug issues
- Testing modules
- Development environment

---

## 🎯 Quyết Định Sử Dụng

### **Production** → `editor_modular_v3.html`
```python
# Trong routes.py
return render_template('editor_modular_v3.html', ...)
```

### **Development** → `editor_pagemaker_v3.html`
```python
# Trong routes.py (development mode)
if app.debug:
    return render_template('editor_pagemaker_v3.html', ...)
```

---

## 🔄 Migration Path

### **Từ Development → Production**
1. Build bundle: `npm run build`
2. Test với `editor_modular_v3.html`
3. Deploy production

### **Từ Legacy v2 → v3**
1. Review features trong `editor_pagemaker_v2.html`
2. Port sang `editor_pagemaker_v3.html`
3. Test và build production

---

## 📁 File Structure

```
templates/
├── editor_modular_v3.html      # ✅ Production (bundle)
├── editor_pagemaker_v3.html    # ✅ Development (ES6 modules)
├── editor_pagemaker_v2.html    # ❌ Legacy (deprecated)
└── README.md                   # This file
```

---

## 🛠️ Maintenance

### **Bundle Updates**
Khi update source code trong `static/src/`:
```bash
cd static/
npm run build
# Bundle sẽ được cập nhật trong /static/dist/
```

### **Template Updates**
- **Production template**: Cập nhật khi có breaking changes
- **Development template**: Cập nhật khi có new features

---

## 🚨 Lưu Ý Quan Trọng

1. **Đừng xóa `editor_pagemaker_v2.html`** - Cần để reference legacy features
2. **Luôn test cả 2 phiên bản v3** trước khi deploy
3. **Bundle path phải đúng**: `/static/dist/pagemaker-editor.bundle.js`
4. **Development mode cần build lại** sau khi thay đổi source

---

*Last updated: November 2024*