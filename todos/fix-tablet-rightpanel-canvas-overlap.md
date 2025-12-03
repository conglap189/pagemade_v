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

## Session 4 - Fix Left Panel Not Pushing Inward in Tablet Mode

### Vấn đề mới (từ session trước):
> "In tablet mode, the canvas doesn't push the left panel inward, so users can't see full content like before."

### Phân tích:
- Layout hiện tại: left-sidebar (60px) + left-panel (280px) + canvas-area (flex:1) + right-panel (320px)
- Viewport 1440px → canvas-area = 780px → tablet (768px) OK
- Viewport 1280px → canvas-area = 620px → tablet (768px) KHÔNG ĐỦ CHỖ!
- Khi canvas area < device width, frame bị cắt hoặc overflow

### Giải pháp đề xuất:
**Option 1**: Auto-collapse left panel khi chuyển sang tablet/mobile mode
**Option 2**: Thêm horizontal scroll cho canvas area khi device width > canvas area
**Option 3**: Responsive CSS để shrink left-panel width trong tablet mode

### Các bước thực hiện:
- [x] Thêm CSS cho tablet/mobile mode: khi `#gjs.device-tablet` hoặc `.device-mobile`, left-panel sẽ collapse
- [x] Thêm transition animation cho smooth collapse
- [x] DeviceSwitcher.js đã add class `device-tablet`, `device-mobile` vào `#gjs` - chỉ cần thêm CSS
- [ ] Test trên các viewport sizes

### Chi tiết kỹ thuật:
```css
/* Khi chế độ tablet/mobile, collapse left panel để có thêm không gian */
#gjs.device-tablet ~ #right-panel,
#gjs.device-mobile ~ #right-panel {
    /* Right panel giữ nguyên */
}

/* Left panel collapse khi có class device-tablet/mobile */
#editor-wrapper:has(#gjs.device-tablet) #left-panel,
#editor-wrapper:has(#gjs.device-mobile) #left-panel {
    width: 0;
    padding: 0;
    overflow: hidden;
}
```

### Fix Applied (Session 4):

**File modified**: `/frontend/src/editor/index.html` (after line 799)

**CSS Added**:
```css
/* TABLET/MOBILE MODE RESPONSIVE ADJUSTMENTS */
/* Using :has() selector to detect device mode on #gjs and adjust left-panel */
#editor-wrapper:has(#gjs.device-tablet) #left-panel,
#editor-wrapper:has(#gjs.device-mobile) #left-panel {
    width: 0;
    padding: 0;
    overflow: hidden;
    border-right: none;
}

/* Also collapse left panel content smoothly */
#editor-wrapper:has(#gjs.device-tablet) #left-panel *,
#editor-wrapper:has(#gjs.device-mobile) #left-panel * {
    opacity: 0;
    visibility: hidden;
}

/* Transition for smooth animation */
#left-panel {
    transition: width 0.3s ease, padding 0.3s ease, border 0.3s ease;
}

/* Visual indicator for responsive mode */
#gjs.device-tablet,
#gjs.device-mobile {
    background: #f0f0f0;
}
```

**How it works**:
1. DeviceSwitcher.js adds class `device-tablet` or `device-mobile` to `#gjs`
2. CSS `:has()` selector detects this and collapses `#left-panel`
3. `#canvas-area` (flex: 1) automatically expands to fill the freed space
4. Tablet (768px) or Mobile (375px) frame now has enough room to display fully

**Expected behavior**:
- Desktop mode: left-panel visible (280px), canvas shows full width
- Tablet mode: left-panel collapses (0px), canvas shows 768px centered frame
- Mobile mode: left-panel collapses (0px), canvas shows 375px centered frame

## Session 5 - Fix DeviceSwitcher Bug + Collapse Both Panels

### Vấn đề phát hiện:
1. **Bug trong DeviceSwitcher.js**: Code tìm `#pm-canvas` (line 155) nhưng HTML không có element này - chỉ có `#canvas-area`
2. Có `if (!canvas) return` nên function return ngay và KHÔNG add class vào `#gjs` hay `#editor-wrapper`
3. CSS `:has()` selector không reliable bằng class trực tiếp

### Fixes applied:

#### Fix 1: DeviceSwitcher.js
- Đổi `getElementById('pm-canvas')` → `getElementById('canvas-area')`
- Bỏ `if (!canvas) return` để code tiếp tục chạy
- Thêm logic add class `device-tablet/mobile` vào `#editor-wrapper`

#### Fix 2: CSS in index.html
- Đổi từ `:has()` selector sang class trực tiếp: `#editor-wrapper.device-tablet`
- Thêm collapse cho **cả left panel VÀ right panel** khi tablet/mobile mode

### CSS Changes:
```css
/* Collapse BOTH panels in tablet/mobile mode */
#editor-wrapper.device-tablet #left-panel,
#editor-wrapper.device-mobile #left-panel,
#editor-wrapper.device-tablet #right-panel,
#editor-wrapper.device-mobile #right-panel {
    width: 0 !important;
    min-width: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
}
```

### Expected Result:
- Tablet/Mobile mode: Both panels collapse → Canvas has full width → 768px/375px frame fits perfectly
- Desktop mode: Both panels visible as normal
