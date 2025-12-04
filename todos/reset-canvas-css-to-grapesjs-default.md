# Kế hoạch: Reset Canvas CSS về GrapesJS Default

## 1. Mục tiêu (Goal)
Reset canvas CSS về logic gốc của GrapesJS, loại bỏ các CSS override custom đã gây ra vấn đề hiển thị.

## 2. Phân tích CSS Gốc GrapesJS

Từ file `grapesjs/packages/core/src/styles/scss/_gjs_canvas.scss`:

### .gjs-cv-canvas (line 199-218)
```scss
.gjs-cv-canvas {
  box-sizing: border-box;
  width: calc(100% - var(--gjs-left-width));
  height: calc(100% - var(--gjs-canvas-top));
  bottom: 0;
  overflow: hidden;
  z-index: 1;
  position: absolute;
  left: 0;
  top: var(--gjs-canvas-top);

  // UI mode override
  &.gjs-cui {
    width: 100%;
    height: 100%;
    top: 0;
  }
}
```

### .gjs-cv-canvas__frames (line 227-233)
```scss
.gjs-cv-canvas__frames {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

### .gjs-frame (line 300-315)
```scss
.gjs-frame {
  outline: medium none;
  height: 100%;
  width: 100%;
  border: none;
  margin: auto;
  display: block;
  transition: width 0.35s ease, height 0.35s ease;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
```

### .gjs-frame-wrapper (line 114-126)
```scss
.gjs-frame-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  right: 0;
  margin: auto;

  &--anim {
    transition: width 0.35s ease, height 0.35s ease;
  }
}
```

## 3. CSS Override Hiện tại (cần loại bỏ)

Trong `frontend/src/editor/index.html` line 760-786:
```css
/* CANVAS STYLING - MATCHING OLD WORKING VERSION */

.gjs-cv-canvas {
    width: 100% !important;
    height: 100% !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
}

.gjs-cv-canvas__frames {
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
}

.gjs-frame {
    width: 100% !important;
    height: 100% !important;
}
```

## 4. Các bước Thực hiện (Implementation Steps)

### Phase 1: Xóa CSS Override
* [ ] Comment/xóa CSS override cho `.gjs-cv-canvas` trong `index.html`
* [ ] Comment/xóa CSS override cho `.gjs-cv-canvas__frames` trong `index.html`
* [ ] Comment/xóa CSS override cho `.gjs-frame` trong `index.html`

### Phase 2: Kiểm tra CSS Variables
* [ ] Kiểm tra `--gjs-left-width` được set đúng
* [ ] Kiểm tra `--gjs-canvas-top` được set đúng
* [ ] Đảm bảo các CSS variables cần thiết có trong `:root`

### Phase 3: Kiểm tra FrameWrapView
* [ ] Xác nhận không có MutationObserver custom nào đang interfere
* [ ] Kiểm tra `FrameWrapView.ts` có modification nào cần revert không

### Phase 4: Testing
* [ ] Test canvas hiển thị đúng với empty page
* [ ] Test device switching (Desktop/Tablet/Mobile)
* [ ] Test scroll nếu content dài
* [ ] Test drag & drop blocks

## 5. Các file bị ảnh hưởng (Files to be Touched)
* `frontend/src/editor/index.html` - Xóa CSS override (line 760-786)
* `grapesjs/packages/core/src/canvas/view/FrameWrapView.ts` - Kiểm tra/revert nếu cần

## 6. Rollback Plan
Nếu reset gây ra vấn đề mới:
1. Uncomment lại CSS override đã xóa
2. Hoặc thêm lại từng rule một để xác định rule nào cần thiết

## 7. Expected Result
- Canvas sử dụng CSS gốc của GrapesJS
- Không có `!important` override không cần thiết
- CSS variables (`--gjs-left-width`, `--gjs-canvas-top`) điều khiển layout
- Canvas responsive theo device modes
