# Kế hoạch: Fix Tablet Mode - Right Panel Overlapping Canvas

## 1. Mục tiêu (Goal)
Sửa lỗi giao diện ở chế độ Tablet: Right panel đang đè lên canvas thay vì canvas co lại để nhường chỗ cho right panel (giống như hoạt động ở Desktop mode).

## PHIÊN BẢN 3 - FINAL FIX

### Vấn đề gốc đã phát hiện (Root Cause):
**DUPLICATE EVENT LISTENERS** - Có 2 nơi handle device switching:
1. `DeviceSwitcher.js` (component) - Đúng: gọi `editor.setDevice('Tablet')` với tên PROPER CASE
2. `main.js setupDeviceSwitcher()` - SAI: gọi `pm.setDevice('tablet')` với tên chữ thường

Khi click device button, CẢ HAI event listeners chạy:
- DeviceSwitcher gọi `setDevice('Tablet')` ✓
- main.js gọi `setDevice('tablet')` ✗ - GrapesJS không recognize device name này!

### Giải pháp:
Xóa duplicate logic trong `main.js setupDeviceSwitcher()`, để DeviceSwitcher component xử lý hoàn toàn.

## 2. Các bước Thực hiện (Implementation Steps)
- [x] Đọc lại code hiện tại của DeviceSwitcher.js để hiểu logic resize
- [x] Đọc lại CSS trong index.html và editor.css liên quan đến canvas
- [x] Xác định cách tính toán width chính xác cho canvas khi right panel visible
- [x] Sửa CSS trong index.html: Thêm CSS cho `.gjs-frame` theo device class trên `#gjs`
- [x] Sửa DeviceSwitcher.js: Thêm device class vào `#gjs` element để CSS có thể target
- [x] Xóa duplicate logic trong main.js setupDeviceSwitcher() - gây conflict device naming
- [x] Fix HTML data-device attributes: "Desktop" → "desktop" (lowercase để match JS)
- [ ] Test trên các chế độ: Desktop, Tablet, Mobile để đảm bảo không break

## 3. Các file đã chỉnh sửa
- `/frontend/src/editor/scripts/main.js` (line 1110-1127) - Xóa duplicate device switching logic
- `/frontend/src/editor/scripts/components/DeviceSwitcher.js` - Đã đúng, không cần sửa
- `/frontend/src/editor/index.html` - CSS đã đúng từ session trước

## 4. Ghi chú Kỹ thuật
- Layout hiện tại: `#left-sidebar` (60px) + `#left-panel` (280px) + `#canvas-area` (flex:1) + `#right-panel` (320px)
- Tablet device width trong GrapesJS: 768px
- GrapesJS deviceManager set width trực tiếp trên `.gjs-frame-wrapper` element
- DeviceSwitcher.js chuyển đổi device names: 'desktop' → 'Desktop', 'tablet' → 'Tablet', 'mobile' → 'Mobile'

## 5. Status: ĐÃ SỬA - CẦN TEST
