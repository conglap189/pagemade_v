# Hướng dẫn Thêm Category Block Mới

Tài liệu này hướng dẫn chi tiết cách thêm một **Block Category** mới vào PageMade Editor.

---

## Mục lục

1. [Tổng quan Cấu trúc](#1-tổng-quan-cấu-trúc)
2. [Các bước Thêm Category Mới](#2-các-bước-thêm-category-mới)
3. [Template Code](#3-template-code)
4. [Ví dụ Thực tế](#4-ví-dụ-thực-tế)
5. [Checklist Kiểm tra](#5-checklist-kiểm-tra)
6. [Lỗi Thường Gặp](#6-lỗi-thường-gặp)

---

## 1. Tổng quan Cấu trúc

### Cấu trúc Thư mục

```
frontend/src/editor/scripts/blocks/
├── site-blocks.js                    # Main loader (KHÔNG CẦN SỬA)
├── categories/
│   ├── index.js                      # Import & register categories (CẦN SỬA)
│   │
│   ├── hero-section/                 # Category 1
│   │   ├── index.js                  # Export blocks + category info
│   │   ├── hero-1.js                 # Block 1
│   │   └── hero-2.js                 # Block 2
│   │
│   ├── footer-section/               # Category 2
│   │   ├── index.js
│   │   └── footer-1.js
│   │
│   └── [your-new-category]/          # Category mới của bạn
│       ├── index.js
│       └── [block-name].js
```

### Luồng Hoạt động

```
site-blocks.js
    └── import từ categories/index.js
            └── import từ [category]/index.js
                    └── import từ [category]/[block].js
```

---

## 2. Các bước Thêm Category Mới

### Bước 1: Tạo Thư mục Category

```bash
# Thay [category-name] bằng tên category của bạn
# Ví dụ: feature-section, cta-section, pricing-section

mkdir frontend/src/editor/scripts/blocks/categories/[category-name]
```

**Quy tắc đặt tên thư mục:**
- Viết thường, dùng dấu gạch ngang `-`
- Kết thúc bằng `-section` để thống nhất
- Ví dụ: `feature-section`, `cta-section`, `testimonial-section`

---

### Bước 2: Tạo File Block

Tạo file block đầu tiên trong thư mục vừa tạo:

```bash
touch frontend/src/editor/scripts/blocks/categories/[category-name]/[block-name].js
```

**Quy tắc đặt tên file block:**
- Tên ngắn gọn + số thứ tự
- Ví dụ: `feature-1.js`, `cta-1.js`, `pricing-1.js`

**Nội dung file block:** (xem [Template Block](#template-block-file) bên dưới)

---

### Bước 3: Tạo File index.js cho Category

Tạo file `index.js` trong thư mục category:

```bash
touch frontend/src/editor/scripts/blocks/categories/[category-name]/index.js
```

**Nội dung file index.js:** (xem [Template Index](#template-category-indexjs) bên dưới)

---

### Bước 4: Đăng ký Category vào Main Index

Mở file `frontend/src/editor/scripts/blocks/categories/index.js` và thêm:

**4.1. Thêm import ở đầu file:**

```javascript
import { [categoryName]Blocks, categoryInfo as [categoryName]Category } from './[category-folder]/index.js'
```

**4.2. Thêm vào array `categories`:**

```javascript
export const categories = [
    // ... các category cũ ...
    
    {
        ...[categoryName]Category,
        blocks: [categoryName]Blocks,
    },
]
```

---

## 3. Template Code

### Template Block File

File: `[category-name]/[block-name].js`

```javascript
/**
 * [Block Name] - [Mô tả ngắn]
 * 
 * [Mô tả chi tiết về block này]
 */

export const [blockVariableName] = {
    // ID duy nhất cho block (kebab-case)
    id: '[category]-[number]',
    
    // Label hiển thị trong Block Manager
    label: '[Tên hiển thị]',
    
    // Category name (phải trùng với categoryInfo.name)
    category: '[Category Name]',
    
    // Icon SVG (24x24 viewBox)
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <!-- SVG path ở đây -->
        <rect x="2" y="2" width="20" height="20" rx="2"/>
    </svg>`,
    
    // HTML content của block
    content: `
        <section class="pm-[block-id]">
            <style>
                /* CSS scoped cho block này */
                .pm-[block-id] {
                    /* styles */
                }
            </style>
            
            <!-- HTML content -->
            <div class="container">
                <h2>Your Content Here</h2>
            </div>
        </section>
    `
}
```

---

### Template Category index.js

File: `[category-name]/index.js`

```javascript
/**
 * [Category Name] Blocks
 * 
 * Export tất cả blocks từ thư mục này.
 * Khi thêm block mới, chỉ cần:
 * 1. Tạo file [block-name].js
 * 2. Import và thêm vào array bên dưới
 */

import { [block1] } from './[block-1].js'
// import { [block2] } from './[block-2].js'  // Uncomment khi thêm

// Export tất cả blocks
export const [categoryName]Blocks = [
    [block1],
    // [block2],  // Uncomment khi thêm
]

// Category info
export const categoryInfo = {
    name: '[Category Display Name]',  // Tên hiển thị trong Block Manager
    order: [number],                   // Thứ tự hiển thị (1, 2, 3...)
}
```

---

## 4. Ví dụ Thực tế

### Ví dụ: Thêm "CTA Section" Category

#### Bước 1: Tạo thư mục

```bash
mkdir frontend/src/editor/scripts/blocks/categories/cta-section
```

#### Bước 2: Tạo file `cta-1.js`

```javascript
/**
 * CTA 1 - Simple CTA
 * 
 * Call-to-action section với heading và button
 */

export const cta1 = {
    id: 'cta-1',
    label: 'CTA 1 - Simple',
    category: 'CTA Section',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="8" width="18" height="8" rx="2"/>
        <line x1="7" y1="12" x2="17" y2="12"/>
    </svg>`,
    content: `
        <section class="pm-cta-1">
            <style>
                .pm-cta-1 {
                    padding: 80px 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    text-align: center;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                .pm-cta-1 * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                .pm-cta-1 .cta-container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .pm-cta-1 .cta-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #ffffff;
                    margin-bottom: 1rem;
                }
                .pm-cta-1 .cta-description {
                    font-size: 1.25rem;
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 2rem;
                }
                .pm-cta-1 .cta-button {
                    display: inline-block;
                    padding: 16px 32px;
                    background: #ffffff;
                    color: #667eea;
                    font-size: 1rem;
                    font-weight: 600;
                    text-decoration: none;
                    border-radius: 8px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .pm-cta-1 .cta-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                }
            </style>
            
            <div class="cta-container">
                <h2 class="cta-title">Ready to Get Started?</h2>
                <p class="cta-description">Join thousands of satisfied customers and transform your business today.</p>
                <a href="#" class="cta-button">Start Free Trial</a>
            </div>
        </section>
    `
}
```

#### Bước 3: Tạo file `index.js`

```javascript
/**
 * CTA Section Blocks
 * 
 * Export tất cả CTA blocks từ thư mục này.
 */

import { cta1 } from './cta-1.js'
// import { cta2 } from './cta-2.js'

export const ctaBlocks = [
    cta1,
    // cta2,
]

export const categoryInfo = {
    name: 'CTA Section',
    order: 3,
}
```

#### Bước 4: Đăng ký vào main index

Mở `frontend/src/editor/scripts/blocks/categories/index.js`:

```javascript
// Thêm import
import { heroBlocks, categoryInfo as heroCategory } from './hero-section/index.js'
import { footerBlocks, categoryInfo as footerCategory } from './footer-section/index.js'
import { ctaBlocks, categoryInfo as ctaCategory } from './cta-section/index.js'  // THÊM DÒNG NÀY

// Thêm vào array
export const categories = [
    {
        ...heroCategory,
        blocks: heroBlocks,
    },
    {
        ...footerCategory,
        blocks: footerBlocks,
    },
    {
        ...ctaCategory,       // THÊM BLOCK NÀY
        blocks: ctaBlocks,
    },
]
```

---

## 5. Checklist Kiểm tra

Trước khi test, hãy kiểm tra:

### File Block (`[block-name].js`)

- [ ] `export const [name]` - Có export variable
- [ ] `id` - Unique, kebab-case (vd: `cta-1`)
- [ ] `label` - Có giá trị
- [ ] `category` - Trùng với `categoryInfo.name`
- [ ] `media` - SVG hợp lệ (có `viewBox`)
- [ ] `content` - HTML string (dùng backticks `` ` ``)
- [ ] CSS class có prefix `pm-[block-id]` để tránh conflict

### File Category Index (`index.js`)

- [ ] Import đúng tên variable từ block files
- [ ] Export `[category]Blocks` là array
- [ ] Export `categoryInfo` object với `name` và `order`
- [ ] Có dấu phẩy `,` sau mỗi property

### File Main Index (`categories/index.js`)

- [ ] Import đúng path và tên variable
- [ ] Thêm object mới vào array `categories`
- [ ] Có dấu phẩy `,` sau mỗi object

---

## 6. Lỗi Thường Gặp

### Lỗi 1: Block không hiển thị

**Nguyên nhân:** Quên đăng ký category vào main index

**Cách sửa:** Kiểm tra file `categories/index.js`:
- Có import category không?
- Có thêm vào array `categories` không?

---

### Lỗi 2: SyntaxError khi load

**Nguyên nhân:** Thiếu dấu phẩy trong object/array

**Ví dụ lỗi:**
```javascript
// SAI - thiếu dấu phẩy
export const categoryInfo = {
    name: 'CTA Section'   // <-- Thiếu dấu phẩy ở đây!
    order: 3,
}
```

**Cách sửa:**
```javascript
// ĐÚNG
export const categoryInfo = {
    name: 'CTA Section',  // <-- Có dấu phẩy
    order: 3,
}
```

---

### Lỗi 3: Category hiện nhưng block bị trống

**Nguyên nhân:** File block trống hoặc không export đúng

**Cách kiểm tra:**
1. Mở file block, kiểm tra có `export const [name]` không
2. Kiểm tra tên export có trùng với import trong index.js không

---

### Lỗi 4: Icon không hiển thị

**Nguyên nhân:** SVG không hợp lệ

**Cách sửa:** Đảm bảo SVG có:
- `viewBox="0 0 24 24"`
- `fill="none"` hoặc `fill="currentColor"`
- `stroke="currentColor"`

---

### Lỗi 5: CSS bị conflict với block khác

**Nguyên nhân:** Không dùng prefix cho CSS class

**Cách sửa:** Luôn dùng prefix `pm-[block-id]`:
```css
/* SAI */
.cta-title { ... }

/* ĐÚNG */
.pm-cta-1 .cta-title { ... }
```

---

## Quick Reference

```
# Lệnh tạo category mới
mkdir frontend/src/editor/scripts/blocks/categories/[name]-section
touch frontend/src/editor/scripts/blocks/categories/[name]-section/index.js
touch frontend/src/editor/scripts/blocks/categories/[name]-section/[name]-1.js

# Files cần sửa
1. [name]-section/[name]-1.js     # Tạo block content
2. [name]-section/index.js        # Export blocks + category info
3. categories/index.js            # Đăng ký category
```

---

## Tài liệu Liên quan

- [REFACTORING_RULES.md](./REFACTORING_RULES.md) - Quy tắc refactor code
- [GRAPESJS_CUSTOMIZE_GUIDE.md](./GRAPESJS_CUSTOMIZE_GUIDE.md) - Tùy chỉnh GrapesJS

---

*Last updated: December 2024*
