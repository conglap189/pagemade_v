# Hướng dẫn Thêm Template Mới

## Tổng quan

Thư mục này chứa các template cho PageMade. Khi bạn thêm file template mới vào đây, nó sẽ **tự động hiển thị** trong modal chọn template khi tạo site mới.

---

## Cách Thêm Template Mới

### Bước 1: Tạo file Template JSON

Tạo file mới với tên dạng `ten-template.json` trong thư mục này:

```json
{
  "id": "ten-template",
  "name": "Tên Hiển Thị Template",
  "description": "Mô tả ngắn về template",
  "category": "landing",
  "thumbnail": "/static/templates/thumbnails/ten-template.svg",
  "content": {
    "html": "<div>HTML của template</div>",
    "css": "/* CSS của template */",
    "components": [],
    "styles": []
  }
}
```

### Giải thích các trường:

| Trường | Bắt buộc | Mô tả |
|--------|----------|-------|
| `id` | ✅ | ID unique, nên trùng với tên file (không có `.json`) |
| `name` | ✅ | Tên hiển thị trong modal chọn template |
| `description` | ✅ | Mô tả ngắn gọn về template |
| `category` | ❌ | Phân loại: `landing`, `business`, `portfolio`, `ecommerce`... |
| `thumbnail` | ❌ | Đường dẫn đến ảnh preview (nếu không có sẽ dùng placeholder) |
| `content.html` | ✅ | HTML content của template |
| `content.css` | ✅ | CSS styles của template |
| `content.components` | ❌ | GrapesJS components JSON (nâng cao) |
| `content.styles` | ❌ | GrapesJS styles JSON (nâng cao) |

### Bước 2: Tạo Thumbnail (Tùy chọn)

Tạo file ảnh preview trong thư mục `thumbnails/`:

- **Định dạng:** SVG, PNG, hoặc JPG
- **Tên file:** Trùng với `id` của template (ví dụ: `ten-template.svg`)
- **Kích thước đề xuất:** 400x300px

---

## Ví dụ Template

### Template đơn giản: `portfolio.json`

```json
{
  "id": "portfolio",
  "name": "Portfolio Cá Nhân",
  "description": "Template giới thiệu bản thân, phù hợp cho freelancer và designer",
  "category": "portfolio",
  "thumbnail": "/static/templates/thumbnails/portfolio.svg",
  "content": {
    "html": "<section class=\"hero\"><div class=\"container\"><h1>Xin chào, tôi là <span class=\"highlight\">[Tên của bạn]</span></h1><p class=\"subtitle\">Web Developer & Designer</p><a href=\"#contact\" class=\"btn\">Liên hệ ngay</a></div></section><section class=\"about\"><div class=\"container\"><h2>Về tôi</h2><p>Mô tả ngắn về bản thân và kinh nghiệm của bạn...</p></div></section>",
    "css": ".hero { text-align: center; padding: 120px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; } .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; } .highlight { color: #ffd700; } .subtitle { font-size: 1.5rem; margin: 20px 0; opacity: 0.9; } .btn { display: inline-block; padding: 15px 40px; background: white; color: #667eea; text-decoration: none; border-radius: 30px; font-weight: bold; margin-top: 20px; } .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); } .about { padding: 80px 20px; background: #f8f9fa; } .about h2 { text-align: center; margin-bottom: 30px; }",
    "components": [],
    "styles": []
  }
}
```

### Template landing page: `landing-saas.json`

```json
{
  "id": "landing-saas",
  "name": "Landing SaaS",
  "description": "Template cho sản phẩm SaaS, startup công nghệ",
  "category": "landing",
  "thumbnail": "/static/templates/thumbnails/landing-saas.svg",
  "content": {
    "html": "<header class=\"navbar\"><div class=\"container\"><div class=\"logo\">YourBrand</div><nav><a href=\"#features\">Tính năng</a><a href=\"#pricing\">Bảng giá</a><a href=\"#contact\">Liên hệ</a></nav></div></header><section class=\"hero\"><div class=\"container\"><h1>Giải pháp tuyệt vời cho doanh nghiệp của bạn</h1><p>Tăng hiệu suất làm việc lên 200% với công cụ quản lý thông minh</p><div class=\"cta-buttons\"><a href=\"#\" class=\"btn btn-primary\">Dùng thử miễn phí</a><a href=\"#\" class=\"btn btn-secondary\">Xem demo</a></div></div></section>",
    "css": ".navbar { padding: 20px 0; position: fixed; width: 100%; top: 0; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000; } .navbar .container { display: flex; justify-content: space-between; align-items: center; } .logo { font-size: 1.5rem; font-weight: bold; color: #2563eb; } .navbar nav a { margin-left: 30px; text-decoration: none; color: #374151; } .hero { padding: 150px 20px 100px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); text-align: center; } .hero h1 { font-size: 3rem; color: #1e3a8a; margin-bottom: 20px; } .hero p { font-size: 1.25rem; color: #64748b; margin-bottom: 40px; } .cta-buttons { display: flex; gap: 20px; justify-content: center; } .btn { padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; } .btn-primary { background: #2563eb; color: white; } .btn-secondary { background: white; color: #2563eb; border: 2px solid #2563eb; } .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }",
    "components": [],
    "styles": []
  }
}
```

---

## Mẹo: Lấy HTML/CSS từ Editor

Nếu bạn đã thiết kế một trang trong editor và muốn lưu thành template:

1. Mở trang trong PageMade Editor
2. Mở DevTools (F12) → Console
3. Chạy lệnh sau:

```javascript
// Copy kết quả này vào file template
console.log(JSON.stringify({
  html: pm.getHtml(),
  css: pm.getCss()
}, null, 2))
```

4. Copy kết quả và paste vào `content.html` và `content.css` của file template mới

---

## Cấu trúc Thư mục

```
backend/static/templates/
├── README.md                 # File hướng dẫn này
├── blank.json                # Template trang trống
├── landing-product.json      # Template landing sản phẩm
├── [your-template].json      # Template của bạn
└── thumbnails/
    ├── blank.svg
    ├── landing-product.svg
    └── [your-template].svg   # Thumbnail của bạn
```

---

## Kiểm tra Template

Sau khi thêm file template:

1. Vào trang tạo site mới: `http://localhost:5000/new-site`
2. Click vào ô "Chọn Template"
3. Template mới sẽ xuất hiện trong danh sách

---

## Lưu ý

- **ID phải unique**: Không được trùng với template đã có
- **JSON hợp lệ**: Đảm bảo file JSON không có lỗi cú pháp
- **Escape đúng cách**: Trong JSON, dấu `"` trong HTML/CSS phải được escape thành `\"`
- **Test trước khi deploy**: Luôn kiểm tra template hoạt động đúng trên local

---

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. File JSON có đúng cú pháp không (dùng JSON validator online)
2. Đường dẫn thumbnail có đúng không
3. Console log của trình duyệt có báo lỗi gì không
