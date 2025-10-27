# 🎨 Hướng dẫn tùy chỉnh Buttons

## 📍 Vị trí các buttons trong project

### 1. **Buttons trong Header (Sign In / Sign Up)**
**File:** `src/components/Header/index.tsx`  
**Dòng:** ~167-180

### 2. **Buttons trong Hero (Get Started / How it Work)**
**File:** `src/components/Hero/index.tsx`  
**Dòng:** ~29-57

---

## 🎯 Cấu trúc button cơ bản

### Button style cơ bản với Tailwind CSS:

```tsx
<Link
  href="/your-link"
  className="inline-block rounded-md bg-primary px-8 py-4 text-white hover:bg-primary/90"
>
  Button Text
</Link>
```

**Giải thích các class:**
- `inline-block` - Hiển thị dạng inline block
- `rounded-md` - Bo góc vừa phải
- `bg-primary` - Background màu primary
- `px-8` - Padding trái/phải 32px
- `py-4` - Padding trên/dưới 16px
- `text-white` - Chữ màu trắng
- `hover:bg-primary/90` - Hover đổi màu opacity 90%

---

## 🔧 Tùy chỉnh Sign In / Sign Up buttons

### ❌ **Vấn đề:** Button bị thu hẹp, chữ xuống 2 hàng

**Nguyên nhân:**
- Padding responsive (`lg:px-6`) làm giảm width
- Không có min-width cố định

**✅ Giải pháp:**

```tsx
<Link
  href="/signin"
  className="hidden rounded-lg bg-primary/10 px-8 py-3 text-base font-medium text-primary"
  style={{ minWidth: '120px' }}  {/* ← Thêm min-width */}
>
  Sign In
</Link>
```

### 📐 Điều chỉnh width buttons:

**Cách 1: Dùng inline style (Đơn giản)**
```tsx
style={{ minWidth: '120px' }}  // Width tối thiểu 120px
```

**Cách 2: Dùng Tailwind class (Linh hoạt hơn)**
```tsx
className="... min-w-[120px]"  // Tương tự như trên
```

**Cách 3: Tăng padding**
```tsx
className="... px-10 py-3"  // Tăng padding ngang lên 40px
```

### 🎨 Đổi màu buttons:

#### **Sign In button (nền xanh nhạt):**
```tsx
bg-primary/10      // Nền primary opacity 10%
text-primary       // Chữ màu primary
hover:bg-primary/20 // Hover tăng opacity lên 20%
```

Đổi sang màu khác:
```tsx
bg-blue-50 text-blue-600 hover:bg-blue-100    // Xanh dương
bg-green-50 text-green-600 hover:bg-green-100 // Xanh lá
bg-purple-50 text-purple-600 hover:bg-purple-100 // Tím
```

#### **Sign Up button (nền đen):**
```tsx
bg-black text-white hover:bg-black/80
```

Đổi sang màu khác:
```tsx
bg-primary text-white hover:bg-primary/90      // Primary
bg-red-600 text-white hover:bg-red-700        // Đỏ
bg-gradient-to-r from-blue-500 to-purple-600  // Gradient
```

---

## 🎯 Thêm button "How it Work" (có icon play)

### 📍 Vị trí: `src/components/Hero/index.tsx`

### Cấu trúc button với icon:

```tsx
<button
  className="inline-flex items-center rounded-md border-2 border-gray-300 bg-transparent px-6 py-4 hover:border-primary hover:bg-primary/5"
>
  {/* Icon play bên trái */}
  <span className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
    <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  </span>
  How it Work
</button>
```

**Giải thích:**
1. `inline-flex items-center` - Flexbox để căn icon và text
2. `border-2 border-gray-300` - Viền xám 2px
3. `bg-transparent` - Nền trong suốt
4. `hover:border-primary` - Hover đổi viền thành primary
5. `mr-3` - Margin-right 12px cho icon
6. `h-10 w-10` - Icon container 40x40px
7. `rounded-full` - Bo tròn icon

---

## 🎨 Các kiểu button thường dùng

### 1. **Button Primary (Solid)**
```tsx
<button className="rounded-md bg-primary px-8 py-3 text-white hover:bg-primary/90">
  Primary Button
</button>
```

### 2. **Button Outline (Viền)**
```tsx
<button className="rounded-md border-2 border-primary bg-transparent px-8 py-3 text-primary hover:bg-primary hover:text-white">
  Outline Button
</button>
```

### 3. **Button Ghost (Nhạt)**
```tsx
<button className="rounded-md bg-primary/10 px-8 py-3 text-primary hover:bg-primary/20">
  Ghost Button
</button>
```

### 4. **Button với Icon bên phải**
```tsx
<button className="inline-flex items-center rounded-md bg-primary px-8 py-3 text-white">
  Get Started
  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
</button>
```

### 5. **Button Loading (có spinner)**
```tsx
<button className="inline-flex items-center rounded-md bg-primary px-8 py-3 text-white" disabled>
  <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
  Loading...
</button>
```

---

## 🎯 Tùy chỉnh nâng cao

### 1. **Thay đổi kích thước button**

**Size nhỏ:**
```tsx
className="px-4 py-2 text-sm"
```

**Size vừa (mặc định):**
```tsx
className="px-8 py-3 text-base"
```

**Size lớn:**
```tsx
className="px-10 py-4 text-lg"
```

### 2. **Bo góc khác nhau**

```tsx
rounded-none    // Vuông
rounded-sm      // Bo góc nhỏ
rounded-md      // Bo góc vừa (mặc định)
rounded-lg      // Bo góc lớn
rounded-full    // Bo tròn hoàn toàn
```

### 3. **Thêm shadow (đổ bóng)**

```tsx
shadow-sm       // Bóng nhỏ
shadow-md       // Bóng vừa
shadow-lg       // Bóng lớn
hover:shadow-xl // Hover tăng bóng
```

### 4. **Transition (chuyển động)**

```tsx
transition duration-300 ease-in-out  // Smooth transition 300ms
```

### 5. **Full width button**

```tsx
className="w-full"  // Rộng 100% container
```

---

## 🎨 Icons cho buttons

### SVG Icons phổ biến:

#### **Arrow Right (→)**
```tsx
<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
</svg>
```

#### **Play Icon (▶)**
```tsx
<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
  <path d="M8 5v14l11-7z" />
</svg>
```

#### **Download Icon (⬇)**
```tsx
<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
</svg>
```

#### **Check Icon (✓)**
```tsx
<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
</svg>
```

---

## 💡 Ví dụ thực tế

### Ví dụ 1: Thêm button "Contact Us" vào Hero

**File:** `src/components/Hero/index.tsx`

```tsx
<div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
  {/* Button Get Started */}
  <Link href="/start" className="...">
    Get Started
  </Link>
  
  {/* Button How it Work */}
  <button className="...">
    How it Work
  </button>
  
  {/* ✨ Thêm button Contact Us mới */}
  <Link
    href="/contact"
    className="inline-flex items-center justify-center rounded-md bg-green-500 px-8 py-4 text-white hover:bg-green-600"
  >
    Contact Us
  </Link>
</div>
```

### Ví dụ 2: Đổi "Get Started" thành gradient button

```tsx
<Link
  href="/start"
  className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-white hover:from-blue-600 hover:to-purple-700"
>
  Get Started
</Link>
```

### Ví dụ 3: Button với badge (số thông báo)

```tsx
<button className="relative inline-flex items-center rounded-md bg-primary px-8 py-3 text-white">
  Notifications
  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs">
    5
  </span>
</button>
```

---

## 🔍 Tìm và sửa buttons trong project

### Bước 1: Tìm button cần sửa
Press `Ctrl+Shift+F` trong VS Code, search text trên button (vd: "Sign In", "Get Started")

### Bước 2: Mở file
Click vào kết quả search → file sẽ mở

### Bước 3: Sửa className
Thay đổi các class Tailwind theo ý muốn

### Bước 4: Save & Reload
`Ctrl+S` → Trình duyệt tự động reload

---

## 🚀 Quick Reference - Copy & Paste

### Template button cơ bản:
```tsx
{/* Primary Button */}
<button className="rounded-md bg-primary px-8 py-3 text-white hover:bg-primary/90">
  Click Me
</button>

{/* Outline Button */}
<button className="rounded-md border-2 border-primary bg-transparent px-8 py-3 text-primary hover:bg-primary hover:text-white">
  Click Me
</button>

{/* Button with Icon */}
<button className="inline-flex items-center rounded-md bg-primary px-8 py-3 text-white">
  <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
  Play Video
</button>
```

---

## ⚠️ Lưu ý quan trọng

1. **Min-width cho buttons quan trọng:**
   - Dùng `style={{ minWidth: '120px' }}` hoặc `min-w-[120px]`
   - Tránh chữ xuống 2 hàng

2. **Padding cân đối:**
   - Ngang (`px-`) luôn lớn hơn dọc (`py-`)
   - Thường: `px-8 py-3` hoặc `px-10 py-4`

3. **Hover effect luôn cần:**
   - Thêm `hover:bg-...` hoặc `hover:opacity-...`
   - Smooth transition: `transition duration-300`

4. **Responsive:**
   - Desktop: `md:block` hoặc `lg:block`
   - Mobile: full width `w-full sm:w-auto`

5. **Dark mode:**
   - Luôn thêm `dark:bg-...` `dark:text-...`
   - Test cả 2 chế độ

---

## 🎓 Tài liệu tham khảo

- Tailwind CSS Buttons: https://tailwindcss.com/docs
- Heroicons (SVG Icons): https://heroicons.com/
- Tailwind Color Palette: https://tailwindcss.com/docs/customizing-colors

---

**Chúc bạn tùy chỉnh buttons thành công! 🎨✨**
