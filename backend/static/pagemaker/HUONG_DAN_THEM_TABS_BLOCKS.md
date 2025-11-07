# 📚 HƯỚNG DẪN THÊM TABS VÀO BLOCKS PANEL

## ✅ HOÀN THÀNH - BLOCKS VỚI TABS (GIỐNG STYLES/PROPERTIES)

### 🎯 Thay đổi chính:

1. **Sidebar trái** ✅
   - CHỈ 1 button "Blocks" (icon: `fa-th-large`)
   - Click để mở/đóng panel blocks

2. **Left Panel có 2 Tabs** ✅ (Giống Right Panel)
   - Tab 1: **Site Blocks** (Blog, Contact, Content, CTA, Commerce, Features, Footer, Gallery, Header, Hero, Testimonials)
   - Tab 2: **Basic Blocks** (Basic, Form, Extra)

3. **Architecture** ✅
   - 1 container duy nhất: `#blocks-container`
   - Tất cả blocks render vào cùng 1 nơi
   - Filter bằng CSS `display: none/block` theo tab active
   - **Render ONCE:** Chỉ render blocks 1 lần đầu tiên khi mở panel
   - **Lưu trạng thái:** Đóng/mở panel không re-render, chỉ toggle CSS
   - KHÔNG re-render khi switch tabs → Tránh lỗi drag & drop

---

## 📝 CÁCH THÊM MỚI BLOCKS VÀO HỆ THỐNG

### Option 1: Thêm vào Site Blocks (Custom Blocks)

**File:** `/backend/static/pagemaker/custom-blocks/index.js`

```javascript
export default (editor) => {
    const bm = editor.BlockManager;
    
    // Thêm block mới vào category có sẵn
    bm.add('my-custom-block', {
        label: 'My Block',
        category: 'Blog', // Hoặc: Contact, Content, CTA, etc.
        media: '<i class="fas fa-star"></i>',
        content: '<div>Custom content here</div>',
    });
};
```

### Option 2: Thêm vào Basic Blocks

**File:** `/backend/static/pagemaker/basic-blocks/index.js`

```javascript
export default (editor) => {
    const bm = editor.BlockManager;
    
    // Thêm block vào category Basic, Form, hoặc Extra
    bm.add('my-basic-block', {
        label: 'My Block',
        category: 'Basic', // Hoặc: Form, Extra
        media: '<i class="fas fa-cube"></i>',
        content: '<div>Basic block content</div>',
    });
};
```

---

## 🎨 CÁCH THÊM TAB MỚI (VÍ DỤ: "PREMIUM BLOCKS")

### Bước 1: Thêm Tab Button vào HTML

**File:** `/backend/templates/editor_pagemaker_v2.html`

Tìm section:
```html
<div class="left-panel-tabs">
```

Thêm button mới:
```html
<button class="left-panel-tab" data-tab="premium-blocks">
    <i class="fas fa-gem"></i> Premium Blocks
</button>
```

### Bước 2: Thêm Categories vào JavaScript

Tìm đoạn:
```javascript
const SITE_CATEGORIES = ['Blog', 'Contact', ...];
const BASIC_CATEGORIES = ['Basic', 'Form', 'Extra'];
```

Thêm:
```javascript
const PREMIUM_CATEGORIES = ['Premium', 'Pro', 'VIP'];
```

### Bước 3: Update Filter Function

Tìm function:
```javascript
function filterBlocksByTab(tabName) {
```

Sửa thành:
```javascript
function filterBlocksByTab(tabName) {
    let categories;
    
    switch(tabName) {
        case 'site-blocks':
            categories = SITE_CATEGORIES;
            break;
        case 'basic-blocks':
            categories = BASIC_CATEGORIES;
            break;
        case 'premium-blocks':
            categories = PREMIUM_CATEGORIES;
            break;
        default:
            categories = SITE_CATEGORIES;
    }
    
    const blockCategories = document.querySelectorAll('#blocks-container .gjs-block-category');
    
    blockCategories.forEach(categoryEl => {
        const titleEl = categoryEl.querySelector('.gjs-title');
        if (!titleEl) return;
        
        const categoryName = titleEl.textContent.trim();
        const shouldShow = categories.includes(categoryName);
        
        categoryEl.style.display = shouldShow ? 'block' : 'none';
    });
}
```

### Bước 4: Tạo File Blocks Mới

**File:** `/backend/static/pagemaker/premium-blocks/index.js`

```javascript
export default (editor) => {
    const bm = editor.BlockManager;
    
    // Premium category blocks
    bm.add('premium-hero', {
        label: 'Premium Hero',
        category: 'Premium',
        media: '<i class="fas fa-gem"></i>',
        content: '<div class="premium-hero">Premium Hero Section</div>',
    });
    
    console.log('✅ Premium Blocks loaded!');
};
```

### Bước 5: Load Premium Blocks System

Tìm section:
```javascript
// ===== Load Block Systems =====
```

Thêm:
```javascript
// 3. Load Premium Blocks System
import('/static/pagemaker/premium-blocks/index.js')
    .then(module => {
        module.default(editor);
        console.log('✅ Premium Blocks System loaded');
    })
    .catch(err => {
        console.warn('⚠️ Premium Blocks not available:', err);
    });
```

---

## ⚠️ LƯU Ý QUAN TRỌNG - TRÁNH LỖI

### ❌ KHÔNG LÀM:

1. **KHÔNG render blocks vào nhiều containers**
   ```javascript
   // ❌ SAI - Gây lỗi "element is not removable"
   bm.render(blocks, { appendTo: '#container-1' });
   bm.render(blocks, { appendTo: '#container-2' });
   ```

2. **KHÔNG xóa/re-render khi switch tabs**
   ```javascript
   // ❌ SAI - Phá vỡ drag & drop
   container.innerHTML = '';
   renderBlocksAgain();
   ```

3. **KHÔNG dùng nhiều tabs content containers**
   ```html
   <!-- ❌ SAI -->
   <div id="site-blocks-tab"></div>
   <div id="basic-blocks-tab"></div>
   ```

### ✅ ĐÚNG:

1. **CHỈ 1 container duy nhất**
   ```javascript
   blockManager: {
       appendTo: '#blocks-container', // Chỉ 1 container
       custom: true,
   }
   ```

2. **Filter bằng CSS, KHÔNG re-render**
   ```javascript
   // ✅ ĐÚNG - Chỉ ẩn/hiện bằng CSS
   function filterBlocksByTab(tabName) {
       blockCategories.forEach(categoryEl => {
           categoryEl.style.display = shouldShow ? 'block' : 'none';
       });
   }
   ```

3. **Render tất cả blocks 1 lần duy nhất**
   ```javascript
   // ✅ ĐÚNG - Load tất cả blocks vào 1 container
   import('/static/pagemaker/custom-blocks/index.js').then(...)
   import('/static/pagemaker/basic-blocks/index.js').then(...)
   // Sau đó chỉ filter bằng CSS
   ```

---

## 🔧 CẤU TRÚC FILE

```
backend/
├── static/pagemaker/
│   ├── basic-blocks/
│   │   └── index.js          # Basic blocks (Basic, Form, Extra)
│   ├── custom-blocks/
│   │   └── index.js          # Site blocks (Blog, Contact, etc.)
│   └── HUONG_DAN_THEM_TABS_BLOCKS.md
└── templates/
    └── editor_pagemaker_v2.html  # Main editor với tabs logic
```

---

## 🎯 KIẾN TRÚC HOẠT ĐỘNG

```
┌─────────────────────────────────────┐
│  Left Panel                         │
├─────────────────────────────────────┤
│  [Site Blocks] [Basic Blocks]       │ ← Tabs (chỉ toggle CSS)
├─────────────────────────────────────┤
│  #blocks-container                  │ ← 1 container duy nhất
│  ┌─────────────────────────────┐   │
│  │ Category: Blog (display:?)  │   │ ← Hiện/ẩn theo tab
│  │ Category: Basic (display:?) │   │
│  │ Category: Contact (display:?)│  │
│  │ Category: Form (display:?)  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Flow hoạt động:

1. **Page Load (First Time):**
   - Load `custom-blocks/index.js` → Thêm Site Blocks vào BlockManager
   - Load `basic-blocks/index.js` → Thêm Basic Blocks vào BlockManager
   - BlockManager tự render TẤT CẢ blocks vào `#blocks-container`
   - Apply filter: Hiện Site Blocks, ẩn Basic Blocks (default)
   - Set `blocksRendered = true` và `currentActiveTab = 'site-blocks'`

2. **User Click Tab "Basic Blocks":**
   - JavaScript: `tab.classList.add('active')`
   - Call `filterBlocksByTab('basic-blocks')`
   - Loop qua tất cả `.gjs-block-category`
   - Set `display: none` cho Blog, Contact, etc.
   - Set `display: block` cho Basic, Form, Extra
   - **Update `currentActiveTab = 'basic-blocks'`**

3. **User Close Panel (Click Blocks Button):**
   - `leftPanel.classList.remove('active')` → Panel ẩn (CSS)
   - `currentActiveTab` vẫn giữ giá trị `'basic-blocks'`
   - `blocksRendered = true` (đã render rồi)
   - **DOM blocks vẫn còn nguyên trong container, chỉ bị ẩn bởi CSS**

4. **User Open Panel Lại (Click Blocks Button):**
   - Check: `blocksRendered === true` → **SKIP render**
   - Chỉ: `leftPanel.classList.add('active')` → Panel hiện (CSS)
   - **Blocks đã có filter sẵn từ lần trước**
   - → Hiện ngay Basic Blocks, KHÔNG có flash, KHÔNG re-render

5. **User Drag Block to Canvas:**
   - GrapeJS drag & drop hoạt động bình thường
   - Vì KHÔNG bao giờ re-render → DOM elements giữ nguyên → Event listeners còn nguyên
   - KHÔNG bị lỗi "element is not removable"

---

## 📊 SO SÁNH APPROACH

| Approach | Re-render | Containers | Drag & Drop | Performance | Flash |
|----------|-----------|------------|-------------|-------------|-------|
| ❌ Multiple Containers + Re-render | Có | Nhiều | ❌ Lỗi | Chậm | Có |
| ❌ Single Container + innerHTML | Có | 1 | ❌ Lỗi | Chậm | Có |
| ✅ Single Container + CSS Filter + Render Once | Không | 1 | ✅ OK | Nhanh | Không |

---

## 🚀 TỔNG KẾT

### Ưu điểm của solution này:

✅ **Đơn giản:** Chỉ 1 container, filter bằng CSS  
✅ **Ổn định:** KHÔNG re-render → Drag & drop luôn work  
✅ **Dễ mở rộng:** Thêm tab mới chỉ cần thêm categories list  
✅ **Performance tốt:** Không có DOM manipulation khi toggle panel  
✅ **Giống Right Panel:** Cùng architecture với Styles/Properties tabs  
✅ **Nhớ trạng thái:** Đóng/mở panel vẫn giữ nguyên tab và filter  
✅ **Không flash:** Mở panel không thấy blocks cũ rồi mới chuyển  

### Nguyên tắc vàng:

> **"Render once on first open, filter with CSS, never re-render, remember everything"**

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Cannot drag blocks to canvas"
**Nguyên nhân:** Re-render phá vỡ event listeners  
**Giải pháp:** Kiểm tra không có `innerHTML = ''` hoặc `removeChild()` trong tab switching logic

### Lỗi: "Blocks không hiện khi switch tab"
**Nguyên nhân:** Categories array không đúng hoặc timing issue  
**Giải pháp:** 
- Check console log: `✅ Initial filter applied`
- Verify category names match exactly (case-sensitive)
- Đảm bảo blocks đã load xong trước khi filter

### Lỗi: "Blocks flash/switch khi mở panel"
**Nguyên nhân:** Re-render blocks mỗi khi toggle panel  
**Giải pháp:** 
- Chỉ render 1 lần đầu tiên: Check `blocksRendered` flag
- Lần sau chỉ toggle CSS `display` của panel
- Filter đã apply sẵn, không cần apply lại

---

Được tạo: 2025-11-07  
Cập nhật: 2025-11-07  
Version: 2.0 (Final - Stable)
