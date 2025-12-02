# Kế hoạch: Rename "pagemaker" thành "pagemade"

## 1. Mục tiêu (Goal)
Đổi tên tất cả references từ "pagemaker" thành "pagemade" trong:
- Backend static files
- Backend routes/templates
- Frontend source code
- Rebuild các file cần thiết

## 2. Phạm vi (Scope)
**KHÔNG bao gồm:**
- node_modules (sẽ được rebuild)
- Các file trong `pagemakerv2- do-not-use` (deprecated, sẽ xóa)

## 3. Các bước Thực hiện (Implementation Steps)

### Phase 1: Backend - Xóa và rename files/folders
* [ ] Xóa folder deprecated: `backend/templates/pagemakerv2- do-not-use`
* [ ] Xóa file test cũ: `backend/templates/test/editor_pagemaker_simple.html`

### Phase 2: Backend - Update Python routes
* [x] Update `backend/app/routes/pages.py` - rename route endpoints và function names
* [x] Update `backend/app/routes/sites.py` - rename references

### Phase 3: Backend - Update Templates  
* [x] Update `backend/templates/new_site.html` - rename value và conditions
* [x] Update `backend/templates/new_page.html` - rename comments/references

### Phase 4: Frontend - Update source code
* [x] Update `frontend/src/editor/index.html` - rename CSS path references
* [x] Update `frontend/src/editor/scripts/config/pagemade-config.js` - rename CSS path
* [x] Update `frontend/src/editor/scripts/main.js` - rename CSS class names (.pagemaker-empty-state → .pagemade-empty-state)
* [ ] Update `frontend/src/editor/styles/editor.css` - rename comments
* [x] Update `frontend/src/editor/scripts/blocks/site-blocks.js` - removed custom-blocks feature (simplified to stub)
* [ ] Update `frontend/src/editor/public/images/branding/README.md` - rename references

### Phase 5: GrapesJS Core - Rename build output
* [x] Update GrapesJS build config để output pagemade.min.js/css thay vì pagemaker
* [x] Rebuild GrapesJS core

### Phase 6: Copy build files to backend static
* [x] Create backend/static/pagemade/ folder
* [x] Copy pagemade.min.js và pagemade.min.css vào backend/static/pagemade/
* [x] REMOVED: custom-blocks feature (no longer needed)

### Phase 7: Frontend build
* [x] Rebuild frontend với npm run build

## 4. Các file bị ảnh hưởng (Files to be Touched)

### Xóa:
* `backend/templates/pagemakerv2- do-not-use/` (folder)
* `backend/templates/test/editor_pagemaker_simple.html`

### Chỉnh sửa:
* `backend/app/routes/pages.py`
* `backend/app/routes/sites.py`
* `backend/templates/new_site.html`
* `backend/templates/new_page.html`
* `frontend/src/editor/index.html`
* `frontend/src/editor/scripts/config/pagemade-config.js`
* `frontend/src/editor/scripts/main.js`
* `frontend/src/editor/styles/editor.css`
* `frontend/src/editor/scripts/blocks/site-blocks.js`
* `grapesjs/packages/core/vite.config.ts` (build output name)

### Tạo mới:
* `backend/static/pagemade/` (folder với build files)
