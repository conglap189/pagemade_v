# 🎬 Hướng dẫn sử dụng Typing Animation

## 🎯 Hiệu ứng đã tạo

Typing animation tự động gõ và xóa các từ theo thứ tự:
1. **Business** (gõ từng chữ)
2. Dừng 2 giây
3. **Xóa từng chữ** (ssenissuB)
4. **Company** (gõ từng chữ)
5. Xóa...
6. **Startup** (gõ từng chữ)
7. Lặp lại...

✨ **Có gạch chân** màu primary dưới từ đang hiển thị

---

## 📍 Vị trí files

### Component chính:
```
src/components/Hero/TypingAnimation.tsx
```

### Sử dụng trong:
```
src/components/Hero/index.tsx
```

---

## ✏️ Tùy chỉnh các từ hiển thị

### Thay đổi danh sách từ:

**File:** `src/components/Hero/TypingAnimation.tsx`  
**Dòng:** ~6

```tsx
const words = ["Business", "Company", "Startup"];  // ← Sửa ở đây
```

### Ví dụ thêm từ mới:

```tsx
// Thêm "Agency" và "Team"
const words = ["Business", "Company", "Startup", "Agency", "Team"];
```

```tsx
// Chỉ 2 từ
const words = ["Startup", "Business"];
```

---

## ⚙️ Tùy chỉnh tốc độ

### Trong file `TypingAnimation.tsx`:

**Tốc độ gõ chữ (typing):**
```tsx
setTypingSpeed(150);  // ← Dòng ~17 (ms, càng nhỏ = càng nhanh)
```

**Tốc độ xóa chữ (deleting):**
```tsx
setTypingSpeed(100);  // ← Dòng ~27 (ms)
```

**Thời gian dừng trước khi xóa:**
```tsx
setTimeout(() => setIsDeleting(true), 2000);  // ← Dòng ~20 (2000ms = 2 giây)
```

**Thời gian chuyển từ:**
```tsx
setTypingSpeed(500);  // ← Dòng ~32 (delay giữa các từ)
```

---

## 🎨 Tùy chỉnh gạch chân

### File: `TypingAnimation.tsx` (dòng ~43)

**Hiện tại:**
```tsx
<span className="underline decoration-primary decoration-4 underline-offset-8">
  {currentText}
</span>
```

### Đổi màu gạch chân:
```tsx
decoration-primary    // Màu primary (xanh)
decoration-red-500    // Màu đỏ
decoration-green-500  // Màu xanh lá
decoration-purple-500 // Màu tím
```

### Đổi độ dày:
```tsx
decoration-1  // Mỏng
decoration-2  // Vừa
decoration-4  // Dày (hiện tại)
decoration-8  // Rất dày
```

### Đổi khoảng cách từ chữ đến gạch:
```tsx
underline-offset-4   // Gần chữ
underline-offset-8   // Vừa (hiện tại)
underline-offset-12  // Xa chữ
```

### Xóa gạch chân:
```tsx
<span className="">  {/* Xóa hết class underline */}
  {currentText}
</span>
```

---

## 🎨 Style khác cho gạch chân

### Gạch đứt (dotted):
```tsx
<span className="underline decoration-dotted decoration-primary decoration-4">
  {currentText}
</span>
```

### Gạch chấm (dashed):
```tsx
<span className="underline decoration-dashed decoration-primary decoration-4">
  {currentText}
</span>
```

### Gạch sóng (wavy):
```tsx
<span className="underline decoration-wavy decoration-primary decoration-4">
  {currentText}
</span>
```

### Highlight thay vì gạch chân:
```tsx
<span className="bg-primary/20 px-2 rounded">
  {currentText}
</span>
```

### Gradient underline (custom):
```tsx
<span className="relative inline-block">
  {currentText}
  <span className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-purple-600"></span>
</span>
```

---

## 🎯 Tùy chỉnh con trỏ nhấp nháy (cursor)

### Hiện tại:
```tsx
<span className="animate-pulse">|</span>
```

### Đổi ký tự cursor:
```tsx
<span className="animate-pulse">_</span>  // Gạch dưới
<span className="animate-pulse">█</span>  // Block
<span className="animate-pulse">▌</span>  // Half block
```

### Đổi màu cursor:
```tsx
<span className="animate-pulse text-primary">|</span>
```

### Ẩn cursor:
```tsx
{/* Xóa dòng <span className="animate-pulse">|</span> */}
```

### Cursor animation khác (blink nhanh hơn):
```tsx
<span className="animate-blink">|</span>

// Thêm vào file CSS (src/styles/index.css):
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.animate-blink {
  animation: blink 0.7s infinite;
}
```

---

## 💡 Ví dụ tùy chỉnh

### Ví dụ 1: Typing nhanh hơn
```tsx
// Trong TypingAnimation.tsx
setTypingSpeed(100);  // Gõ nhanh (dòng 17)
setTypingSpeed(70);   // Xóa nhanh (dòng 27)
setTimeout(() => setIsDeleting(true), 1000);  // Dừng 1s (dòng 20)
```

### Ví dụ 2: Thêm nhiều từ hơn
```tsx
const words = [
  "Business", 
  "Company", 
  "Startup", 
  "Agency",
  "Team",
  "Product",
  "Dream"
];
```

### Ví dụ 3: Gạch chân đỏ, dày hơn
```tsx
<span className="underline decoration-red-500 decoration-8 underline-offset-8">
  {currentText}
</span>
```

### Ví dụ 4: Không gạch chân, có background màu
```tsx
<span className="bg-primary/10 px-3 py-1 rounded-md text-primary">
  {currentText}
</span>
```

---

## 🔧 Sử dụng ở chỗ khác

### Muốn dùng ở trang About hoặc component khác:

**Bước 1:** Import component
```tsx
import TypingAnimation from "@/components/Hero/TypingAnimation";
```

**Bước 2:** Sử dụng
```tsx
<h2>
  We are <TypingAnimation />
</h2>
```

---

## 🎨 Tùy chỉnh từng từ có màu khác nhau

### Tạo file mới: `TypingAnimationColorful.tsx`

```tsx
"use client";
import { useEffect, useState } from "react";

const TypingAnimationColorful = () => {
  const words = [
    { text: "Business", color: "text-blue-500" },
    { text: "Company", color: "text-green-500" },
    { text: "Startup", color: "text-purple-500" },
  ];
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // ... (logic tương tự)

  return (
    <span className={`underline decoration-4 ${words[currentWordIndex].color}`}>
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};
```

---

## 🚀 Quick Reference

### Thay đổi từ:
- File: `src/components/Hero/TypingAnimation.tsx`
- Dòng: 6
- Code: `const words = [...]`

### Thay đổi tốc độ:
- Gõ: dòng 17 → `setTypingSpeed(150)`
- Xóa: dòng 27 → `setTypingSpeed(100)`
- Dừng: dòng 20 → `setTimeout(..., 2000)`

### Thay đổi gạch chân:
- Dòng: 43-45
- Class: `decoration-primary decoration-4 underline-offset-8`

---

## ⚠️ Lưu ý

1. **"use client" bắt buộc:** Component dùng useState/useEffect nên cần `"use client"` ở đầu file

2. **Performance:** Animation chạy smooth nhờ useEffect + setTimeout

3. **Responsive:** Animation hoạt động tốt trên mọi kích thước màn hình

4. **Dark mode:** Gạch chân tự động đổi theo theme (nhờ `decoration-primary`)

---

## 🆘 Troubleshooting

**Animation không chạy:**
- Check có `"use client"` ở đầu file không
- Restart dev server: `npm run dev`

**Gạch chân không hiện:**
- Check class `underline` có bị xóa không
- Check `decoration-*` classes

**Tốc độ quá nhanh/chậm:**
- Điều chỉnh `setTypingSpeed()` trong code
- Thử các giá trị: 50, 100, 150, 200

**Cursor nhấp nháy không đều:**
- Dùng custom animation (xem phần "Cursor animation khác")

---

**Chúc bạn tạo hiệu ứng typing đẹp! ⌨️✨**
