# Logo & Branding Assets

## 📁 Cấu trúc thư mục:

```
backend/static/images/branding/
├── logo.svg                      # Logo chính (SVG vector)
├── logo.png                      # Logo PNG backup (512x512+)
├── favicon.ico                   # Favicon chính (16x16, 32x32, 48x48)
├── favicon-16x16.png             # Favicon 16x16
├── favicon-32x32.png             # Favicon 32x32
├── apple-touch-icon.png          # iOS home screen (180x180)
├── android-chrome-192x192.png    # Android (192x192)
├── android-chrome-512x512.png    # Android/PWA (512x512)
└── site.webmanifest              # PWA manifest
```

## 🎨 Đặt tên files:

### Files anh đã có → Đổi tên như sau:

**From anh's files:**
- `logo svg` → `logo.svg`
- `logo_remove background.png` → `logo.png`
- `favicon.ico` → `favicon.ico` (giữ nguyên)
- `favicon-16x16.png` → `favicon-16x16.png` (giữ nguyên)
- `favicon-32x32.png` → `favicon-32x32.png` (giữ nguyên)
- `apple-touch-icon.png` → `apple-touch-icon.png` (giữ nguyên)
- `android-chrome-192x192.png` → `android-chrome-192x192.png` (giữ nguyên)
- `android-chrome-512x512.png` → `android-chrome-512x512.png` (giữ nguyên)

## 📝 Checklist:

### Bước 1: Copy files vào folder này
```bash
# Từ thư mục hiện tại của anh, copy các files:
cp logo.svg /home/helios/ver1.1/backend/static/images/branding/
cp logo_remove_background.png /home/helios/ver1.1/backend/static/images/branding/logo.png
cp favicon.ico /home/helios/ver1.1/backend/static/images/branding/
cp favicon-16x16.png /home/helios/ver1.1/backend/static/images/branding/
cp favicon-32x32.png /home/helios/ver1.1/backend/static/images/branding/
cp apple-touch-icon.png /home/helios/ver1.1/backend/static/images/branding/
cp android-chrome-192x192.png /home/helios/ver1.1/backend/static/images/branding/
cp android-chrome-512x512.png /home/helios/ver1.1/backend/static/images/branding/
```

### Bước 2: Verify files
```bash
ls -lh /home/helios/ver1.1/backend/static/images/branding/
```

### Bước 3: Implementation (em sẽ làm sau khi anh copy xong)
- ✅ base.html - Add favicon links
- ✅ editor_pagemaker_v2.html - Update logo
- ✅ dashboard.html - Update navbar logo
- ✅ login.html - Update logo
- ✅ Create site.webmanifest for PWA

## 🚀 Usage:

### Favicon (trong <head>):
```html
<link rel="icon" type="image/x-icon" href="{{ url_for('static', filename='images/branding/favicon.ico') }}">
<link rel="icon" type="image/png" sizes="32x32" href="{{ url_for('static', filename='images/branding/favicon-32x32.png') }}">
<link rel="icon" type="image/png" sizes="16x16" href="{{ url_for('static', filename='images/branding/favicon-16x16.png') }}">
<link rel="apple-touch-icon" sizes="180x180" href="{{ url_for('static', filename='images/branding/apple-touch-icon.png') }}">
```

### Logo (trong navbar):
```html
<img src="{{ url_for('static', filename='images/branding/logo.svg') }}" alt="Pagemade Logo" height="32">
```

## 🎯 Ready to implement!
