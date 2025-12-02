# Kế hoạch: Fix JWT to Session Authentication for Web Routes

## 1. Mục tiêu (Goal)
Khi user đăng nhập từ frontend (localhost:3000/signin) và redirect về backend dashboard (localhost:5000/dashboard), user sẽ được tự động login mà không phải đăng nhập lại.

## 2. Vấn đề hiện tại
- Frontend login tạo JWT cookie `auth_token`
- Backend web routes (dashboard) dùng `@login_required` (Flask-Login session)
- JWT bypass middleware chỉ xử lý `/api/` routes, không xử lý web routes
- Kết quả: User bị redirect về `/login` khi truy cập dashboard

## 3. Các bước Thực hiện (Implementation Steps)
* [x] Sửa `setup_jwt_bypass` trong `jwt_bypass.py` để xử lý cả web routes (như `/dashboard`)
* [x] Tự động `login_user()` khi phát hiện JWT cookie hợp lệ trên web routes
* [ ] Test flow: login từ localhost:3000 -> redirect về localhost:5000/dashboard

## 4. Các file bị ảnh hưởng (Files to be Touched)
* `backend/app/middleware/jwt_bypass.py` (Chỉnh sửa)
