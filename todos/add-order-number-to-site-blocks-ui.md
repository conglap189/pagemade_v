# Kế hoạch: Sắp xếp thứ tự Category trong UI Site Blocks

## 1. Mục tiêu (Goal)
- Hiển thị số thứ tự trước tên category: "1. Hero Section", "2. Footer Section"
- **Quan trọng**: Categories phải được sắp xếp theo thứ tự số (1, 2, 3...), không theo A-Z

## 2. Các bước Thực hiện (Implementation Steps)
* [x] Cập nhật `categoryInfo` trong `hero-section/index.js` - đổi name thành "1. Hero Section" ✅
* [x] Cập nhật `categoryInfo` trong `footer-section/index.js` - đổi name thành "2. Footer Section" ✅
* [x] Sửa hàm `renderBlocksToContainer` trong `main.js` - sắp xếp theo số thay vì alphabetical ✅
* [x] Sửa `category` trong `hero-1.js` thành "1. Hero Section" ✅
* [x] Sửa `category` trong `footer-1.js` thành "2. Footer Section" ✅

## 3. Các file bị ảnh hưởng (Files to be Touched)
* `frontend/src/editor/scripts/blocks/categories/hero-section/index.js` (Chỉnh sửa) ✅
* `frontend/src/editor/scripts/blocks/categories/footer-section/index.js` (Chỉnh sửa) ✅
* `frontend/src/editor/scripts/main.js` (Chỉnh sửa) ✅
* `frontend/src/editor/scripts/blocks/categories/hero-section/hero-1.js` (Chỉnh sửa) ✅
* `frontend/src/editor/scripts/blocks/categories/footer-section/footer-1.js` (Chỉnh sửa) ✅
