# Custom Blocks System

## 📁 Cấu trúc thư mục

```
/backend/static/pagemaker/custom-blocks/
├── index.js              # Main entry point - load tất cả modules
├── basic-blocks.js       # Blocks cơ bản (Text, Image, Button...)
├── advanced-cta.js       # CTA blocks nâng cao
├── custom-header.js      # Header blocks custom
└── README.md            # File này
```

## 🎯 Mục đích

Thư mục này chứa **custom blocks** do bạn tự tạo, **TÁCH BIỆT** với blocks có sẵn từ plugin `grapesjs-tailwind`.

### Blocks từ Plugin (GIỮ NGUYÊN):
- Blog, Contact, Content, CTA, Commerce
- Features, Footer, Gallery, Header, Hero
- Pricing, Team, Testimonials
- **Nguồn**: `/grapesjs/packages/grapesjs-tailwind/`

### Custom Blocks (BẠN TỰ THÊM):
- Nằm trong thư mục này
- Có thể merge vào categories có sẵn (VD: thêm CTA mới vào category 'CTA')
- Hoặc tạo category mới (VD: 'Basic', 'Forms', 'Advanced'...)

## 🚀 Cách sử dụng

### 1. Thêm block mới

Mở file tương ứng (VD: `basic-blocks.js`) và uncomment ví dụ:

```javascript
// Từ:
/*
editor.BlockManager.add('basic-button', {
  label: 'Button',
  category: 'Basic',
  content: '<button>Click</button>'
});
*/

// Thành:
editor.BlockManager.add('basic-button', {
  label: 'Button',
  category: 'Basic',
  content: '<button>Click</button>'
});
```

### 2. Tạo module mới

Nếu muốn thêm loại blocks mới (VD: Forms):

**Bước 1:** Tạo file `custom-forms.js`:
```javascript
export default function(editor) {
  editor.BlockManager.add('contact-form', {
    label: 'Contact Form',
    category: 'Forms',
    content: '<form>...</form>'
  });
}
```

**Bước 2:** Import vào `index.js`:
```javascript
import customForms from './custom-forms.js';

export default function init(editor) {
  basicBlocks(editor);
  advancedCTA(editor);
  customHeader(editor);
  customForms(editor);  // ← Thêm dòng này
}
```

### 3. Reload trang

Custom blocks sẽ tự động load khi editor khởi động. **KHÔNG cần rebuild GrapeJS**.

## 📝 Quy tắc

1. ✅ **KHÔNG SỬA** blocks từ plugin grapesjs-tailwind
2. ✅ **CHỈ THÊM** custom blocks vào thư mục này
3. ✅ **Mỗi loại blocks** một file riêng (dễ maintain)
4. ✅ **Comment rõ ràng** cho mỗi block
5. ✅ **Test kỹ** trước khi uncomment nhiều blocks cùng lúc

## 🔧 Maintenance

- **Thêm block:** Uncomment hoặc thêm code vào file tương ứng
- **Sửa block:** Tìm block ID và sửa trong file
- **Xóa block:** Comment lại hoặc xóa code block đó
- **Debug:** Check console log để xem blocks nào được load

## 📚 Tài liệu tham khảo

- GrapeJS Block Manager: https://grapesjs.com/docs/modules/Blocks.html
- Tailwind CSS: https://tailwindcss.com/docs

---

**Lưu ý:** Hệ thống này được thiết kế để **tách biệt** custom code khỏi thư viện gốc, giúp dễ dàng:
- Cập nhật GrapeJS/plugins mà không mất custom blocks
- Team work (mỗi người sửa file riêng, tránh conflict)
- Rollback nếu có lỗi
