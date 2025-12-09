# Hướng dẫn: Thêm Category "3. Content" vào Site Blocks

## Tổng quan

Hướng dẫn này sẽ giúp bạn thêm một category mới **"3. Content"** vào Site Blocks trong PageMade Editor.

### Cấu trúc thư mục sau khi hoàn thành:
```
frontend/src/editor/scripts/blocks/categories/
├── hero-section/
│   ├── index.js
│   └── hero-1.js
├── footer-section/
│   ├── index.js
│   └── footer-1.js
├── content-section/        ← THƯ MỤC MỚI
│   ├── index.js            ← FILE MỚI
│   └── content-1.js        ← FILE MỚI
├── index.js                ← CHỈNH SỬA
└── HOW_TO_ADD_CATEGORY.md
```

---

## Bước 1: Tạo thư mục `content-section/`

Chạy lệnh trong terminal:

```bash
mkdir -p frontend/src/editor/scripts/blocks/categories/content-section
```

---

## Bước 2: Tạo file `index.js` cho category

Tạo file: `frontend/src/editor/scripts/blocks/categories/content-section/index.js`

```javascript
/**
 * Content Section Blocks
 * 
 * Export tất cả content blocks từ thư mục này.
 * Khi thêm content mới, chỉ cần:
 * 1. Tạo file content-X.js
 * 2. Import và thêm vào array bên dưới
 */

import { content1 } from './content-1.js'
// import { content2 } from './content-2.js'  // Uncomment khi thêm
// import { content3 } from './content-3.js'  // Uncomment khi thêm

// Export tất cả content blocks
export const contentBlocks = [
    content1,
    // content2,  // Uncomment khi thêm
    // content3,  // Uncomment khi thêm
]

// Category info
export const categoryInfo = {
    name: '3. Content',
    order: 3,  // Thứ tự hiển thị trong Block Manager
}
```

---

## Bước 3: Tạo file `content-1.js` (Block đầu tiên)

Tạo file: `frontend/src/editor/scripts/blocks/categories/content-section/content-1.js`

```javascript
/**
 * Content 1 - Simple Content Block
 * 
 * Basic content section with:
 * - Title
 * - Description text
 * - Optional image
 */

export const content1 = {
    id: 'content-1',
    label: 'Content 1 - Simple',
    category: '3. Content',  // QUAN TRỌNG: Phải khớp với categoryInfo.name
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="7" y1="8" x2="17" y2="8"/>
        <line x1="7" y1="12" x2="17" y2="12"/>
        <line x1="7" y1="16" x2="13" y2="16"/>
    </svg>`,
    content: `
        <section class="pm-content-1">
            <style>
                .pm-content-1 {
                    background: #ffffff;
                    font-family: system-ui, -apple-system, sans-serif;
                    padding: 4rem 1.5rem;
                }
                .pm-content-1 * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                .pm-content-1 .content-container {
                    max-width: 48rem;
                    margin: 0 auto;
                }
                .pm-content-1 .content-title {
                    font-size: 2.25rem;
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 1.5rem;
                    line-height: 1.2;
                }
                .pm-content-1 .content-text {
                    font-size: 1.125rem;
                    line-height: 1.75;
                    color: #4b5563;
                }
                .pm-content-1 .content-text p {
                    margin-bottom: 1rem;
                }
                .pm-content-1 .content-text p:last-child {
                    margin-bottom: 0;
                }
                @media (min-width: 768px) {
                    .pm-content-1 {
                        padding: 6rem 2rem;
                    }
                    .pm-content-1 .content-title {
                        font-size: 3rem;
                    }
                }
            </style>
            
            <div class="content-container">
                <h2 class="content-title">Your Content Title Here</h2>
                <div class="content-text">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </div>
            </div>
        </section>
    `
}
```

---

## Bước 4: Đăng ký category trong `categories/index.js`

Chỉnh sửa file: `frontend/src/editor/scripts/blocks/categories/index.js`

### 4.1. Thêm import ở đầu file:

```javascript
import { heroBlocks, categoryInfo as heroCategory } from './hero-section/index.js'
import { footerBlocks, categoryInfo as footerCategory} from './footer-section/index.js'
import { contentBlocks, categoryInfo as contentCategory } from './content-section/index.js'  // ← THÊM DÒNG NÀY
```

### 4.2. Thêm category vào array `categories`:

```javascript
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
        ...contentCategory,      // ← THÊM BLOCK NÀY
        blocks: contentBlocks,
    },
]
```

---

## Kết quả

Sau khi hoàn thành, UI Block Manager sẽ hiển thị:

```
Site Blocks
├── 1. Hero Section
│   └── Hero 1 - With Header
├── 2. Footer Section
│   └── Footer 1 - Simple
└── 3. Content              ← MỚI
    └── Content 1 - Simple
```

---

## Thêm block mới vào category Content

Khi muốn thêm block mới (ví dụ: `content-2.js`):

### 1. Tạo file `content-2.js`:

```javascript
export const content2 = {
    id: 'content-2',
    label: 'Content 2 - With Image',
    category: '3. Content',
    media: `<svg>...</svg>`,
    content: `<section>...</section>`
}
```

### 2. Import trong `content-section/index.js`:

```javascript
import { content1 } from './content-1.js'
import { content2 } from './content-2.js'  // ← Thêm import

export const contentBlocks = [
    content1,
    content2,  // ← Thêm vào array
]
```

---

## Lưu ý quan trọng

1. **`category` trong block PHẢI khớp với `categoryInfo.name`**
   - Nếu `categoryInfo.name = '3. Content'`
   - Thì block phải có `category: '3. Content'`

2. **Số thứ tự `order` quyết định vị trí hiển thị**
   - `order: 1` → Hiển thị đầu tiên
   - `order: 2` → Hiển thị thứ hai
   - `order: 3` → Hiển thị thứ ba

3. **Tên file nên theo format**: `content-X.js` (X = 1, 2, 3...)

4. **Class CSS nên có prefix**: `pm-content-X` để tránh conflict

---

## Checklist

- [ ] Tạo thư mục `content-section/`
- [ ] Tạo file `content-section/index.js`
- [ ] Tạo file `content-section/content-1.js`
- [ ] Import category trong `categories/index.js`
- [ ] Thêm category vào array `categories`
- [ ] Refresh editor và kiểm tra
