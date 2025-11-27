# PageMade Frontend

Frontend của PageMade Editor - một Page Builder dựa trên GrapeJS đã được rebrand.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run serve

# Build for production
npm run build

# Watch for changes
npm run watch
```

## 📁 Cấu trúc

- `src/` - Source code chính
- `js/` - Compiled files
- `css/` - Stylesheets
- `images/` - Static assets

## 📖 Documentation

Xem `AGENTS.md` để hiểu nhiệm vụ và quy trình làm việc.

## 🔗 Integration

Frontend giao tiếp với Backend qua API endpoints:
- Load: `/api/pages/{id}/pagemaker/load`
- Save: `/api/pages/{id}/pagemaker/save`
- Publish: `/api/pages/{id}/publish`

## 🎯 Important

- Luôn sử dụng `pm` thay vì `gjs`
- Đây là sản phẩm cốt lõi - maintain rebranding integrity