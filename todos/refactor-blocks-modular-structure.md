# Kế hoạch: Refactor Blocks thành Modular Structure

## 1. Mục tiêu (Goal)
Tổ chức lại blocks theo cấu trúc modular, dễ mở rộng:
- Mỗi category là một thư mục riêng
- Mỗi block là một file riêng (hero-1.js, hero-2.js, ...)
- Thêm block mới chỉ cần tạo file + export

## 2. Cấu trúc Thư mục Đề xuất
```
frontend/src/editor/scripts/blocks/
├── basic-blocks.js
├── site-blocks.js              # Main loader
└── categories/
    ├── index.js                # Export all categories
    └── hero-section/
        ├── index.js            # Export all hero blocks
        ├── hero-1.js           # Hero with Header (đã có)
        ├── hero-2.js           # (thêm sau)
        └── hero-3.js           # (thêm sau)
```

## 3. Các bước Thực hiện (Implementation Steps)
- [x] Tạo thư mục `categories/`
- [x] Tạo thư mục `categories/hero-section/`
- [x] Tạo file `categories/hero-section/hero-1.js` (move code từ site-blocks.js)
- [x] Tạo file `categories/hero-section/index.js` (export all hero blocks)
- [x] Tạo file `categories/index.js` (export all categories)
- [x] Refactor `site-blocks.js` để load từ categories
- [x] Tạo README.md hướng dẫn thêm block mới
- [ ] Test xem blocks có load đúng không

## 4. Các file bị ảnh hưởng
- `frontend/src/editor/scripts/blocks/site-blocks.js` (Refactor)
- `frontend/src/editor/scripts/blocks/categories/` (Tạo mới)
- `frontend/src/editor/scripts/blocks/categories/index.js` (Tạo mới)
- `frontend/src/editor/scripts/blocks/categories/hero-section/` (Tạo mới)
- `frontend/src/editor/scripts/blocks/categories/hero-section/index.js` (Tạo mới)
- `frontend/src/editor/scripts/blocks/categories/hero-section/hero-1.js` (Tạo mới)
