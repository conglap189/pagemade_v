# Kế hoạch: Sửa lỗi Component Outline, Undo, Redo buttons

## 1. Mục tiêu (Goal)
Sửa các tính năng không hoạt động sau refactor:
- **Component Outline button** (`#btn-outline`) - Toggle hiển thị outline cho components
- **Undo button** (`#btn-undo`) - Hoàn tác thay đổi
- **Redo button** (`#btn-redo`) - Làm lại thay đổi

## 2. Phân tích vấn đề

### 2.1 Component Outline
- **Hiện tại**: Button `#btn-outline` không có event listener
- **Giải pháp**: Sử dụng GrapesJS command `core:component-outline` để toggle outline

### 2.2 Undo/Redo
- **Hiện tại**: 
  - Custom HistoryManager tự quản lý history riêng (không dùng GrapesJS native)
  - Buttons gọi `historyManager.undo()` và `historyManager.redo()`
  - Buttons bị disabled và không update state đúng cách
  
- **Vấn đề chính**:
  - GrapesJS đã có UndoManager native (`editor.UndoManager`)
  - Custom HistoryManager gây conflict và không cần thiết
  
- **Giải pháp**: Sử dụng GrapesJS native UndoManager thay vì custom HistoryManager

## 3. Các bước Thực hiện (Implementation Steps)

* [x] 1. Thêm event listener cho Component Outline button trong `main.js`
* [x] 2. Sửa Undo/Redo để sử dụng GrapesJS native UndoManager
* [x] 3. Cập nhật trạng thái buttons (enabled/disabled) khi history thay đổi
* [x] 4. Test các tính năng - Server đang chạy tại http://localhost:5003/editor/

## 6. Hoàn thành
- **Ngày hoàn thành**: 2025-12-09
- **Trạng thái**: ✅ DONE

## 4. Các file bị ảnh hưởng (Files to be Touched)
* `frontend/src/editor/scripts/main.js` (Chỉnh sửa)

## 5. Chi tiết Implementation

### 5.1 Component Outline
```javascript
// Toggle outline visibility
const outlineBtn = document.getElementById('btn-outline');
if (outlineBtn) {
    outlineBtn.addEventListener('click', () => {
        // GrapesJS command to toggle component outline
        this.pm.runCommand('core:component-outline');
        outlineBtn.classList.toggle('active');
    });
}
```

### 5.2 Undo/Redo với GrapesJS UndoManager
```javascript
// Undo
const undoBtn = document.getElementById('btn-undo');
if (undoBtn) {
    undoBtn.addEventListener('click', () => {
        this.pm.UndoManager.undo();
    });
}

// Redo
const redoBtn = document.getElementById('btn-redo');
if (redoBtn) {
    redoBtn.addEventListener('click', () => {
        this.pm.UndoManager.redo();
    });
}

// Update button states
this.pm.on('change:canUndo change:canRedo', () => {
    const um = this.pm.UndoManager;
    undoBtn.disabled = !um.hasUndo();
    redoBtn.disabled = !um.hasRedo();
});
```
