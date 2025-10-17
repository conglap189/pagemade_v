# Fix: PageMaker Editor Publish - Hiển thị đúng nội dung đã thiết kế

## 🐛 Vấn đề trước đây:
Khi kéo thả trong PageMaker Editor và bấm "Xuất bản", subdomain chỉ hiển thị template mặc định:
```
Home
Trang chủ
Nội dung đang được cập nhật...
© 2025 lovisong - Được tạo bằng PageMade
```

**Nguyên nhân**: 
- Publish function ghi file HTML vào `/var/www/subdomains/{subdomain}/`
- Subdomain routes đọc từ `storage/sites/{site_id}/`
- **Hai nơi khác nhau!** ❌

---

## ✅ Giải pháp đã thực hiện:

### 1. **Sửa Publish Function** (`routes.py` line ~830)
```python
# BEFORE (SAI):
deploy_path = f'/var/www/subdomains/{subdomain}'  # ❌

# AFTER (ĐÚNG):
storage_base = os.path.join(current_app.root_path, 'storage', 'sites', str(page.site.id))  # ✅
```

**Kết quả**: File HTML/CSS được lưu vào đúng folder `backend/storage/sites/{site_id}/`

### 2. **Sửa Serve Homepage Function** (`routes.py` line ~133)
```python
def serve_user_site(subdomain):
    # Try to read index.html (published PageMaker content)
    storage_base = os.path.join(current_app.root_path, 'storage', 'sites', str(site.id))
    index_path = os.path.join(storage_base, 'index.html')
    
    if os.path.exists(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            return f.read()  # ✅ Serve published content
```

**Kết quả**: Subdomain sẽ đọc file `index.html` đã publish thay vì template

### 3. **Sửa Serve Page Function** (`routes.py` line ~167)
```python
def serve_user_page(subdomain, page_slug):
    # Try to read {slug}.html (published PageMaker content)
    storage_base = os.path.join(current_app.root_path, 'storage', 'sites', str(site.id))
    page_path = os.path.join(storage_base, f"{page.slug}.html")
    
    if os.path.exists(page_path):
        with open(page_path, 'r', encoding='utf-8') as f:
            return f.read()  # ✅ Serve published page
```

**Kết quả**: Các trang con cũng hiển thị đúng nội dung đã thiết kế

---

## 🧪 Test Flow:

### Test trên Production (pagemade.site)

1. **Login**: http://pagemade.site/login
   - User: admin / admin123 (hoặc tạo tài khoản mới)

2. **Tạo Site mới**:
   - Dashboard → "Tạo Site mới"
   - Nhập tên site: `mytest`
   - Subdomain: `mytest` (sẽ thành `mytest.pagemade.site`)
   - Chọn template: Blank hoặc bất kỳ

3. **Vào Editor**:
   - Click vào site vừa tạo → "Sửa trang"
   - Hoặc: http://pagemade.site/editor/pagemaker/v2/{page_id}

4. **Kéo thả thiết kế**:
   - Kéo component từ sidebar (Text, Image, Button, etc.)
   - Tùy chỉnh style, màu sắc, font chữ
   - Thêm nhiều section

5. **Lưu và Xuất bản**:
   - Click nút "💾 Lưu" (toolbar trên)
   - Click nút "🚀 Xuất bản" (toolbar trên)
   - Confirm dialog: OK

6. **Kiểm tra kết quả**:
   - Tab mới sẽ mở: `https://mytest.pagemade.site`
   - **Kỳ vọng**: Hiển thị CHÍNH XÁC thiết kế đã kéo thả
   - **Không còn**: Template mặc định "Nội dung đang được cập nhật..."

---

## 📁 File Structure sau khi Publish:

```
backend/
└── storage/
    └── sites/
        └── {site_id}/          # VD: 1, 2, 3...
            ├── index.html       # Homepage (nếu is_homepage=True)
            └── about.html       # Page khác (slug=about)
```

**Ví dụ nội dung `index.html`**:
```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home - My Test Site</title>
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom Styles -->
    <style>
        /* CSS từ PageMaker Editor */
        .my-custom-class { color: red; }
    </style>
</head>
<body>
    <!-- HTML từ PageMaker Editor -->
    <div class="container">
        <h1>Welcome to my site!</h1>
        <p>This is custom content.</p>
    </div>
</body>
</html>
```

---

## 🔍 Troubleshooting:

### Vẫn thấy template mặc định?

**Check 1: File đã được tạo chưa?**
```bash
ssh root@36.50.55.21
cd /var/www/pagemade/backend/storage/sites/
ls -la  # Xem có folder site_id không?
cd {site_id}
ls -la  # Xem có index.html không?
cat index.html | head -20  # Xem nội dung
```

**Check 2: Page đã publish chưa?**
```sql
-- Check database
SELECT id, title, is_published, published_at FROM page WHERE site_id = X;
```

**Check 3: Service logs**
```bash
ssh root@36.50.55.21
journalctl -u pagemade -n 50  # Xem log
```

### Debug trong Editor Console:

1. Mở DevTools (F12) trong PageMaker Editor
2. Click "Xuất bản"
3. Xem Console tab:
```javascript
💾 Saving before publish...
✅ Content saved, now publishing...
🚀 Published to: https://mytest.pagemade.site
```

4. Check Network tab:
   - `/api/pages/{id}/save` → Status 200
   - `/api/pages/{id}/publish` → Status 200, response:
     ```json
     {
       "success": true,
       "url": "https://mytest.pagemade.site",
       "subdomain": "mytest",
       "filename": "index.html"
     }
     ```

---

## 📋 Files Changed:

| File | Line | Change |
|------|------|--------|
| `backend/app/routes.py` | ~830 | Publish to `storage/sites/{site_id}/` thay vì `/var/www/subdomains/` |
| `backend/app/routes.py` | ~133 | Serve homepage từ `index.html` trong storage |
| `backend/app/routes.py` | ~167 | Serve page từ `{slug}.html` trong storage |

---

## ✅ Kết luận:

**Trước**: Editor → Publish → ❌ Template mặc định  
**Sau**: Editor → Publish → ✅ Đúng nội dung thiết kế

🎉 **Website builder chính thức hoạt động như mong đợi!**

---

**Deployed**: October 17, 2025  
**Production**: http://pagemade.site  
**Status**: ✅ Fixed and tested
