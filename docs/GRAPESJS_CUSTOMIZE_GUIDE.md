# 🎨 Hướng dẫn Customize GrapesJS

## 📋 Tổng quan

GrapesJS được clone từ repository chính thức và customize để phù hợp với PageMaker.

## 📁 Cấu trúc thư mục

```
/home/helios/ver1.1/
│
├── grapesjs/                          ← Source code GrapesJS
│   └── packages/core/
│       ├── src/                       ← 🔧 EDIT CODE Ở ĐÂY
│       │   ├── block_manager/        ← Quản lý blocks
│       │   ├── style_manager/        ← Quản lý styles
│       │   ├── panels/               ← Toolbar, sidebar
│       │   ├── canvas/               ← Canvas editor
│       │   ├── commands/             ← Editor commands
│       │   ├── dom_components/       ← Components (div, text, image...)
│       │   └── ...
│       │
│       ├── dist/                      ← Build output
│       │   ├── grapes.min.js
│       │   └── css/grapes.min.css
│       │
│       └── package.json
│
└── backend/static/pagemaker/
    ├── pagemaker.min.js               ← GrapesJS build đang dùng
    └── pagemaker.min.css
```

---

## 🔧 Các loại Customization phổ biến

### 1️⃣ **Thay đổi UI/UX**

#### Ẩn/hiện panels
File: `grapesjs/packages/core/src/panels/config/config.ts`

```typescript
// Ví dụ: Ẩn panel "Views"
defaults: {
  panels: {
    defaults: [
      {
        id: 'views',
        visible: false,  // ← Thay đổi ở đây
      }
    ]
  }
}
```

#### Thay đổi icon toolbar
File: `grapesjs/packages/core/src/panels/view/PanelsView.ts`

```typescript
// Customize icon cho buttons
buttons: [
  {
    id: 'sw-visibility',
    command: 'sw-visibility',
    className: 'fa fa-eye',  // ← Đổi icon
  }
]
```

### 2️⃣ **Customize Blocks**

File: `grapesjs/packages/core/src/block_manager/config/config.ts`

```typescript
// Thêm custom blocks mặc định
defaults: {
  blocks: [
    {
      id: 'my-custom-block',
      label: 'Custom Block',
      category: 'Custom',
      content: '<div class="my-block">Custom content</div>',
    }
  ]
}
```

### 3️⃣ **Customize Style Manager**

File: `grapesjs/packages/core/src/style_manager/config/config.ts`

```typescript
// Thay đổi style properties
sectors: [
  {
    name: 'Dimension',
    open: true,
    properties: [
      'width', 'height', 'padding', 'margin'
    ]
  }
]
```

### 4️⃣ **Thay đổi Canvas behavior**

File: `grapesjs/packages/core/src/canvas/config/config.ts`

```typescript
// Customize canvas settings
defaults: {
  canvas: {
    styles: ['https://cdn.tailwindcss.com'],  // Add Tailwind CSS
    scripts: [],
  }
}
```

---

## ⚡ Quy trình Build

### **Phương pháp 1: Dùng Script tự động**

```bash
# Chạy từ thư mục gốc
cd /home/helios/ver1.1
./build-grapesjs.sh
```

Script sẽ tự động:
1. ✅ Build GrapesJS từ source
2. ✅ Backup file cũ
3. ✅ Copy file mới vào backend
4. ✅ Hiển thị kết quả

### **Phương pháp 2: Build thủ công**

```bash
# Step 1: Build GrapesJS
cd /home/helios/ver1.1/grapesjs
pnpm --filter grapesjs build

# Step 2: Copy vào backend
cp packages/core/dist/grapes.min.js ../backend/static/pagemaker/pagemaker.min.js
cp packages/core/dist/css/grapes.min.css ../backend/static/pagemaker/pagemaker.min.css
```

### **Phương pháp 3: Development mode (live reload)**

```bash
# Build với watch mode (auto rebuild khi code thay đổi)
cd /home/helios/ver1.1/grapesjs
pnpm --filter grapesjs start
```

Server sẽ chạy tại: `http://localhost:8080`

---

## 🧪 Testing

### 1. Test trên standalone server (development)

```bash
cd /home/helios/ver1.1/grapesjs/packages/core
pnpm start
```

Mở: `http://localhost:8080`

### 2. Test trên PageMaker (production)

Sau khi build và copy:

1. Reload Flask server (hoặc hard refresh browser)
2. Mở editor: `http://localhost:5000/editor/16`
3. Test các thay đổi của bạn

---

## 📝 Ví dụ Customization

### **Ví dụ 1: Đổi màu primary**

File: `grapesjs/packages/core/src/styles/scss/_variables.scss`

```scss
// Thay đổi màu chủ đạo
$primary-color: #3b82f6;  // Blue (thay vì mặc định)
$secondary-color: #10b981; // Green
```

### **Ví dụ 2: Thêm custom command**

File: `grapesjs/packages/core/src/commands/index.ts`

```typescript
editor.Commands.add('my-custom-command', {
  run(editor) {
    alert('Custom command executed!');
  }
});
```

### **Ví dụ 3: Customize component (Button)**

File: `grapesjs/packages/core/src/dom_components/types.ts`

```typescript
editor.Components.addType('button', {
  model: {
    defaults: {
      tagName: 'button',
      classes: ['btn', 'btn-primary'],  // Default classes
      attributes: { type: 'button' },
    }
  }
});
```

---

## 🔍 Debugging

### Check GrapesJS version đang dùng

Mở console trong editor:

```javascript
console.log('GrapesJS version:', grapesjs.version);
```

### So sánh file build

```bash
# Check file size
ls -lh backend/static/pagemaker/pagemaker.min.js

# Check version trong file
head -n 1 backend/static/pagemaker/pagemaker.min.js
```

### Restore backup nếu có lỗi

```bash
cd backend/static/pagemaker
cp pagemaker.min.js.backup_YYYYMMDD_HHMMSS pagemaker.min.js
```

---

## 📚 Tài liệu tham khảo

- **GrapesJS Documentation**: https://grapesjs.com/docs/
- **API Reference**: https://grapesjs.com/docs/api/
- **Source Code**: `grapesjs/packages/core/src/`
- **Examples**: `grapesjs/packages/core/test/`

---

## 🚀 Workflow khuyến nghị

1. **Edit code** trong `grapesjs/packages/core/src/`
2. **Test với dev server**: `pnpm start` (optional)
3. **Build production**: `./build-grapesjs.sh`
4. **Test trên PageMaker**: Reload editor
5. **Commit changes** nếu OK

---

## ⚠️ Lưu ý quan trọng

1. ✅ **Luôn backup** trước khi build mới
2. ✅ **Test kỹ** trước khi deploy production
3. ✅ **Commit code** vào Git sau mỗi customization
4. ⚠️ **Không edit trực tiếp** file `.min.js` (sẽ bị ghi đè khi build)
5. ⚠️ **Cẩn thận với breaking changes** khi update GrapesJS version

---

## 🆘 Troubleshooting

### Build lỗi: "pnpm not found"
```bash
npm install -g pnpm
```

### Build lỗi: "dependencies not found"
```bash
cd grapesjs
pnpm install
```

### Editor không load sau khi build
```bash
# Check console errors trong browser (F12)
# Restore backup
cd backend/static/pagemaker
cp pagemaker.min.js.backup_LATEST pagemaker.min.js
```

### File .min.js quá lớn
```bash
# Build với production mode (đã minify sẵn)
cd grapesjs
NODE_ENV=production pnpm --filter grapesjs build
```

---

**Last updated**: 2025-10-17
**GrapesJS version**: 0.22.13
**Maintained by**: PageMaker Team
