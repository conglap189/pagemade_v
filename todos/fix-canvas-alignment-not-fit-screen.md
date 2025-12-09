# Kế hoạch: Fix Canvas Alignment - Canvas Lệch và Không Fit Màn Hình

## 1. Mục tiêu (Goal)
Sửa lỗi canvas bị lệch (misaligned) và không fit với màn hình trong PageMade Editor.

## 2. Nguyên nhân Phân tích (Root Cause Analysis)

### Vấn đề hiện tại:
- Canvas bị lệch khi hiển thị
- Frame không căn giữa màn hình
- Có thể bị overflow hoặc không đủ chiều rộng/cao

### Nguyên nhân chính:
Trong `frontend/src/editor/styles/editor.css` (lines 39-64), CSS hiện tại:

```css
.gjs-cv-canvas {
    overflow: auto !important;
    width: 100% !important;
    height: 100% !important;
}

.gjs-frame {
    border: none !important;
    display: block !important;
    margin: auto !important;
}

.gjs-frame-wrapper {
    position: absolute !important;
    margin: auto !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
    bottom: 0 !important;
}
```

**Vấn đề:**
1. `.gjs-frame-wrapper { position: absolute }` - Có thể làm frame thoát khỏi luồng bình thường
2. `left: 0, right: 0, top: 0, bottom: 0` - Kéo giãn frame toàn bộ canvas thay vì căn giữa
3. Conflict với GrapesJS internal sizing logic (deviceManager)

### GrapesJS Expected Behavior:
- GrapesJS tự quản lý frame sizing qua `deviceManager`
- Desktop: width auto (full canvas)
- Tablet: width 768px (centered)
- Mobile: width 375px (centered)
- `.gjs-frame-wrapper` nên để GrapesJS xử lý positioning

## 3. Các bước Thực hiện (Implementation Steps)

### Bước 1: Sửa `.gjs-frame-wrapper` positioning
* [x] Xóa `position: absolute !important` và các `left/right/top/bottom`
* [x] Thay bằng `display: flex` với `justify-content: center` để căn giữa
* [x] Cho phép GrapesJS tự quản lý width

### Bước 2: Đơn giản hóa `.gjs-frame` styles
* [x] Giữ lại `border: none`, `display: block`
* [x] `.gjs-frame` không cần thay đổi thêm (frame-wrapper lo việc căn giữa)

### Bước 3: Kiểm tra `.gjs-cv-canvas`
* [x] `.gjs-cv-canvas` vẫn hoạt động đúng với `overflow: auto` và width/height 100%

### Bước 4: Test trên cả 3 devices
* [ ] Test Desktop mode - frame phải full-width
* [ ] Test Tablet mode - frame 768px phải căn giữa
* [ ] Test Mobile mode - frame 375px phải căn giữa
* [ ] Kiểm tra không có lệch hoặc overflow

## 4. Các file bị ảnh hưởng (Files to be Touched)
* `frontend/src/editor/styles/editor.css` (Sửa lines 39-64)

## 5. CSS Solution (Giải pháp - SỬ DỤNG GRAPESJS GỐC)

### ❌ Cách cũ (SAI - Tự custom):
```css
.gjs-frame-wrapper {
    position: absolute !important;
    margin: auto !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
    bottom: 0 !important;
}
```

### ✅ Giải pháp ĐÚNG (Từ GrapesJS source code):
Lấy CSS gốc từ `/grapesjs/packages/core/src/styles/scss/_gjs_canvas.scss`

**`.gjs-frame-wrapper` (lines 114-121):**
```css
.gjs-frame-wrapper {
    position: absolute !important;
    width: 100% !important;
    height: 100% !important;
    left: 0 !important;
    right: 0 !important;
    margin: auto !important;
}
```

**`.gjs-frame` (lines 300-315) - QUAN TRỌNG:**
```css
.gjs-frame {
    outline: medium none !important;
    height: 100% !important;
    width: 100% !important;
    border: none !important;
    margin: auto !important;
    display: block !important;
    position: absolute !important;
    top: 0 !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
}
```

### Giải thích:
- **Vấn đề cũ:** Chỉ set `.gjs-frame-wrapper` mà THIẾU `.gjs-frame` với `top: 0; bottom: 0`
- **Bản gốc GrapesJS:** CẢ HAI class đều dùng `position: absolute` + `top/bottom/left/right`
- **Tại sao nó work:** `.gjs-frame` (iframe) được center bởi `margin: auto` và `position: absolute` với cả 4 cạnh = 0
- **GrapesJS deviceManager** sẽ tự động thay đổi `width` của `.gjs-frame` → auto/768px/375px

## 6. Expected Result (Kết quả mong đợi)
✅ Canvas căn giữa màn hình trên mọi device
✅ Desktop: Frame full-width
✅ Tablet: Frame 768px, căn giữa
✅ Mobile: Frame 375px, căn giữa
✅ Không có lệch, overflow, hoặc gap lạ

## 7. Rollback Plan (Nếu có vấn đề)
Nếu fix gây lỗi mới, revert về CSS cũ trong commit history hoặc backup file.
