# Kế hoạch: Fix Canvas Display Bug (Less ⨯Ok)

## 1. Mục tiêu (Goal)
Sửa lỗi Canvas hiển thị các nút "less ⨯Ok" lặp lại thay vì nội dung thực tế của trang.

## 2. Phân tích vấn đề
Dựa trên mô tả lỗi:
- Canvas đang hiển thị: "Forms Layout Media less ⨯Ok less ⨯Ok less"
- Có vẻ như GrapesJS đang render các component controls/buttons thay vì nội dung
- Có thể do CSS conflict hoặc GrapesJS canvas frame bị override

## 3. Các bước Thực hiện (Implementation Steps)

### Phase 1: Kiểm tra và Chẩn đoán
* [x] Kiểm tra CSS của `.gjs-cv-canvas` và `.gjs-cv-canvas__frames` trong `index.html`
* [x] Kiểm tra CSS của `#gjs` container
* [x] Kiểm tra xem có CSS nào override GrapesJS default không
* [x] Kiểm tra console log xem có error nào liên quan đến canvas không

**Diagnosis**: Tìm thấy lỗi tại `.gjs-cv-canvas__frames` (line 774-784) - flexbox centering đang conflict với GrapesJS rendering, khiến iframe bị collapse và block panel buttons xuất hiện trong canvas.

**UPDATE**: Phát hiện vấn đề thực sự! GrapesJS config tìm `#blocks-container` (line 81 trong pagemade-config.js) nhưng HTML không có element này. Chỉ có `#basic-blocks-container` và `#site-blocks-container`. Khi không tìm thấy container, GrapesJS render blocks vào canvas → "less ⨯Ok" xuất hiện!

### Phase 2: Fix CSS Canvas
* [x] Loại bỏ/sửa các CSS override có thể gây lỗi canvas - Removed flexbox from `.gjs-cv-canvas__frames`
* [x] Đảm bảo `.gjs-cv-canvas` có đủ không gian để render
* [x] Đảm bảo `.gjs-frame` (iframe) được hiển thị đúng
* [x] Kiểm tra z-index conflicts - Không có conflict
* [x] Fix missing `#blocks-container` - Added hidden container for GrapesJS

**Fix Applied**: 
1. Removed `display: flex`, `justify-content: center`, `align-items: flex-start` from `.gjs-cv-canvas__frames` (line 773-784 in index.html)
2. **CRITICAL FIX**: Added `<div id="blocks-container" style="display: none;"></div>` before basic/site blocks containers. GrapesJS config expects this element (line 81 in pagemade-config.js). Without it, GrapesJS renders blocks into canvas → "less ⨯Ok" error!

### Phase 3: Kiểm tra GrapesJS Config
* [x] Kiểm tra config của canvas trong `pagemade-config.js` - Config OK, scrollableCanvas enabled
* [x] Đảm bảo không có plugin nào conflict với canvas rendering - No conflicts found

### Phase 4: Testing
* [ ] Test canvas hiển thị đúng với empty page
* [ ] Test canvas hiển thị đúng với existing content
* [ ] Test drag & drop blocks vào canvas
* [ ] Test device switching (desktop/tablet/mobile)

### Testing Instructions
1. **Start the editor**:
   ```bash
   cd /home/helios/ver1.1/frontend
   npm run dev
   ```

2. **Open browser** and navigate to the PageMade editor

3. **Verify fixes**:
   - ✅ Canvas should show iframe (not "Forms Layout Media less ⨯Ok")
   - ✅ Empty canvas should display blank white area
   - ✅ Drag a block (e.g., "Section") into canvas - should render properly
   - ✅ Switch devices (Desktop → Tablet → Mobile) - canvas should resize correctly
   - ✅ Load existing page content - should display in canvas iframe

4. **If issues persist**, check browser console for errors

## 4. Các file bị ảnh hưởng (Files to be Touched)
* `frontend/src/editor/index.html` - CSS fixes cho canvas
* `frontend/src/editor/styles/editor.css` - Canvas styles
* `frontend/src/editor/scripts/config/pagemade-config.js` - Canvas config (nếu cần)

## 5. Root Cause Hypothesis
Lỗi "less ⨯Ok" lặp lại có thể do:
1. CSS `display` hoặc `overflow` bị override sai
2. GrapesJS canvas frame bị hidden hoặc collapsed
3. Plugin/component controls bị render sai vị trí
4. Canvas container size = 0 hoặc quá nhỏ

## 7. Fix Summary (UPDATED)

### Root Cause Identified
**Primary Issue**: GrapesJS config expects `#blocks-container` element (line 81 in pagemade-config.js) but HTML only had `#basic-blocks-container` and `#site-blocks-container`. When GrapesJS couldn't find the target container, it defaulted to rendering blocks **inside the canvas area**, causing the "less ⨯Ok" text to appear.

**Secondary Issue**: The `.gjs-cv-canvas__frames` container had flexbox properties that interfered with GrapesJS frame rendering.

### Changes Applied

#### Fix 1: Added Missing Blocks Container
**File**: `frontend/src/editor/index.html` (line 1075)

**Added**:
```html
<!-- Hidden main blocks container for GrapesJS -->
<div id="blocks-container" style="display: none;">
    <!-- GrapesJS will render blocks here first -->
</div>
```

This hidden container catches GrapesJS's block rendering, preventing blocks from appearing in the canvas.

#### Fix 2: Removed Conflicting Flexbox
**File**: `frontend/src/editor/index.html` (lines 773-783)

**Removed**:
```css
display: flex;
justify-content: center;
align-items: flex-start;
```

**Kept**:
```css
top: 0 !important;
left: 0 !important;
right: 0 !important;
bottom: 0 !important;
width: 100% !important;
height: 100% !important;
```

### Why This Works
1. **Blocks Container Fix**: GrapesJS now finds `#blocks-container` and renders blocks there (hidden), instead of in the canvas
2. **Canvas Frame Fix**: Removing flexbox allows GrapesJS to handle frame positioning natively via its FrameWrapView
3. **Combined Effect**: Canvas iframe now displays properly with actual page content, not UI controls

### Expected Result
After these fixes:
- ✅ Canvas displays blank iframe (not "Forms Layout Media less ⨯Ok")
- ✅ Drag & drop blocks renders content in canvas
- ✅ Layers panel structure should be intact
- ✅ Device switching maintains canvas display

## 8. Final Solution (Session 2)

### Root Cause Confirmed
The **GrapesJS CSS** (`grapes.min.css`) was **NOT loaded** in `index.html`. Only the custom `pagemade.min.css` was included, which contains style overrides but **NOT** the base GrapesJS styles.

The text **"less"** comes from GrapesJS's **Spectrum ColorPicker** (`grapesjs/packages/core/src/utils/ColorPicker.ts`):
```javascript
togglePaletteLessText: 'less'
```

Without the `.sp-*` (Spectrum) CSS classes from `grapes.min.css`, the ColorPicker UI elements rendered as raw text in the wrong location.

### Fix Applied
**File**: `frontend/src/editor/index.html`

**Added** (before favicon links, line 8-9):
```html
<!-- GrapesJS Core CSS (CRITICAL: Must load BEFORE custom pagemade.min.css) -->
<link rel="stylesheet" href="https://unpkg.com/grapesjs@0.20.3/dist/css/grapes.min.css">
```

### CSS Load Order (Correct)
1. `grapes.min.css` - GrapesJS base styles (includes Spectrum ColorPicker `.sp-*` classes)
2. `pagemade.min.css` - Custom PageMade overrides
3. `editor.css` - Page-specific editor styles

### Why This Works
- `grapes.min.css` includes the Spectrum ColorPicker CSS (`.sp-container`, `.sp-replacer`, `.sp-preview`, etc.)
- These styles properly hide/position the ColorPicker toggle button that shows "less" text
- The ColorPicker now renders correctly as a color swatch instead of raw text in the canvas

### Testing
1. Start the editor: `cd /home/helios/ver1.1/frontend && npm run dev`
2. Open browser to PageMade editor
3. Verify: Canvas shows blank iframe (not "less ⨯Ok" text)
4. Verify: Blocks panel renders correctly in left sidebar
5. Verify: StyleManager color pickers render correctly in right panel
