# Kế hoạch: Fix Canvas Issues - Đồng bộ với GrapesJS Source Gốc

## 1. Mục tiêu (Goal)
Sửa các lỗi canvas sau khi refactor:
1. Canvas mở rộng quá lớn - không hiển thị khung vừa đủ và expand dần khi thêm content
2. Footer thả vào vẫn còn khoảng trống phía dưới - canvas không co lại theo content
3. Khi xóa phần tử, canvas không co lại (giữ nguyên kích thước)
4. Các chế độ Desktop, Tablet, Mobile không ăn khớp với nhau so với source gốc

## 2. Phân tích Nguyên nhân

### 2.1 Khác biệt Device Manager
**Source gốc GrapesJS (`grapesjs/packages/core/src/device_manager/config/config.ts`):**
```js
devices: [
  { id: 'desktop', name: 'Desktop', width: '' },
  { id: 'tablet', name: 'Tablet', width: '768px', widthMedia: '768px' },
  { id: 'mobileLandscape', name: 'Mobile landscape', width: '568px', widthMedia: '768px' },
  { id: 'mobilePortrait', name: 'Mobile portrait', width: '320px', widthMedia: '480px' }
]
```

**Cấu hình hiện tại (`pagemade-config.js`):** *(ĐÃ CẬP NHẬT)*
```js
devices: [
  { id: 'desktop', name: 'Desktop', width: '' },            // Đã thêm id, xóa widthMedia
  { id: 'tablet', name: 'Tablet', width: '768px', widthMedia: '768px' },
  { id: 'mobilePortrait', name: 'Mobile', width: '320px', widthMedia: '480px' } // Đồng bộ với source gốc
]
```

**Vấn đề:** *(ĐÃ SỬA)*
- ~~Thiếu `id` field → GrapesJS phải tự generate~~ → ĐÃ THÊM id
- ~~Desktop có `widthMedia: '992px'`~~ → ĐÃ XÓA widthMedia khỏi Desktop
- ~~Mobile width `375px` khác với source gốc (`320px`)~~ → ĐÃ CẬP NHẬT thành `320px`

### 2.2 CSS Override có thể gây conflict *(ĐÃ SỬA)*
**Trong `index.html` lines 765-786:** *(ĐÃ COMMENT/XÓA)*
```css
.gjs-cv-canvas {
    width: 100% !important;
    height: 100% !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
}

.gjs-cv-canvas__frames {
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
}

.gjs-frame {
    width: 100% !important;
    height: 100% !important;
}
```

**Vấn đề:**
- `!important` có thể ghi đè behavior native của GrapesJS
- Source gốc dùng CSS variables (`--gjs-left-width`, `--gjs-canvas-top`)
- `.gjs-frame { height: 100% }` có thể conflict với auto-height behavior

### 2.3 scrollableCanvas Config
- Source gốc: `scrollableCanvas: false` (mặc định trong config.ts)
- Hiện tại: `scrollableCanvas: true` (trong pagemade-config.js)

## 3. Các bước Thực hiện (Implementation Steps)

### Phase 1: Đồng bộ Device Manager với Source Gốc
* [x] Thêm `id` field cho tất cả devices trong `pagemade-config.js`
* [x] Xóa `widthMedia: '992px'` khỏi Desktop (source gốc không set)
* [x] Cập nhật Mobile: `width: '320px'` và `widthMedia: '480px'` (hoặc giữ `375px` nếu phù hợp hơn)
* [ ] Xem xét thêm `mobileLandscape` device như source gốc

### Phase 2: Kiểm tra và Sửa CSS Override
* [x] Comment/xóa CSS override cho `.gjs-cv-canvas` trong `index.html`
* [x] Comment/xóa CSS override cho `.gjs-cv-canvas__frames`
* [x] Comment/xóa CSS override cho `.gjs-frame`
* [x] Thay thế bằng CSS variables nếu cần:
  ```css
  :root {
      --gjs-left-width: 0;
      --gjs-canvas-top: 0;
  }
  ```

### Phase 3: Kiểm tra scrollableCanvas Setting
* [ ] Test với `scrollableCanvas: false` (như source gốc)
* [ ] So sánh behavior với `scrollableCanvas: true`
* [ ] Chọn setting phù hợp với yêu cầu

### Phase 4: Testing
* [ ] Test canvas hiển thị đúng với empty page
* [ ] Test drag & drop blocks vào canvas
* [ ] Test device switching (Desktop → Tablet → Mobile)
* [ ] Test canvas co/giãn khi thêm/xóa content
* [ ] Test scroll khi content dài

## 4. Các file bị ảnh hưởng (Files to be Touched)
* `frontend/src/editor/scripts/config/pagemade-config.js` - Device Manager config
* `frontend/src/editor/index.html` - CSS overrides (lines 760-790)
* `frontend/src/editor/styles/editor.css` - Custom styles (nếu cần)

## 5. Rollback Plan
Nếu các thay đổi gây ra vấn đề mới:
1. Revert device config về cũ
2. Uncomment lại CSS overrides đã xóa
3. Thử từng thay đổi một để xác định vấn đề

## 6. Expected Result
- Canvas hiển thị đúng kích thước theo device mode
- Canvas co/giãn theo content khi thêm/xóa phần tử
- Không có khoảng trống thừa khi drop footer
- Device switching hoạt động mượt mà
