# Kế hoạch: Fix Canvas Scroll Not Working

## 1. Mục tiêu (Goal)
Sửa lỗi không thể cuộn (scroll) xuống để xem toàn bộ nội dung trong canvas editor khi kéo các blocks vào trang.

## 2. Phân tích Vấn đề

### Hiện trạng:
- `scrollableCanvas: true` đã được cấu hình trong `pagemade-config.js`
- `enableCanvasScrolling()` method đã có trong `main.js` sử dụng `ResizeObserver`
- CSS có `.gjs-cv-canvas__frames { height: auto !important; min-height: 100%; }` trong `index.html`

### Vấn đề tiềm ẩn:
1. **ResizeObserver có thể không trigger đúng** - Observer chỉ observe `iframeBody`, nhưng content height thay đổi có thể không được detect
2. **CSS conflict** - `.gjs-frame-wrapper` và `.gjs-frame` có thể bị CSS override
3. **Timing issue** - `enableCanvasScrolling()` có thể chạy trước khi iframe fully loaded
4. **GrapesJS inline styles** - GrapesJS có thể set inline styles override CSS rules

### Cơ chế scrollableCanvas hoạt động:
```
.gjs-cv-canvas (overflow: auto - set by GrapesJS inline khi scrollableCanvas: true)
  └── .gjs-cv-canvas__frames (phải có height: auto để grow)
        └── .gjs-frame-wrapper (height phải được set động based on iframe content)
              └── .gjs-frame (iframe - chứa nội dung thực)
```

## 3. Các bước Thực hiện (Implementation Steps)

* [x] Bước 1: Kiểm tra và cải thiện `enableCanvasScrolling()` method trong main.js
  - Đảm bảo ResizeObserver observe đúng element
  - Thêm MutationObserver để detect DOM changes trong iframe
  - Cải thiện logic updateHeight để force refresh
  - **DONE**: Đã thêm MutationObserver, GrapesJS component events, và immediate update function

* [x] Bước 2: Fix CSS conflicts trong index.html
  - Đảm bảo `.gjs-cv-canvas` không bị override overflow
  - Loại bỏ các !important không cần thiết
  - Đảm bảo `.gjs-frame-wrapper` không bị constrain height
  - **DONE**: Đã remove `overflow: hidden` từ `#gjs` container

* [x] Bước 3: Thêm event listeners cho component:add/remove
  - Trigger height recalculation khi user thêm/xóa components
  - **DONE**: Đã thêm trong enableCanvasScrolling() nhưng vẫn chưa hoạt động

* [x] Bước 4: **NEW APPROACH** - Set frame height = 'auto' để enable GrapesJS native ResizeObserver
  - Cập nhật enableCanvasScrolling() để set frame model height = 'auto'
  - Điều này trigger hasAutoHeight() → true → GrapesJS tự động tạo ResizeObserver
  - **DONE**: Đã rewrite hoàn toàn method, bỏ custom observers, chỉ dùng frame.set('height', 'auto')

* [x] Bước 5: **FIX VERSION MISMATCH** - Upgrade GrapesJS từ 0.20.3 lên 0.22.14
  - File: `frontend/src/editor/public/pagemade.min.js`
  - Đã thay đổi line 10: `grapesjs@0.20.3` → `grapesjs@0.22.14`
  - Version 0.22.6+ có tính năng `scrollableCanvas` với `hasAutoHeight()` và native ResizeObserver
  - **DONE**: 2024-12-04

* [ ] Bước 6: Test và verify scrolling hoạt động
  - User cần refresh browser (Ctrl+Shift+R để clear cache) và test bằng cách kéo nhiều blocks vào canvas
  - Kiểm tra scrollbar xuất hiện khi content vượt quá viewport height

## 4. Các file bị ảnh hưởng (Files to be Touched)
* `frontend/src/editor/scripts/main.js` - Cải thiện enableCanvasScrolling()
* `frontend/src/editor/index.html` - Fix CSS conflicts

## 5. Ghi chú kỹ thuật
- Khi `scrollableCanvas: true`, GrapesJS set `overflow: auto` trên `.gjs-cv-canvas` via inline style
- Frame wrapper height cần được điều chỉnh động dựa trên `iframe.contentDocument.body.scrollHeight`
- MutationObserver có thể cần thiết để detect DOM changes bên trong iframe

## 6. Changelog

### 2024-12-04: Implemented fixes
1. **main.js - enableCanvasScrolling()**:
   - Added MutationObserver to detect DOM changes in iframe
   - Added GrapesJS component events (component:add/remove/update/styleUpdate, undo, redo)
   - Fixed event handler cleanup by storing at class level
   - Split updateHeight into immediate and debounced versions

2. **index.html - CSS**:
   - Removed `overflow: hidden` from `#gjs` container to allow canvas scrolling

### 2024-12-04: ROOT CAUSE ANALYSIS (GrapesJS Source Code)

**Phát hiện nguyên nhân gốc:**

1. **Frame.ts (lines 242-250) - `hasAutoHeight()` method:**
```typescript
hasAutoHeight() {
  const { height } = this.attributes;
  if (height === 'auto' || this.config.infiniteCanvas) {
    return true;
  }
  return false;
}
```

2. **FrameWrapView.ts (lines 167-186) - ResizeObserver chỉ được tạo khi `hasAutoHeight() === true`:**
```typescript
if (model.hasAutoHeight()) {
  const iframe = this.frame.el;
  const { contentDocument } = iframe;
  if (contentDocument) {
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        const minHeight = parseFloat(model.get('minHeight')) || 0;
        const heightResult = Math.max(contentDocument.body.scrollHeight, minHeight);
        style.height = `${heightResult}px`;  // ← This sets frame-wrapper height!
      });
    });
    observer.observe(contentDocument.body);
    this.sizeObserver = observer;
  }
}
```

**Kết luận:** 
- Hiện tại `hasAutoHeight()` return `false` vì frame height không được set thành `'auto'`
- Điều này khiến GrapesJS KHÔNG tự động điều chỉnh frame-wrapper height
- Frame-wrapper có height cố định → content bị cắt → không thể scroll

**Giải pháp:**
- Set frame `height = 'auto'` sau khi editor load để trigger GrapesJS native ResizeObserver
- KHÔNG dùng `infiniteCanvas: true` vì nó block wheel scrolling events (preventDefault in onWheel)

### 2024-12-04: IMPLEMENTED FIX - Set frame height = 'auto'

**Thay đổi trong main.js - enableCanvasScrolling():**

Đã viết lại hoàn toàn method này với approach đơn giản hơn:

```javascript
enableCanvasScrolling() {
    const frame = this.pm.Canvas.getFrame();
    if (frame && frame.get('height') !== 'auto') {
        frame.set('height', 'auto', { noUndo: true });
    }
}
```

**Cách hoạt động:**
1. `frame.set('height', 'auto')` → Frame model có `attributes.height = 'auto'`
2. `hasAutoHeight()` return `true` (vì `height === 'auto'`)
3. `FrameWrapView.__handleSize()` tạo `ResizeObserver` observe `contentDocument.body`
4. ResizeObserver tự động set `frame-wrapper.style.height = scrollHeight`
5. Canvas có thể scroll vì `.gjs-cv-canvas` có `overflow: auto` (từ `scrollableCanvas: true`)

**Ưu điểm:**
- Sử dụng native GrapesJS mechanism, không cần custom observers
- Code đơn giản, dễ maintain
- Không conflict với GrapesJS internal logic

### 2024-12-04: FIX VERSION MISMATCH - ROOT CAUSE

**Vấn đề thực sự:**
- CSS load từ: `grapesjs@0.22.14` (index.html)
- JS load từ: `grapesjs@0.20.3` (pagemade.min.js) 

Tính năng `scrollableCanvas`, `hasAutoHeight()` và native ResizeObserver trong FrameWrapView chỉ có từ **GrapesJS v0.22.6** (release 17 Mar 2025). Version 0.20.3 **KHÔNG HỖ TRỢ** các tính năng này!

**Fix đã thực hiện:**
- File: `frontend/src/editor/public/pagemade.min.js`
- Thay đổi line 10: 
  - Từ: `https://unpkg.com/grapesjs@0.20.3/dist/grapes.min.js`
  - Thành: `https://unpkg.com/grapesjs@0.22.14/dist/grapes.min.js`

**Kết quả mong đợi:**
Sau khi upgrade, GrapesJS 0.22.14 sẽ có:
1. `scrollableCanvas: true` config option hoạt động đúng
2. `Frame.hasAutoHeight()` method 
3. Native ResizeObserver trong FrameWrapView tự động điều chỉnh frame-wrapper height
4. Canvas sẽ scroll được khi content vượt viewport
