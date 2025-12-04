# Kế hoạch: Tính năng Preview Mode Button

## 1. Mục tiêu (Goal)
Đảm bảo nút Preview Mode (cạnh Component Outline) hoạt động đúng với GrapesJS preview command.
- Hide/show UI panels khi toggle preview
- Canvas fullscreen trong preview mode
- Floating toolbar để điều khiển khi ở preview mode

## 2. Các bước Thực hiện (Implementation Steps)
* [x] Kiểm tra event listener cho nút btn-preview
* [x] Đơn giản hóa logic togglePreview() trong PageMadeEditor
* [x] Cập nhật command 'preview' để không dùng commands không tồn tại
* [x] Sửa logic toggle button state trong main.js
* [x] Thêm enterPreviewMode() - Hide UI panels, canvas fullscreen
* [x] Thêm exitPreviewMode() - Restore UI panels
* [x] Thêm showFloatingPreviewToolbar() - Tạo và hiển thị floating toolbar
* [x] Thêm hideFloatingPreviewToolbar() - Ẩn floating toolbar
* [x] Thêm CSS cho floating-preview-toolbar trong index.html
* [x] Test tính năng (verified code implementation)
* [x] Thêm CSS position classes (top/left/right/bottom) cho floating toolbar
* [x] Thêm setupFloatingToolbarDrag() - Logic kéo và snap vào 4 cạnh
* [x] Thêm localStorage save/restore cho vị trí toolbar

## 3. Các file bị ảnh hưởng (Files to be Touched)
* `frontend/src/editor/scripts/config/pagemade-config.js` (Chỉnh sửa - đơn giản hóa togglePreview và preview command)
* `frontend/src/editor/scripts/main.js` (Chỉnh sửa - thêm enter/exit preview mode, floating toolbar)
* `frontend/src/editor/index.html` (Chỉnh sửa - thêm CSS cho floating-preview-toolbar)

## 4. Chi tiết Logic Preview Mode
### Enter Preview Mode:
- Hide: `#top-toolbar`, `#left-sidebar`, `#left-panel`, `#right-panel`
- Canvas fullscreen: position fixed, 100vw x 100vh
- Show floating toolbar với: Exit button, Device switcher, Save, Publish

### Exit Preview Mode:
- Restore tất cả UI panels về trạng thái ban đầu
- Hide floating toolbar
- Remove `preview-mode` class từ body

### Floating Toolbar:
- Position: Default TOP, có thể kéo và snap vào 4 cạnh (top/left/right/bottom)
- Buttons: Exit Preview, Device Switcher (Desktop/Tablet/Mobile), Save, Publish
- Style: Light glassmorphism với dark mode support
- Drag: Kéo tự do, thả ra sẽ snap vào cạnh gần nhất
- Lưu vị trí vào localStorage để restore khi mở lại

## 5. Trạng thái
- Ngày cập nhật: 2024-12-04
- Trạng thái: ✅ HOÀN THÀNH (bao gồm cả drag functionality)

## 6. Hướng dẫn Test Thủ công
1. Mở editor: http://localhost:5000/editor (login nếu cần)
2. Click nút Preview (icon con mắt 👁️) cạnh Component Outline
3. Verify:
   - Tất cả panels (top-toolbar, left-sidebar, left-panel, right-panel) ẩn
   - Canvas fullscreen
   - Floating toolbar xuất hiện ở **TOP** (top: 20px) hoặc vị trí đã lưu
   - Floating toolbar có: Close button (X), Device Switcher, Save, Publish
4. **Test Drag**:
   - Kéo floating toolbar (click vào vùng trống, không phải nút)
   - Thả ra để snap vào cạnh gần nhất (top/left/right/bottom)
   - Khi ở left/right, toolbar sẽ xoay dọc (flex-direction: column)
5. Click "X" hoặc click lại nút Preview để thoát
6. Verify: Tất cả panels được restore
7. Mở lại Preview Mode - toolbar sẽ ở vị trí đã lưu trước đó
