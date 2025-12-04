# Kế hoạch: Fix Canvas Scrollbar Not Visible (Lần 2)

## 1. Mục tiêu (Goal)
Sửa lỗi scrollbar không hiển thị hoặc hiển thị không ổn định trên canvas editor khi kéo components vào trang.

## 2. Phân tích Vấn đề (Lần 2)
- `scrollableCanvas: true` đã enable trong config - OK
- **VẤN ĐỀ CHÍNH**: GrapesJS scrolling xảy ra BÊN TRONG iframe (`.gjs-frame`), không phải trên `.gjs-cv-canvas`
- CSS hiện tại đang đặt `overflow: auto` trên `.gjs-cv-canvas` - SAI vị trí
- `.gjs-cv-canvas__frames` có `display: flex` với `align-items: flex-start` có thể gây conflict
- Cần loại bỏ các CSS không cần thiết và để GrapesJS xử lý scrolling tự nhiên

## 3. Các bước Thực hiện (Implementation Steps)
* [x] Loại bỏ `overflow: auto` trên `.gjs-cv-canvas` (không cần thiết) - Đã đổi thành `overflow: hidden`
* [x] Loại bỏ scrollbar styles cho `.gjs-cv-canvas` (scroll nằm trong iframe)
* [x] Fix `.gjs-cv-canvas__frames` - bỏ flex align/justify, dùng position absolute để fill canvas
* [x] Đảm bảo `.gjs-frame-wrapper` và `.gjs-frame` có sizing đúng (100% width/height với !important)
* [x] Revert `customStyles` property trong `pagemade-config.js` (không phải GrapesJS option hợp lệ)
* [x] Verify scrollbar injection via `injectCanvasScrollbarStyles()` trong main.js

## 4. Các file bị ảnh hưởng
* `frontend/src/editor/index.html` - Sửa CSS cho canvas

## 5. Giải pháp Kỹ thuật

### Hiểu cách GrapesJS Canvas hoạt động:
```
#gjs (container)
  └── .gjs-cv-canvas (canvas wrapper)
        └── .gjs-cv-canvas__frames (frames container)
              └── .gjs-frame-wrapper (wrapper for each frame)
                    └── .gjs-frame (IFRAME - Scrolling happens HERE)
```

### CSS Changes:
1. `.gjs-cv-canvas` - Chỉ cần position và sizing, KHÔNG overflow
2. `.gjs-cv-canvas__frames` - position absolute, KHÔNG flex layout
3. `.gjs-frame-wrapper` và `.gjs-frame` - 100% width/height
4. Scrollbar styling cần target iframe content (qua canvas.styles in config)

## 6. Thay đổi trước đó (Lần 1 - Cần rollback một phần)
- ❌ `overflow: auto` trên `.gjs-cv-canvas` - Không đúng vị trí
- ❌ Scrollbar styles cho `.gjs-cv-canvas` - Không áp dụng được
- ✅ `min-height: 100%` cho `.gjs-cv-canvas__frames` - Có thể giữ

## 7. Hoàn thành - 2025-12-03 (Updated)

### Phân tích Sâu về scrollableCanvas: true

Sau khi đọc source code GrapesJS (`CanvasView.ts` và `FrameWrapView.ts`), hiểu rõ cơ chế:

1. **CanvasView.ts (line 699-701)**: Khi `scrollableCanvas: true`, GrapesJS set `overflow: auto` trên `.gjs-cv-canvas` qua inline style
2. **FrameWrapView.ts (line 167-186)**: Khi `hasAutoHeight()` là true, GrapesJS dùng `ResizeObserver` để theo dõi `contentDocument.body.scrollHeight` và set height của `.gjs-frame-wrapper` động

**VẤN ĐỀ GỐC**: CSS của chúng ta có các override sau gây block scrolling:
- `.gjs-frame-wrapper { height: 100% !important }` - override height động của GrapesJS
- `.gjs-frame { height: 100% !important }` - constrain iframe height  
- `.gjs-cv-canvas__frames { position: absolute; width: 100%; height: 100% }` - constrain frames container

### Các thay đổi đã thực hiện (Lần 2):

**File: `frontend/src/editor/index.html`**

1. `.gjs-cv-canvas`:
   - Removed `overflow: hidden !important` (GrapesJS sets `overflow: auto` inline)
   - Keep only positioning/sizing rules

2. `.gjs-cv-canvas__frames`:
   - Changed from `position: absolute; width: 100%; height: 100%` 
   - To `min-width: 100%; min-height: 100%` (allow content to grow)
   - Keep `overflow: visible !important`

3. `.gjs-frame-wrapper`:
   - Removed `height: 100% !important` (let GrapesJS control dynamically)
   - Keep only transition for smooth animations

4. `.gjs-frame`:
   - Changed from `height: 100% !important` to `min-height: 100%`
   - Keep `width: 100% !important`

**File: `frontend/src/editor/scripts/config/pagemade-config.js`**
- Removed invalid `customStyles` property (not a valid GrapesJS option)

### Key Understanding (Corrected):
1. With `scrollableCanvas: true`, scrolling happens on `.gjs-cv-canvas` element (NOT inside iframe)
2. GrapesJS dynamically sets `.gjs-frame-wrapper` height based on iframe content
3. If we force `height: 100% !important` on frame-wrapper, content can never overflow canvas
4. The frames container needs `min-height` not `height` to allow growth

### Cơ chế Scrolling với scrollableCanvas:
```
.gjs-cv-canvas (overflow: auto - set by GrapesJS inline)
  └── .gjs-cv-canvas__frames (min-height: 100%, grows with content)
        └── .gjs-frame-wrapper (height set dynamically by GrapesJS via ResizeObserver)
              └── .gjs-frame (iframe)
                    └── contentDocument.body (actual content)

When content is taller than canvas:
1. ResizeObserver detects contentDocument.body.scrollHeight > canvas height
2. GrapesJS sets .gjs-frame-wrapper height to match content
3. .gjs-cv-canvas__frames grows to contain frame-wrapper
4. .gjs-cv-canvas (with overflow: auto) shows scrollbar
```

## 8. Phiên 2 - 2025-12-03

### Phát hiện mới: infiniteCanvas là bắt buộc!

Sau khi đọc kỹ source code GrapesJS:

**FrameWrapView.ts (line 167-186)**:
```javascript
if (model.hasAutoHeight()) {
  const iframe = this.frame.el;
  const { contentDocument } = iframe;
  if (contentDocument) {
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        const minHeight = parseFloat(model.get('minHeight')) || 0;
        const heightResult = Math.max(contentDocument.body.scrollHeight, minHeight);
        style.height = `${heightResult}px`;
      });
    });
    observer.observe(contentDocument.body);
    this.sizeObserver = observer;
  }
} else {
  style.height = newHeight;  // Fixed height, no resize
}
```

**Frame.ts (line 242-250)**:
```javascript
hasAutoHeight() {
  const { height } = this.attributes;
  if (height === 'auto' || this.config.infiniteCanvas) {
    return true;
  }
  return false;
}
```

### Vấn đề chính
- `scrollableCanvas: true` chỉ set `overflow: auto` trên `.gjs-cv-canvas`
- Nhưng nếu `hasAutoHeight()` trả về `false`, frame-wrapper có height cố định
- Để `hasAutoHeight()` trả về `true`, cần `infiniteCanvas: true` trong canvas config

### Thay đổi đã thực hiện (Phiên 2)

**File: `frontend/src/editor/scripts/config/pagemade-config.js`**
```javascript
canvas: {
    scrollableCanvas: true,
    infiniteCanvas: true,  // <-- THÊM MỚI - Bắt buộc để enable ResizeObserver
    styles: [...],
    scripts: [],
}
```

### Tóm tắt Config cần thiết cho Canvas Scrolling:
1. `scrollableCanvas: true` - Set overflow: auto trên .gjs-cv-canvas
2. `infiniteCanvas: true` - Enable hasAutoHeight() → ResizeObserver → dynamic height

### Trạng thái: Chờ test

## 9. Phiên 3 - 2025-12-03 (Tiếp tục)

### Phát hiện: Phiên bản GrapesJS cũ không có scrollableCanvas/infiniteCanvas!

**Vấn đề chính**: 
- `pagemade.min.js` đang load GrapesJS **0.20.3** từ CDN
- Các option `scrollableCanvas` và `infiniteCanvas` chỉ có từ phiên bản **0.22.x+**
- GrapesJS local trong thư mục `grapesjs/` là phiên bản **0.22.13**

### Thay đổi đã thực hiện (Phiên 3)

**File: `frontend/js/pagemade.min.js`**
- Cập nhật CDN URL từ `grapesjs@0.20.3` → `grapesjs@0.22.14`

**File: `frontend/src/editor/index.html`**
- Cập nhật CSS CDN từ `grapesjs@0.20.3` → `grapesjs@0.22.14`

### Tóm tắt tất cả thay đổi cho Canvas Scrolling:

| File | Thay đổi |
|------|----------|
| `pagemade-config.js` | Thêm `scrollableCanvas: true`, `infiniteCanvas: true` |
| `pagemade.min.js` | Cập nhật GrapesJS 0.20.3 → 0.22.14 |
| `index.html` (CSS) | Cập nhật grapes.min.css 0.20.3 → 0.22.14 |
| `index.html` (CSS rules) | Sửa `.gjs-cv-canvas__frames { height: auto !important }` |

### Trạng thái: Chờ test lần 2

## 10. Phiên 4 - 2025-12-03 (Giải pháp Cuối cùng)

### Phát hiện QUAN TRỌNG: infiniteCanvas blocks wheel scrolling!

Sau khi đọc source code GrapesJS (`CanvasView.ts` lines 209-212):

```javascript
onWheel(ev: WheelEvent) {
  if (config.infiniteCanvas) {
    this.preventDefault(ev);  // BLOCKS normal scrolling!
  }
}
```

**Vấn đề**: `infiniteCanvas: true` chặn wheel scrolling vì nó call `preventDefault()` trên wheel events.

### Giải pháp: Dùng frame.set('height', 'auto') thay vì infiniteCanvas

Cả hai cách đều làm `hasAutoHeight()` return `true`, nhưng chỉ `infiniteCanvas` blocks wheel events:

| Approach | hasAutoHeight() | Wheel Scrolling |
|----------|-----------------|-----------------|
| `infiniteCanvas: true` | ✅ true | ❌ Blocked |
| `frame.set('height', 'auto')` | ✅ true | ✅ Works |

### Các thay đổi đã thực hiện (Phiên 4)

**1. File: `frontend/src/editor/scripts/config/pagemade-config.js`**
- Removed `infiniteCanvas: true` từ canvas config
- Giữ `scrollableCanvas: true`

**2. File: `frontend/src/editor/scripts/main.js`**
- Thêm call `this.enableCanvasScrolling();` trong `setupOlderSystemFeatures()`
- Thêm method `enableCanvasScrolling()` implementation:

```javascript
enableCanvasScrolling() {
    if (!this.pm) return;
    
    const enableForCurrentPage = () => {
        const pages = this.pm.Pages;
        const currentPage = pages.getSelected();
        if (currentPage) {
            const mainFrame = currentPage.getMainFrame();
            if (mainFrame) {
                mainFrame.set('height', 'auto');
                console.log('✅ Canvas scrolling enabled: frame height set to auto');
            }
        }
    };
    
    // Enable after canvas ready
    setTimeout(enableForCurrentPage, 500);
    
    // Re-enable when page/frame changes
    this.pm.on('page:select', () => setTimeout(enableForCurrentPage, 100));
    this.pm.on('canvas:frame:load', () => setTimeout(enableForCurrentPage, 100));
}
```

### Tóm tắt Config cuối cùng cho Canvas Scrolling:

| Component | Setting | Purpose |
|-----------|---------|---------|
| `pagemade-config.js` | `scrollableCanvas: true` | Set `overflow: auto` on `.gjs-cv-canvas` |
| `main.js` | `frame.set('height', 'auto')` | Enable `hasAutoHeight()` → ResizeObserver → dynamic height |
| CSS | Remove `height: 100% !important` overrides | Allow GrapesJS to control frame-wrapper height |

### Trạng thái: ✅ HOÀN THÀNH - Implementation complete, ready for testing

## 11. Phiên 5 - 2025-12-03 (Cải thiện Implementation)

### Vấn đề phát hiện trong implementation cũ:

1. **Memory Leak**: `resizeObserver` được khai báo trong closure và không được cleanup khi page/frame thay đổi
2. **Race Condition**: `iframeBody` reference có thể stale khi page thay đổi
3. **Missing iframe sync**: Chỉ set `frameWrapperEl.style.height`, quên set `frameEl.style.height`
4. **No debounce**: ResizeObserver có thể fire quá nhiều lần

### Các cải thiện đã thực hiện:

**File: `frontend/src/editor/scripts/main.js`** - Method `enableCanvasScrolling()`

1. **Class-level observer storage**: 
   - Đổi từ `let resizeObserver = null` thành `this._canvasResizeObserver`
   - Cho phép cleanup đúng cách khi re-setup

2. **Debounce mechanism**:
   - Thêm debounce helper với delay 50ms
   - Tránh update quá nhiều lần khi content thay đổi

3. **Stale reference check**:
   - Trong callback, re-check `frameEl.contentDocument.body` còn valid không
   - Tránh error khi page đã thay đổi

4. **Sync iframe height**:
   - Set cả `frameWrapperEl.style.height` VÀ `frameEl.style.height`
   - Đảm bảo iframe fill wrapper đúng

5. **Initial update trigger**:
   - Gọi `updateHeight()` ngay sau khi setup observer
   - Đảm bảo height được set ngay lần đầu

### Tóm tắt thay đổi:

```javascript
// OLD - Memory leak issue
let resizeObserver = null;

// NEW - Class-level for proper cleanup  
if (this._canvasResizeObserver) {
    this._canvasResizeObserver.disconnect();
}

// NEW - Debounce to prevent excessive updates
const updateHeight = debounce(() => {
    // Re-check validity
    if (!frameEl.contentDocument || !frameEl.contentDocument.body) return;
    
    // Sync BOTH wrapper and iframe
    frameWrapperEl.style.height = newHeight;
    frameEl.style.height = newHeight;
}, 50);
```

### Trạng thái: ✅ Đã cải thiện, cần test lại

## 12. Phiên 6 - 2025-12-03 (Fix CSS Conflict)

### Phát hiện: Conflicting CSS rules cho #canvas-container

Sau khi phân tích kỹ:

**File: `editor.css` line 26**:
```css
#canvas-container {
    overflow: hidden;
}
```

**File: `panels.css` line 448**:
```css
#canvas-container {
    overflow: auto;
}
```

Vì `panels.css` load sau `editor.css`, rule `overflow: auto` sẽ được áp dụng. Tuy nhiên, đây là một conflict tiềm ẩn cần được giải quyết.

### Phân tích:
- `#canvas-container` là container chứa GrapesJS canvas (`#pm-canvas`)
- Với `scrollableCanvas: true`, scrolling xảy ra trên `.gjs-cv-canvas` (bên trong `#pm-canvas`)
- `#canvas-container` chỉ cần `overflow: hidden` để không tạo thêm scrollbar
- Rule trong `panels.css` là SAI và cần được loại bỏ

### Các bước thực hiện:
* [x] Loại bỏ rule `overflow: auto` cho `#canvas-container` trong `panels.css`
* [x] Giữ rule `overflow: hidden` trong `editor.css`
* [x] Verify không còn conflict

### Kết quả:
Đã xác nhận chỉ còn 1 nơi định nghĩa overflow cho `#canvas-container`:
- `editor.css` line 26: `overflow: hidden` ✅
- `panels.css` line 446-451: Không còn override overflow ✅

### Trạng thái: ✅ HOÀN THÀNH - CSS conflict đã được giải quyết
