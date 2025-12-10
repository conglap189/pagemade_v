# Kế hoạch: Fix Header Category hiển thị cuối trong Site Blocks

## 1. Mục tiêu (Goal)
Sửa lỗi "0. Header Section" hiển thị cuối cùng thay vì đầu tiên trong Site Blocks panel.

## 2. Phân tích Nguyên nhân (Root Cause Analysis)

### Vấn đề:
- Log console cho thấy blocks được register theo thứ tự: hero-1 → footer-1 → header-1
- Mặc dù `categories/index.js` có sort theo `order`, nhưng UI vẫn hiển thị sai

### Nguyên nhân gốc:
1. **`registerAllBlocks()` sort categories ĐÚNG** theo `order` (0, 1, 2)
2. **NHƯNG** `main.js` function `renderBlocksToContainer()` dùng `Object.keys()` để lấy categories
3. `Object.keys()` trả về keys theo thứ tự **blocks được ADD vào BlockManager**
4. Vì blocks được add theo thứ tự sort (header → hero → footer), nhưng **GrapesJS BlockManager có thể không giữ thứ tự này**

### Điểm mấu chốt:
- Code sort ở `categories/index.js` dòng 52 **CHỈ ảnh hưởng đến thứ tự REGISTER**
- Code sort ở `main.js` dòng 1848-1852 **quyết định thứ tự HIỂN THỊ**
- Regex `^(\d+)\.` trong `main.js` có thể không match đúng với tên category

## 3. Các bước Thực hiện (Implementation Steps)

* [x] Tạo file kế hoạch này
* [x] Kiểm tra và debug regex trong main.js
* [x] Fix code sort trong main.js
* [x] Test lại trên browser - THÀNH CÔNG!

## 4. Các file bị ảnh hưởng (Files to be Touched)
* `frontend/src/editor/scripts/main.js` (Chỉnh sửa - dòng ~1848)
* `frontend/src/editor/scripts/blocks/categories/index.js` (Kiểm tra)
