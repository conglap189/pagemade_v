# PageMade Editor v3 - Architecture Guide

## Overview
PageMade Editor v3 is a complete refactor from the monolithic v2.html (4.8k lines) into a modular, maintainable architecture using Vite build system.

## Architecture

### 📁 Directory Structure
```
frontend/
├── src/editor/
│   ├── index.html              # Main HTML template
│   ├── scripts/
│   │   ├── main.js            # Entry point & PageMadeApp class
│   │   ├── components/        # UI components
│   │   │   ├── Toolbar.js
│   │   │   ├── ThemeToggle.js
│   │   │   └── DeviceSwitcher.js
│   │   ├── panels/           # Editor panels
│   │   │   ├── BlockPanel.js
│   │   │   ├── StylePanel.js
│   │   │   └── AssetPanel.js
│   │   ├── utils/            # Utility classes
│   │   │   ├── ThemeManager.js
│   │   │   └── StorageManager.js
│   │   └── config/           # Configuration
│   │       └── pagemade-config.js
│   └── styles/               # Modular CSS
│       ├── editor.css
│       ├── toolbar.css
│       └── panels.css
├── dist/                     # Production build output
├── package.json              # Dependencies & scripts
├── vite.config.js           # Vite configuration
└── tailwind.config.js       # Tailwind CSS config
```

## 🚀 Getting Started

### Development
```bash
cd frontend
npm install
npm run dev
# Editor available at http://localhost:3001/editor/
```

### Production Build
```bash
npm run build
# Output in /dist directory
```

## 🔧 Key Features

### 1. Modular Architecture
- **Component-based**: Each UI element is a separate ES6 module
- **Event-driven**: Components communicate via custom events
- **Separation of concerns**: UI, logic, and data are separated

### 2. Rebranding (grapesjs → pagemade)
- All references use `pagemade`/`pm` instead of `grapesjs`/`gjs`
- Maintains functionality while establishing unique brand identity

### 3. Modern Build System
- **Vite**: Fast development server and optimized builds
- **ES6 Modules**: Clean import/export syntax
- **Tailwind CSS**: Utility-first CSS framework
- **Code Splitting**: Optimized bundle sizes

### 4. Enhanced Features
- **Dark/Light Theme**: Persistent theme switching
- **Device Switching**: Desktop/Tablet/Mobile preview modes
- **Local Storage**: Auto-save with compression
- **Responsive Design**: Mobile-friendly interface

## 📦 Dependencies

### Core Dependencies
- `grapesjs`: Visual page builder core
- `grapesjs-tailwind`: Tailwind CSS integration
- `vite`: Build tool and dev server

### Development Dependencies
- `tailwindcss`: CSS framework
- `postcss`: CSS processing
- `autoprefixer`: CSS vendor prefixes

## 🔌 API Integration

The editor integrates with the backend API at `http://localhost:5000`:

### Endpoints
- `GET /api/editor/template-data/` - Load page templates
- `POST /api/editor/save/` - Save page content
- `POST /api/editor/publish/` - Publish page

### Proxy Configuration
Vite dev server proxies `/api/*` requests to backend for seamless development.

## 🎨 Customization

### Adding New Components
1. Create component class in `src/editor/scripts/components/`
2. Import and initialize in `main.js`
3. Add HTML structure to `index.html`
4. Add styles to appropriate CSS file

### Adding New Panels
1. Create panel class in `src/editor/scripts/panels/`
2. Register in `pagemade-config.js`
3. Add tab button to `index.html`

### Custom Themes
1. Modify `ThemeManager.js` for theme logic
2. Update CSS variables in `editor.css`
3. Add theme toggle functionality

## 🚀 Deployment

### Production Deployment
1. Run `npm run build`
2. Deploy `/dist` directory to web server
3. Ensure `/js/pagemade.min.js` is accessible
4. Configure backend API endpoints

### Environment Variables
- `VITE_API_URL`: Backend API URL (default: http://localhost:5000)
- `VITE_EDITOR_BASE`: Editor base path (default: /editor/)

## 🔍 Migration from v2

### What Changed
- **Monolithic → Modular**: Split 4.8k lines into focused modules
- **Webpack → Vite**: Faster builds and development
- **Global → ES6 Modules**: Proper import/export structure
- **Mixed CSS → Organized**: Separated styles by functionality

### Compatibility
- **Backward Compatible**: All v2 functionality preserved
- **API Compatible**: Same backend endpoints
- **Data Compatible**: Same storage format

## 🐛 Troubleshooting

### Common Issues
1. **Build fails**: Check `node_modules` installation
2. **API errors**: Ensure backend is running on port 5000
3. **Styles missing**: Verify Tailwind CSS configuration
4. **Module errors**: Check import paths in components

### Development Tips
- Use browser dev tools for debugging
- Check Vite console for build warnings
- Monitor network tab for API calls
- Use `npm run build -- --mode development` for debug builds

## 📈 Performance

### Bundle Size
- **Main JS**: ~1.4MB (gzipped: ~330KB)
- **Main CSS**: ~11KB (gzipped: ~2.5KB)
- **HTML**: ~5KB (gzipped: ~1.3KB)

### Optimization
- Code splitting available for large applications
- Lazy loading for heavy components
- Image optimization in asset panel
- CSS purging for unused styles

## 🔮 Future Enhancements

### Planned Features
- [ ] Plugin system for third-party extensions
- [ ] Real-time collaboration
- [ ] Advanced component library
- [ ] Performance monitoring
- [ ] A/B testing integration

### Technical Debt
- [ ] Migrate to TypeScript
- [ ] Add comprehensive unit tests
- [ ] Implement error boundaries
- [ ] Add accessibility features

---

**PageMade Editor v3** - Professional page builder for modern web development.