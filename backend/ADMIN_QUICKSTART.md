# 🚀 QUICK START - Quản Lý Admin

## 📖 Các Lệnh Thường Dùng

### 1. **Tạo Admin Mới** (quan trọng nhất!)
```bash
cd /home/helios/ver1.1/backend
python3 manage_admin.py create admin@pagemade.site "Tên Admin"
```
✅ **Lưu mật khẩu ngay!** Chỉ hiển thị 1 lần!

---

### 2. **Xem Danh Sách Admin**
```bash
python3 manage_admin.py list
```

---

### 3. **Nâng User Lên Admin**
```bash
python3 manage_admin.py promote user@example.com
```

---

### 4. **Hạ Admin Xuống User**
```bash
python3 manage_admin.py demote admin@example.com
```

---

### 5. **Xóa Tài Khoản**
```bash
python3 manage_admin.py delete email@example.com
# Gõ YES để xác nhận
```

---

## 🌐 Production (VPS)

```bash
# 1. SSH vào VPS
ssh root@36.50.55.21

# 2. Di chuyển vào thư mục
cd /var/www/pagemade/backend

# 3. Activate venv
source venv/bin/activate

# 4. Tạo admin
python manage_admin.py create admin@pagemade.site "Admin Production"

# 5. LƯU MẬT KHẨU!
```

---

## ⚠️ Lưu Ý Quan Trọng

1. ✅ **Luôn lưu mật khẩu** vào password manager
2. ✅ **Không thể xem lại** mật khẩu sau khi tạo
3. ✅ **Phải có ít nhất 1 admin** trong hệ thống
4. ✅ **Confirm 'YES'** (viết hoa) khi xóa
5. ✅ **Backup database** trước khi xóa admin

---

## 🔒 Đăng Nhập

- **URL Local:** http://localhost:5000
- **URL Production:** http://pagemade.site
- **Email:** Email đã tạo
- **Password:** Mật khẩu được sinh tự động

---

## 📚 Docs Đầy Đủ

Xem chi tiết: [ADMIN_MANAGEMENT.md](./ADMIN_MANAGEMENT.md)
