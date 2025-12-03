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

## 5. Status: CẦN TEST

### Session 3 - Sửa CSS đúng cách (HOÀN THÀNH):

**Phát hiện lỗi:**
- CSS custom đang dùng `position: relative` cho `.gjs-frame-wrapper` - SAI!
- GrapesJS gốc dùng `position: absolute; left: 0; right: 0; margin: auto` để center frame
- Khi set `position: relative`, frame không thể được center đúng cách

**Sửa đổi đã thực hiện:**
1. `.gjs-cv-canvas__frames`: Bỏ `display: flex`, giữ `position: absolute` giống GrapesJS gốc
2. `.gjs-frame-wrapper`: Dùng `position: absolute` với `left: 0; right: 0; margin: auto` + `top: 20px`

**Logic hoạt động (đã verify từ source code):**
1. `editor.setDevice('Tablet')` → emit `change:device` event
2. `Canvas.updateDevice()` lấy device config và set `width/height/minHeight` vào frame model
3. `FrameWrapView.__handleSize()` update `style.width` và `style.height` inline trên `.gjs-frame-wrapper`
4. CSS `position: absolute; left: 0; right: 0; margin: auto` center frame trong canvas
5. Canvas area có `flex: 1`, co lại khi right panel visible

**Cần test trên browser:**
- [ ] Chuyển Desktop → Tablet: frame co lại 768px và centered
- [ ] Chuyển Tablet → Mobile: frame co lại 375px và centered  
- [ ] Right panel không đè lên canvas
- [ ] Scrollbar hiển thị với màu đậm khi content overflow

### Để test:
1. Mở http://localhost:5001 (frontend dev server)
2. Đăng nhập và vào editor
3. Click device buttons (Desktop/Tablet/Mobile) trên toolbar
4. Kiểm tra frame resize và centering
5. Kiểm tra right panel không overlap
