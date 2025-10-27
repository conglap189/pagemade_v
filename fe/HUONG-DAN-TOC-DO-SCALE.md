# ⚙️ Hướng dẫn điều chỉnh Tốc độ & Scale

## 🎬 Tốc độ Typing Animation

### 📍 Vị trí: `src/components/Hero/TypingAnimation.tsx`

### Các thông số tốc độ:

#### **1. Tốc độ gõ chữ (Typing)**
**Dòng ~19:**
```tsx
setTypingSpeed(80);  // ms/chữ - Hiện tại: 80ms (nhanh)
```

**Ví dụ:**
- `50` = Rất nhanh ⚡⚡⚡
- `80` = Nhanh (hiện tại) ⚡⚡
- `150` = Vừa phải ⚡
- `200` = Chậm 🐌

---

#### **2. Tốc độ xóa chữ (Deleting)**
**Dòng ~29:**
```tsx
setTypingSpeed(50);  // ms/chữ - Hiện tại: 50ms (rất nhanh)
```

**Ví dụ:**
- `30` = Xóa cực nhanh ⚡⚡⚡
- `50` = Xóa nhanh (hiện tại) ⚡⚡
- `100` = Xóa vừa ⚡
- `150` = Xóa chậm 🐌

---

#### **3. Thời gian dừng trước khi xóa**
**Dòng ~22:**
```tsx
setTimeout(() => setIsDeleting(true), 1500);  // ms - Hiện tại: 1.5s
```

**Ví dụ:**
- `500` = Dừng 0.5 giây (rất nhanh)
- `1500` = Dừng 1.5 giây (hiện tại)
- `2000` = Dừng 2 giây
- `3000` = Dừng 3 giây

---

### 📊 Bảng cấu hình mẫu:

| Profile | Gõ (ms) | Xóa (ms) | Dừng (ms) | Mô tả |
|---------|---------|----------|-----------|-------|
| **Rất nhanh** | 50 | 30 | 800 | Năng động, nhanh |
| **Nhanh** ✅ | 80 | 50 | 1500 | Hiện tại |
| **Vừa phải** | 120 | 80 | 2000 | Cân bằng |
| **Chậm** | 180 | 120 | 3000 | Thư thái |

---

## 📐 Scale trang web (Font sizes & Spacing)

### 🎯 Đã điều chỉnh để match GoStartup:

#### **1. Badge "Next.js Starter"**
```tsx
// Trước: text-sm px-4 py-2
// Sau:   text-xs px-3 py-1.5  ← Nhỏ hơn
```

#### **2. Tiêu đề chính (H1)**
```tsx
// Trước: text-3xl → md:text-5xl → xl:text-5xl
// Sau:   text-2xl → md:text-4xl → xl:text-4xl  ← Giảm 1 size
```

#### **3. Mô tả (Paragraph)**
```tsx
// Trước: text-base mb-10
// Sau:   text-sm sm:text-base mb-8  ← Nhỏ hơn và responsive
```

#### **4. Buttons**
```tsx
// Get Started:
// Trước: px-8 py-4 text-base
// Sau:   px-6 py-3 text-sm  ← Compact hơn

// How it Work:
// Trước: px-6 py-4 text-base, icon h-10 w-10
// Sau:   px-5 py-3 text-sm, icon h-8 w-8  ← Nhỏ gọn hơn
```

---

### 📍 Vị trí files đã sửa:

**Hero Section:** `src/components/Hero/index.tsx`
- Badge: Dòng ~17
- H1: Dòng ~20
- Paragraph: Dòng ~23
- Buttons: Dòng ~29-62

---

## 🎨 So sánh Before/After:

### Typography Scale:

| Element | Before | After | Giảm |
|---------|--------|-------|------|
| Badge | text-sm | text-xs | -1 |
| H1 Desktop | text-5xl | text-4xl | -1 |
| H1 Mobile | text-3xl | text-2xl | -1 |
| Paragraph | text-base | text-sm | -1 |
| Buttons | text-base | text-sm | -1 |

### Spacing:

| Element | Before | After |
|---------|--------|-------|
| Badge padding | px-4 py-2 | px-3 py-1.5 |
| Paragraph mb | mb-10 | mb-8 |
| Button padding | px-8 py-4 | px-6 py-3 |
| Icon size | h-10 w-10 | h-8 w-8 |

---

## 🔧 Tùy chỉnh thêm

### Nếu vẫn thấy to quá:

#### **Giảm H1 thêm 1 size:**
```tsx
className="text-xl ... md:text-3xl ... xl:text-3xl"
```

#### **Giảm buttons thêm:**
```tsx
className="px-5 py-2.5 text-xs"
```

#### **Giảm spacing tổng thể:**
```tsx
// Badge margin
className="mb-3 ..."  // Từ mb-4 → mb-3

// Paragraph margin
className="mb-6 ..."  // Từ mb-8 → mb-6
```

---

### Nếu thấy nhỏ quá (muốn tăng lại):

#### **Tăng H1:**
```tsx
className="text-3xl ... md:text-5xl ... xl:text-5xl"
```

#### **Tăng paragraph:**
```tsx
className="text-base"  // Bỏ sm:text-base
```

---

## 🚀 Quick Fix Commands

### Copy/Paste để thử các profile khác nhau:

#### **Profile: Super Fast** ⚡⚡⚡
```tsx
// TypingAnimation.tsx
setTypingSpeed(50);   // Gõ
setTypingSpeed(30);   // Xóa
setTimeout(..., 800); // Dừng
```

#### **Profile: Balanced** ⚖️
```tsx
setTypingSpeed(120);  // Gõ
setTypingSpeed(80);   // Xóa
setTimeout(..., 2000); // Dừng
```

#### **Profile: Smooth** 🎯
```tsx
setTypingSpeed(100);  // Gõ
setTypingSpeed(60);   // Xóa
setTimeout(..., 1800); // Dừng
```

---

## 📱 Responsive Scale

### Hiện tại responsive đã optimize:

**Mobile (< 640px):**
- Badge: text-xs
- H1: text-2xl
- Text: text-sm
- Buttons: Full width, compact

**Tablet (640px - 1024px):**
- Badge: text-xs
- H1: text-3xl
- Text: text-base
- Buttons: Inline, normal

**Desktop (> 1024px):**
- Badge: text-xs
- H1: text-4xl
- Text: text-base
- Buttons: Inline, normal

---

## ⚠️ Lưu ý

1. **Sau khi sửa tốc độ:** 
   - Save file → Browser tự reload
   - Xem hiệu ứng typing mới

2. **Sau khi sửa scale:**
   - Clear cache: `Ctrl+Shift+R`
   - Check cả Desktop & Mobile

3. **Consistency:**
   - Giữ tỷ lệ giữa các elements
   - Button không nên lớn hơn tiêu đề

---

## 🎯 Tóm tắt thay đổi hiện tại:

✅ **Typing Animation:**
- Gõ: 80ms (nhanh hơn ~47%)
- Xóa: 50ms (nhanh hơn 50%)
- Dừng: 1.5s (ngắn hơn 25%)

✅ **Scale:**
- Tất cả giảm 1 size (text-base → text-sm)
- Spacing compact hơn 20%
- Icons nhỏ hơn 20%

**Kết quả:** Gần với GoStartup hơn! 🎉

---

**Cần điều chỉnh thêm thì báo mình nhé!** 😊
