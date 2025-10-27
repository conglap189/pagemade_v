# 📖 Hướng dẫn tự chỉnh sửa giao diện

## 🎯 Menu Navigation (Home, About, Blog, Support, Pages)

### 📍 Vị trí file:
```
src/components/Header/menuData.tsx
```

### ✏️ Cách chỉnh sửa:

**1. Thêm/Xóa/Sửa menu items:**

Mở file `src/components/Header/menuData.tsx`:

```typescript
const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",           // ← Đổi tên menu
    path: "/",               // ← Đổi đường dẫn
    newTab: false,           // true = mở tab mới
  },
  {
    id: 2,
    title: "About",
    path: "/about",
    newTab: false,
  },
  // ... thêm menu mới ở đây
];
```

**2. Thêm menu mới:**

```typescript
{
  id: 5,                     // ID unique (không trùng)
  title: "Portfolio",        // Tên hiển thị
  path: "/portfolio",        // URL path
  newTab: false,
},
```

**3. Thêm dropdown submenu:**

```typescript
{
  id: 4,
  title: "Pages",
  newTab: false,
  submenu: [                 // ← Thêm submenu array
    {
      id: 41,
      title: "About Page",
      path: "/about",
      newTab: false,
    },
    {
      id: 42,
      title: "Contact",
      path: "/contact",
      newTab: false,
    },
  ],
},
```

---

## 🎨 Màu sắc buttons (Sign In / Sign Up)

### 📍 Vị trí:
```
src/components/Header/index.tsx
```

Tìm dòng ~167-180 (phần buttons):

**Sign In button:**
```tsx
className="hidden rounded-lg bg-primary/10 px-7 py-3 text-base font-medium text-primary transition duration-300 hover:bg-primary/20 ..."
```

- `bg-primary/10` = background màu primary opacity 10%
- `text-primary` = text màu primary
- `hover:bg-primary/20` = hover đổi sang opacity 20%

**Sign Up button:**
```tsx
className="hidden rounded-lg bg-black px-8 py-3 text-base font-medium text-white transition duration-300 hover:bg-black/80 ..."
```

- `bg-black` = background đen
- `text-white` = text trắng
- `hover:bg-black/80` = hover đổi sang đen opacity 80%

**Đổi màu khác:**
- Màu xanh: `bg-blue-500`
- Màu đỏ: `bg-red-500`
- Màu xanh lá: `bg-green-500`
- Custom: `bg-primary` (màu trong theme)

---

## 🎨 Màu chữ menu items

### 📍 Vị trí:
```
src/components/Header/index.tsx
```

Tìm dòng ~110 (phần menu Link):

```tsx
className={`flex py-2 text-base font-medium ... ${
  usePathName === menuItem.path
    ? "text-primary dark:text-white"           // ← Màu khi active
    : "text-body-color hover:text-primary ..."  // ← Màu bình thường
}`}
```

**Các biến màu sẵn có:**
- `text-primary` - màu primary (#4a6cf7)
- `text-body-color` - màu xám nhạt (#788293)
- `text-dark` - màu đen
- `text-white` - màu trắng
- `text-gray-500` - xám Tailwind

---

## 🎨 Style dropdown (Pages menu)

### 📍 Vị trí:
```
src/components/Header/index.tsx
```

Tìm dòng ~145 (phần dropdown):

```tsx
className={`submenu ... rounded-lg bg-white ... lg:shadow-[0_10px_40px_rgba(0,0,0,0.08)] ...`}
```

**Thay đổi shadow:**
- `lg:shadow-lg` - shadow nhỏ
- `lg:shadow-xl` - shadow vừa
- `lg:shadow-2xl` - shadow lớn
- `lg:shadow-[0_10px_40px_rgba(0,0,0,0.08)]` - custom shadow

**Thay đổi background:**
- `bg-white` - nền trắng
- `bg-gray-50` - nền xám nhạt
- `bg-blue-50` - nền xanh nhạt

**Items trong dropdown (dòng ~160):**
```tsx
className="block rounded-md px-4 py-2.5 text-sm font-medium text-body-color hover:bg-gray-50 hover:text-primary ..."
```

---

## 🎨 Màu primary chính của website

### 📍 Vị trí:
```
src/styles/index.css
```

Tìm dòng ~21:

```css
--color-primary: #4a6cf7;  /* ← Đổi mã màu hex này */
```

**Ví dụ màu khác:**
- Xanh dương đậm: `#2563eb`
- Xanh lá: `#10b981`
- Tím: `#8b5cf6`
- Cam: `#f97316`
- Hồng: `#ec4899`

---

## 📝 Hero Section (Banner chính)

### 📍 Vị trí:
```
src/components/Hero/index.tsx
```

**Thay đổi tiêu đề:**
Dòng ~23:
```tsx
<h1 className="...">
  Next.js Boilerplate for Your Startup  {/* ← Đổi text ở đây */}
</h1>
```

**Thay đổi mô tả:**
Dòng ~26:
```tsx
<p className="...">
  Handcrafted Next.js starter for...  {/* ← Đổi text ở đây */}
</p>
```

**Thay đổi buttons:**
- "Get Started" button (dòng ~32)
- "How it Work" button (dòng ~47)
- ⭐ **Xem hướng dẫn chi tiết về buttons:** `HUONG-DAN-BUTTONS.md`

**Thay đổi ảnh hero:**
- Thay file: `/public/images/hero/hero-image.svg`
- Hoặc upload ảnh `.jpg/.png` mới và đổi đường dẫn trong code (dòng ~41)

---

## 📊 Cấu trúc thư mục quan trọng

```
src/
├── components/
│   ├── Header/
│   │   ├── index.tsx          ← Chỉnh header layout
│   │   └── menuData.tsx       ← Thêm/sửa menu items ⭐
│   ├── Hero/
│   │   └── index.tsx          ← Chỉnh hero section
│   ├── Footer/
│   │   └── index.tsx          ← Chỉnh footer
│   └── ...
├── app/
│   ├── page.tsx               ← Trang chủ
│   ├── about/page.tsx         ← Trang About
│   ├── blog/page.tsx          ← Trang Blog
│   └── ...
└── styles/
    └── index.css              ← Màu primary và theme ⭐

public/
└── images/
    ├── logo/                  ← Logo website
    └── hero/                  ← Ảnh hero
```

---

## 🚀 Lệnh sau khi chỉnh sửa

```bash
# 1. Sau khi sửa code, save file (Ctrl+S)

# 2. Nếu dev server đang chạy, nó sẽ tự reload

# 3. Nếu chưa chạy, chạy lệnh:
npm run dev

# 4. Mở trình duyệt: http://localhost:3000
```

---

## ⚡ Tips hữu ích

### 1. Xem thay đổi ngay lập tức:
- Dev server (`npm run dev`) có hot reload
- Save file → trình duyệt tự động refresh

### 2. Tìm kiếm nhanh:
- Press `Ctrl+F` trong VS Code
- Tìm text bạn muốn đổi (vd: "Home", "Sign In")
- Replace All để đổi hết

### 3. Comment code tạm thời:
```tsx
{/* <Link href="/about">About</Link> */}
```

### 4. Thêm spacing giữa menu:
Trong `Header/index.tsx`, tìm dòng có `lg:space-x-10`:
```tsx
<ul className="block lg:flex lg:space-x-10">  {/* ← Đổi 10 thành 8 hoặc 12 */}
```

### 5. Dark mode:
Các class `dark:text-white`, `dark:bg-gray-dark` tự động áp dụng khi bật dark mode.

---

## 🆘 Troubleshooting

**Lỗi compile sau khi sửa:**
1. Check syntax (dấu ngoặc, dấu phẩy)
2. Xem terminal có báo lỗi gì
3. Undo (`Ctrl+Z`) nếu không chắc

**Menu không hiển thị:**
1. Check `menuData.tsx` có lỗi syntax không
2. Check `id` có bị trùng không

**Màu không đổi:**
1. Clear cache trình duyệt (`Ctrl+Shift+R`)
2. Restart dev server

---

## 📞 Cần giúp đỡ?

1. Đọc lại phần liên quan trong file này
2. Check terminal xem có lỗi gì
3. Google error message
4. Hỏi AI assistant (như tôi!) 😊

---

**Chúc bạn chỉnh sửa thành công! 🎉**
