# Kế hoạch: Fix Canvas Auto Height Issues

## ⚠️ TRẠNG THÁI: REVERTED - Quay lại hành vi gốc

**Ngày cập nhật:** Dec 4, 2025

### Kết luận:

Sau khi phân tích kỹ file cũ hoạt động đúng (`editor_old_file.html`) vs file mới, phát hiện:

1. **File cũ KHÔNG dùng `height: 'auto'`** trong deviceManager
2. **File mới đã thêm `height: 'auto'`** cho tất cả devices → gây ra canvas bị cắt ngắn

### Nguyên nhân Canvas bị cắt ngắn:

Khi `height: 'auto'` được set trên device:
- `hasAutoHeight()` trả về `true`
- ResizeObserver set height = `scrollHeight` của body
- Nếu body trống → canvas rất nhỏ → xuất hiện khoảng xám lớn

### Giải pháp đã áp dụng:

1. **[DONE]** Xóa `height: 'auto'` khỏi tất cả devices trong `pagemade-config.js`
2. **[DONE]** Giữ CSS `.gjs-cv-canvas, .gjs-frame { height: 100% }` để canvas full height

### Hành vi sau fix:

- Canvas luôn chiếm toàn bộ chiều cao (height: 100%)
- Scrollbar xuất hiện **bên trong iframe** khi content vượt quá
- Đây là hành vi giống file cũ hoạt động đúng

---

## Lịch sử (Archive)

### Các thay đổi đã thực hiện trước đó (có thể cần revert thêm):

* [x] **Bước 1**: CSS trong index.html - đã đơn giản hóa về giống file cũ
* [x] **Bước 2**: FrameWrapView.ts - thêm MutationObserver (có thể KHÔNG cần thiết nữa)
* [x] **Bước 3**: main.js - thêm setupCanvasHeightEvents() (có thể KHÔNG cần thiết nữa)
* [x] **Bước 4**: Build lại GrapesJS
* [x] **Bước 5**: Xóa height: 'auto' khỏi deviceManager

## Files đã chỉnh sửa

* `frontend/src/editor/scripts/config/pagemade-config.js` - Xóa height: 'auto'
* `frontend/src/editor/index.html` - Đơn giản hóa CSS canvas
* `grapesjs/packages/core/src/canvas/view/FrameWrapView.ts` - Thêm MutationObserver (có thể revert)
