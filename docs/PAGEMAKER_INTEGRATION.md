# PageMaker Integration Guide

## 🎯 Overview

PageMaker là phiên bản customize của GrapesJS, được tích hợp vào backend Flask để tạo website builder.

---

## 📁 File Structure

```
ver1.1/
├── grapesjs/packages/core/     # GrapesJS source code
├── backend/
│   ├── static/pagemaker/       # Built PageMaker files
│   │   ├── pagemaker.min.js
│   │   └── pagemaker.min.css
│   ├── templates/
│   │   ├── editor_pagemaker.html  # PageMaker editor template
│   │   └── editor.html            # Old editor (fallback)
│   └── app/
│       ├── routes.py           # API endpoints
│       └── models.py           # Page model with HTML generation
└── build-pagemaker.sh          # Build script
```

---

## 🚀 Build & Deploy

### Build PageMaker

```bash
# Build GrapesJS and copy to Flask static
./build-pagemaker.sh
```

Output:
- `backend/static/pagemaker/pagemaker.min.js` (1.05 MB)
- `backend/static/pagemaker/pagemaker.min.css`

### Rebuild khi có thay đổi

```bash
cd grapesjs/packages/core
npm run build:js    # Build JavaScript
npm run build:css   # Build CSS
cd ../../..
./build-pagemaker.sh  # Copy to Flask
```

---

## 🔌 API Endpoints

### Load PageMaker Content

```http
GET /api/pages/{page_id}/pagemaker/load
Authorization: Required (login)
```

Response:
```json
{
  "assets": [],
  "styles": [],
  "pages": [{
    "frames": [{
      "component": { /* GrapesJS components */ }
    }]
  }]
}
```

### Save PageMaker Content

```http
POST /api/pages/{page_id}/pagemaker/save
Authorization: Required (login)
Content-Type: application/json
```

Body:
```json
{
  "assets": [],
  "styles": [],
  "components": { /* GrapesJS components */ },
  "html": "<div>Generated HTML</div>",
  "css": "body { margin: 0; }"
}
```

---

## 💾 Database Schema

### Page.content column

Lưu trữ JSON với cấu trúc:

```json
{
  "assets": [],           // Images, files
  "styles": [],           // CSS styles
  "components": {},       // GrapesJS component tree
  "html": "<div>...</div>",  // Generated HTML
  "css": "body { ... }"   // Generated CSS
}
```

### Khi publish

`Page.generate_html()` sẽ:
1. Parse JSON từ `Page.content`
2. Extract `html` và `css`
3. Generate full HTML document với Bootstrap
4. Serve qua subdomain

---

## 🎨 Editor Usage

### Open Editor

```
/editor/{page_id}
```

### Features

- ✅ Drag & Drop components
- ✅ Responsive design (Desktop/Tablet/Mobile)
- ✅ Style Manager (CSS editor)
- ✅ Auto-save (every 2 minutes)
- ✅ Manual save button
- ✅ Publish button

### Shortcuts

- `Ctrl/Cmd + S`: Save
- `Ctrl/Cmd + Shift + P`: Preview

---

## 🔧 Customization

### Add Custom Blocks

Edit `editor_pagemaker.html`:

```javascript
editor.BlockManager.add('my-block', {
  label: 'My Block',
  category: 'Custom',
  content: '<div class="my-block">Content</div>'
});
```

### Change Colors

Edit CSS in `editor_pagemaker.html`:

```css
.gjs-one-bg {
  background-color: #YOUR_COLOR;
}
```

### Add Plugins

```javascript
plugins: [
  'gjs-blocks-basic',
  'gjs-plugin-ckeditor',  // Rich text
  'gjs-preset-webpage'    // Web page preset
]
```

---

## 🐛 Troubleshooting

### Editor không load

1. Check browser console for errors
2. Verify files exist:
   ```bash
   ls -lh backend/static/pagemaker/
   ```
3. Rebuild PageMaker:
   ```bash
   ./build-pagemaker.sh
   ```

### Save không hoạt động

1. Check API endpoints:
   ```bash
   curl http://localhost:5000/api/pages/1/pagemaker/load
   ```
2. Check browser Network tab
3. Check Flask logs

### Published page hiển thị sai

1. Check `Page.content` in database:
   ```python
   page = Page.query.get(1)
   print(page.content)
   ```
2. Verify `generate_html()` method
3. Check subdomain routing

---

## 📊 Performance

- **Build size**: 1.05 MB (minified)
- **Load time**: ~500ms (first load)
- **Auto-save**: Every 2 minutes
- **Storage**: JSON in database (TEXT column)

---

## 🔄 Update GrapesJS

```bash
cd grapesjs/packages/core
git pull origin main  # Or specific version
npm install
npm run build
cd ../../..
./build-pagemaker.sh
```

---

## ✅ Checklist

- [x] Build PageMaker
- [x] Copy to Flask static
- [x] Add API endpoints
- [x] Update Page model
- [x] Create editor template
- [x] Test save/load
- [x] Test publish

---

## 🎓 Next Steps

1. **Add Vietnamese blocks** (Hero, Features, Contact, etc.)
2. **Add templates** (Landing page templates)
3. **Optimize performance** (lazy loading, code splitting)
4. **Add asset upload** (image upload to server)
5. **Add version control** (save multiple versions)

---

## 📝 Notes

- Editor route: `/editor/{page_id}` → uses PageMaker
- Old editor: `/editor-old/{page_id}` → fallback
- Storage format: GrapesJS JSON
- Publish format: Generated HTML + CSS
