/**
 * PageMade Editor Configuration
 * Rebranded from GrapesJS with enhanced features
 */

// GrapesJS is loaded via pagemade.min.js wrapper
// import grapesjs from 'grapesjs'
// import 'grapesjs-tailwind'

export class PageMadeEditor {
    constructor(editor, options = {}) {
        this.editor = editor
        this.options = options
        this.isPreview = false
    }

    static async create(options = {}) {
        const config = new PageMadeEditorConfig(options)
        const editor = window.pm.init(config.getConfig())
        
        return new PageMadeEditor(editor, options)
    }

    getContent() {
        return {
            html: this.editor.getHtml(),
            css: this.editor.getCss(),
            components: this.editor.getComponents(),
            styles: this.editor.getStyle(),
            assets: this.editor.getAssets()
        }
    }

    getStyles() {
        return this.editor.getStyle()
    }

    getAssets() {
        return this.editor.getAssets()
    }

    togglePreview() {
        this.isPreview = !this.isPreview
        
        if (this.isPreview) {
            this.editor.runCommand('gjs-preserve-command', true)
            this.editor.runCommand('gjs-preserve-selected', false)
            this.editor.setDevice('Desktop')
            this.editor.runCommand('preview')
        } else {
            this.editor.stopCommand('preview')
            this.editor.runCommand('gjs-preserve-command', false)
        }
        
        return this.isPreview
    }
}

export class PageMadeEditorConfig {
    constructor(options = {}) {
        this.options = options
        this.pageData = options.pageData || {}
    }

    getConfig() {
        return {
            // Basic configuration
            height: '100%',
            width: '100%',
            container: '#gjs',
            
            // Storage Manager - Disabled (we handle save/load manually)
            storageManager: false,
            
            // Plugins - grapesjs-tailwind loaded separately in HTML
            plugins: [],
            pluginsOpts: {},
            
            // Block Manager
            blockManager: {
                appendTo: '#blocks-container',
                custom: true,
                blocks: this.getCustomBlocks()
            },
            
            // Layer Manager
            layerManager: {
                appendTo: '#layers-container'
            },
            
            // Asset Manager
            assetManager: {
                appendTo: '#assets-panel',
                upload: true,
                uploadFile: (e) => this.handleAssetUpload(e),
                assets: this.pageData.assets || []
            },
            
            // Style Manager - Complete CSS Properties
            styleManager: {
                appendTo: '#styles-container',
                sectors: this.getStyleSectors()
            },
            
            // Trait Manager
            traitManager: {
                appendTo: '#traits-container'
            },
            
            // Device Manager
            // Note: Tablet behaves like Desktop (no fixed height, just width change)
            // Mobile width should match DeviceSwitcher.js (375px)
            deviceManager: {
                devices: [
                    {
                        name: 'Desktop',
                        width: '',
                        widthMedia: '992px'
                    },
                    {
                        name: 'Tablet',
                        width: '768px',
                        widthMedia: '768px'
                        // No height - auto height like desktop
                    },
                    {
                        name: 'Mobile',
                        width: '375px',
                        widthMedia: '375px'
                    }
                ]
            },
            
            // Canvas configuration
            // IMPORTANT: Load ALL CSS resources via CDN for reliability
            // This prevents CORS issues and ensures fonts/icons load correctly
            canvas: {
                // Enable scrollable canvas for content overflow
                scrollableCanvas: true,
                styles: [
                    // Tailwind CSS (CDN - specific version for stability)
                    'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
                    
                    // PageMade Core CSS (from Backend static folder)
                    'http://localhost:5000/static/pagemade/pagemade.min.css',
                    
                    // Font Awesome Icons (CDN - version 5.15.4 for ligature support)
                    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
                ],
                scripts: [],
            },
            
            // Commands
            commands: {
                defaults: this.getCustomCommands()
            },
            
            // Panels configuration
            panels: { defaults: [] },
            
            // Selectors
            selectorManager: {
                escapeName: (name) => name.replace(/(\s|#)/g, '_'),
                labelName: (name) => name.charAt(0).toUpperCase() + name.slice(1)
            },
            
            // Rich Text Editor - Using default actions
            // Custom actions removed to prevent DOM appendChild errors
            richTextEditor: {},
            
            // Undo Manager
            undoManager: {
                trackSelection: false
            },
            
            // Events
            onReady: () => {
                console.log('🎨 PageMade editor ready!')
                
                // Load existing content if available
                if (this.pageData && this.pageData.page && this.pageData.page.content) {
                    try {
                        const content = JSON.parse(this.pageData.page.content)
                        if (content.html) {
                            this.editor.setComponents(content.html)
                        }
                        if (content.css) {
                            this.editor.setStyle(content.css)
                        }
                        if (content.components) {
                            this.editor.setComponents(content.components)
                        }
                        if (content.styles) {
                            this.editor.setStyle(content.styles)
                        }
                        console.log('📄 Loaded existing page content')
                    } catch (error) {
                        console.error('Failed to load existing content:', error)
                    }
                }
                
                if (this.options.onReady) {
                    this.options.onReady()
                }
            },
            
            onSave: (e) => {
                console.log('💾 Saving content...')
                if (this.options.onSave) {
                    this.options.onSave(e)
                }
            },
            
            onStorage: (e) => {
                console.log('📦 Storage event:', e)
            },
            
            onComponentSelect: (component) => {
                console.log('🎯 Component selected:', component)
            },
            
            onComponentDeselected: (component) => {
                console.log('📤 Component deselected:', component)
            },
            
            onBlock: (block) => {
                console.log('🧩 Block added:', block)
            },
            
            onAsset: (asset) => {
                console.log('🖼️ Asset added:', asset)
            },
            
            onStyle: (style) => {
                console.log('🎨 Style changed:', style)
            }
        }
    }

    getCustomBlocks() {
        return [
            {
                id: 'section',
                label: 'Section',
                category: 'Layout',
                content: '<section class="p-8"><h1 class="text-3xl font-bold mb-4">Section Title</h1><p class="text-gray-600">Section content goes here...</p></section>',
                attributes: { class: 'fa fa-square' }
            },
            {
                id: 'container',
                label: 'Container',
                category: 'Layout',
                content: '<div class="container mx-auto px-4"></div>',
                attributes: { class: 'fa fa-square-full' }
            },
            {
                id: 'grid',
                label: 'Grid',
                category: 'Layout',
                content: '<div class="grid grid-cols-3 gap-4"><div class="bg-gray-200 p-4">Column 1</div><div class="bg-gray-200 p-4">Column 2</div><div class="bg-gray-200 p-4">Column 3</div></div>',
                attributes: { class: 'fa fa-th' }
            },
            {
                id: 'card',
                label: 'Card',
                category: 'Components',
                content: '<div class="bg-white rounded-lg shadow-md p-6"><h3 class="text-lg font-semibold mb-2">Card Title</h3><p class="text-gray-600">Card description...</p></div>',
                attributes: { class: 'fa fa-square' }
            },
            {
                id: 'button',
                label: 'Button',
                category: 'Components',
                content: '<button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Click me</button>',
                attributes: { class: 'fa fa-square' }
            },
            {
                id: 'form',
                label: 'Form',
                category: 'Components',
                content: '<form class="space-y-4"><input type="text" placeholder="Name" class="w-full p-2 border rounded"><textarea placeholder="Message" class="w-full p-2 border rounded"></textarea><button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Submit</button></form>',
                attributes: { class: 'fa fa-square' }
            },
            {
                id: 'navbar',
                label: 'Navigation',
                category: 'Components',
                content: '<nav class="bg-white shadow-md"><div class="container mx-auto px-4 py-4 flex justify-between items-center"><div class="text-xl font-bold">Logo</div><div class="space-x-4"><a href="#" class="text-gray-600 hover:text-gray-900">Home</a><a href="#" class="text-gray-600 hover:text-gray-900">About</a><a href="#" class="text-gray-600 hover:text-gray-900">Contact</a></div></div></nav>',
                attributes: { class: 'fa fa-bars' }
            },
            {
                id: 'footer',
                label: 'Footer',
                category: 'Components',
                content: '<footer class="bg-gray-800 text-white py-8"><div class="container mx-auto px-4 text-center"><p>&copy; 2024 Your Company. All rights reserved.</p></div></footer>',
                attributes: { class: 'fa fa-square' }
            }
        ]
    }

    getStyleSectors() {
        return [
            {
                name: 'Layout',
                open: false,
                buildProps: ['display', 'flex-direction', 'justify-content', 'align-items', 'align-content', 'flex-wrap', 'gap', 'float', 'clear', 'overflow', 'overflow-x', 'overflow-y'],
                properties: [
                    {
                        type: 'select',
                        property: 'display',
                        default: 'block',
                        options: [
                            { value: 'block', name: 'Block' },
                            { value: 'inline', name: 'Inline' },
                            { value: 'inline-block', name: 'Inline Block' },
                            { value: 'flex', name: 'Flex' },
                            { value: 'inline-flex', name: 'Inline Flex' },
                            { value: 'grid', name: 'Grid' },
                            { value: 'inline-grid', name: 'Inline Grid' },
                            { value: 'none', name: 'None' },
                        ],
                    },
                    {
                        type: 'select',
                        property: 'flex-direction',
                        default: 'row',
                        options: [
                            { value: 'row', name: 'Row' },
                            { value: 'row-reverse', name: 'Row Reverse' },
                            { value: 'column', name: 'Column' },
                            { value: 'column-reverse', name: 'Column Reverse' },
                        ],
                    },
                    {
                        type: 'select',
                        property: 'justify-content',
                        default: 'flex-start',
                        options: [
                            { value: 'flex-start', name: 'Start' },
                            { value: 'center', name: 'Center' },
                            { value: 'flex-end', name: 'End' },
                            { value: 'space-between', name: 'Space Between' },
                            { value: 'space-around', name: 'Space Around' },
                            { value: 'space-evenly', name: 'Space Evenly' },
                        ],
                    },
                    {
                        type: 'select',
                        property: 'align-items',
                        default: 'stretch',
                        options: [
                            { value: 'stretch', name: 'Stretch' },
                            { value: 'flex-start', name: 'Start' },
                            { value: 'center', name: 'Center' },
                            { value: 'flex-end', name: 'End' },
                            { value: 'baseline', name: 'Baseline' },
                        ],
                    }
                ]
            },
            {
                name: 'Typography',
                open: false,
                buildProps: ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'color', 'text-align', 'text-decoration'],
                properties: [
                    {
                        property: 'font-family',
                        type: 'select',
                        default: 'sans-serif',
                        options: [
                            { value: 'sans-serif', name: 'Sans Serif' },
                            { value: 'serif', name: 'Serif' },
                            { value: 'monospace', name: 'Monospace' },
                        ]
                    },
                    {
                        property: 'font-size',
                        type: 'integer',
                        units: ['px', 'em', 'rem', '%'],
                        default: 16
                    },
                    {
                        property: 'font-weight',
                        type: 'select',
                        default: 'normal',
                        options: [
                            { value: '100', name: 'Thin' },
                            { value: '300', name: 'Light' },
                            { value: '400', name: 'Normal' },
                            { value: '500', name: 'Medium' },
                            { value: '600', name: 'Semi Bold' },
                            { value: '700', name: 'Bold' },
                            { value: '900', name: 'Black' },
                        ]
                    }
                ]
            },
            {
                name: 'Spacing',
                open: false,
                buildProps: ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
                properties: [
                    {
                        property: 'margin',
                        type: 'integer',
                        units: ['px', 'em', 'rem', '%', 'vh', 'vw'],
                        default: 0
                    },
                    {
                        property: 'padding',
                        type: 'integer',
                        units: ['px', 'em', 'rem', '%', 'vh', 'vw'],
                        default: 0
                    }
                ]
            },
            {
                name: 'Appearance',
                open: false,
                buildProps: ['background-color', 'background-image', 'border', 'border-radius', 'box-shadow', 'opacity'],
                properties: [
                    {
                        property: 'background-color',
                        type: 'color'
                    },
                    {
                        property: 'border-radius',
                        type: 'integer',
                        units: ['px', '%'],
                        default: 0
                    },
                    {
                        property: 'opacity',
                        type: 'slider',
                        min: 0,
                        max: 1,
                        step: 0.1,
                        default: 1
                    }
                ]
            }
        ]
    }

    getCustomCommands() {
        return [
            {
                id: 'preview',
                run: function(editor, sender) {
                    sender && sender.set('active', 0);
                    editor.runCommand('gjs-preserve-command', true);
                    editor.runCommand('gjs-preserve-selected', false);
                    editor.setDevice('Desktop');
                    editor.getModel().set('state', 'preview');
                },
                stop: function(editor, sender) {
                    editor.stopCommand('gjs-preserve-command');
                    editor.getModel().set('state', '');
                }
            },
            {
                id: 'toggle-outline',
                run: function(editor, sender) {
                    editor.runCommand('gjs-toggle-outline');
                    sender && sender.set('active', editor.getModel().get('outline'));
                }
            },
            {
                id: 'fullscreen',
                run: function(editor, sender) {
                    const el = editor.getContainer().closest('body');
                    if (el.requestFullscreen) {
                        el.requestFullscreen();
                    } else if (el.webkitRequestFullscreen) {
                        el.webkitRequestFullscreen();
                    } else if (el.mozRequestFullScreen) {
                        el.mozRequestFullScreen();
                    }
                }
            }
        ]
    }

    async handleAssetUpload(e) {
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files
        
        for (let file of files) {
            if (file.type.match('image.*')) {
                const formData = new FormData()
                formData.append('file', file)
                
                try {
                    const result = await window.apiClient.uploadAsset(formData)
                    if (result && result.url) {
                        this.editor.AssetManager.add(result.url)
                    }
                } catch (error) {
                    console.error('Upload failed:', error)
                }
            }
        }
    }
}

export default PageMadeEditor