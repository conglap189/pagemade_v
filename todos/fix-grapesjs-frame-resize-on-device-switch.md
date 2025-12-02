# Kế hoạch: Fix GrapesJS Frame không Resize khi Switch Device

## 1. Mục tiêu (Goal)
Sửa lỗi GrapesJS iframe/frame không thay đổi kích thước khi người dùng chuyển đổi giữa Desktop/Tablet/Mobile trong PageMade Editor.

## 2. Phân tích vấn đề (Root Cause Analysis) - ĐÃ HOÀN THÀNH

### Hai hệ thống đang xung đột:
1. **DeviceSwitcher.js** - Controls wrapper/canvas container sizes via inline styles
2. **GrapesJS native deviceManager** - Controls the internal iframe via `editor.setDevice()`

### **ROOT CAUSE ĐÃ XÁC ĐỊNH:**

**CSS trong index.html đang override GrapesJS native sizing:**
```css
/* Lines 774-777 - ĐÂY LÀ VẤN ĐỀ! */
.gjs-frame {
    width: 100% !important;
    height: 100% !important;
}
```

GrapesJS native flow:
1. `editor.setDevice('Tablet')` → `em.set('device', name)`
2. `Canvas.ts` listens `change:device` → calls `updateDevice()`
3. `updateDevice()` → `frame.set({ width, height })` trên Frame model
4. `FrameWrapView.ts` listens `change:width` → calls `updateSize()` → `__handleSize()`
5. `__handleSize()` sets `style.width` trên `.gjs-frame-wrapper` element

**Nhưng CSS `!important` trên `.gjs-frame` override điều này!**

### Các vấn đề khác:
1. ✅ Device names KHỚP: DeviceSwitcher dùng `this.devices[device].name` = 'Desktop'/'Tablet'/'Mobile'
2. ❌ Mobile width KHÔNG KHỚP: DeviceSwitcher=`375px`, pagemade-config=`320px` → ĐÃ FIX

## 3. Các bước Thực hiện (Implementation Steps)

### Phase 1: Debug và Xác định nguyên nhân
* [x] Kiểm tra DeviceSwitcher.js - xem tên device được pass vào `editor.setDevice()` như thế nào
* [x] Kiểm tra pagemade-config.js - xem device names trong deviceManager config
* [x] So sánh và đảm bảo device names khớp nhau (case-sensitive)
* [x] Tìm root cause: CSS `!important` đang override GrapesJS native sizing

### Phase 2: Sửa lỗi
* [x] Xóa CSS `!important` rules cho `.gjs-frame` trong index.html
* [x] Để GrapesJS tự xử lý frame sizing (via `.gjs-frame-wrapper`)
* [x] Đồng bộ Mobile width: cập nhật pagemade-config.js từ `320px` thành `375px`
* [x] Đơn giản hóa `updateCanvasSize()` trong DeviceSwitcher.js - chỉ update UI classes, không set size
* [x] Build frontend: `npm run build` trong `/frontend`

### Phase 3: Testing
* [ ] Test Desktop -> Tablet switching
* [ ] Test Desktop -> Mobile switching
* [ ] Test Tablet -> Mobile switching
* [ ] Verify frame actually resizes

## 4. Các file đã chỉnh sửa (Files Modified)
* `/frontend/src/editor/index.html` - Xóa CSS `!important` rules cho `.gjs-frame`
* `/frontend/src/editor/scripts/config/pagemade-config.js` - Mobile width: `320px` → `375px`
* `/frontend/src/editor/scripts/components/DeviceSwitcher.js` - Đơn giản hóa `updateCanvasSize()`

## 5. Technical Notes
- GrapesJS sets width trên `.gjs-frame-wrapper`, KHÔNG PHẢI `.gjs-frame`
- Frame resize được handle bởi `FrameWrapView.__handleSize()`
- CSS không nên override GrapesJS internal styles với `!important`

## 6. Summary of Changes

### index.html CSS Changes:
**Before:**
```css
.gjs-frame {
    width: 100% !important;
    height: 100% !important;
}
#gjs.device-tablet .gjs-frame { width: 768px !important; }
#gjs.device-mobile .gjs-frame { width: 375px !important; }
```

**After:**
```css
/* Let GrapesJS handle frame wrapper sizing */
.gjs-frame-wrapper {
    transition: width 0.3s ease, height 0.3s ease;
}
.gjs-frame {
    width: 100%;  /* No !important - fills wrapper */
    height: 100%;
    border: none;
}
.gjs-cv-canvas__frames {
    display: flex;
    justify-content: center;
    align-items: flex-start;
}
```

### pagemade-config.js:
- Mobile device width: `320px` → `375px` (to match DeviceSwitcher.js)

### DeviceSwitcher.js:
- Removed manual canvas/frame size manipulation
- Only updates CSS classes for UI styling
- GrapesJS native `editor.setDevice()` handles actual frame resizing
