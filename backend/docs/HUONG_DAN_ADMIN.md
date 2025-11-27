# 👑 Hướng Dẫn Tạo và Xóa Admin - PageMade

## 📌 Tổng Quan

Hệ thống PageMade sử dụng **CLI script** để quản lý admin, **KHÔNG** qua giao diện web. Điều này đảm bảo bảo mật cao.

---

## 🚀 Tạo Admin Mới

### Local Development

```bash
# Bước 1: Di chuyển vào thư mục backend
cd /home/helios/ver1.1/backend

# Bước 2: Tạo admin
python3 manage_admin.py create email@example.com "Tên Admin"

# Bước 3: LƯU MẬT KHẨU (chỉ hiển thị 1 lần!)
# Output:
# ✅ Tạo tài khoản admin thành công!
# 📧 Email:    email@example.com
# 👤 Tên:      Tên Admin
# 🔑 Mật khẩu: Xy9#mK2$pL4@vN8!
# 👑 Role:     admin
```

### Production (VPS)

```bash
# Bước 1: SSH vào VPS
ssh root@36.50.55.21

# Bước 2: Di chuyển vào thư mục
cd /var/www/pagemade/backend

# Bước 3: Activate virtual environment
source venv/bin/activate

# Bước 4: Tạo admin
python manage_admin.py create admin@pagemade.site "Admin Production"

# Bước 5: LƯU MẬT KHẨU vào password manager!
```

---

## 🗑️ Xóa Admin

### Lệnh xóa

```bash
python3 manage_admin.py delete email@example.com
```

### Output

```
⚠️  CẢNH BÁO: Bạn sắp xóa tài khoản:
   Email: email@example.com
   Tên:   Tên Admin
   Role:  admin

Gõ 'YES' để xác nhận xóa: YES
✅ Đã xóa tài khoản 'email@example.com'!
```

### ⚠️ Lưu ý

- ❌ **Không thể xóa admin cuối cùng** (hệ thống phải có ít nhất 1 admin)
- ⚠️ Phải gõ **YES** (viết hoa) để confirm
- 🔄 Xóa vĩnh viễn, **không thể khôi phục**
- 💾 Nên **backup database** trước khi xóa

---

## 📋 Các Lệnh Khác

### Xem danh sách admin

```bash
python3 manage_admin.py list
```

### Nâng user lên admin

```bash
python3 manage_admin.py promote user@example.com
```

### Hạ admin xuống user

```bash
python3 manage_admin.py demote admin@example.com
```

### Xem hướng dẫn

```bash
python3 manage_admin.py help
```

---

## 🔐 Bảo Mật

### ✅ Best Practices

1. **Lưu mật khẩu an toàn:**
   - Dùng password manager (1Password, Bitwarden)
   - KHÔNG lưu vào file text
   - KHÔNG gửi qua email/chat

2. **Giới hạn số admin:**
   - Chỉ tạo khi cần thiết
   - Review định kỳ: `python3 manage_admin.py list`

3. **Backup trước khi xóa:**
   ```bash
   cp app.db app.db.backup_$(date +%Y%m%d)
   python3 manage_admin.py delete email@example.com
   ```

4. **Đổi mật khẩu sau khi tạo:**
   - Đăng nhập vào hệ thống
   - Vào Profile → Change Password
   - Đổi sang mật khẩu dễ nhớ hơn (nhưng vẫn mạnh!)

---

## 🔒 Đăng Nhập Admin

### Local
- URL: http://localhost:5000
- Email: Email đã tạo
- Password: Mật khẩu được sinh tự động

### Production
- URL: http://pagemade.site
- Email: Email đã tạo
- Password: Mật khẩu được sinh tự động

---

## ❓ Troubleshooting

### Quên mật khẩu?

**Giải pháp 1:** Tạo admin mới
```bash
python3 manage_admin.py create newadmin@pagemade.site "New Admin"
```

**Giải pháp 2:** Xóa và tạo lại (nếu có nhiều admin)
```bash
python3 manage_admin.py delete oldadmin@pagemade.site
python3 manage_admin.py create oldadmin@pagemade.site "Old Admin"
```

### Email đã tồn tại?

```bash
# Kiểm tra role hiện tại
python3 manage_admin.py list

# Nếu là user, promote lên admin
python3 manage_admin.py promote existing@email.com
```

### Không xóa được admin cuối cùng?

```bash
# Tạo admin backup trước
python3 manage_admin.py create backup@pagemade.site "Backup Admin"

# Sau đó mới xóa
python3 manage_admin.py delete old@pagemade.site
```

---

## 📚 Tài Liệu Chi Tiết

- [ADMIN_MANAGEMENT.md](./ADMIN_MANAGEMENT.md) - Hướng dẫn đầy đủ
- [ADMIN_QUICKSTART.md](./ADMIN_QUICKSTART.md) - Tham khảo nhanh

---

## 🎯 Ví Dụ Thực Tế

### Kịch bản 1: Setup lần đầu

```bash
# 1. Tạo admin đầu tiên
cd /home/helios/ver1.1/backend
python3 manage_admin.py create admin@pagemade.site "Main Admin"

# 2. Lưu mật khẩu: p@ZV]3eH35V*YKj|

# 3. Đăng nhập và test
# URL: http://localhost:5000
# Email: admin@pagemade.site
# Pass: p@ZV]3eH35V*YKj|

# 4. Đổi mật khẩu trong Profile
```

### Kịch bản 2: Thêm admin mới

```bash
# 1. Kiểm tra admin hiện tại
python3 manage_admin.py list

# 2. Tạo admin thứ 2
python3 manage_admin.py create admin2@pagemade.site "Admin 2"

# 3. Lưu mật khẩu và gửi cho người dùng qua kênh an toàn
```

### Kịch bản 3: Xóa admin cũ

```bash
# 1. Đảm bảo có ít nhất 2 admin
python3 manage_admin.py list

# 2. Backup database
cp app.db app.db.backup_before_delete

# 3. Xóa admin cũ
python3 manage_admin.py delete oldadmin@pagemade.site
# Gõ: YES

# 4. Verify
python3 manage_admin.py list
```

---

**Cập nhật:** 2025-10-17  
**Version:** 1.0
