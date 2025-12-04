# Ke hoach: Fix Canvas Scrolling va Device Overlap

## 1. Muc tieu (Goal)
1. Load GrapesJS tu folder local (`grapesjs/`) thay vi CDN
2. Fix van de canvas scrolling khong hoat dong
3. Fix van de UI bi xep chong khi chuyen doi giua cac device modes (Desktop/Tablet/Mobile)
4. Clean up code CSS va JS

## 2. Phan tich Van de

### Van de 1: Version GrapesJS
- Hien tai: Load tu CDN `unpkg.com/grapesjs@0.22.14`
- Can: Load tu folder local `grapesjs/packages/core/dist/`

### Van de 2: Canvas Scrolling
- `scrollableCanvas: true` da duoc cau hinh
- Can dam bao frame height = 'auto' de GrapesJS native ResizeObserver hoat dong

### Van de 3: UI Xep Chong khi chuyen Device
- Khi chuyen tu Desktop -> Tablet/Mobile, cac element bi overlap
- Nguyen nhan co the:
  - CSS `.gjs-cv-canvas__frames` position absolute + height 100%
  - CSS `.gjs-frame-wrapper` khong duoc update dung
  - CSS zoom/transform conflict
  - Multiple frames render cung luc

## 3. Cac buoc Thuc hien (Implementation Steps)

* [x] Buoc 1: Build GrapesJS tu source va update pagemade.min.js
  - Build grapesjs/packages/core ✅
  - Copy dist file vao static folder ✅
    - pagemade-core.min.js -> frontend/src/editor/public/
    - pagemade-core.min.css -> frontend/src/editor/styles/
  - Update pagemade.min.js de load tu local ✅
  - Update index.html de load CSS tu local ✅

* [x] Buoc 2: Clean up CSS trong index.html
  - Loai bo CSS zoom approach (lines 825-905)
  - De GrapesJS deviceManager xu ly hoan toan sizing

* [x] Buoc 3: Clean up enableCanvasScrolling() trong main.js
  - Don gian hoa logic - chi giu setFrameAutoHeight()
  - Loai bo manualHeightUpdate() - ResizeObserver tu xu ly
  - Giam tu 115 lines xuong 45 lines

* [x] Buoc 4: Fix DeviceSwitcher.js
  - Loai bo createScaleIndicator(), calculateScaleRatio(), applyCanvasScale(), updateScaleIndicator()
  - Loai bo currentScale tracking
  - Chi giu: setDevice() goi editor.setDevice() + updateCanvasClasses()
  - Giam tu 585 lines xuong 280 lines

* [ ] Buoc 5: Test tren tat ca devices
  - [ ] Test Desktop mode - canvas scroll khi content dai
  - [ ] Test Tablet mode (768px) - khong bi overlap
  - [ ] Test Mobile mode (375px) - khong bi overlap
  - [ ] Test scrolling hoat dong trong tat ca modes

## 4. Cac file bi anh huong (Files to be Touched)
* `frontend/src/editor/public/pagemade.min.js` - Load local GrapesJS
* `frontend/src/editor/index.html` - Clean up CSS
* `frontend/src/editor/scripts/main.js` - Clean up enableCanvasScrolling()
* `frontend/src/editor/scripts/components/DeviceSwitcher.js` - Fix device switching
* `frontend/src/editor/scripts/config/pagemade-config.js` - Add height:'auto' to all devices
* `frontend/src/editor/styles/editor.css` - Additional CSS fixes (if needed)

## 5. Changelog
(Se duoc cap nhat trong qua trinh thuc hien)

### 2024-12-04 - Build GrapesJS tu Local Source
1. Build thanh cong GrapesJS 0.22.13 tu `/home/helios/ver1.1/grapesjs/packages/core/`
2. Copy files:
   - `pagemade.min.js` (1.05MB) -> `frontend/src/editor/public/pagemade-core.min.js`
   - `pagemade.min.css` (60KB) -> `frontend/src/editor/styles/pagemade-core.min.css`
3. Update `pagemade.min.js` loader de load tu local thay vi CDN
4. Update `index.html`:
   - Line 10: CSS load tu `./styles/pagemade-core.min.css`
   - Line 1289-1290: JS load tu `./public/pagemade.min.js`

### 2024-12-04 - Clean up CSS zoom approach (Buoc 2)
1. Loai bo CSS zoom approach trong index.html (lines 825-905)
2. CSS zoom gay ra:
   - Highlighter bi lech vi tri
   - Conflict voi GrapesJS native sizing
   - Firefox khong support
3. Thay bang: De GrapesJS deviceManager xu ly hoan toan

### 2024-12-04 - Simplify enableCanvasScrolling() (Buoc 3)
1. Don gian hoa `enableCanvasScrolling()` trong main.js
2. Loai bo `manualHeightUpdate()` - khong can vi ResizeObserver tu xu ly
3. Chi giu `setFrameAutoHeight()` - dat frame.height = 'auto'
4. Giam tu 115 lines xuong 45 lines

### 2024-12-04 - Simplify DeviceSwitcher.js (Buoc 4)
1. Loai bo cac ham scale/zoom:
   - createScaleIndicator()
   - calculateScaleRatio()
   - applyCanvasScale()
   - updateScaleIndicator()
2. Loai bo currentScale tracking
3. Doi ten updateCanvasSize() -> updateCanvasClasses()
4. DeviceSwitcher chi con:
   - setDevice() goi editor.setDevice()
   - updateCanvasClasses() chi add CSS classes
5. Giam tu 585 lines xuong 280 lines

### 2024-12-04 - Fix Root Cause: Device height override
**Root cause**: Khi switch device, GrapesJS gọi `updateDevice()` trong Canvas.ts:
```typescript
// grapesjs/packages/core/src/canvas/model/Canvas.ts line 63-71
updateDevice(opts) {
  const device = em.getDeviceModel();
  const frame = opts.frame || em.getCurrentFrameModel();
  if (frame && device) {
    const { width, height, minHeight } = device.attributes;
    frame.set({ width, height, minHeight }, { noUndo: 1 });  // ← OVERRIDE frame.height!
  }
}
```

**Giải pháp đã áp dụng**:
1. Thêm `height: 'auto'` vào tất cả devices trong `pagemade-config.js`:
   - Desktop: `height: 'auto'`
   - Tablet: `height: 'auto'`
   - Mobile: `height: 'auto'`
2. Thêm listener `device:select` trong `enableCanvasScrolling()` để re-apply `height='auto'` sau mỗi lần switch device

## 6. Huong dan Test (Buoc 5)

### Truoc khi test:
```bash
# Dam bao Vite dev server dang chay
cd frontend && npm run dev
# Mo browser tai: http://localhost:5001/editor/
```

### Test Cases:

#### Test Case 1: Desktop Mode - Canvas Scrolling
1. Mo editor o Desktop mode (default)
2. Keo tha 10+ blocks vao canvas (VD: Hero, Features, Testimonials, etc.)
3. Xac nhan:
   - [ ] Canvas co the scroll len xuong
   - [ ] Scrollbar hien thi o ben phai canvas
   - [ ] Content khong bi cat

#### Test Case 2: Tablet Mode (768px)
1. Click nut Tablet tren toolbar
2. Xac nhan:
   - [ ] Frame thu hep thanh 768px width
   - [ ] Khong co element bi overlap
   - [ ] Content van hien thi dung
   - [ ] Scrolling van hoat dong

#### Test Case 3: Mobile Mode (375px) 
1. Click nut Mobile tren toolbar
2. Xac nhan:
   - [ ] Frame thu hep thanh 375px width
   - [ ] Khong co element bi overlap
   - [ ] Content van hien thi dung
   - [ ] Scrolling van hoat dong

#### Test Case 4: Device Switching
1. Chuyen nhanh giua cac devices: Desktop -> Tablet -> Mobile -> Desktop
2. Xac nhan:
   - [ ] Transition muot ma (0.3s)
   - [ ] Khong co visual glitch
   - [ ] Highlighter theo dung vi tri element

### Console Commands (Debug):
```javascript
// Kiem tra frame height
pm.Canvas.getFrame()?.get('height')  // Nen tra ve 'auto'

// Kiem tra device hien tai
pm.getDevice()  // Tra ve device name

// Kiem tra DeviceSwitcher state
window.deviceSwitcher?.getState()

// DEBUG FUNCTION - Comprehensive check
window.debugCanvasScrolling()  // Returns full debug info

// Manual check iframe body scrollHeight
document.querySelector('.gjs-frame')?.contentDocument?.body?.scrollHeight
```

## 7. Debug Session Notes

### 2024-12-04 - Debug Function Added
Added `window.debugCanvasScrolling()` function to `main.js` for troubleshooting.

**How to use:**
1. Open browser console (F12)
2. Run: `window.debugCanvasScrolling()`
3. Check output for:
   - `frameHeight`: Should be `'auto'`
   - `hasAutoHeight`: Should be `true`
   - `bodyScrollHeight`: Should be total content height in pixels
   - `frameWrapperHeight`: Should match bodyScrollHeight (e.g., `'2500px'`)
   - `canvasScrollHeight` vs `canvasClientHeight`: If scrollHeight > clientHeight, scroll should work

### Potential Issues to Check:
1. **If `hasAutoHeight` is false**: Device config may be overriding
2. **If `bodyScrollHeight` is small**: Check CSS inside iframe for `html, body { height: 100% }`
3. **If `frameWrapperHeight` doesn't match**: ResizeObserver may not be triggering
4. **If canvas overflow is not 'auto'**: CSS may be overriding GrapesJS inline style

### 2024-12-04 - Added Fallback Mechanism
Added backup ResizeObserver and manual height update functions to `main.js`:

**New Features:**
1. **Backup ResizeObserver**: Creates a secondary observer that watches iframe body
2. **updateFrameWrapperHeight()**: Manually updates frame-wrapper height when needed
3. **component:add/remove/drag:end listeners**: Auto-update height after content changes
4. **window.fixCanvasHeight()**: Manual fix function for debugging

**New Debug Commands:**
```javascript
// Comprehensive debug
window.debugCanvasScrolling()

// Manual fix if scrolling not working
window.fixCanvasHeight()
```

**Changes to `enableCanvasScrolling()`:**
- Added `backupResizeObserver` variable to track backup observer
- Added `updateFrameWrapperHeight()` function for manual height updates
- Added `setupBackupResizeObserver()` to create fallback observer
- Added listeners for `component:add`, `component:remove`, `component:drag:end`
- Added `window.fixCanvasHeight()` for manual intervention

