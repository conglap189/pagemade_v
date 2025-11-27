# PageMade Editor v2.0

## 📋 Tổng Quan

PageMade Editor v2.0 là trình soạn thảo trang web hiện đại được xây dựng trên architecture modular, dễ dàng bảo trì và mở rộng. Editor được refactor từ phiên bản monolithic sang modular architecture để cải thiện performance và maintainability.

### 🚀 Features

- **Modular Architecture**: Code được tổ chức thành các module độc lập
- **Event-Driven**: Tất cả communication qua EventBus system
- **State Management**: Centralized state tracking với StateManager
- **Theme Support**: Hỗ trợ light/dark themes
- **Auto-Save**: Tự động lưu nội dung
- **Asset Management**: Quản lý files và media
- **Block System**: Component-based editing
- **Responsive Design**: Mobile-friendly interface

### 🏗️ Architecture

```
PageMadeEditor (Main Class)
├── Core Modules
│   ├── EventBus (Communication Hub)
│   ├── StateManager (State Management)
│   ├── LifecycleManager (Change Tracking)
│   └── Editor (GrapesJS Wrapper)
├── UI Modules
│   ├── PanelManager (Side Panels)
│   ├── AssetManager (File Management)
│   ├── BlockManager (Block Components)
│   ├── Canvas (Main Canvas)
│   └── Toolbar (Action Toolbar)
└── Styles & Themes
```

## 📦 Installation & Setup

### Prerequisites

- Node.js 14+ (for development)
- Modern browser with ES6 support
- GrapesJS (loaded separately)

### Quick Start

```html
<!DOCTYPE html>
<html>
<head>
    <title>PageMade Editor</title>
    <!-- Load GrapesJS (Required) -->
    <script src="https://unpkg.com/grapesjs"></script>
    <!-- Load PageMade Editor -->
    <script src="/static/dist/pagemaker-editor.bundle.js"></script>
</head>
<body>
    <div id="editor-container"></div>
    
    <script>
        const editor = new PageMadeEditor();
        await editor.initialize(
            { id: 123, siteId: 456, title: "My Page" },
            { 
                save: '/api/save',
                publish: '/api/publish',
                preview: '/preview'
            }
        );
    </script>
</body>
</html>
```

## 🛠️ Development

### Setup Development Environment

```bash
cd static/
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

### File Structure

```
static/
├── src/                    # Source code
│   ├── index.js           # Main entry point
│   ├── core/              # Core modules
│   ├── modules/           # UI modules
│   └── styles/            # CSS files
├── dist/                  # Built bundles
├── examples/              # Usage examples
├── pagemaker/            # Legacy files (deprecated)
└── webpack.config.js     # Build configuration
```

## 📚 Documentation

- **[USAGE.md](./USAGE.md)** - Hướng dẫn sử dụng chi tiết
- **[UPDATE_GUIDE.md](./UPDATE_GUIDE.md)** - Hướng dẫn cập nhật và phát triển
- **[examples/basic-usage.html](./examples/basic-usage.html)** - Ví dụ sử dụng cơ bản
- **[simple-test.html](./simple-test.html)** - Test bundle functionality

## 🧪 Testing

### Quick Test
```bash
# Build and test
npm run build
open simple-test.html
```

### Integration Test
```bash
open examples/basic-usage.html
```

## 🔄 Migration from v1.0

### Key Changes
1. **Modular Architecture**: Code split thành focused modules
2. **Event System**: EventBus cho inter-module communication
3. **Bundle Size**: Optimized webpack build (1.35MB vs 2.5MB)
4. **API Changes**: New initialization pattern

### Migration Steps
```javascript
// Old v1.0
const editor = grapesjs.init({
    container: '#gjs',
    // ... config
});

// New v2.0
const editor = new PageMadeEditor();
await editor.initialize(pageData, endpoints, config);
```

## 🎯 Usage Examples

### Basic Editor
```javascript
const editor = new PageMadeEditor();
await editor.initialize(
    { id: 1, siteId: 1, title: "Home Page" },
    { save: '/save', publish: '/publish' }
);
```

### Advanced Configuration
```javascript
await editor.initialize(pageData, endpoints, {
    theme: 'dark',
    autoSave: true,
    autoSaveInterval: 60000,
    debug: true
});
```

### Event Handling
```javascript
const eventBus = editor.getEventBus();
eventBus.on('editor:saved', (data) => {
    console.log('Page saved:', data);
});
```

## 🔧 Configuration Options

```javascript
const config = {
    theme: 'light',              // 'light' | 'dark'
    autoSave: true,              // Enable auto-save
    autoSaveInterval: 30000,     // Auto-save interval (ms)
    debug: false                 // Enable debug logging
};
```

## 📡 API Integration

### Required Endpoints
```javascript
const endpoints = {
    load: '/api/pages/{page_id}/load',
    save: '/api/pages/{page_id}/save',
    publish: '/api/pages/{page_id}/publish',
    preview: '/pages/{page_id}/preview',
    assets: '/api/assets'
};
```

## 🎨 Themes & Styling

### Built-in Themes
- Light Theme (default)
- Dark Theme

### Custom CSS
```css
[data-theme="dark"] {
    --primary-color: #2563eb;
    --background-color: #1f2937;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Bundle not loading**: Ensure GrapesJS is loaded first
2. **Events not firing**: Check editor initialization
3. **Save not working**: Verify API endpoints
4. **Styles missing**: Check CSS imports

### Debug Mode
```javascript
const editor = new PageMadeEditor();
await editor.initialize(pageData, endpoints, { debug: true });
```

## 🚀 Performance

### Bundle Size
- **Development**: ~2.5MB (with source maps)
- **Production**: ~1.35MB (minified)
- **Gzipped**: ~350KB

### Optimization Features
- Code splitting
- Tree shaking
- Lazy loading
- Bundle caching

## 📈 Roadmap

### v2.1 (Planned)
- [ ] Plugin system
- [ ] Advanced block builder
- [ ] Real-time collaboration
- [ ] Version history

### v2.2 (Future)
- [ ] AI-powered suggestions
- [ ] Advanced animations
- [ ] Multi-language support
- [ ] Mobile app

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Standards
- ES6+ syntax
- JSDoc documentation
- Event-driven architecture
- Modular design

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: See [USAGE.md](./USAGE.md) and [UPDATE_GUIDE.md](./UPDATE_GUIDE.md)
- **Examples**: Check [examples/](./examples/) directory
- **Issues**: Report via GitHub issues
- **Testing**: Use [simple-test.html](./simple-test.html) for quick verification

---

*Version 2.0 | Last updated: January 2024*