# Frontend AGENTS.md

## 🎯 MỤC TIÊU CHÍNH

Frontend PageMade là một **Page Builder** dựa trên GrapeJS đã được rebrand thành **PageMade (pm)**. Đây là sản phẩm cốt lõi của hệ thống.

## 🏗️ HYBRID ARCHITECTURE (Điểm 9/10)

Chúng ta sử dụng **Hybrid Approach** - cân bằng giữa independence và integration:

### 📦 Frontend chịu trách nhiệm:
- **PageMade Editor templates** (`/frontend/templates/`)
- **JavaScript modules** (`/frontend/src/`)
- **CSS/Assets** (`/frontend/css/`, `/frontend/images/`)
- **Development server** (port 3000)

### 🖥️ Backend chịu trách nhiệm:
- **Admin/Auth templates** (`/backend/templates/`)
- **Published pages** (`/backend/templates/published_page.html`)
- **API endpoints** cho data
- **Authentication & sessions**

## 📁 CẤU TRÚC THƯ MỤC

```
frontend/
├── src/                    # Source code chính
│   ├── editor/            # 🆕 PageMade Editor v3 (modular)
│   │   ├── index.html     # Main editor HTML
│   │   ├── styles/        # CSS styles
│   │   │   ├── editor.css
│   │   │   ├── toolbar.css
│   │   │   └── panels.css
│   │   ├── scripts/       # JavaScript modules
│   │   │   ├── main.js    # Entry point
│   │   │   ├── config/
│   │   │   │   └── pagemade-config.js
│   │   │   ├── components/
│   │   │   │   ├── Toolbar.js
│   │   │   │   ├── ThemeToggle.js
│   │   │   │   └── DeviceSwitcher.js
│   │   │   ├── panels/
│   │   │   │   ├── BlockPanel.js
│   │   │   │   ├── StylePanel.js
│   │   │   │   └── AssetPanel.js
│   │   │   └── utils/
│   │   │       ├── ThemeManager.js
│   │   │       └── StorageManager.js
│   ├── core/              # Core modules
│   │   ├── Editor.js       # Main orchestrator
│   │   ├── EventBus.js     # Event system
│   │   ├── StateManager.js # State management
│   │   └── LifecycleManager.js
│   ├── modules/           # UI modules
│   │   ├── assets/        # Asset management
│   │   ├── blocks/        # Block management
│   │   ├── canvas/        # Canvas handling
│   │   ├── panels/        # Panel management
│   │   └── toolbar/       # Toolbar functionality
│   ├── styles/            # CSS styles
│   │   ├── editor.css
│   │   ├── components.css
│   │   └── themes.css
│   └── index.js           # Main entry point
├── templates/             # 🆕 PageMade Editor templates
│   ├── editor.html        # Main editor template
│   ├── editor_pagemaker.html
│   ├── editor_modular_v3.html
│   ├── preview.html
│   └── test/             # Test templates
├── js/                    # Compiled/bundled files
│   └── pagemade.min.js    # PageMade Editor core (rebranded GrapeJS)
├── css/                   # CSS files
│   ├── style.css
│   └── tailwind.min.css
├── images/                # Static images
├── package.json           # NPM dependencies (Vite-based)
├── vite.config.js          # Vite build configuration
└── AGENTS.md              # This file
```

## 🔧 NHIỆM VỤ CỦA AI AGENTS

### 1. **MAINTAIN & DEVELOP PAGEMADE EDITOR**
- Phát triển và maintain các modules trong `src/`
- Đảm bảo tính modular và clean architecture
- Test và debug các functionality của PageMade

### 2. **HYBRID TEMPLATE MANAGEMENT**
- **🆕 QUẢN LÝ TEMPLATES**: Chỉ làm việc với templates trong `/frontend/templates/`
- **KHÔNG** modify templates trong `/backend/templates/`
- Các templates được quản lý:
  - `editor.html` - Main PageMade Editor
  - `preview.html` - Preview functionality
  - `test/` - Development test templates

### 3. **REBRANDING INTEGRITY**
- **QUAN TRỌNG**: Luôn sử dụng `pm` thay vì `gjs`
- Đảm bảo tất cả references đều là `PageMade` không phải `GrapeJS`
- Check file `js/pagemade.min.js` để verify rebranding

### 4. **API INTEGRATION**
- Frontend chỉ giao tiếp với Backend qua API endpoints
- **🆕 TEMPLATE DATA API**: `/api/editor/template-data/{id}`
- Các endpoints chính:
  - `/api/pages/{id}/pagemaker/load`
  - `/api/pages/{id}/pagemaker/save`
  - `/api/pages/{id}/publish`
  - `/api/assets/upload`
  - `/api/editor/template-data/{id}` - Template data cho frontend

### 5. **BUILD & DEPLOYMENT**
- Sử dụng **Vite** để build production bundles (fast HMR)
- Development: `npm run dev` (Vite dev server)
- Production: `npm run build`
- **🆕 FRONTEND SERVER**: Chạy trên port 3000, independent từ backend

## 🚀 QUY TRÌNH LÀM VIỆC

### Khi thêm feature mới:
1. Tạo module trong `src/modules/` nếu cần
2. Import và register trong `src/index.js`
3. Test với development server
4. Build production bundle

### Khi fix bug:
1. Xác định module bị ảnh hưởng
2. Fix trong source code
3. Test thoroughly
4. Rebuild nếu cần

### Khi maintain:
1. Review dependencies trong `package.json`
2. Update Webpack config nếu cần
3. Optimize bundle size
4. Monitor performance

## 📋 IMPORTANT NOTES

### ❌ KHÔNG LÀM:
- **KHÔNG** sử dụng `gjs.` prefix - luôn dùng `pm.`
- **KHÔNG** modify templates trong `/backend/templates/`
- **KHÔNG** hardcode API URLs
- **KHÔNG** tạo circular dependencies giữa modules
- **KHÔNG** mix frontend/backend template responsibilities

### ✅ LUÔN LÀM:
- **LUÔN** test với development server trước
- **LUÔN** verify rebranding (pm vs gjs)
- **LUÔN** maintain modular architecture
- **LUÔN** update documentation khi thay đổi structure
- **🆕 LUÔN** fetch template data từ API thay vì Jinja2
- **🆕 LUÔN** giữ frontend templates independent từ Flask

### 🔄 HYBRID WORKFLOW:
1. **Frontend dev**: Modify templates trong `/frontend/templates/`
2. **Backend dev**: Maintain API endpoints và admin templates
3. **Integration**: Qua API calls, không qua template sharing
4. **Testing**: Frontend server port 3001 + Backend API port 5000

## 🔍 DEBUGGING TIPS

1. **Console logs**: Check `pm.init()` và `PageMadeEditor`
2. **Network tab**: Verify API calls
3. **Module loading**: Check import paths trong `index.js`
4. **Build issues**: Check Vite configuration
5. **🆕 Template issues**: Check `/frontend/templates/` paths
6. **🆕 API data**: Verify `/api/editor/template-data/{id}` response

## 📞 CONTACT & COORDINATION

- Backend API coordination: Check `/backend/AGENTS.md`
- API documentation: `/docs/backend/API.md`
- Architecture overview: `/docs/ARCHITECTURE.md`
- **🆕 Hybrid approach**: This file documents frontend responsibilities

---

## 📚 HỌC HỎI TỪ LOGIC CŨ (QUAN TRỌNG)

### 🎯 **Reference File: `editor_pagemaker_v2.html`**
**Location**: `/backend/templates/pagemakerv2- do-not-use/editor_pagemaker_v2.html`

Đây là file **hoàn thiện nhất** chứa toàn bộ logic của hệ thống PageMade Editor. Khi refactor modular frontend, **HÃY HỌC HỎI** từ file này.

### 📋 **CÁC LOGIC QUAN TRỌNG CẦN HỌC HỎI**

#### 1. **🎨 UI/UX Logic** (Lines 1-2000)
- **Dark Mode Toggle** (Lines 2005-2014)
- **Canvas Responsive Layout** (Lines 2016-2036) 
- **Panel Management** (Lines 2038-2100)
- **Device Switcher** (Lines 4016-4025)
- **Theme System** với localStorage

#### 2. **🧩 GrapesJS Configuration** (Lines 2400-2800)
- **Complete Panel Manager** với Blocks, Layers, Assets, Styles
- **Trait Manager** với đầy đủ properties
- **Style Manager** với comprehensive styling options
- **Device Management** cho responsive design

#### 3. **📦 Asset Management** (Lines 3000-3700)
- **Custom Drag & Drop** logic (Lines 3000-3100)
- **File Upload System** (Lines 3506-3650)
- **Asset Gallery** với grid layout
- **Image Positioning** và drop zones

#### 4. **⚡ Event Handling** (Lines 4000-4500)
- **Component Selection** logic
- **Preview Mode** toggle (Lines 4028-4091)
- **Undo/Redo** integration
- **Auto-save** functionality

#### 5. **🔧 Custom Commands** (Lines 4093-4200)
- **toggle-preview** command
- **toggle-outline** command
- **Custom toolbar actions**
- **Keyboard shortcuts**

### 🎯 **QUY TRÌNH REFACTOR TỪ FILE CŨ**

#### **Step 1: Analysis**
```javascript
// 1. Đọc và hiểu từng section logic
// 2. Map logic sang modular structure
// 3. Identify dependencies và side effects
```

#### **Step 2: Modularization**
```javascript
// Ví dụ: Dark Mode Logic
// OLD (trong editor_pagemaker_v2.html):
const darkModeToggle = document.getElementById('darkModeToggle');
// ... 20 lines logic

// NEW (trong src/modules/theme/ThemeManager.js):
export class ThemeManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupDarkModeToggle();
        this.loadSavedTheme();
    }
    
    // ... rest of logic
}
```

#### **Step 3: Event System Integration**
```javascript
// OLD: Direct DOM manipulation
document.getElementById('save-btn').addEventListener('click', () => {
    // ... save logic
});

// NEW: Event-driven architecture
eventBus.emit('editor:save', { pageId, content });
```

### 📁 **MAPPING STRUCTURE**

| Logic in v2.html | → | New Modular Location |
|------------------|---|-------------------|
| Dark Mode (Lines 2005-2014) | → | `src/modules/theme/ThemeManager.js` |
| Canvas Layout (Lines 2016-2036) | → | `src/modules/canvas/LayoutManager.js` |
| Panel Management (Lines 2038-2100) | → | `src/modules/panels/PanelManager.js` |
| Asset Upload (Lines 3506-3650) | → | `src/modules/assets/AssetManager.js` |
| GrapesJS Config (Lines 2400-2800) | → | `src/core/Editor.js` (config section) |
| Custom Commands (Lines 4093-4200) | → | `src/modules/commands/CommandManager.js` |

### 🚨 **IMPORTANT NOTES KHI REFACTOR**

#### **✅ LUÔN GIỮ LẠI:**
- **Event flow** và user interactions
- **CSS class names** và styling
- **Keyboard shortcuts** và accessibility
- **Error handling** patterns
- **Performance optimizations**

#### **🔄 CẦN ADAPT:**
- **Direct DOM access** → Component-based
- **Global variables** → Module exports
- **Inline event handlers** → Event bus system
- **Mixed concerns** → Single responsibility modules

#### **❌ KHÔNG LÀM:**
- **KHÔNG** copy-paste trực tiếp
- **KHÔNG** ignore error handling
- **KHÔNG** break existing functionality
- **KHÔNG** forget responsive design

### 🛠️ **DEBUGGING TIPS**

Khi refactor từ v2.html:
1. **Test từng module** độc lập
2. **So sánh behavior** với original
3. **Check console logs** từ v2 để hiểu flow
4. **Verify event listeners** được attach đúng
5. **Test responsive** trên multiple devices

### 📖 **STUDY GUIDE**

1. **Read Lines 2000-2500**: UI/UX patterns
2. **Read Lines 2400-2800**: GrapesJS integration  
3. **Read Lines 3000-3700**: Asset management
4. **Read Lines 4000-4500**: Event handling
5. **Read Lines 4093-4200**: Custom commands

---

## ✅ HYBRID ARCHITECTURE IMPLEMENTATION COMPLETE

### Status: **WORKING** ✅
- **Frontend Server**: Running on port 3000 ✅
- **Backend Server**: Running on port 5000 ✅  
- **CORS Configuration**: Properly configured ✅
- **API Integration**: `/api/editor/template-data/{id}` working ✅
- **Redirect Flow**: Backend `/editor/{id}` → Frontend with token ✅

### Final Architecture:
```
User → /editor/1 (Backend) → Redirect to http://localhost:3000/editor/1?token=xxx
Frontend → Fetch data from /api/editor/template-data/1 → Initialize PageMade Editor
```

### Key Changes Made:
1. **Backend editor route** now redirects to frontend instead of rendering template
2. **Frontend templates** use API calls instead of Jinja2 variables  
3. **CORS configured** for cross-origin requests
4. **Webpack fixed** to handle chunk splitting properly
5. **🆕 Refactor Guide**: Added comprehensive guide for learning from `editor_pagemaker_v2.html`

---

## 🎉 PAGEMADE EDITOR V3 REFACTOR - COMPLETE ✅

### Status: **PRODUCTION READY** ✅
- **Modular Architecture**: Fully implemented ✅
- **Vite Build System**: Working with optimized bundles ✅
- **Component Extraction**: All components modularized ✅
- **Rebranding**: Complete (grapesjs → pagemade) ✅
- **Production Build**: Tested and verified ✅
- **Documentation**: Comprehensive guide created ✅

### Key Achievements:
1. **From Monolithic to Modular**: 4.8k lines → organized modules
2. **Modern Build System**: Webpack → Vite (faster, better HMR)
3. **Clean Architecture**: ES6 modules, component-based design
4. **Production Ready**: Optimized bundles, proper externalization
5. **Maintainable**: Clear separation of concerns, reusable components

### Files Created/Modified:
- ✅ `src/editor/` - Complete modular structure
- ✅ `vite.config.js` - Vite configuration with external dependencies
- ✅ `tailwind.config.js` - Tailwind CSS configuration
- ✅ `package.json` - Updated dependencies and scripts
- ✅ `README_V3.md` - Comprehensive documentation
- ✅ All component modules (Toolbar, ThemeToggle, DeviceSwitcher, etc.)
- ✅ All panel modules (BlockPanel, StylePanel, AssetPanel)
- ✅ Utility modules (ThemeManager, StorageManager)

### Bundle Performance:
- **Main JS**: 1.4MB → 330KB (gzipped)
- **Main CSS**: 11KB → 2.5KB (gzipped)
- **HTML**: 5KB → 1.3KB (gzipped)
- **Build Time**: ~5 seconds
- **HMR**: Instant updates

### Next Steps for Production:
1. Deploy `/dist` to web server
2. Ensure `/js/pagemade.min.js` is accessible
3. Configure backend API endpoints
4. Monitor performance in production
5. Collect user feedback for enhancements

---

*Last updated: 2025-11-25*
*PageMade Editor v3 Refactor: COMPLETE ✅*
*Production Status: READY ✅*