# Hướng Dẫn Thêm Block Mới

## Cấu trúc Thư mục

```
frontend/src/editor/scripts/blocks/
├── basic-blocks.js          # Basic blocks (Text, Button, Image...)
├── site-blocks.js           # Main loader
├── README.md                # File này
│
└── categories/
    ├── index.js             # Export & register tất cả categories
    │
    ├── hero-section/        # Hero Section blocks
    │   ├── index.js
    │   ├── hero-1.js
    │   ├── hero-2.js        # (thêm sau)
    │   └── ...
    │
    ├── feature-section/     # Feature Section blocks (thêm sau)
    │   ├── index.js
    │   └── feature-1.js
    │
    └── cta-section/         # CTA Section blocks (thêm sau)
        ├── index.js
        └── cta-1.js
```

---

## 1. Thêm Block Mới (cùng Category)

**Ví dụ:** Thêm `hero-2` vào category "Hero Section"

### Bước 1: Tạo file block

Tạo file `categories/hero-section/hero-2.js`:

```javascript
/**
 * Hero 2 - Simple Centered
 * 
 * Mô tả ngắn về block này
 */

export const hero2 = {
    id: 'hero-2',
    label: 'Hero 2 - Simple',
    category: 'Hero Section',
    
    // Icon hiển thị trong Block Manager (SVG hoặc HTML)
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="4" y="8" width="16" height="2" rx="0.5"/>
        <rect x="6" y="12" width="12" height="1" rx="0.5"/>
        <rect x="8" y="15" width="8" height="2" rx="1"/>
    </svg>`,
    
    // HTML content của block
    content: `
        <section class="pm-hero-2">
            <style>
                /* CSS cho block - sử dụng class prefix pm-hero-2 */
                .pm-hero-2 {
                    padding: 80px 20px;
                    text-align: center;
                    background: #f9fafb;
                }
                .pm-hero-2 .hero-title {
                    font-size: 3rem;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 1rem 0;
                }
                .pm-hero-2 .hero-subtitle {
                    font-size: 1.25rem;
                    color: #6b7280;
                    margin: 0 0 2rem 0;
                }
                .pm-hero-2 .hero-btn {
                    display: inline-block;
                    padding: 12px 24px;
                    background: #4f46e5;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                }
                .pm-hero-2 .hero-btn:hover {
                    background: #4338ca;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .pm-hero-2 {
                        padding: 60px 16px;
                    }
                    .pm-hero-2 .hero-title {
                        font-size: 2rem;
                    }
                }
            </style>
            
            <h1 class="hero-title">Your Amazing Headline</h1>
            <p class="hero-subtitle">A short description that explains your value proposition</p>
            <a href="#" class="hero-btn">Get Started</a>
        </section>
    `
}
```

### Bước 2: Export trong index.js

Mở file `categories/hero-section/index.js` và thêm:

```javascript
import { hero1 } from './hero-1.js'
import { hero2 } from './hero-2.js'  // ← Thêm import

export const heroBlocks = [
    hero1,
    hero2,  // ← Thêm vào array
]

export const categoryInfo = {
    name: 'Hero Section',
    order: 1,
}
```

### Bước 3: Done!

Refresh editor, block mới sẽ xuất hiện trong category "Hero Section".

---

## 2. Thêm Category Mới

**Ví dụ:** Thêm category "Feature Section"

### Bước 1: Tạo thư mục và files

```bash
mkdir -p categories/feature-section
```

Tạo file `categories/feature-section/feature-1.js`:

```javascript
export const feature1 = {
    id: 'feature-1',
    label: 'Feature 1 - Grid',
    category: 'Feature Section',
    media: `<svg>...</svg>`,
    content: `<section class="pm-feature-1">...</section>`
}
```

Tạo file `categories/feature-section/index.js`:

```javascript
import { feature1 } from './feature-1.js'

export const featureBlocks = [
    feature1,
]

export const categoryInfo = {
    name: 'Feature Section',
    order: 2,  // Thứ tự hiển thị (sau Hero Section)
}
```

### Bước 2: Đăng ký category

Mở file `categories/index.js` và thêm:

```javascript
import { heroBlocks, categoryInfo as heroCategory } from './hero-section/index.js'
import { featureBlocks, categoryInfo as featureCategory } from './feature-section/index.js'  // ← Thêm

export const categories = [
    { ...heroCategory, blocks: heroBlocks },
    { ...featureCategory, blocks: featureBlocks },  // ← Thêm
]
```

### Bước 3: Done!

Category mới xuất hiện trong Block Manager.

---

## 3. Quy tắc Đặt tên

| Loại | Quy tắc | Ví dụ |
|------|---------|-------|
| **Folder** | kebab-case | `hero-section/`, `feature-section/` |
| **File** | kebab-case + số | `hero-1.js`, `hero-2.js` |
| **Block ID** | kebab-case | `hero-1`, `feature-grid-3` |
| **CSS Class** | prefix `pm-` + block id | `.pm-hero-1`, `.pm-feature-1` |
| **Export name** | camelCase | `hero1`, `featureGrid3` |

---

## 4. Cấu trúc Block Object

```javascript
export const blockName = {
    // BẮT BUỘC
    id: 'unique-block-id',      // ID duy nhất, dùng cho BlockManager
    label: 'Display Name',       // Tên hiển thị trong UI
    category: 'Category Name',   // Tên category
    content: `<html>...</html>`, // HTML content
    
    // TÙY CHỌN
    media: `<svg>...</svg>`,     // Icon (SVG hoặc HTML)
    attributes: { class: '...' }, // Attributes cho block element
}
```

---

## 5. Best Practices

### CSS
- **Luôn dùng class prefix**: `.pm-hero-1`, `.pm-feature-2` để tránh conflict
- **Inline styles trong `<style>` tag**: Giữ CSS trong block, không phụ thuộc file ngoài
- **Mobile-first responsive**: Viết CSS cho mobile trước, dùng `@media (min-width: ...)` cho desktop

### HTML
- **Semantic tags**: Dùng `<section>`, `<header>`, `<nav>`, `<article>` đúng ngữ nghĩa
- **Accessible**: Thêm `alt` cho images, `aria-label` khi cần
- **Editable content**: Text nên ở trong các tag có thể edit (h1, p, span, a...)

### Tổ chức
- **1 block = 1 file**: Dễ quản lý, dễ tìm
- **Comment mô tả**: Thêm comment ở đầu file mô tả block làm gì
- **Giữ đơn giản**: Mỗi block nên làm 1 việc, không quá phức tạp

---

## 6. Convert từ Tailwind CSS

Khi convert component từ Tailwind:

1. **Loại bỏ Tailwind classes** → Viết CSS thuần
2. **Loại bỏ dark mode** (`dark:...`) → Chỉ giữ light mode
3. **Loại bỏ interactive elements** phức tạp (dropdown, modal) → Không hoạt động trong editor
4. **Giữ lại structure** và responsive breakpoints

**Ví dụ convert:**

```html
<!-- Tailwind (trước) -->
<h1 class="text-5xl font-bold text-gray-900 sm:text-7xl">Title</h1>

<!-- CSS thuần (sau) -->
<style>
    .pm-hero-1 .hero-title {
        font-size: 3rem;
        font-weight: 700;
        color: #111827;
    }
    @media (min-width: 640px) {
        .pm-hero-1 .hero-title {
            font-size: 4.5rem;
        }
    }
</style>
<h1 class="hero-title">Title</h1>
```

---

## 7. Troubleshooting

### Block không xuất hiện
- Kiểm tra console log có error không
- Kiểm tra đã export trong `index.js` chưa
- Kiểm tra ID có bị trùng không

### CSS không apply
- Kiểm tra class prefix có đúng không
- Kiểm tra `<style>` tag có nằm trong content không
- Kiểm tra CSS selector có đúng cấu trúc không

### Block bị vỡ layout
- Kiểm tra có thiếu `box-sizing: border-box` không
- Kiểm tra responsive breakpoints
- Test trên các device sizes khác nhau

---

## 8. Template Nhanh

Copy template này để tạo block mới nhanh:

```javascript
/**
 * [Block Name]
 * 
 * [Mô tả ngắn]
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
                }
                /* Thêm CSS ở đây */
                
                @media (max-width: 768px) {
                    .pm-block-id {
                        padding: 40px 16px;
                    }
                }
            </style>
            
            <!-- HTML content ở đây -->
            <h2>Block Title</h2>
            <p>Block content</p>
        </section>
    `
}
```

---

*Last updated: December 2024*
