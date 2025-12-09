# Hướng Dẫn Thêm Category Mới

Hướng dẫn này giúp bạn thêm một category mới (ví dụ: Footer Section, Feature Section, CTA Section...) vào Block Manager.

---

## Tổng quan

Để thêm 1 category mới, bạn cần tạo **3 files**:

```
categories/
└── [tên-category]/
    ├── index.js        # Export tất cả blocks trong category
    └── [block-1].js    # Block đầu tiên
```

Và **sửa 1 file**:
```
categories/index.js     # Đăng ký category mới
```

---

## Ví dụ: Thêm Category "Footer Section"

### Bước 1: Tạo thư mục

```bash
mkdir -p categories/footer-section
```

---

### Bước 2: Tạo file block (footer-1.js)

Tạo file `categories/footer-section/footer-1.js`:

```javascript
/**
 * Footer 1 - Simple Footer
 * 
 * Footer đơn giản với logo, navigation links và copyright
 */

export const footer1 = {
    id: 'footer-1',
    label: 'Footer 1 - Simple',
    category: 'Footer Section',
    
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="16" width="20" height="5" rx="1"/>
        <line x1="6" y1="18.5" x2="10" y2="18.5"/>
        <line x1="14" y1="18.5" x2="18" y2="18.5"/>
    </svg>`,
    
    content: `
        <footer class="pm-footer-1">
            <style>
                .pm-footer-1 {
                    background: #1f2937;
                    color: #ffffff;
                    padding: 40px 20px;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                .pm-footer-1 * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                .pm-footer-1 .footer-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                }
                .pm-footer-1 .footer-logo {
                    font-size: 1.5rem;
                    font-weight: 700;
                }
                .pm-footer-1 .footer-links {
                    display: flex;
                    gap: 24px;
                }
                .pm-footer-1 .footer-links a {
                    color: #9ca3af;
                    text-decoration: none;
                    font-size: 0.875rem;
                }
                .pm-footer-1 .footer-links a:hover {
                    color: #ffffff;
                }
                .pm-footer-1 .footer-copyright {
                    width: 100%;
                    text-align: center;
                    padding-top: 20px;
                    margin-top: 20px;
                    border-top: 1px solid #374151;
                    color: #9ca3af;
                    font-size: 0.875rem;
                }
                
                @media (max-width: 768px) {
                    .pm-footer-1 .footer-container {
                        flex-direction: column;
                        text-align: center;
                    }
                    .pm-footer-1 .footer-links {
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                }
            </style>
            
            <div class="footer-container">
                <div class="footer-logo">YourBrand</div>
                <nav class="footer-links">
                    <a href="#">Home</a>
                    <a href="#">About</a>
                    <a href="#">Services</a>
                    <a href="#">Contact</a>
                </nav>
                <div class="footer-copyright">
                    © 2024 YourBrand. All rights reserved.
                </div>
            </div>
        </footer>
    `
}
```

---

### Bước 3: Tạo file index.js cho category

Tạo file `categories/footer-section/index.js`:

```javascript
/**
 * Footer Section Blocks
 * 
 * Khi thêm footer mới:
 * 1. Tạo file footer-X.js
 * 2. Import và thêm vào array bên dưới
 */

import { footer1 } from './footer-1.js'
// import { footer2 } from './footer-2.js'

export const footerBlocks = [
    footer1,
    // footer2,
]

export const categoryInfo = {
    name: 'Footer Section',
    order: 10,  // Số lớn = hiển thị sau
}
```

---

### Bước 4: Đăng ký category

Mở file `categories/index.js`, thêm vào:

```javascript
// Thêm import ở đầu file
import { footerBlocks, categoryInfo as footerCategory } from './footer-section/index.js'

// Thêm vào array categories
export const categories = [
    { ...heroCategory, blocks: heroBlocks },
    { ...footerCategory, blocks: footerBlocks },  // ← Thêm dòng này
]
```

---

### Bước 5: Test

1. Refresh editor
2. Mở Block Manager (panel bên trái)
3. Category "Footer Section" sẽ xuất hiện
4. Kéo "Footer 1 - Simple" vào canvas

---

## Checklist

- [ ] Tạo thư mục `categories/[tên-category]/`
- [ ] Tạo file block `[block-1].js` với đầy đủ: id, label, category, media, content
- [ ] Tạo file `index.js` export blocks và categoryInfo
- [ ] Thêm import vào `categories/index.js`
- [ ] Thêm vào array `categories` trong `categories/index.js`
- [ ] Test trên editor

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Category không hiện | Chưa import trong `categories/index.js` | Thêm import và đăng ký |
| Block không hiện | Chưa export trong category `index.js` | Thêm vào array exports |
| Lỗi syntax | Thiếu dấu phẩy, ngoặc | Kiểm tra lại cú pháp JS |
| CSS không apply | Class prefix sai | Đảm bảo dùng `.pm-[block-id]` |

---

## Template Copy-Paste

### Template cho file block mới

```javascript
/**
 * [Tên Block]
 * 
 * [Mô tả]
 */

export const blockName = {
    id: 'block-id',
    label: 'Block Label',
    category: 'Category Name',
    
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
    </svg>`,
    
    content: `
        <section class="pm-block-id">
            <style>
                .pm-block-id {
                    padding: 60px 20px;
                    background: #ffffff;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                .pm-block-id * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                /* Thêm CSS ở đây */
                
                @media (max-width: 768px) {
                    .pm-block-id {
                        padding: 40px 16px;
                    }
                }
            </style>
            
            <!-- HTML content -->
            <div class="container">
                <h2>Title</h2>
                <p>Content</p>
            </div>
        </section>
    `
}
```

### Template cho file index.js của category

```javascript
/**
 * [Category Name] Blocks
 */

import { block1 } from './block-1.js'
// import { block2 } from './block-2.js'

export const categoryBlocks = [
    block1,
    // block2,
]

export const categoryInfo = {
    name: 'Category Name',
    order: 1,
}
```

---

## Thứ tự Category (order)

| Order | Category |
|-------|----------|
| 1 | Hero Section |
| 2 | Feature Section |
| 3 | Content Section |
| 4 | CTA Section |
| 5 | Testimonial Section |
| 10 | Footer Section |

*Số nhỏ = hiển thị trước*

---

*Xem thêm: [README.md](./README.md) để biết chi tiết về cấu trúc block và best practices*
