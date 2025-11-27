# PageMade Editor v2.0 - Hướng Dẫn Cập Nhật

## 📋 Tổng Quan

Hướng dẫn này giúp bạn hiểu cách cập nhật, bảo trì và phát triển PageMade Editor v2.0 sau khi refactor sang modular architecture.

## 🏗️ Architecture Overview

### Cấu Trúc Thư Mục
```
static/
├── src/                          # Source code (ES6 Modules)
│   ├── index.js                  # Main entry point
│   ├── core/                     # Core modules
│   │   ├── Editor.js            # Main editor wrapper
│   │   ├── EventBus.js          # Event system
│   │   ├── StateManager.js      # State management
│   │   └── LifecycleManager.js  # Change tracking
│   ├── modules/                  # UI modules
│   │   ├── panels/              # Side panels
│   │   ├── assets/              # Asset management
│   │   ├── blocks/              # Block components
│   │   ├── canvas/              # Main canvas
│   │   └── toolbar/             # Action toolbar
│   └── styles/                   # CSS files
├── dist/                         # Built bundles
│   └── pagemaker-editor.bundle.js
├── pagemaker/                   # Legacy files (deprecated)
├── webpack.config.js            # Build configuration
├── package.json                 # Dependencies
└── examples/                    # Usage examples
```

### Module Dependencies
```
PageMadeEditor (Main)
├── EventBus (Core - No dependencies)
├── StateManager (Core - Depends on EventBus)
├── LifecycleManager (Core - Depends on EventBus, StateManager)
├── Editor (Core - GrapesJS wrapper)
├── PanelManager (UI - Depends on EventBus, StateManager)
├── AssetManager (UI - Depends on EventBus, StateManager)
├── BlockManager (UI - Depends on EventBus, StateManager)
├── Canvas (UI - Depends on EventBus, StateManager)
└── Toolbar (UI - Depends on EventBus, StateManager)
```

## 🔄 Development Workflow

### 1. Setup Development Environment

```bash
# Navigate to static directory
cd /home/helios/ver1.1/backend/static

# Install dependencies (if not already done)
npm install

# Start development mode with watch
npm run dev

# Or build once
npm run build
```

### 2. Making Changes

#### Step 1: Identify Module to Update
```bash
# Find which module contains the functionality
grep -r "functionName" src/
grep -r "className" src/
```

#### Step 2: Make Changes
```bash
# Edit the appropriate module file
vim src/modules/panels/PanelManager.js
```

#### Step 3: Test Changes
```bash
# Build and test
npm run build

# Test with simple page
open simple-test.html
```

### 3. Build Process

#### Development Build
```bash
# Fast build with source maps
npm run dev

# Output: dist/pagemaker-editor.bundle.js (unminified)
```

#### Production Build
```bash
# Optimized build
NODE_ENV=production npm run build

# Output: dist/pagemaker-editor.bundle.js (minified)
```

## 📦 Module Development Guide

### 1. Creating New Modules

#### Step 1: Create Module File
```javascript
// src/modules/newmodule/NewModule.js
import EventBus from '../../core/EventBus.js';
import StateManager from '../../core/StateManager.js';

export class NewModule {
    constructor(eventBus, stateManager) {
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        this.isInitialized = false;
    }
    
    async initialize(editorInstance, pageData) {
        console.log('🔧 Initializing NewModule...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize UI
        this.initializeUI(editorInstance);
        
        this.isInitialized = true;
        console.log('✅ NewModule initialized');
    }
    
    setupEventListeners() {
        this.eventBus.on('some:event', (data) => {
            this.handleEvent(data);
        });
    }
    
    initializeUI(editorInstance) {
        // Initialize UI components
    }
    
    handleEvent(data) {
        // Handle events
    }
    
    destroy() {
        // Cleanup
        this.eventBus.off('some:event', this.handleEvent);
        this.isInitialized = false;
    }
}
```

#### Step 2: Register Module in Main Editor
```javascript
// src/index.js
import { NewModule } from './modules/newmodule/NewModule.js';

class PageMadeEditor {
    constructor() {
        // ... existing code
        this.newModule = null;
    }
    
    async initializeUIModules() {
        // ... existing modules
        
        // Initialize new module
        this.newModule = new NewModule(this.eventBus, this.stateManager);
    }
    
    async initializeUIWithEditor() {
        // ... existing modules
        
        // Initialize new module with editor
        await this.newModule.initialize(editorInstance, this.pageData);
    }
    
    destroy() {
        // ... existing cleanup
        
        if (this.newModule) this.newModule.destroy();
    }
}
```

### 2. Updating Existing Modules

#### Best Practices
1. **Maintain API Compatibility**: Don't break existing method signatures
2. **Use Events for Communication**: Avoid direct module-to-module calls
3. **Handle State Properly**: Use StateManager for state changes
4. **Cleanup Resources**: Implement proper destroy methods

#### Example: Adding New Feature to PanelManager
```javascript
// src/modules/panels/PanelManager.js
export class PanelManager {
    // ... existing code
    
    /**
     * New feature: Add custom panel
     */
    addCustomPanel(name, content, options = {}) {
        const panel = document.createElement('div');
        panel.className = 'pagemaker-panel custom-panel';
        panel.innerHTML = content;
        
        // Add to container
        this.container.appendChild(panel);
        
        // Emit event
        this.eventBus.emit('panel:custom-added', { name, panel });
        
        return panel;
    }
    
    /**
     * Enhanced feature: Panel with animation
     */
    showTab(tabName, animated = true) {
        if (animated) {
            this.animateTabTransition(tabName);
        } else {
            this.showTabImmediate(tabName);
        }
    }
    
    animateTabTransition(tabName) {
        // Add animation logic
        const currentTab = this.currentTab;
        const newTab = this.tabs[tabName];
        
        if (currentTab) {
            currentTab.classList.add('fade-out');
        }
        
        setTimeout(() => {
            this.showTabImmediate(tabName);
            if (newTab) {
                newTab.classList.add('fade-in');
            }
        }, 150);
    }
}
```

### 3. Event System Usage

#### Emitting Events
```javascript
// In any module
this.eventBus.emit('module:action', {
    type: 'user-action',
    data: { id: 123, value: 'example' },
    timestamp: Date.now()
});
```

#### Listening to Events
```javascript
// In any module
this.eventBus.on('module:action', (data) => {
    console.log('Action received:', data);
    
    // Handle the event
    if (data.type === 'user-action') {
        this.handleUserAction(data.data);
    }
});
```

#### Event Naming Convention
```
module:action           # Module-specific actions
editor:lifecycle        # Editor lifecycle events
state:changed          # State change notifications
ui:interaction         # UI interaction events
error:occurred         # Error events
```

## 🛠️ Common Update Scenarios

### 1. Adding New API Endpoint

#### Step 1: Update Endpoints Configuration
```javascript
// In initialization
const endpoints = {
    // ... existing endpoints
    newFeature: '/api/new-feature'
};
```

#### Step 2: Add Method to Appropriate Module
```javascript
// src/modules/features/NewFeatureModule.js
export class NewFeatureModule {
    async fetchNewFeature() {
        try {
            const response = await fetch(this.endpoints.newFeature, {
                method: 'GET',
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.eventBus.emit('new-feature:loaded', data);
                return data;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.eventBus.emit('error:occurred', {
                type: 'new-feature-fetch',
                error: error.message
            });
            throw error;
        }
    }
}
```

### 2. Updating UI Components

#### Step 1: Update CSS
```css
/* src/styles/components.css */
.pagemaker-new-component {
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px;
    margin: 8px 0;
}

.pagemaker-new-component:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

#### Step 2: Update JavaScript Module
```javascript
// src/modules/components/NewComponent.js
export class NewComponent {
    createElement(data) {
        const element = document.createElement('div');
        element.className = 'pagemaker-new-component';
        element.innerHTML = `
            <h3>${data.title}</h3>
            <p>${data.description}</p>
            <button class="btn-primary">${data.actionText}</button>
        `;
        
        // Add event listeners
        element.querySelector('button').addEventListener('click', () => {
            this.eventBus.emit('component:action', {
                type: 'new-component',
                data: data
            });
        });
        
        return element;
    }
}
```

### 3. Performance Optimization

#### Code Splitting
```javascript
// webpack.config.js
module.exports = {
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                core: {
                    test: /[\\/]src[\\/]core[\\/]/,
                    name: 'core',
                    chunks: 'all'
                },
                modules: {
                    test: /[\\/]src[\\/]modules[\\/]/,
                    name: 'modules',
                    chunks: 'all'
                }
            }
        }
    }
};
```

#### Lazy Loading
```javascript
// src/modules/lazy/LazyModule.js
export class LazyModule {
    async loadFeature(featureName) {
        try {
            const module = await import(`./features/${featureName}.js`);
            const feature = new module.default();
            await feature.initialize();
            return feature;
        } catch (error) {
            console.error(`Failed to load feature ${featureName}:`, error);
            throw error;
        }
    }
}
```

## 🧪 Testing Guide

### 1. Unit Testing

#### Test Setup
```javascript
// tests/unit/EventManager.test.js
import { EventBus } from '../../src/core/EventBus.js';

describe('EventBus', () => {
    let eventBus;
    
    beforeEach(() => {
        eventBus = new EventBus();
    });
    
    afterEach(() => {
        eventBus.clear();
    });
    
    test('should emit and receive events', () => {
        const mockCallback = jest.fn();
        eventBus.on('test:event', mockCallback);
        
        eventBus.emit('test:event', { data: 'test' });
        
        expect(mockCallback).toHaveBeenCalledWith({ data: 'test' });
    });
});
```

### 2. Integration Testing

#### Test Page
```html
<!-- tests/integration/editor-test.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Editor Integration Test</title>
    <script src="https://unpkg.com/grapesjs"></script>
    <script src="../../dist/pagemaker-editor.bundle.js"></script>
</head>
<body>
    <div id="test-container"></div>
    
    <script>
        async function runTests() {
            const editor = new PageMadeEditor();
            
            try {
                await editor.initialize(
                    { id: 1, siteId: 1, title: "Test Page" },
                    {
                        save: '/test/save',
                        publish: '/test/publish'
                    }
                );
                
                console.log('✅ Integration test passed');
                
            } catch (error) {
                console.error('❌ Integration test failed:', error);
            }
        }
        
        runTests();
    </script>
</body>
</html>
```

### 3. End-to-End Testing

#### Automated Tests
```javascript
// tests/e2e/editor-workflow.test.js
describe('Editor Workflow', () => {
    test('complete editing workflow', async () => {
        // Initialize editor
        const editor = new PageMadeEditor();
        await editor.initialize(pageData, endpoints);
        
        // Add content
        const canvas = editor.getEditor().getCanvas();
        const component = canvas.addComponent({
            type: 'text',
            content: 'Hello World'
        });
        
        // Save
        await editor.save();
        
        // Verify save was successful
        expect(editor.getStateManager().hasChanges()).toBe(false);
    });
});
```

## 🚀 Deployment Guide

### 1. Production Build

```bash
# Clean build
rm -rf dist/
NODE_ENV=production npm run build

# Verify bundle
ls -la dist/pagemaker-editor.bundle.js
```

### 2. Version Management

#### Update Version
```bash
# Update package.json version
npm version patch  # or minor, major

# Build new version
npm run build

# Tag release
git tag -a v2.0.1 -m "Release v2.0.1"
git push origin v2.0.1
```

### 3. Rollback Plan

#### If Build Fails
```bash
# Restore previous working version
git checkout previous-working-commit
npm run build

# Test rollback
open simple-test.html
```

## 📝 Best Practices

### 1. Code Organization
- **Single Responsibility**: Each module has one clear purpose
- **Dependency Injection**: Pass dependencies through constructor
- **Event-Driven**: Use EventBus for inter-module communication
- **State Management**: Use StateManager for all state changes

### 2. Performance
- **Lazy Loading**: Load modules only when needed
- **Bundle Splitting**: Separate vendor and app code
- **Tree Shaking**: Remove unused code
- **Caching**: Use appropriate caching strategies

### 3. Error Handling
```javascript
// Standard error handling pattern
try {
    const result = await this.someOperation();
    this.eventBus.emit('operation:success', result);
} catch (error) {
    console.error('Operation failed:', error);
    this.eventBus.emit('error:occurred', {
        type: 'operation-failed',
        error: error.message,
        context: this.getContext()
    });
}
```

### 4. Documentation
- **Inline Comments**: Document complex logic
- **JSDoc**: Use JSDoc for public APIs
- **README**: Update README for major changes
- **CHANGELOG**: Maintain changelog for releases

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Errors
```bash
# Check webpack configuration
npm run build -- --verbose

# Clear cache
rm -rf node_modules/.cache
npm install
```

#### 2. Runtime Errors
```javascript
// Enable debug mode
const editor = new PageMadeEditor();
await editor.initialize(pageData, endpoints, { debug: true });

// Check console for detailed logs
```

#### 3. Module Loading Issues
```bash
# Check bundle contents
grep -o "export.*{" dist/pagemaker-editor.bundle.js

# Test individual modules
node -e "
import('./src/core/EventBus.js').then(m => {
    console.log('EventBus loaded:', m.EventBus);
});
"
```

## 📚 Additional Resources

- **Webpack Documentation**: https://webpack.js.org/
- **ES6 Modules**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- **Event-Driven Architecture**: Research patterns and best practices
- **GrapesJS Documentation**: https://grapesjs.com/docs/

---

*Last updated: January 2024*