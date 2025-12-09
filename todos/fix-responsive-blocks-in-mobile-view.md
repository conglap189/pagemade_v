# Kế hoạch: Fix Responsive Blocks trong Mobile View

## 1. Mục tiêu (Goal)
Sửa các vấn đề responsive khi chuyển sang mobile view trong PageMade editor:
1. Canvas frame quá nhỏ (320px) - không hiển thị đủ nội dung
2. Navigation tràn - menu items bị cắt, cần hamburger menu
3. Hero text không scale - font-size cần responsive
4. Canvas wrapper cần overflow: auto để scroll được

## 2. Phân tích Hiện trạng

### 2.1 Device Config hiện tại (`pagemade-config.js` lines 112-133)
```javascript
deviceManager: {
    devices: [
        { id: 'desktop', name: 'Desktop', width: '' },
        { id: 'tablet', name: 'Tablet', width: '768px', widthMedia: '768px' },
        { id: 'mobilePortrait', name: 'Mobile', width: '320px', widthMedia: '480px' }
    ]
}
```

**Vấn đề:**
- Mobile width 320px quá nhỏ cho content thực tế (iPhone 5 size)
- Nên tăng lên 375px (iPhone 6/7/8 size) để phù hợp hơn

### 2.2 Blocks hiện tại KHÔNG có responsive styles (`basic-blocks.js`)
- **Navigation block** (lines 289-294): Dùng `flex justify-between`, không có hamburger menu
- **Hero block** (lines 142-156): Font size fixed `3rem`, `1.25rem` - không responsive
- **Footer block** (lines 297-342): Grid layout không collapse trên mobile

### 2.3 CSS trong Canvas (`index.html`)
- Đã xóa `!important` overrides (Phase 2 completed)
- Cần thêm responsive CSS cho blocks trong canvas
- Canvas styles được load từ:
  - Tailwind CSS CDN
  - pagemade.min.css từ backend
  - Font Awesome

## 3. Các bước Thực hiện (Implementation Steps)

### Phase 1: Cập nhật Mobile Device Width
* [x] Tăng Mobile width từ `320px` lên `375px` trong `pagemade-config.js`
* [x] Giữ nguyên `widthMedia: '480px'` để match media queries

### Phase 2: Update Navigation Block với Responsive Styles
* [x] Thêm responsive CSS inline cho navigation
* [x] Ẩn menu items và hiển thị hamburger icon trên mobile
* [x] Sử dụng CSS media query `@media (max-width: 768px)`

### Phase 3: Update Hero Block với Responsive Font Sizes
* [x] Thay đổi từ fixed `font-size: 3rem` sang responsive sizing
* [x] Sử dụng `clamp()` hoặc viewport units (`vw`) cho text
* [x] Giảm padding trên mobile

### Phase 4: Update Footer Block với Responsive Grid
* [x] Thay đổi grid layout để stack columns trên mobile
* [x] Sử dụng explicit grid columns với media queries

### Phase 5: Update Layout Columns Blocks
* [x] Thêm `flex-wrap: wrap` cho layouts
* [x] Columns chuyển thành 100% width trên mobile
* [x] Update 2-columns, 3-columns, 4-columns blocks

### Phase 5b: Update Other Components (Bonus)
* [x] Features Section - responsive grid
* [x] Testimonial - responsive text sizing
* [x] Gallery - responsive grid
* [x] Contact Form - responsive padding/sizing

### Phase 6: Testing
* [x] Test trong editor với device switching Desktop → Tablet → Mobile
* [x] Kiểm tra scroll behavior trong canvas
* [x] Kiểm tra các blocks mới được drop vào canvas

## 7. Completed - Summary

### Files Modified:
1. **`pagemade-config.js`** - Device width 320px → 375px, Navigation with hamburger
2. **`basic-blocks.js`** - All blocks updated with responsive CSS

### Responsive Breakpoints Used:
- Desktop: > 768px (full layout)
- Tablet: 481px - 768px (2 columns, simplified layout)
- Mobile: ≤ 480px (single column, stacked layout)

### Blocks Updated:
- Layout: 2/3/4 Columns with flex-wrap
- Hero: clamp() font sizes
- Features: Grid → 1 column on mobile
- Testimonial: Responsive text + centered author on mobile
- Contact Form: Adjusted padding/sizing
- Gallery: 3 → 2 columns on mobile
- Footer: 4 → 2 → 1 columns on mobile
- Navigation: Hamburger menu on tablet/mobile

## 4. Các file bị ảnh hưởng (Files to be Touched)
* `frontend/src/editor/scripts/config/pagemade-config.js` - Device Manager config (line 129)
* `frontend/src/editor/scripts/blocks/basic-blocks.js` - Block templates với responsive styles

## 5. Approach: Inline Styles với Media Queries
Vì blocks sử dụng inline styles (không phải Tailwind classes), chúng ta cần:
1. Thêm `<style>` tag bên trong block content với media queries
2. Sử dụng unique class names để tránh conflict

**Example:**
```html
<nav class="pm-nav">
  <style>
    @media (max-width: 768px) {
      .pm-nav .menu-items { display: none; }
      .pm-nav .hamburger { display: block; }
    }
  </style>
  <div class="menu-items">...</div>
  <button class="hamburger" style="display: none;">☰</button>
</nav>
```

## 6. Expected Result
- Mobile view hiển thị content phù hợp ở 375px width
- Navigation có hamburger menu trên mobile
- Hero text scale đúng trên các device sizes
- Footer grid collapse thành 1 column trên mobile
- Canvas scroll hoạt động smooth
