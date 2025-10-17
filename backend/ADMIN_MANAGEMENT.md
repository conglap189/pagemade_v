# 👑 Hướng Dẫn Quản Lý Admin - PageMade

Script `manage_admin.py` cho phép bạn quản lý tài khoản admin từ command line, **không qua giao diện web**.

## 📋 Mục Lục
- [Yêu cầu](#yêu-cầu)
- [Các lệnh cơ bản](#các-lệnh-cơ-bản)
- [Ví dụ sử dụng](#ví-dụ-sử-dụng)
- [Lưu ý bảo mật](#lưu-ý-bảo-mật)
- [FAQ](#faq)

---

## ⚙️ Yêu Cầu

- Python 3.8+
- Đã cài đặt dependencies: `pip install -r requirements.txt`
- Truy cập vào server/database
- File `.env` hoặc `.env.local` đã cấu hình đúng

---

## 🚀 Các Lệnh Cơ Bản

### 1. Tạo admin mới

```bash
cd /home/helios/ver1.1/backend
python manage_admin.py create <email> <name>
```

**Output:**
```
✅ Tạo tài khoản admin thành công!
------------------------------------------------------------
📧 Email:    admin@pagemade.site
👤 Tên:      Admin System
🔑 Mật khẩu: Xy9#mK2$pL4@vN8!
👑 Role:     admin
------------------------------------------------------------
⚠️  LƯU Ý: Hãy lưu mật khẩu này ngay! Không thể xem lại.
```

**Lưu ý:**
- Mật khẩu tự động sinh ngẫu nhiên (16 ký tự, rất mạnh)
- Chỉ hiển thị **1 lần duy nhất**
- Lưu mật khẩu vào nơi an toàn (password manager)

---

### 2. Liệt kê tất cả admin

```bash
python manage_admin.py list
```

**Output:**
```
📋 Danh sách Admin (2 người):
================================================================================
ID    Email                          Tên                       Tạo lúc             
--------------------------------------------------------------------------------
1     admin@pagemade.site            Admin System              2025-10-17 04:30:15
2     superadmin@pagemade.site       Super Admin               2025-10-16 10:20:00
================================================================================
```

---

### 3. Nâng cấp user thành admin

```bash
python manage_admin.py promote user@example.com
```

**Output:**
```
✅ Đã nâng cấp 'user@example.com' (John Doe) lên admin!
```

**Use case:**
- Khi có user đăng ký qua Google OAuth cần nâng lên admin
- Trao quyền quản trị cho thành viên mới

---

### 4. Hạ cấp admin xuống user

```bash
python manage_admin.py demote admin@pagemade.site
```

**Output:**
```
✅ Đã hạ cấp 'admin@pagemade.site' (Admin System) xuống user thường!
```

**Lưu ý:**
- ❌ Không thể hạ cấp admin cuối cùng
- Hệ thống phải có ít nhất 1 admin

---

### 5. Xóa tài khoản admin

```bash
python manage_admin.py delete admin@pagemade.site
```

**Output:**
```
⚠️  CẢNH BÁO: Bạn sắp xóa tài khoản:
   Email: admin@pagemade.site
   Tên:   Admin System
   Role:  admin

Gõ 'YES' để xác nhận xóa: YES
✅ Đã xóa tài khoản 'admin@pagemade.site'!
```

**Lưu ý:**
- ❌ Không thể xóa admin cuối cùng
- ⚠️ Cần confirm bằng cách gõ `YES` (viết hoa)
- Xóa vĩnh viễn, không thể khôi phục

---

## 📝 Ví Dụ Sử Dụng

### Kịch bản 1: Setup admin đầu tiên

```bash
# Bước 1: SSH vào server
ssh root@36.50.55.21

# Bước 2: Di chuyển vào thư mục backend
cd /var/www/pagemade/backend

# Bước 3: Activate virtual environment
source venv/bin/activate

# Bước 4: Tạo admin
python manage_admin.py create admin@pagemade.site "Admin Chính"

# Bước 5: Lưu mật khẩu vào password manager
# Output: 🔑 Mật khẩu: Xy9#mK2$pL4@vN8!
```

### Kịch bản 2: Local development

```bash
# Bước 1: Di chuyển vào thư mục backend
cd /home/helios/ver1.1/backend

# Bước 2: Sử dụng Python local
python manage_admin.py create dev@localhost "Dev Admin"

# Bước 3: Đăng nhập vào http://localhost:5000
# Email: dev@localhost
# Password: <mật khẩu đã tạo>
```

### Kịch bản 3: Quản lý nhiều admin

```bash
# Tạo 2 admin
python manage_admin.py create admin1@pagemade.site "Admin 1"
python manage_admin.py create admin2@pagemade.site "Admin 2"

# Xem danh sách
python manage_admin.py list

# Hạ cấp 1 admin
python manage_admin.py demote admin2@pagemade.site

# Nâng cấp lại
python manage_admin.py promote admin2@pagemade.site
```

---

## 🔒 Lưu Ý Bảo Mật

### ✅ Nên làm

1. **Lưu mật khẩu an toàn:**
   - Sử dụng password manager (1Password, Bitwarden, LastPass)
   - Không lưu vào file text thường
   - Không share qua email/chat

2. **Giới hạn số admin:**
   - Chỉ tạo admin khi thực sự cần thiết
   - Định kỳ review danh sách admin: `python manage_admin.py list`

3. **Đổi mật khẩu ngay:**
   - Sau khi tạo, đăng nhập và đổi mật khẩu sang cái dễ nhớ hơn
   - Sử dụng mật khẩu mạnh (12+ ký tự, có số, chữ hoa, ký tự đặc biệt)

4. **Backup database:**
   - Trước khi xóa admin: `cp app.db app.db.backup`
   - Định kỳ backup: `/var/www/pagemade/backend/app.db`

### ❌ Không nên làm

1. ❌ Không commit mật khẩu vào Git
2. ❌ Không share script `manage_admin.py` công khai
3. ❌ Không tạo admin qua API/web form
4. ❌ Không để lộ mật khẩu trong logs
5. ❌ Không xóa admin cuối cùng

---

## 🔧 Production Deployment

### Setup admin trên VPS Production

```bash
# 1. SSH vào VPS
ssh root@36.50.55.21

# 2. Di chuyển vào thư mục backend
cd /var/www/pagemade/backend

# 3. Activate venv
source venv/bin/activate

# 4. Tạo admin đầu tiên
python manage_admin.py create admin@pagemade.site "Admin PageMade"

# 5. LƯU MẬT KHẨU!
# Output: 🔑 Mật khẩu: Xy9#mK2$pL4@vN8!

# 6. Test đăng nhập
# Truy cập: http://pagemade.site
# Đăng nhập với email và mật khẩu vừa tạo

# 7. Đổi mật khẩu trong Profile
# (chức năng này cần implement nếu chưa có)
```

---

## ❓ FAQ

### Q1: Quên mật khẩu admin?
**A:** Tạo admin mới hoặc reset:
```bash
# Cách 1: Tạo admin mới
python manage_admin.py create newadmin@pagemade.site "New Admin"

# Cách 2: Xóa và tạo lại (nếu có nhiều admin)
python manage_admin.py delete oldadmin@pagemade.site
python manage_admin.py create oldadmin@pagemade.site "Old Admin"
```

### Q2: Lỗi "Email đã tồn tại"?
**A:** Email đã được dùng. Có 2 cách:
```bash
# Cách 1: Promote user đó lên admin
python manage_admin.py promote existing@email.com

# Cách 2: Dùng email khác
python manage_admin.py create newemail@pagemade.site "Admin"
```

### Q3: Không thể xóa admin cuối cùng?
**A:** Đúng! Hệ thống phải có ít nhất 1 admin. Giải pháp:
```bash
# Tạo admin mới trước
python manage_admin.py create backup_admin@pagemade.site "Backup Admin"

# Sau đó mới xóa admin cũ
python manage_admin.py delete old_admin@pagemade.site
```

### Q4: Script không chạy được?
**A:** Kiểm tra:
```bash
# 1. Kiểm tra Python version
python --version  # Cần >= 3.8

# 2. Kiểm tra dependencies
pip install -r requirements.txt

# 3. Kiểm tra database path
ls -la app.db  # Phải có file này

# 4. Kiểm tra .env
cat .env  # Phải có DATABASE_URL hoặc tương đương

# 5. Run script với full path
cd /home/helios/ver1.1/backend
python manage_admin.py help
```

### Q5: Làm sao để admin login qua Google OAuth?
**A:** Admin có thể login cả 2 cách:
1. **Email/Password**: Dùng email và password được tạo bởi script
2. **Google OAuth**: Nếu đã link Google account

Để link Google account cho admin:
```bash
# 1. Admin đăng nhập bằng email/password
# 2. Trong Profile, click "Link Google Account"
# 3. Authorize với Google
# 4. Từ giờ có thể login bằng Google
```

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `/var/www/pagemade/backend/logs/`
2. Kiểm tra database: `sqlite3 app.db "SELECT * FROM user WHERE role='admin';"`
3. Restart service: `sudo systemctl restart pagemade`

---

## 📚 Tham Khảo

- [User Model](./app/models.py) - Cấu trúc User
- [Auth Routes](./app/routes.py) - Logic xác thực
- [Production Deployment](../PRODUCTION_DEPLOYMENT_SUMMARY.md) - Hướng dẫn deploy

---

**Phiên bản:** 1.0  
**Cập nhật:** 2025-10-17  
**Tác giả:** PageMade Team
