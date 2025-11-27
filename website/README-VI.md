# 🚀 Hướng dẫn nhanh - Startup Next.js Template

## 📦 Cài đặt

```bash
# 1. Cài dependencies
npm install

# 2. Chạy development server
npm run dev

# 3. Mở trình duyệt
# http://localhost:3000
```

## 📁 Các file quan trọng để chỉnh sửa

| File | Mục đích |
|------|----------|
| `src/components/Header/menuData.tsx` | **Thêm/sửa menu items** (Home, About, Blog...) |
| `src/components/Header/index.tsx` | Màu buttons, style dropdown |
| `src/components/Hero/index.tsx` | Banner trang chủ (tiêu đề, mô tả, button) |
| `src/styles/index.css` | Màu primary chính của website |
| `public/images/` | Logo, ảnh hero |

## ✏️ Chỉnh sửa thường dùng

### 1️⃣ Thay đổi menu navigation

**File:** `src/components/Header/menuData.tsx`

```typescript
const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",        // ← Đổi tên
    path: "/",            // ← Đổi link
    newTab: false,
  },
  // Thêm menu mới...
];
```

### 2️⃣ Đổi màu primary

**File:** `src/styles/index.css` (dòng 21)

```css
--color-primary: #4a6cf7;  /* Đổi mã màu hex */
```

### 3️⃣ Sửa nội dung hero

**File:** `src/components/Hero/index.tsx`

```tsx
<h1>Next.js Boilerplate for Your Startup</h1>  {/* Đổi tiêu đề */}
<p>Handcrafted Next.js starter...</p>          {/* Đổi mô tả */}
```

## 📚 Hướng dẫn chi tiết

- **`HUONG-DAN-CHINH-SUA.md`** - Hướng dẫn tổng quan (menu, màu sắc, layout)
- **`HUONG-DAN-BUTTONS.md`** - Hướng dẫn chi tiết về buttons ⭐
  - Cách thêm/sửa buttons
  - Fix lỗi button bị thu hẹp
  - Thêm icons vào buttons
  - Copy/paste templates

## 🛠️ Scripts

```bash
npm run dev      # Chạy development (có hot reload)
npm run build    # Build production
npm run start    # Chạy production server
npm run lint     # Check lỗi code
```

## 📖 Cấu trúc thư mục

```
src/
├── app/              # Pages (Next.js App Router)
│   ├── page.tsx      # Trang chủ
│   ├── about/        # Trang About
│   └── blog/         # Trang Blog
├── components/       # Components tái sử dụng
│   ├── Header/       # Header + Menu
│   ├── Hero/         # Banner chính
│   ├── Footer/       # Footer
│   └── ...
└── styles/           # CSS toàn cục
    └── index.css     # Theme colors

public/
└── images/           # Ảnh static
    ├── logo/
    └── hero/
```

## 🎨 UI hiện tại

- ✅ Header với menu căn giữa (Home, About, Blog, Support, Pages)
- ✅ Dropdown menu Pages với shadow đẹp
- ✅ Sign In button (màu xanh nhạt) + Sign Up button (màu đen)
- ✅ Hero section 2 columns (text trái, ảnh phải)
- ✅ Responsive design (mobile + desktop)
- ✅ Dark mode support

## 🆘 Cần giúp?

1. Đọc file `HUONG-DAN-CHINH-SUA.md`
2. Check terminal nếu có lỗi
3. Google error message
4. Clear cache browser: `Ctrl + Shift + R`

---

**Tech Stack:** Next.js 15 • React 19 • TypeScript • Tailwind CSS 4
