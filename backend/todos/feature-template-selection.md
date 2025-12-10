# Kế hoạch: Template Selection khi Tạo Page Mới

## 1. Mục tiêu (Goal)
Cho phép người dùng chọn template sẵn có khi tạo page mới, sau đó template đó sẽ được load vào GrapesJS editor để chỉnh sửa.

**User Flow:**
1. User vào trang "Tạo Page Mới"
2. Nhập tên page, mô tả
3. **MỚI:** Chọn 1 template từ danh sách có sẵn (có preview thumbnail)
4. Bấm "Tạo Site & Thiết kế"
5. Redirect tới Editor với template đã chọn được load sẵn

## 2. Trạng thái Implementation

### Phase 1: Backend - Template System ✅ DONE
* [x] 1.1. Tạo thư mục `backend/static/templates/` để lưu template files
* [x] 1.2. Tạo 2 template JSON files mẫu (blank, landing-product)
* [x] 1.3. Tạo API endpoint `GET /api/templates` để lấy danh sách templates
* [x] 1.4. Tạo API endpoint `GET /api/templates/<id>` để lấy content của 1 template

### Phase 2: Frontend - UI Chọn Template ✅ DONE
* [x] 2.1. Sửa `new_page.html` - thêm section chọn template với grid thumbnails
* [x] 2.2. Fetch templates từ API và render ra grid
* [x] 2.3. Xử lý selection state (highlight template được chọn)
* [x] 2.4. Gửi template_id khi submit form

### Phase 3: Editor - Load Template ✅ DONE
* [x] 3.1. Sửa API create_page để lưu template content vào page khi tạo
* [x] 3.2. Sửa editor main.js để load html_content fallback

### Phase 4: Bug Fixes ✅ DONE
* [x] 4.1. Fix catch-all route trong `pages.py` (ngăn chặn `/api/*` bị redirect)
* [x] 4.2. Fix templates directory path trong `api.py` (đường dẫn templates sai)

## 3. Các file đã thay đổi

| File | Hành động |
|------|-----------|
| `backend/static/templates/` | ✅ Tạo mới (thư mục) |
| `backend/static/templates/blank.json` | ✅ Tạo mới |
| `backend/static/templates/landing-product.json` | ✅ Tạo mới |
| `backend/static/templates/thumbnails/blank.svg` | ✅ Tạo mới |
| `backend/static/templates/thumbnails/landing-product.svg` | ✅ Tạo mới |
| `backend/app/routes/api.py` | ✅ Chỉnh sửa (thêm template endpoints + fix path) |
| `backend/app/routes/pages.py` | ✅ Chỉnh sửa (fix catch-all route for /api/*) |
| `backend/templates/new_page.html` | ✅ Chỉnh sửa (thêm UI chọn template) |
| `frontend/src/editor/scripts/main.js` | ✅ Chỉnh sửa (thêm html_content fallback) |

## 4. Templates hiện có

1. **blank** - Trang trống
   - Bắt đầu với một trang hoàn toàn trống

2. **landing-product** - Landing Sản phẩm
   - Hero section với gradient
   - Features grid (3 cột)
   - CTA section với giá
   - Footer

## 5. API Endpoints

```
GET /api/templates          - Lấy danh sách templates (metadata only)
GET /api/templates/<id>     - Lấy full content của 1 template
POST /api/pages             - Tạo page mới (nhận template parameter)
```

## 6. Cách Test

1. Truy cập: `http://localhost:5000/sites/<site_id>/pages/new`
2. Nhập tên page
3. Chọn template (mặc định là "Trang trống")
4. Bấm "Tạo & Thiết kế"
5. Editor sẽ mở với content của template đã chọn

## 7. Next Steps (Tùy chọn)

- [ ] Thêm nhiều templates hơn (bio-link, hero-simple, contact-form...)
- [ ] Thêm thumbnail ảnh thật thay vì SVG placeholder
- [ ] Template preview modal khi hover
- [ ] Search/filter templates theo category
- [ ] User có thể save design làm template riêng
