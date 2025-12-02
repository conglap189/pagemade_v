# Kế hoạch: Fix Right Panel Close Button, Blocks Drag & Drop, và Layers

## 1. Mục tiêu (Goal)
Fix 3 vấn đề trong PageMade Editor:
1. **Right Panel Close Button (X)**: Không hoạt động khi click
2. **Blocks Drag & Drop**: Blocks không hiển thị trong canvas khi kéo thả
3. **Layers Panel**: Cấu trúc bị lỗi

## 2. Phân tích Vấn đề

### 2.1 Right Panel Close Button (X)
- **Vị trí**: `index.html` line 1137-1139 - có button `.right-panel-close` với id `right-panel-close`
- **Vấn đề**: Không có event listener cho nút X
- **CSS**: `.right-panel-close` và `#right-panel.hidden` đã có styles

### 2.2 Blocks Drag & Drop vào Canvas
- **Vị trí**: `main.js` function `createBlockElement()` lines 1307-1352
- **Vấn đề**: 
  - Chỉ có `dragstart` event và `click` event
  - Không có proper drag data transfer cho GrapesJS
  - GrapesJS cần block content được pass đúng cách qua drag event
- **Root cause**: Custom block rendering không integrate đúng với GrapesJS BlockManager drag/drop system

### 2.3 Layers Panel Structure
- **Vị trí**: `LayerPanel.js` + `main.js` function `renderLayers()` lines 1354-1368
- **Vấn đề**: 
  - LayerPanel tự render custom structure thay vì dùng GrapesJS LayerManager.render()
  - `main.js` đang gọi `LayerManager.render()` nhưng LayerPanel.js override với custom rendering
  - Conflicting implementations

## 3. Các bước Thực hiện (Implementation Steps)

* [x] **Step 1**: Fix Right Panel Close Button ✅
  - Thêm event listener trong `setupEventListeners()` của `main.js`
  - Toggle class `hidden` khi click nút X
  - Khi click component trong canvas → hiển thị right panel
  - **DONE**: Added `setupRightPanelClose()` function (lines 1033-1064)

* [x] **Step 2**: Fix Blocks Drag & Drop ✅
  - Sử dụng GrapesJS BlockManager native drag system thay vì custom drag events
  - **DONE**: Updated `createBlockElement()` to use:
    - `BlockManager.__startDrag(block, e)` on dragstart
    - `BlockManager.__drag(e)` on drag
    - `BlockManager.__endDrag()` + droppable.endCustom on dragend
    - `startCustom()` to enable iframe drop handling

* [x] **Step 3**: Fix Layers Panel Structure ✅
  - Sử dụng GrapesJS LayerManager.render() native
  - Chỉ render nếu container empty (avoid double rendering)
  - **DONE**: Updated `renderLayers()` to check `children.length === 0`

* [ ] **Step 4**: Test all functionality
  - Test Right Panel Close Button (X)
  - Test Blocks Drag & Drop into Canvas
  - Test Layers Panel Structure

## 4. Các file bị ảnh hưởng (Files to be Touched)
* `frontend/src/editor/scripts/main.js` (Chỉnh sửa - thêm event listeners, fix drag/drop, fix layers)
* `frontend/src/editor/styles/editor.css` (Chỉnh sửa - có thể cần thêm styles cho layers)
* `frontend/src/editor/scripts/panels/LayerPanel.js` (Kiểm tra/Chỉnh sửa nếu cần)

## 5. Technical Details

### 5.1 Right Panel Toggle Logic
```javascript
// In setupEventListeners()
const rightPanelClose = document.getElementById('right-panel-close');
if (rightPanelClose) {
    rightPanelClose.addEventListener('click', () => {
        const rightPanel = document.getElementById('right-panel');
        rightPanel.classList.add('hidden');
        this.updateCanvasLayout();
    });
}

// On component select - show right panel
this.pm.on('component:selected', () => {
    const rightPanel = document.getElementById('right-panel');
    rightPanel.classList.remove('hidden');
    this.updateCanvasLayout();
});
```

### 5.2 Block Drag Implementation
Thay vì custom drag events, sử dụng GrapesJS approach:
- Set `draggable="true"` 
- On dragstart: set `dataTransfer` với block content
- On dragend: GrapesJS handles drop into canvas

### 5.3 Layers Manager
Sử dụng native GrapesJS LayerManager thay vì custom implementation.
