# Kế hoạch: Fix Highlighter Misalignment on Device Switch

## 1. Mục tiêu (Goal)
Sửa lỗi khung xanh highlighter bị lệch vị trí so với phần tử thực tế trong canvas sau khi chuyển đổi device (Desktop/Tablet/Mobile).

## 2. Nguyên nhân (Root Cause)
- Khi chuyển device, GrapesJS resize frame (iframe) nhưng highlighter/tools layer không được refresh để cập nhật vị trí mới
- GrapesJS có sẵn method `editor.Canvas.refresh({ all: true })` để cập nhật vị trí tools
- DeviceSwitcher.js không gọi refresh sau khi chuyển device

## 3. Các bước Thực hiện (Implementation Steps)
* [x] Phân tích code GrapesJS để hiểu cơ chế refresh highlighter
* [x] Xác định vị trí cần thêm refresh call trong DeviceSwitcher.js
* [x] Sửa DeviceSwitcher.js để gọi `editor.Canvas.refresh({ all: true })` sau khi chuyển device
* [x] Thêm delay phù hợp để đảm bảo frame đã resize xong trước khi refresh
* [x] Build và test - ✅ Build thành công

## 4. Các file bị ảnh hưởng (Files to be Touched)
* `/frontend/src/editor/scripts/components/DeviceSwitcher.js` (Chỉnh sửa)

## 5. Giải pháp Chi tiết
Trong method `setDevice()` của DeviceSwitcher.js, sau khi gọi `this.editor.setDevice()`, thêm:
```javascript
// Refresh canvas to update highlighter positions after device switch
setTimeout(() => {
    if (this.editor && this.editor.Canvas) {
        this.editor.Canvas.refresh({ all: true });
    }
}, 350); // Wait for frame resize animation to complete
```

Lý do dùng `setTimeout(350ms)`:
- GrapesJS có animation khi resize frame (class `gjs-frame-wrapper--anim`)
- Code trong FrameWrapView.ts: `noChanges ? this.updateOffset() : setTimeout(this.updateOffset, 350);`
- Cần chờ animation hoàn thành trước khi refresh
