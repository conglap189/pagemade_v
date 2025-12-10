# Kế hoạch: Template Selection Feature

## 1. Mục tiêu (Goal)
Thêm tính năng chọn template khi tạo page/site mới trong dự án PageMade. Khi user chọn "Tạo & Thiết Kế Ngay", họ có thể chọn template (blank hoặc landing-product) và editor sẽ load content từ template đó.

## 2. Các bước Thực hiện (Implementation Steps)

### Backend - Template System
- [x] Tạo thư mục `backend/static/templates/`
- [x] Tạo file `blank.json` - Template trang trống
- [x] Tạo file `landing-product.json` - Template landing page bán hàng
- [x] Tạo thumbnails: `thumbnails/blank.svg` và `thumbnails/landing-product.svg`

### API Endpoints
- [x] Thêm `GET /api/templates` - Lấy danh sách templates
- [x] Thêm `GET /api/templates/<id>` - Lấy content chi tiết
- [x] Fix `get_templates_dir()` path để trỏ đúng đến `backend/static/templates/`

### Fix Routes
- [x] Fix catch-all route trong `pages.py` - skip `/api/*` paths
- [x] Fix template application trong `sites.py` - load JSON và save vào homepage

### Frontend Editor
- [x] Thêm xử lý format `html_content`/`css_content` trong `main.js`

### UI Template Selection (REDESIGNED)
- [x] Tạo template grid trong `new_site.html`
- [x] Fix `selectTemplate()` function với `event.preventDefault()`
- [x] **REDESIGN** CSS cho template cards với visual cues rõ ràng:
  - Card lớn hơn (thumbnail 140px)
  - Border 4px khi selected
  - Gradient background khi selected
  - Badge "Đang chọn" ở top
  - Checkmark icon với animation
  - Unselected cards bị dim (opacity 0.6, grayscale)
  - Scale 1.02 khi selected
- [x] Cập nhật SVG thumbnails đẹp hơn
- [x] **SIMPLIFY** Chuyển sang 3 radio options thay vì template grid:
  - Option 1: Trang Trống (dashboard + blank)
  - Option 2: Landing Sản Phẩm (pagemade + landing-product)
  - Option 3: Thiết Kế Ngay (pagemade + blank)
- [x] Fix checkmark indicator - dùng JavaScript toggle `.active` class thay vì `peer-checked:`

### Testing
- [x] Verify database có lưu template content đúng
- [x] Verify API `/api/pages/{id}/content` trả về `html_content`/`css_content`
- [x] Fix `updateTemplateValue()` để ẩn template preview khi chọn option khác
- [x] Verify code hoàn chỉnh - server running, APIs working, templates available

## 3. Các file bị ảnh hưởng (Files Touched)

### Created:
- `backend/static/templates/blank.json`
- `backend/static/templates/landing-product.json`
- `backend/static/templates/thumbnails/blank.svg`
- `backend/static/templates/thumbnails/landing-product.svg`

### Modified:
- `backend/app/routes/api.py` - Template API endpoints
- `backend/app/routes/sites.py` - Create site với template
- `backend/app/routes/pages.py` - Fixed catch-all route
- `backend/templates/new_site.html` - UI chọn template (REDESIGNED)
- `frontend/src/editor/scripts/main.js` - Editor load template content

## 4. UI Changes Summary (Latest)

**Template Card Visual States:**

| State | Visual Cues |
|-------|-------------|
| **Unselected** | Opacity 0.6, grayscale 30%, border gray 3px |
| **Hover** | Opacity 0.9, no grayscale, lift up 4px, shadow |
| **Selected** | Border green 4px, gradient bg (green), scale 1.02, glow shadow, badge "Đang chọn", checkmark icon with pop animation |

## 5. UI Redesign - Integrated Template Card (Latest)

### Changes Made:
- [x] Ô "Chọn Template" bây giờ có background là hình preview template
- [x] Khi chưa chọn → hiện button "Chọn Template" ở giữa card
- [x] Khi đã chọn → hiện checkmark + tên template, click để đổi
- [x] Bỏ template preview container riêng bên dưới
- [x] Bỏ nút "Đổi Template" overlay

### Template Card States:
| State | Visual |
|-------|--------|
| **Empty** | Purple gradient bg, icon palette, button "Chọn Template" |
| **Selected** | Green checkmark, template name, "Click để đổi", preview image visible |

## 6. Next Steps
1. User test trong browser: http://localhost:5000/new-site?v=8
2. Verify modal mở đúng khi click button/card
3. Verify template được chọn và hiển thị đúng
