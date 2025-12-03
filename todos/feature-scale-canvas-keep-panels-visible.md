# Kế hoạch: Scale Canvas và Giữ Panels Hiển thị ở Mọi Device Mode

## 1. Mục tiêu (Goal)
Thay đổi hành vi của editor để:
- **Left panel (280px)** và **Right panel (320px)** luôn hiển thị đầy đủ ở TẤT CẢ các chế độ device (Desktop, Tablet, Mobile)
- **Canvas/Frame sẽ scale down** (thu nhỏ bằng CSS transform) để vừa với không gian còn lại
- Frame vẫn giữ kích thước thật (768px tablet, 375px mobile) nhưng được scale nhỏ lại để fit

## 2. Các bước Thực hiện (Implementation Steps)

### Phase 1: Sửa CSS trong index.html
* [x] Xóa CSS đang ẩn left-panel và right-panel ở tablet/mobile mode (line 806-862)
* [x] Thêm CSS mới để panels luôn hiển thị với kích thước cố định
* [x] Thêm CSS cho canvas container để hỗ trợ centering và scaling

### Phase 2: Cập nhật DeviceSwitcher.js
* [x] Thêm hàm `calculateScaleRatio()` - tính toán tỷ lệ scale dựa trên không gian còn lại
* [x] Thêm hàm `applyCanvasScale()` - apply CSS transform scale cho canvas
* [x] Cập nhật `setDevice()` để gọi các hàm mới
* [x] Thêm event listener cho window resize để recalculate scale

### Phase 3: CSS Animation và Visual
* [x] Thêm CSS transition cho smooth scaling animation
* [x] Đảm bảo canvas được căn giữa trong vùng còn lại
* [x] Hiển thị % zoom indicator (scale-indicator badge)

### Phase 4: Testing và Fixes
* [x] Sửa lỗi right panel che canvas - chuyển từ transform sang zoom
* [ ] Test chuyển đổi Desktop -> Tablet -> Mobile
* [ ] Test resize window ở các device mode
* [ ] Đảm bảo các tool (select, edit) vẫn hoạt động đúng với scaled canvas

## 3. Các file bị ảnh hưởng (Files to be Touched)
* `/frontend/src/editor/index.html` (Chỉnh sửa CSS inline, line 806-862)
* `/frontend/src/editor/scripts/components/DeviceSwitcher.js` (Chỉnh sửa - thêm logic scale)

## 4. Chi tiết Kỹ thuật

### Công thức tính Scale Ratio:
```javascript
// Không gian khả dụng cho canvas
const availableWidth = window.innerWidth - leftPanelWidth(280) - rightPanelWidth(320) - padding;

// Kích thước frame thực tế
const frameWidth = deviceWidths[currentDevice]; // 768 tablet, 375 mobile

// Scale ratio
const scaleRatio = Math.min(1, availableWidth / frameWidth);
```

### CSS Transform:
```css
#editor-canvas-container {
    transform: scale(var(--canvas-scale, 1));
    transform-origin: center top;
}
```

## 5. Ghi chú
- Desktop mode vẫn giữ nguyên hành vi (không scale, panels visible)
- Scale chỉ áp dụng khi frame width > available space
- Cần đảm bảo các event mouse/click vẫn hoạt động đúng với scaled canvas
