# PageMade Editor v2.0 - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan

PageMade Editor v2.0 là phiên bản refactor từ architecture monolithic sang modular architecture. Editor được xây dựng với cấu trúc module hóa, dễ dàng bảo trì và mở rộng.

### 🏗️ Architecture Overview

```
PageMadeEditor (Main Class)
├── Core Modules
│   ├── EventBus (Communication)
│   ├── StateManager (State Management)
│   ├── LifecycleManager (Change Tracking)
│   └── Editor (GrapesJS Wrapper)
├── UI Modules
│   ├── PanelManager (Side Panels)
│   ├── AssetManager (File Management)
│   ├── BlockManager (Block Components)
│   ├── Canvas (Main Canvas)
│   └── Toolbar (Action Toolbar)
└── Styles
    ├── editor.css
    ├── components.css
    └── themes.css
```

## 🚀 Quick Start

### 1. Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>PageMade Editor</title>
    <!-- Load GrapesJS (Required Dependency) -->
    <script src="https://unpkg.com/grapesjs"></script>
    <!-- Load PageMade Editor Bundle -->
    <script src="/static/dist/pagemaker-editor.bundle.js"></script>
</head>
<body>
    <div id="editor-container"></div>
    
    <script>
        // Initialize editor
        const editor = new PageMadeEditor();
        
        await editor.initialize(
            // Page data
            {
                id: 123,
                siteId: 456,
                title: "My Page"
            },
            // API endpoints
            {
                load: '/api/pages/123/load',
                save: '/api/pages/123/save',
                publish: '/api/pages/123/publish',
                preview: '/pages/123/preview',
                assets: '/api/assets'
            },
            // Configuration (optional)
            {
                theme: 'light',
                autoSave: true,
                autoSaveInterval: 30000,
                debug: true
            }
        );
        
        console.log('Editor ready!');
    </script>
</body>
</html>
```

### 2. Advanced Usage with Event Handling

```javascript
const editor = new PageMadeEditor();

// Listen to editor events
const eventBus = editor.getEventBus();

eventBus.on('editor:ready', (data) => {
    console.log('Editor initialized:', data);
});

eventBus.on('editor:saved', (data) => {
    console.log('Page saved:', data);
});

eventBus.on('editor:published', (data) => {
    console.log('Page published:', data);
});

eventBus.on('editor:status', (data) => {
    // Show status notifications
    showNotification(data.message, data.type);
});

// Initialize with custom configuration
await editor.initialize(pageData, endpoints, {
    theme: 'dark',
    autoSave: false,
    debug: true
});
```

## 📦 Module API Reference

### Core Modules

#### EventBus
```javascript
const eventBus = editor.getEventBus();

// Listen to events
eventBus.on('event:name', (data) => {
    console.log('Event received:', data);
});

// Emit events
eventBus.emit('event:name', { key: 'value' });

// Remove listeners
eventBus.off('event:name', handler);

// Clear all events
eventBus.clear();
```

#### StateManager
```javascript
const stateManager = editor.getStateManager();

// Get current state
const state = stateManager.getState();

// Check if there are unsaved changes
const hasChanges = stateManager.hasChanges();

// Mark as saved
stateManager.markAsSaved();

// Track changes
stateManager.trackChange('component:updated', { componentId: 123 });
```

### UI Modules

#### PanelManager
```javascript
const panelManager = editor.panelManager;

// Show specific tab
panelManager.showTab('assets');
panelManager.showTab('blocks');
panelManager.showTab('styles');

// Show component styles
panelManager.showComponentStyles(component);

// Toggle panel visibility
panelManager.toggle();
```

#### AssetManager
```javascript
const assetManager = editor.assetManager;

// Load assets
await assetManager.loadAssets();

// Upload new asset
const asset = await assetManager.uploadAsset(file);

// Delete asset
await assetManager.deleteAsset(assetId);
```

#### BlockManager
```javascript
const blockManager = editor.blockManager;

// Load blocks
await blockManager.loadBlocks();

// Add custom block
blockManager.addBlock('my-block', {
    label: 'My Custom Block',
    content: '<div class="my-block">Content</div>',
    category: 'Custom'
});
```

## 🎨 Themes & Styling

### Built-in Themes
```javascript
// Switch themes
editor.setTheme('light');
editor.setTheme('dark');

// Get current theme
const currentTheme = editor.getTheme();
```

### Custom CSS
```css
/* Custom theme variables */
[data-theme="dark"] {
    --primary-color: #2563eb;
    --background-color: #1f2937;
    --text-color: #f3f4f6;
}

/* Component overrides */
.pagemaker-panel {
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

## 🔧 Configuration Options

### Default Configuration
```javascript
const defaultConfig = {
    theme: 'light',              // 'light' | 'dark'
    autoSave: true,              // Enable auto-save
    autoSaveInterval: 30000,     // Auto-save interval (ms)
    debug: false                 // Enable debug logging
};
```

### Custom Configuration
```javascript
await editor.initialize(pageData, endpoints, {
    theme: 'dark',
    autoSave: true,
    autoSaveInterval: 60000,    // 1 minute
    debug: true,
    
    // Custom panel configuration
    panels: {
        position: 'right',       // 'left' | 'right'
        width: 300,
        collapsible: true
    },
    
    // Custom toolbar configuration
    toolbar: {
        position: 'top',         // 'top' | 'bottom'
        sticky: true
    }
});
```

## 📡 API Integration

### Required Endpoints
```javascript
const endpoints = {
    load: '/api/pages/{page_id}/load',      // GET - Load page content
    save: '/api/pages/{page_id}/save',      // POST - Save page content
    publish: '/api/pages/{page_id}/publish', // POST - Publish page
    preview: '/pages/{page_id}/preview',     // GET - Preview page
    assets: '/api/assets'                    // GET/POST - Asset management
};
```

### Expected API Responses

#### Load Page
```json
{
    "success": true,
    "data": {
        "id": 123,
        "title": "My Page",
        "content": "<html>...</html>",
        "css": "body { margin: 0; }",
        "assets": [...]
    }
}
```

#### Save Page
```json
{
    "success": true,
    "message": "Page saved successfully",
    "data": {
        "updated_at": "2024-01-01T12:00:00Z"
    }
}
```

## 🎯 Common Use Cases

### 1. Simple Page Editor
```javascript
// Minimal setup for basic page editing
const editor = new PageMadeEditor();
await editor.initialize(
    { id: 1, siteId: 1, title: "Home Page" },
    { 
        save: '/save', 
        publish: '/publish',
        preview: '/preview'
    }
);
```

### 2. Advanced Multi-site Editor
```javascript
const editor = new PageMadeEditor();

// Setup event handlers for multi-site management
editor.getEventBus().on('editor:saved', (data) => {
    // Update site navigation
    updateSiteNavigation();
    
    // Notify other users
    notifyCollaborators(pageId, 'updated');
});

// Initialize with site-specific configuration
await editor.initialize(pageData, endpoints, {
    theme: siteConfig.theme,
    autoSave: siteConfig.autoSave,
    debug: isDevelopment
});
```

### 3. Custom Block Integration
```javascript
// Add custom blocks before initialization
const blockManager = editor.blockManager;

// Register custom blocks
blockManager.addBlock('hero-banner', {
    label: 'Hero Banner',
    category: 'Layout',
    content: `
        <div class="hero-banner">
            <h1>{{title}}</h1>
            <p>{{description}}</p>
            <button>{{cta_text}}</button>
        </div>
    `,
    attributes: {
        title: { type: 'text', default: 'Welcome' },
        description: { type: 'text', default: 'Description' },
        cta_text: { type: 'text', default: 'Get Started' }
    }
});

// Then initialize editor
await editor.initialize(pageData, endpoints);
```

## 🐛 Debugging

### Enable Debug Mode
```javascript
const editor = new PageMadeEditor();
await editor.initialize(pageData, endpoints, { debug: true });
```

### Debug Events
```javascript
const eventBus = editor.getEventBus();

// Log all events
eventBus.on('*', (eventName, data) => {
    console.log(`🔔 Event: ${eventName}`, data);
});

// Monitor state changes
eventBus.on('state:changed', (data) => {
    console.log('📝 State changed:', data);
});
```

### Module Status
```javascript
// Check all modules status
const status = editor.getModuleStatus();
console.log('Module Status:', status);

// Check if editor is ready
if (editor.isReady()) {
    console.log('Editor is ready for use');
}
```

## 🔄 Migration from v1.0

### Key Changes
1. **Modular Architecture**: Code is now split into focused modules
2. **Event-Driven**: All communication happens through EventBus
3. **State Management**: Centralized state tracking
4. **Bundle Size**: Optimized webpack build (1.35MB vs 2.5MB)

### Migration Steps
```javascript
// Old v1.0 approach
const editor = grapesjs.init({
    container: '#gjs',
    // ... configuration
});

// New v2.0 approach
const editor = new PageMadeEditor();
await editor.initialize(pageData, endpoints, config);
```

## 📚 Additional Resources

- **API Reference**: See inline documentation in source code
- **Examples**: Check `static/examples/` directory
- **Testing**: Use `static/simple-test.html` for quick testing
- **Development**: See `UPDATE_GUIDE.md` for development workflow

## 🆘 Troubleshooting

### Common Issues

1. **Bundle not loading**: Check that GrapesJS is loaded first
2. **Events not firing**: Ensure editor is fully initialized
3. **Save not working**: Verify API endpoints are correct
4. **Styles not applying**: Check CSS file imports

### Getting Help
- Check browser console for error messages
- Enable debug mode for detailed logging
- Verify all required dependencies are loaded
- Test with `static/simple-test.html` first

---

*Last updated: January 2024*