# 🎨 PageMaker - Custom Build Guide

## 📌 Tổng quan

**PageMaker** là phiên bản customize của **GrapesJS**, được đổi tên và build riêng cho dự án.

### Điểm khác biệt:
- ❌ Global variable: ~~`grapesjs`~~ 
- ✅ Global variable: **`pagemaker`**
- ❌ File output: ~~`grapes.min.js`~~
- ✅ File output: **`pagemaker.min.js`** + **`pagemaker.min.css`**
- ✅ Branding: PageMaker (thay vì GrapesJS)

---

## 📁 Cấu trúc Project

```
/home/helios/ver1.1/
│
├── grapesjs/                          ← Source code (clone từ GrapesJS repo)
│   └── packages/core/
│       ├── src/                       ← 🔧 EDIT CODE Ở ĐÂY để customize
│       │   ├── block_manager/
│       │   ├── style_manager/
│       │   ├── panels/
│       │   ├── canvas/
│       │   └── ...
│       │
│       ├── webpack.config.js          ← ✅ ĐÃ SỬA: library: 'pagemaker'
│       ├── package.json               ← ✅ ĐÃ SỬA: build:css → pagemaker.min.css
│       │
│       └── dist/                      ← Build output
│           ├── pagemaker.min.js       ← 1.1MB (UMD format)
│           ├── pagemaker.min.js.map
│           └── css/
│               └── pagemaker.min.css  ← 60KB
│
├── backend/static/pagemaker/
│   ├── pagemaker.min.js               ← ✅ Copy từ dist/
│   └── pagemaker.min.css              ← ✅ Copy từ dist/css/
│
└── build-grapesjs.sh                  ← ✅ Script tự động build + copy
```

---

## 🔧 Các thay đổi đã thực hiện

### 1. **Webpack Config** (`grapesjs/packages/core/webpack.config.js`)

```javascript
// TRƯỚC:
output: {
  filename: 'grapes.min.js',
  libraryExport: 'default',
}

// SAU:
output: {
  filename: 'pagemaker.min.js',
  library: 'pagemaker',              // ← Global variable name
  libraryTarget: 'umd',              // ← Universal Module Definition
  umdNamedDefine: true,
  libraryExport: 'default',
}
```

**Kết quả:**
- Browser: `window.pagemaker`
- Node.js: `require('pagemaker')`
- ES6: `import pagemaker from 'pagemaker'`

### 2. **Package.json** (`grapesjs/packages/core/package.json`)

```json
// TRƯỚC:
"build:css": "sass ... dist/css/grapes.min.css ..."

// SAU:
"build:css": "sass ... dist/css/pagemaker.min.css ..."
```

### 3. **Editor Template** (`backend/templates/editor_pagemaker_v2.html`)

```javascript
// TRƯỚC:
const editor = grapesjs.init({ ... });

// SAU:
const editor = pagemaker.init({ ... });
```

---

## ⚡ Quy trình Build

### **Phương pháp 1: Script tự động (Khuyến nghị)**

```bash
cd /home/helios/ver1.1
./build-grapesjs.sh
```

**Script sẽ:**
1. ✅ Build PageMaker từ source
2. ✅ Backup file cũ (`.backup_TIMESTAMP`)
3. ✅ Copy file mới vào `backend/static/pagemaker/`
4. ✅ Hiển thị kết quả

### **Phương pháp 2: Build thủ công**

```bash
# Step 1: Build JavaScript
cd /home/helios/ver1.1/grapesjs
pnpm --filter grapesjs build:js

# Step 2: Build CSS
pnpm --filter grapesjs build:css

# Step 3: Copy vào backend
cp packages/core/dist/pagemaker.min.js ../backend/static/pagemaker/
cp packages/core/dist/css/pagemaker.min.css ../backend/static/pagemaker/
```

### **Phương pháp 3: Development mode**

```bash
cd /home/helios/ver1.1/grapesjs/packages/core
pnpm start
```

- Server: `http://localhost:8080`
- Live reload khi code thay đổi
- Không minify (dễ debug)

---

## 🎯 Workflow Customize

### **Bước 1: Edit Source Code**

Ví dụ: Thay đổi màu primary

```bash
# Edit file
nano grapesjs/packages/core/src/styles/scss/_variables.scss
```

```scss
// Thay đổi màu
$primary-color: #3b82f6;  // Blue
$secondary-color: #10b981; // Green
```

### **Bước 2: Build**

```bash
./build-grapesjs.sh
```

### **Bước 3: Test**

1. Reload Flask server (nếu cần)
2. Mở editor: `http://localhost:5000/editor/16`
3. Test thay đổi

### **Bước 4: Commit**

```bash
git add grapesjs/packages/core/
git commit -m "feat: customize PageMaker primary color"
```

---

## 📝 Ví dụ Customization

### **1. Thêm custom block mặc định**

File: `grapesjs/packages/core/src/block_manager/config/config.ts`

```typescript
defaults: {
  blocks: [
    {
      id: 'hero-section',
      label: 'Hero Section',
      category: 'Tailwind',
      content: `
        <div class="bg-blue-600 text-white p-12">
          <h1 class="text-4xl font-bold">Welcome</h1>
          <p class="mt-4">Your custom hero section</p>
        </div>
      `,
    }
  ]
}
```

### **2. Ẩn panel không cần thiết**

File: `grapesjs/packages/core/src/panels/config/config.ts`

```typescript
defaults: {
  panels: {
    defaults: [
      {
        id: 'views',
        visible: false,  // ← Ẩn panel Views
      }
    ]
  }
}
```

### **3. Thay đổi toolbar button**

File: `grapesjs/packages/core/src/panels/view/PanelsView.ts`

```typescript
buttons: [
  {
    id: 'sw-visibility',
    command: 'sw-visibility',
    className: 'fa fa-eye',
    label: 'Hiển thị',  // ← Custom label tiếng Việt
  }
]
```

---

## 🧪 Testing

### **Test global variable**

Mở browser console (F12):

```javascript
// Check PageMaker đã load
console.log(window.pagemaker);

// Check version
console.log(pagemaker.version);  // "0.22.13"

// Test init
const editor = pagemaker.init({
  container: '#gjs',
  height: '600px'
});
```

### **Test build output**

```bash
# Check file size
ls -lh backend/static/pagemaker/pagemaker.min.*

# Check version trong file
head -n 1 backend/static/pagemaker/pagemaker.min.js
# Output: /*! grapesjs - 0.22.13 */

# Check global variable name
grep -o 't\["pagemaker"\]' backend/static/pagemaker/pagemaker.min.js | head -1
# Output: t["pagemaker"]
```

---

## 🔍 Debug

### **Build lỗi: pnpm not found**

```bash
npm install -g pnpm
```

### **Build lỗi: dependencies missing**

```bash
cd grapesjs
pnpm install
```

### **Editor không load sau build**

1. Hard refresh browser: `Ctrl + F5`
2. Check console errors (F12)
3. Restore backup:

```bash
cd backend/static/pagemaker
cp pagemaker.min.js.backup_20251017_012016 pagemaker.min.js
```

### **Global variable undefined**

Check webpack config:

```javascript
// webpack.config.js phải có:
library: 'pagemaker',
libraryTarget: 'umd',
```

---

## 📊 Build Output

### **File sizes:**
- `pagemaker.min.js`: ~1.1MB (minified)
- `pagemaker.min.css`: ~60KB (minified)
- Total: ~1.16MB

### **Supported formats:**
- ✅ Browser (UMD): `<script src="pagemaker.min.js"></script>`
- ✅ CommonJS: `const pagemaker = require('pagemaker')`
- ✅ ES6 Module: `import pagemaker from 'pagemaker'`

### **Browser compatibility:**
- ✅ Chrome/Edge: Latest 2 versions
- ✅ Firefox: Latest 2 versions
- ✅ Safari: 8+
- ✅ IE: 11+ (with polyfills)

---

## ⚠️ Lưu ý quan trọng

1. ✅ **Luôn backup** trước khi build mới (script tự động làm)
2. ✅ **Test kỹ** trước khi deploy production
3. ✅ **Commit code** sau mỗi customization
4. ⚠️ **KHÔNG edit** file `.min.js` trực tiếp (sẽ bị ghi đè)
5. ⚠️ **Cẩn thận** khi update GrapesJS version (có thể breaking changes)

---

## 🚀 Production Deployment

### **Minify thêm (optional):**

```bash
cd backend/static/pagemaker

# Minify JS thêm với terser
npx terser pagemaker.min.js -o pagemaker.min.js -c -m

# Minify CSS thêm với cssnano
npx cssnano pagemaker.min.css pagemaker.min.css
```

### **Gzip compression:**

```bash
# Tạo gzip version cho faster loading
gzip -k -9 pagemaker.min.js  # → pagemaker.min.js.gz
gzip -k -9 pagemaker.min.css # → pagemaker.min.css.gz
```

---

## 📚 Tài liệu tham khảo

- **GrapesJS Docs**: https://grapesjs.com/docs/
- **API Reference**: https://grapesjs.com/docs/api/
- **Source Code**: `grapesjs/packages/core/src/`
- **Webpack Docs**: https://webpack.js.org/

---

## 🎉 Kết quả

✅ **PageMaker = GrapesJS customize với:**
- Tên mới: `pagemaker` (thay vì `grapesjs`)
- File mới: `pagemaker.min.js` + `pagemaker.min.css`
- Global variable: `window.pagemaker`
- Dễ customize và maintain
- Build tự động với script

**Usage:**
```javascript
const editor = pagemaker.init({
  container: '#gjs',
  height: '100vh',
  plugins: ['grapesjs-tailwind']
});
```

---

**Last updated**: 2025-10-17  
**Version**: Based on GrapesJS 0.22.13  
**Maintained by**: PageMaker Team
