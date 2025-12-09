# Kế hoạch: Thêm Hero Section Block vào Site Blocks

## 1. Mục tiêu (Goal)
Convert component Hero Section từ Tailwind CSS thành GrapesJS block với:
- Category riêng: "Hero Section"
- Traits cho các link (href, target)
- Responsive design
- Loại bỏ các element không cần thiết (mobile menu dialog, dark mode)

## 2. Các bước Thực hiện (Implementation Steps)
- [x] Đọc file site-blocks.js hiện tại
- [x] Convert HTML component thành GrapesJS block format
- [x] Thêm traits cho các link elements (Logo, Nav links, CTA buttons)
- [x] Cập nhật file site-blocks.js

## 3. Các file bị ảnh hưởng (Files to be Touched)
- `frontend/src/editor/scripts/blocks/site-blocks.js` (Chỉnh sửa)

## 4. Lưu ý khi Convert
- Loại bỏ: `<el-dialog>`, mobile menu (vì không hoạt động trong editor)
- Loại bỏ: dark mode classes (dark:...)
- Giữ lại: Header navigation + Hero content
- Thêm traits cho: Logo link, Nav links, CTA buttons
