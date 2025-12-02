# Kế hoạch: Customize Tablet Device giống Desktop (chỉ thay đổi width)

## 1. Mục tiêu (Goal)
Làm cho chế độ Tablet trong PageMade Editor hoạt động giống Desktop nhưng chỉ khác về width:
- Không có height cố định (auto height như desktop)
- Canvas không bị centered/có border như hiện tại
- Chỉ thay đổi width canvas

## 2. Phân tích hiện tại
**Hiện tại Tablet có:**
- `width: '768px'`
- `height: '1024px'` (cố định - cần xóa)
- Canvas styling đặc biệt (border, centered) - cần xóa

**Cần thay đổi:**
- GrapesJS core: Device Manager config
- Frontend: DeviceSwitcher.js và pagemade-config.js

## 3. Các bước Thực hiện (Implementation Steps)

### GrapesJS Core
* [x] Chỉnh sửa `/grapesjs/packages/core/src/device_manager/config/config.ts` - bỏ height cho tablet device mặc định

### Frontend PageMade
* [x] Chỉnh sửa `/frontend/src/editor/scripts/config/pagemade-config.js` - cập nhật deviceManager config cho Tablet (bỏ height)
* [x] Chỉnh sửa `/frontend/src/editor/scripts/components/DeviceSwitcher.js` - cập nhật devices object (bỏ height cho tablet) và logic updateCanvasSize()

### Build & Test
* [x] Build GrapesJS core: `npm run build` trong `/grapesjs/packages/core`
* [x] Build frontend PageMade: `npm run build` trong `/frontend`
* [ ] Manual testing trong browser

## 4. Các file bị ảnh hưởng (Files to be Touched)
* `/grapesjs/packages/core/src/device_manager/config/config.ts` (Chỉnh sửa)
* `/frontend/src/editor/scripts/config/pagemade-config.js` (Chỉnh sửa)
* `/frontend/src/editor/scripts/components/DeviceSwitcher.js` (Chỉnh sửa)

## 5. Chi tiết thay đổi

### GrapesJS config.ts (mẫu)
```typescript
// Before:
{
  id: 'tablet',
  name: 'Tablet',
  width: '770px',
  widthMedia: '992px',
}

// After:
{
  id: 'tablet',
  name: 'Tablet',
  width: '768px',
  widthMedia: '768px',
  // Không có height -> auto height như desktop
}
```

### DeviceSwitcher.js (mẫu)
```javascript
// Before:
tablet: { name: 'Tablet', width: '768px', height: '1024px', icon: 'fa-tablet-alt' }

// After:
tablet: { name: 'Tablet', width: '768px', height: null, icon: 'fa-tablet-alt' }
```

### updateCanvasSize() logic
```javascript
// Tablet sẽ được xử lý như desktop (không có border, không centered)
// Chỉ set width, không set height
```
