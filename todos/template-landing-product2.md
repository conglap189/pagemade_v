# Kế hoạch: Tạo Template landing-product2.json

## 1. Mục tiêu (Goal)
Tạo một template website landing page hoàn chỉnh dựa trên cấu trúc và thiết kế của folder `website/` (Next.js). Template sẽ được convert sang HTML/CSS thuần để sử dụng trong PageMade Editor.

## 2. Phân tích Website Gốc

Website gồm các sections chính:
- Header/Navigation
- Hero Section (với typing animation)
- Features Section
- About Section
- Video/CTA Section
- Testimonials Section
- Pricing Section
- Blog Section
- Contact Section
- Footer

## 3. Các Phase Thực hiện

### Phase 1: Phân tích & Thu thập Data (DONE)
* [x] Đọc và phân tích Hero component
* [x] Đọc và phân tích Features component + data
* [x] Đọc và phân tích About sections
* [x] Đọc và phân tích Testimonials + data
* [x] Đọc và phân tích Pricing component
* [x] Đọc và phân tích Footer component
* [x] Đọc styles/index.css để hiểu styling

### Phase 2: Tạo HTML Structure (Chia nhỏ từng section)
* [x] Tạo file JSON cơ bản với metadata
* [x] Viết HTML cho Header/Nav
* [x] Viết HTML cho Hero Section
* [x] Viết HTML cho Features Section
* [x] Viết HTML cho About Section
* [x] Viết HTML cho Testimonials Section
* [x] Viết HTML cho Pricing Section
* [x] Viết HTML cho CTA/Contact Section
* [x] Viết HTML cho Footer

### Phase 3: Styling (CSS)
* [x] Base styles + CSS Variables
* [x] Header/Nav styles
* [x] Hero styles
* [x] Features styles
* [x] About styles
* [x] Testimonials styles
* [x] Pricing styles
* [x] CTA/Contact styles
* [x] Footer styles
* [x] Responsive styles

### Phase 4: Hoàn thiện
* [x] Ghép HTML + CSS vào file JSON
* [x] Tạo thumbnail SVG
* [ ] Test template trong PageMade Editor

## 4. Files cần đọc (theo thứ tự)

**Phase 1:**
1. `website/src/components/Hero/index.tsx`
2. `website/src/components/Features/index.tsx` + `featuresData.tsx`
3. `website/src/components/About/AboutSectionOne.tsx`
4. `website/src/components/Testimonials/index.tsx`
5. `website/src/components/Pricing/index.tsx`
6. `website/src/components/Footer/index.tsx`
7. `website/src/styles/index.css`

**Output file:**
- `backend/static/templates/landing-product2.json`

## 5. Output Files (CREATED)

**Template file:**
- `backend/static/templates/landing-product2.json` ✅

**Thumbnail:**
- `backend/static/templates/thumbnails/landing-product2.svg` ✅

## 6. Template Sections Included
- Header/Navigation (sticky)
- Hero Section (badge, title, description, CTA buttons, image)
- Features Section (6 feature cards with icons)
- About Section (checklist features, image)
- Testimonials Section (3 testimonial cards)
- Pricing Section (3 pricing cards with toggle)
- CTA Section (call-to-action with buttons)
- Footer (brand, links, social icons)

## 7. Ghi chú
- Sử dụng CSS thuần với custom properties (CSS variables)
- Đảm bảo responsive (breakpoints: 992px, 768px)
- Design based on website Next.js gốc
- Sử dụng placeholder images từ placehold.co
- Font: Inter (Google Fonts)
- Primary color: #4A6CF7
