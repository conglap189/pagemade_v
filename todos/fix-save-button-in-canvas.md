# Kế hoạch: Sửa lỗi Button Lưu trong Canvas

## 1. Mục tiêu (Goal)
Sửa chức năng button "Lưu" trong editor canvas để có thể lưu nội dung trang thành công.

## 2. Vấn đề phát hiện (Issues Found)
- Frontend (`main.js:853-897`) đang gửi dữ liệu với cấu trúc:
  - `title`: string
  - `content`: JSON string chứa `{html, css, components, styles, assets}`
  - `css_content`: string
  
- Backend API (`pages_api.py:218-290`) mong đợi:
  - `title`: string  
  - `html_content`: string (HTML thuần)
  - `css_content`: string
  - Không có field `content`

- Mismatch: Frontend gửi `content` (JSON), Backend cần `html_content` (HTML)

## 3. Các bước Thực hiện (Implementation Steps)

### Option 1: Sửa Frontend (Khuyến nghị)
* [ ] Kiểm tra backend có lưu field `content` không (trong model Page)
* [ ] Nếu có field `content`: Cập nhật backend API để nhận cả `content` JSON
* [ ] Nếu không: Sửa frontend gửi đúng format mà backend mong đợi

### Option 2: Kiểm tra luồng Save hiện tại
* [ ] Xem backend có endpoint nào khác cho PageMade editor không
* [ ] Kiểm tra endpoint `/api/pages/<int:page_id>/pagemade/save` (line 540)
* [ ] So sánh với endpoint hiện tại đang dùng `/api/pages/<int:page_id>` PUT

## 4. Các file bị ảnh hưởng (Files to be Touched)
* `/home/helios/ver1.1/frontend/src/editor/scripts/main.js` (Line 853-897 - hàm save)
* `/home/helios/ver1.1/frontend/src/editor/scripts/api-client.js` (Line 213-224 - savePage)
* `/home/helios/ver1.1/backend/app/routes/pages_api.py` (Line 218-290 - update_page endpoint)
* `/home/helios/ver1.1/backend/app/models/page.py` (Kiểm tra cấu trúc model)

## 5. Quyết định Implementation - ĐÃ XÁC ĐỊNH

### Vấn đề chính:
- ✅ Model Page CÓ field `content` (line 18 trong page.py)
- ✅ CÓ endpoint chuyên dụng `/api/pages/<int:page_id>/pagemade/save` (line 540-589 trong pages.py)
- ❌ Frontend đang gọi SAI endpoint:
  - Hiện tại: `/api/pages/${pageId}` (PUT) - endpoint này cần `html_content`
  - Cần sửa: `/api/pages/${pageId}/pagemade/save` (POST) - endpoint này nhận GrapesJS format

### Giải pháp:
**Sửa frontend** để:
1. Gọi đúng endpoint `/pagemade/save` thay vì endpoint PUT chung
2. Gửi đúng format GrapesJS: `gjs-html`, `gjs-css`, `gjs-components`, `gjs-styles`, `gjs-assets`
3. Sử dụng method POST thay vì PUT

## 6. Implementation Tasks (Updated)
* [x] Sửa `api-client.js` - Tạo method `savePageMadeContent()` mới gọi endpoint `/pagemade/save`
  - ✅ Method mới tạo tại line 229-240
  - ✅ Gọi POST `/api/pages/${pageId}/pagemade/save`
* [x] Sửa `main.js` - Cập nhật hàm `save()` để:
  - ✅ Lấy content từ GrapesJS với format `gjs-*` (line 868-874)
  - ✅ Gọi `apiClient.savePageMadeContent()` thay vì `apiClient.savePage()` (line 877)
* [x] Sửa `pages.py` - Cập nhật authentication decorator:
  - ✅ Đổi từ `@login_required` sang `@jwt_required` (line 541)
  - ✅ Sử dụng `request.current_user.id` thay vì `current_user.id` (line 551, 570)
* [ ] Test chức năng save sau khi sửa

## 7. Verification Checklist
* [ ] Build frontend code (nếu cần)
* [ ] Restart backend service
* [ ] Test button "Lưu" trong editor:
  - [ ] Click button Lưu
  - [ ] Kiểm tra console không có lỗi
  - [ ] Verify message success hiển thị
* [ ] Kiểm tra database:
  - [ ] Field `content` có được update với JSON format không
  - [ ] Kiểm tra JSON có đúng format `gjs-*` không
* [ ] Test chức năng Publish sau khi save
* [ ] Test load lại editor - content có được restore không

## 8. Bug Fix Log

### Bug #1: TypeError - getAssets is not a function (FIXED ✅)
**Lỗi phát hiện:**
```
TypeError: this.pm.getAssets is not a function
    at PageMadeApp.save (main.js:864:36)
```

**Root Cause:**
- GrapesJS không có method `getAssets()` trực tiếp trên editor instance
- Assets phải được lấy qua `editor.AssetManager.getAll()`

**Fix Applied:**
- File: `main.js:864`
- Đổi: `const assets = this.pm.getAssets()`
- Thành: `const assets = this.pm.AssetManager ? this.pm.AssetManager.getAll() : []`

**Status:** ✅ Fixed

### Bug #2: Button "Quay lại" không trỏ về dashboard đúng (FIXED ✅)
**Lỗi phát hiện:**
- Button "Quay lại" trỏ về `/dashboard` (relative URL)
- Dẫn đến 404 vì editor chạy ở port 8080, không có route `/dashboard`

**Root Cause:**
- File: `index.html:1057`
- Sử dụng relative URL: `onclick="window.location.href='/dashboard'"`
- Cần absolute URL để trỏ về backend dashboard

**Fix Applied:**
- Đổi: `onclick="window.location.href='/dashboard'"`
- Thành: `onclick="window.location.href='http://localhost:5000/dashboard'"`

**Status:** ✅ Fixed

## 9. Testing Instructions
1. **Reload editor page** (Ctrl+Shift+R)
2. **Test button Lưu:**
   - Thực hiện thay đổi
   - Click "Lưu"
   - Verify: "Trang đã được lưu thành công!"
3. **Test button Quay lại:**
   - Click button "Quay lại" (icon home)
   - Verify: Chuyển về `http://localhost:5000/dashboard`

## 10. Bug #3: Content không load lại sau khi lưu (ĐANG FIX)

### Vấn đề:
- User lưu thành công → Reload trang → Không thấy content đã lưu

### Root Cause Analysis:
1. **SAVE**: Gọi endpoint `/api/pages/${pageId}/pagemade/save` → Lưu vào `page.content` với format JSON `gjs-*`
2. **LOAD**: Gọi endpoint `/api/pages/${pageId}/content` → Trả về JSON nhưng không parse đúng

### Chi tiết:
- Backend `/content` endpoint (line 465-494) trả về:
```python
content_data = json.loads(page.content)  # {"gjs-html": "...", "gjs-components": [...]}
return Helpers.success_response(data=content_data)  # Wrapped in success response
```

- Frontend `api-client.js:202` nhận:
```javascript
const data = await this.request(`/api/pages/${pageId}/content`);
return data.success ? data.data : null;  // data.data = content_data
```

- Frontend `main.js:211-217` parse:
```javascript
parsedContent = typeof pageData.content === 'string' 
    ? JSON.parse(pageData.content) 
    : pageData.content || {}
```

### Vấn đề chính:
- `pageData` = `data.data` = `{"gjs-html": "...", "gjs-components": [...]}` 
- Nhưng code đang check `pageData.content` (không tồn tại!)
- Cần sửa: `pageData` CHÍNH LÀ content data, không phải `pageData.content`

### Fix Tasks:
* [x] Sửa `main.js:loadPageData()` để parse đúng response từ `/content` endpoint
* [x] Test load lại content sau khi lưu

### Fix Applied (Round 1 - Parse response):
- File: `main.js:loadPageData()` (line 201-262)
- Thay đổi logic parse:
  - Check `pageData['gjs-html']` hoặc `pageData['gjs-components']` trước (format mới)
  - Fallback check `pageData.content` (format cũ)
  - Thêm console logs để debug

**Status:** ✅ Fixed - Nhưng chưa đủ!

## 11. Bug #4: Frontend KHÔNG gọi /content endpoint khi có token (FIXED ✅)

### Vấn đề:
- Sau khi verify token thành công, `loadPageData()` return sớm mà KHÔNG gọi API load content
- Token chỉ chứa metadata (page_title, user info), KHÔNG có content

### Root Cause:
- File: `main.js:loadPageData()` (line 187-198)
- Code cũ:
```javascript
if (this.pageData) {
    console.log('Using verified token data')
    // ... update title
    return  // ← BUG: Return sớm, không load content!
}
```

### Fix Applied (2025-12-03):
- Xóa early return khi có token data
- LUÔN gọi `window.apiClient.getPage(this.pageId)` để load content
- Merge token metadata với content data

**Code mới:**
```javascript
// Store token metadata if available
const tokenMetadata = this.pageData || {}

// ALWAYS load page content from API
const contentData = await window.apiClient.getPage(this.pageId)
// ... parse content ...

// Merge token metadata với content
this.pageData = {
    page: {
        title: tokenMetadata.page_title || contentData.title || 'Untitled Page',
        // ... content from API
    }
}
```

**Status:** ✅ FIXED

### Verification:
1. Backend logs now show `/api/pages/{id}/content` being called on editor load
2. Database has content saved (verified with SQLite query)
3. Frontend loads content correctly after reload
