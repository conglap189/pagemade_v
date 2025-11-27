/**
 * PageMade Editor v3 - Main Entry Point
 * Rebranded from GrapesJS with modular architecture
 */

import { PageMadeEditor } from './config/pagemade-config.js'
import { PageMadeEditorConfig } from './config/pagemade-config.js'
import AuthGuard from './auth-check.js'
import { ThemeManager } from './utils/ThemeManager.js'
import { StorageManager } from './utils/StorageManager.js'
import { HistoryManager } from './utils/HistoryManager.js'
import { Toolbar } from './components/Toolbar.js'
import { ThemeToggle } from './components/ThemeToggle.js'
import { DeviceSwitcher } from './components/DeviceSwitcher.js'
import { FloatingToolbar } from './components/FloatingToolbar.js'
import { BlockPanel } from './panels/BlockPanel.js'
import { LayerPanel } from './panels/LayerPanel.js'
import { AssetPanel } from './panels/AssetPanel.js'
import { StylePanel } from './panels/StylePanel.js'
import { TraitsPanel } from './panels/TraitsPanel.js'
import { SettingsPanel } from './panels/SettingsPanel.js'

class PageMadeApp {
    constructor() {
        this.pm = null
        this.pageId = null
        this.pageData = null
        this.components = {}
        this.isInitialized = false
        
        console.log('🚀 PageMade Editor v3 initializing...')
    }

    /**
     * Wait for PageMade library (window.pm) to be loaded
     * @returns {Promise<void>}
     */
    async waitForPageMade() {
        return new Promise((resolve, reject) => {
            // If already loaded, resolve immediately
            if (window.pm && typeof window.pm.init === 'function') {
                console.log('✅ PageMade library already loaded')
                resolve()
                return
            }

            console.log('⏳ Waiting for PageMade library to load...')
            
            // Poll for window.pm every 50ms, timeout after 10 seconds
            const maxAttempts = 200 // 200 * 50ms = 10 seconds
            let attempts = 0
            
            const checkInterval = setInterval(() => {
                attempts++
                
                if (window.pm && typeof window.pm.init === 'function') {
                    console.log(`✅ PageMade library loaded after ${attempts * 50}ms`)
                    clearInterval(checkInterval)
                    resolve()
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval)
                    const error = new Error('PageMade library failed to load within 10 seconds')
                    console.error('❌', error.message)
                    reject(error)
                }
            }, 50)
        })
    }

    async init() {
        try {
            // 🚨 CRITICAL: Get Token from URL FIRST (before checkAuth to avoid race condition)
            console.log('🔍 Step 1: Extracting page ID and token from URL...')
            this.pageId = this.getPageIdFromUrl()
            this.token = this.getTokenFromUrl()
            
            if (this.token) {
                console.log('🔑 Step 2: Token found in URL, saving to localStorage...')
                localStorage.setItem('access_token', this.token)
                console.log('✅ Token saved successfully')
            } else {
                console.log('⚠️  No token in URL, will use stored authentication')
            }
            
            // 🔐 Step 3: Authentication Check (now with token already saved if provided)
            console.log('🔐 Step 3: Checking authentication...')
            const isAuth = await window.authGuard.checkAuth()
            if (!isAuth) {
                console.error('❌ Authentication failed - user will be redirected')
                return // Authentication failed, user will be redirected
            }
            
            // Verify token if provided (additional verification)
            if (this.token) {
                console.log('🔍 Step 4: Verifying token with backend...')
                await this.verifyToken()
            }
            
            // Initialize utilities
            console.log('🔧 Step 5: Initializing utilities...')
            this.themeManager = new ThemeManager()
            this.storageManager = new StorageManager()
            this.historyManager = new HistoryManager(null, {
                maxHistorySize: 50,
                autoSaveInterval: 30000
            })
            
            // Load page data
            console.log('📄 Step 6: Loading page data from API...')
            await this.loadPageData()
            
            // Initialize UI components
            this.initializeComponents()
            
            // Initialize PageMade editor FIRST (creates this.pm instance)
            await this.initializeEditor()
            
            // Load PageMade blocks from older system (AFTER editor is initialized)
            await this.loadPageMadeBlocks()
            
            // Setup event listeners
            this.setupEventListeners()
            
            this.isInitialized = true
            console.log('✅ PageMade Editor v3 initialized successfully!')
            
        } catch (error) {
            console.error('❌ FATAL ERROR - Failed to initialize PageMade Editor:', error)
            
            // Show detailed error to user instead of generic message
            const errorDetails = error.message || error.toString()
            const alertMsg = `⛔ Editor Initialization Failed\n\n${errorDetails}\n\nCheck browser console (F12) for details.`
            alert(alertMsg)
            
            // Also display error in UI
            this.showError(`Failed to initialize editor: ${errorDetails}`)
            
            // Do NOT redirect - let user see the error
            throw error // Re-throw to prevent further execution
        }
    }

    getPageIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search)
        const pathParts = window.location.pathname.split('/')
        
        // Try to get from URL path first: /editor/123
        if (pathParts.length > 2 && pathParts[1] === 'editor') {
            return pathParts[2]
        }
        
        // Then try query parameter: ?id=123
        const id = urlParams.get('id')
        if (id) return id
        
        // Default to 1 for development
        return '1'
    }

    getTokenFromUrl() {
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.get('token')
    }

    async verifyToken() {
        try {
            const result = await window.apiClient.verifyEditorToken(this.token)

            if (!result) {
                throw new Error('Token verification failed')
            }

            this.pageData = result
            console.log('✅ Token verified:', this.pageData)
            
            // Update page title
            document.title = `PageMade Editor - ${this.pageData.page_title}`
            
            return true
        } catch (error) {
            console.error('❌ Token verification failed:', error)
            this.showError('Token verification failed. Please access editor from dashboard.')
            return false
        }
    }

    async loadPageData() {
        try {
            // If we have verified token data, use it
            if (this.pageData) {
                console.log('Using verified token data')
                // Update page title
                const pageTitleEl = document.getElementById('page-title')
                const pageTitleDisplayEl = document.querySelector('.page-title')
                if (pageTitleEl) pageTitleEl.textContent = this.pageData.page_title || 'Untitled Page'
                if (pageTitleDisplayEl) pageTitleDisplayEl.textContent = this.pageData.page_title || 'Untitled Page'
                return
            }

            // Otherwise, load page content using PageMade API client
            console.log('Loading page data via PageMade API...')
            const pageData = await window.apiClient.getPage(this.pageId)
            
            if (!pageData) {
                throw new Error('Failed to load page data from API')
            }
            
            // Parse content JSON if it's a string
            let parsedContent = {}
            try {
                parsedContent = typeof pageData.content === 'string' 
                    ? JSON.parse(pageData.content) 
                    : pageData.content || {}
            } catch (e) {
                console.warn('⚠️ Failed to parse page content JSON, using as HTML:', e)
                parsedContent = { 'pm-html': pageData.content }
            }
            
            // Store page data in PageMade format (pm-* instead of gjs-*)
            this.pageData = {
                page: {
                    id: this.pageId,
                    title: pageData.title || 'Untitled Page',
                    content: parsedContent['pm-html'] || parsedContent['gjs-html'] || '',
                    css: parsedContent['pm-css'] || parsedContent['gjs-css'] || pageData.css_content || '',
                    components: parsedContent['pm-components'] || parsedContent['gjs-components'] || [],
                    styles: parsedContent['pm-styles'] || parsedContent['gjs-styles'] || [],
                    assets: parsedContent['pm-assets'] || parsedContent['gjs-assets'] || []
                },
                site: {
                    title: pageData.site_name || 'PageMade Site',
                    subdomain: pageData.subdomain || 'demo'
                },
                user: {
                    name: pageData.user_name || 'PageMade User'
                }
            }
            
            // Update page title in UI
            const pageTitleEl = document.getElementById('page-title')
            const pageTitleDisplayEl = document.querySelector('.page-title')
            if (pageTitleEl) pageTitleEl.textContent = this.pageData.page.title
            if (pageTitleDisplayEl) pageTitleDisplayEl.textContent = this.pageData.page.title
            
            console.log('✅ Page data loaded via PageMade API:', this.pageData)
            
        } catch (error) {
            console.error('❌ CRITICAL: Failed to load page data:', error)
            console.error('❌ Page ID:', this.pageId)
            console.error('❌ Error details:', error.message)
            
            // 🚫 DO NOT use fallback data - throw error to stop initialization
            // Let the main init() catch block handle the error display
            throw new Error(`Failed to load page data: ${error.message}`)
        }
    }

    initializeComponents() {
        this.toolbar = new Toolbar(this)
        this.themeToggle = new ThemeToggle(this)
        this.deviceSwitcher = new DeviceSwitcher()
        this.floatingToolbar = new FloatingToolbar(this)
        this.blockPanel = new BlockPanel(this)
        this.layerPanel = new LayerPanel(this)
        this.assetPanel = new AssetPanel(this)
        this.stylePanel = new StylePanel(this)
        this.traitsPanel = new TraitsPanel(this)
        this.settingsPanel = new SettingsPanel(this)
    }

    async initializeEditor() {
        try {
            console.log('🔧 Initializing PageMade editor...')
            
            // 🚨 CRITICAL: Wait for PageMade library to load
            await this.waitForPageMade()
            
            // Initialize PageMade editor with configuration
            const editorConfig = new PageMadeEditorConfig({ pageData: this.pageData })
            this.pm = window.pm.init(editorConfig.getConfig())
            
            // Store editor globally for older system compatibility
            window.editor = this.pm
            
            // Set editor instance for components that need it
            this.deviceSwitcher.setEditor(this.pm)
            this.historyManager.editor = this.pm
            
            // Initialize device switcher, history manager, and floating toolbar
            this.deviceSwitcher.init()
            this.historyManager.init()
            this.floatingToolbar.init()
            
            // Load existing page content from older system format
            if (this.pageData && this.pageData.page) {
                console.log('📊 Page data structure:', {
                    hasComponents: !!(this.pageData.page.components),
                    componentsLength: this.pageData.page.components?.length,
                    hasContent: !!(this.pageData.page.content),
                    hasCss: !!(this.pageData.page.css),
                    hasStyles: !!(this.pageData.page.styles)
                })
                
                // PRIORITY: Load components if available (preserves structure)
                if (this.pageData.page.components && this.pageData.page.components.length > 0) {
                    console.log('📦 Loading components:', this.pageData.page.components)
                    this.pm.setComponents(this.pageData.page.components)
                    this.pm.setStyle(this.pageData.page.styles || this.pageData.page.css || '')
                } else {
                    // Fallback to HTML/CSS only if no components
                    console.log('📄 Loading HTML content:', this.pageData.page.content?.substring(0, 100))
                    this.pm.setComponents(this.pageData.page.content || '')
                    this.pm.setStyle(this.pageData.page.css || '')
                }
                console.log('✅ Content loaded from older system format')
            } else {
                console.warn('⚠️ No page data available')
            }
            
            // Setup older system functionality
            this.setupOlderSystemFeatures()
            
            console.log('✅ PageMade editor initialized successfully')
            
            // Hide loading overlay after successful initialization
            const loadingOverlay = document.getElementById('loading-overlay')
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none'
                console.log('✅ Loading overlay hidden')
            } else {
                console.error('❌ Loading overlay element not found!')
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize PageMade editor:', error)
            
            // Also hide loading on error and show error message
            const loadingOverlay = document.getElementById('loading-overlay')
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none'
            }
            
            throw error
        }
    }
    
    setupOlderSystemFeatures() {
        // Auto-open blocks panel on page load (like older system)
        // 🎯 IMPORTANT: BlockPanel.renderBlocks() already handles rendering
        // We just need to show the panel UI
        setTimeout(() => {
            const blocksBtn = document.querySelector('.sidebar-btn[data-panel="blocks"]');
            const blocksContainer = document.getElementById('blocks-container');
            const leftPanel = document.getElementById('left-panel');
            
            if (blocksBtn && blocksContainer && leftPanel) {
                // Show left panel using class
                leftPanel.classList.add('active');
                blocksBtn.classList.add('active');
                
                // 🚨 REMOVED: this.renderBlocks() call
                // Reason: BlockPanel.renderBlocks() already renders blocks safely
                // Calling BlockManager.render() here would CLEAR all blocks!
                console.log('✅ Blocks panel auto-opened, blocks already rendered by BlockPanel')
                
                // Update canvas layout after initial load
                setTimeout(() => this.updateCanvasLayout(), 100);
            }
        }, 1000);
        
        // Setup empty state management
        this.setupEmptyStateManagement();
        
        // Setup asset management overrides
        this.setupAssetManagementOverrides();
    }
    
    setupEmptyStateManagement() {
        if (!this.pm) return;
        
        const checkEmptyState = () => {
            const canvas = this.pm.Canvas.getDocument();
            const body = canvas.querySelector('body');
            const hasContent = body && body.children.length > 0;
            
            if (!hasContent) {
                this.showEmptyState();
            } else {
                this.hideEmptyState();
            }
        };
        
        // Monitor canvas changes
        this.pm.on('component:add component:remove', () => {
            setTimeout(checkEmptyState, 100);
        });
        
        // Initial check
        setTimeout(checkEmptyState, 500);
    }
    
    showEmptyState() {
        if (!this.pm) return;
        
        const canvas = this.pm.Canvas.getDocument();
        const body = canvas.querySelector('body');
        
        if (body && !body.querySelector('.pagemaker-empty-state')) {
            body.innerHTML = `
                <div class="pagemaker-empty-state" style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    color: #64748b;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    pointer-events: none;
                    z-index: 1000;
                    max-width: 400px;
                    padding: 40px 20px;
                ">
                    <div style="margin-bottom: 32px;">
                        <div style="
                            width: 120px;
                            height: 80px;
                            background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
                            border: 2px dashed #cbd5e1;
                            border-radius: 12px;
                            margin: 0 auto 20px auto;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            position: relative;
                        ">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21,15 16,10 5,21"/>
                            </svg>
                            
                            <div style="
                                position: absolute;
                                bottom: -8px;
                                right: -8px;
                                width: 24px;
                                height: 24px;
                                background: #667eea;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                            ">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <h3 style="
                        font-size: 28px;
                        font-weight: 700;
                        margin: 0 0 16px 0;
                        color: #1f2937;
                        line-height: 1.2;
                    ">
                        Bắt đầu xây dựng trang của bạn!
                    </h3>
                    
                    <p style="
                        font-size: 16px;
                        margin: 0 0 32px 0;
                        color: #6b7280;
                        line-height: 1.5;
                    ">
                        Kéo và thả các blocks từ sidebar bên trái để tạo nội dung chuyên nghiệp
                    </p>
                    
                    <div style="
                        display: inline-flex;
                        align-items: center;
                        gap: 12px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 14px 24px;
                        border-radius: 25px;
                        font-size: 14px;
                        font-weight: 500;
                        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
                        margin-bottom: 20px;
                    ">
                        <span style="font-size: 16px;">✨</span>
                        <span>Thử bắt đầu với Hero Block</span>
                    </div>
                </div>
            `;
        }
    }
    
    hideEmptyState() {
        if (!this.pm) return;
        
        const canvas = this.pm.Canvas.getDocument();
        const emptyState = canvas.querySelector('.pagemaker-empty-state');
        if (emptyState) {
            emptyState.remove();
        }
    }
    
    setupAssetManagementOverrides() {
        if (!this.pm) return;
        
        // Override Asset Manager rendering to prevent unauthorized renders
        const originalAssetManagerRender = this.pm.AssetManager.render;
        const originalAssetManagerGetContainer = this.pm.AssetManager.getContainer;
        
        this.pm.AssetManager.render = function() {
            if (window.assetsRenderedInCorrectPlace !== true) {
                console.log('🚫 Asset Manager render blocked - not in assets panel context');
                return null;
            }
            
            console.log('✅ Authorized Asset Manager render');
            const result = originalAssetManagerRender.call(this);
            
            setTimeout(() => {
                window.assetsRenderedInCorrectPlace = false;
            }, 100);
            
            return result;
        };
        
        this.pm.AssetManager.getContainer = function() {
            if (window.assetsRenderedInCorrectPlace !== true) {
                console.log('🚫 Asset Manager getContainer blocked');
                return null;
            }
            return originalAssetManagerGetContainer.call(this);
        };
    }

    async loadPageMadeBlocks() {
        try {
            console.log('🎯 Loading PageMade blocks from older system...')
            
            // Load Basic Blocks System
            await import('./blocks/basic-blocks.js').then(module => {
                module.default(this.pm)
                console.log('✅ Basic Blocks System loaded')
            }).catch(err => {
                console.warn('⚠️ Basic Blocks not available:', err)
                // Fallback: Add basic blocks manually
                this.addFallbackBlocks()
            })
            
            // Load Site Blocks System from backend
            await import('./blocks/site-blocks.js').then(module => {
                return module.default(this.pm)
            }).then(() => {
                console.log('✅ Site Blocks System loaded')
            }).catch(err => {
                console.warn('⚠️ Site Blocks not available:', err)
            })
            
            // Initialize block panel after blocks are loaded
            // 🎯 CRITICAL: Use refactored renderBlocks() to render to dual containers
            setTimeout(() => {
                this.renderBlocks() // Refactored: Renders to #basic-blocks-container and #site-blocks-container
                // Flag that blocks have been rendered (prevents re-render in setupLeftSidebar)
                this._blocksRenderedFlag = true
                console.log('✅ Blocks rendered via refactored renderBlocks(), flag set to prevent re-render')
            }, 500)
            
        } catch (error) {
            console.error('❌ Failed to load PageMade blocks:', error)
            this.addFallbackBlocks()
        }
    }

    addFallbackBlocks() {
        console.log('🔄 Adding fallback blocks...')
        
        const bm = this.pm.BlockManager
        
        // Basic blocks
        bm.add('basic-heading', {
            label: 'Heading',
            category: 'Basic',
            media: '<i class="fas fa-heading"></i>',
            content: '<h1>Heading Text</h1>',
        })
        
        bm.add('basic-text', {
            label: 'Text',
            category: 'Basic',
            media: '<i class="fas fa-paragraph"></i>',
            content: '<p>Your text content here...</p>',
        })
        
        bm.add('basic-button', {
            label: 'Button',
            category: 'Basic',
            media: '<i class="fas fa-square"></i>',
            content: '<button class="btn">Click me</button>',
        })
        
        bm.add('basic-image', {
            label: 'Image',
            category: 'Basic',
            media: '<i class="fas fa-image"></i>',
            content: '<img src="https://via.placeholder.com/350x200" alt="Image" />',
        })
        
        // Layout blocks
        bm.add('layout-2-columns', {
            label: '2 Columns',
            category: 'Layout',
            media: '<div style="display: flex; gap: 2px;"><div style="flex: 1; height: 10px; background: #667eea;"></div><div style="flex: 1; height: 10px; background: #667eea;"></div></div>',
            content: `
                <div style="display: flex; gap: 20px; padding: 20px; min-height: 200px; border: 1px dashed #e5e7eb;">
                    <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280;">
                        Column 1
                    </div>
                    <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280;">
                        Column 2
                    </div>
                </div>
            `,
        })
        
        bm.add('layout-3-columns', {
            label: '3 Columns',
            category: 'Layout',
            media: '<div style="display: flex; gap: 2px;"><div style="flex: 1; height: 10px; background: #667eea;"></div><div style="flex: 1; height: 10px; background: #667eea;"></div><div style="flex: 1; height: 10px; background: #667eea;"></div></div>',
            content: `
                <div style="display: flex; gap: 15px; padding: 20px; min-height: 200px; border: 1px dashed #e5e7eb;">
                    <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 14px;">
                        Column 1
                    </div>
                    <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 14px;">
                        Column 2
                    </div>
                    <div style="flex: 1; padding: 15px; background: #f8fafc; border: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 14px;">
                        Column 3
                    </div>
                </div>
            `,
        })
        
        console.log('✅ Fallback blocks added')
    }

    setupEventListeners() {
        // ===== DARK MODE TOGGLE =====
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            const html = document.documentElement;
            const currentTheme = localStorage.getItem('theme') || 'light';
            html.classList.toggle('dark', currentTheme === 'dark');
            
            darkModeToggle.addEventListener('click', () => {
                html.classList.toggle('dark');
                const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
                localStorage.setItem('theme', newTheme);
            });
        }
        
        // ===== LEFT SIDEBAR TOGGLE =====
        this.setupLeftSidebar();
        
        // ===== RIGHT PANEL TABS =====
        this.setupRightPanelTabs();
        
        // ===== LEFT PANEL TABS (Site Blocks / Basic Blocks) =====
        this.setupLeftPanelTabs();
        
        // ===== DEVICE SWITCHER =====
        this.setupDeviceSwitcher();
        
        // ===== CANVAS LAYOUT MANAGEMENT =====
        this.setupCanvasLayout();
        
        // Save button
        const saveBtn = document.getElementById('btn-save') || document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.save()
            })
        }
        
        // Publish button
        const publishBtn = document.getElementById('btn-publish') || document.getElementById('publishBtn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => {
                this.publish()
            })
        }
        
        // Preview toggle
        const previewBtn = document.getElementById('btn-preview') || document.getElementById('previewToggle');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.togglePreview()
            })
        }

        // Undo button
        const undoBtn = document.getElementById('btn-undo') || document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.historyManager.undo()
            })
        }

        // Redo button
        const redoBtn = document.getElementById('btn-redo') || document.getElementById('redoBtn');
        if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                this.historyManager.redo()
            })
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault()
                        this.save()
                        break
                    case 'p':
                        e.preventDefault()
                        this.publish()
                        break
                    case 'z':
                        if (!e.shiftKey) {
                            e.preventDefault()
                            this.historyManager.undo()
                        }
                        break
                    case 'y':
                        e.preventDefault()
                        this.historyManager.redo()
                        break
                }
            }
        })
        
        // Window events
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault()
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
            }
        })

        // Listen to history manager events
        document.addEventListener('history-manager:auto-save', (e) => {
            console.log('📝 Auto-saving content...')
            // Auto-save functionality can be implemented here
        })

        document.addEventListener('history-manager:state-changed', (e) => {
            // Update UI based on undo/redo state
            this.updateHistoryButtons(e.detail)
        })
        
        console.log('🎯 Event listeners setup complete')
    }

    onEditorReady() {
        console.log('🎯 Editor is ready!')
        
        // Initialize device switcher with editor
        if (this.deviceSwitcher && !this.deviceSwitcher.isInitialized) {
            this.deviceSwitcher.setEditor(this.pm)
            this.deviceSwitcher.init()
        }
        
        // Initialize panels with editor instance
        Object.values(this.components).forEach(component => {
            if (component.setEditor && typeof component.setEditor === 'function') {
                component.setEditor(this.pm)
            }
        })
    }

    async save() {
        if (!this.pm) return
        
        try {
            this.showLoading('btn-save')
            
            // Get content from GrapesJS editor
            const html = this.pm.getHtml()
            const css = this.pm.getCss()
            const components = this.pm.getComponents()
            const styles = this.pm.getStyle()
            const assets = this.pm.getAssets()
            
            // Prepare page data for new API
            const pageData = {
                title: this.pageData?.page_title || 'Untitled Page',
                content: JSON.stringify({
                    html: html || '',
                    css: css || '',
                    components: components || [],
                    styles: styles || [],
                    assets: assets || []
                }),
                css_content: css || ''
            }
            
            // Use new API client to save
            const success = await window.apiClient.savePage(this.pageId, pageData)
            
            if (success) {
                this.showSuccess('Trang đã được lưu thành công!')
                if (this.storageManager) {
                    this.storageManager.setLastSaved()
                }
            } else {
                throw new Error('Save failed')
            }
            
        } catch (error) {
            console.error('Save failed:', error)
            this.showError('Không thể lưu trang. Vui lòng thử lại.')
        } finally {
            this.hideLoading('btn-save')
        }
    }

    async publish() {
        if (!this.pm) return
        
        try {
            this.showLoading('btn-publish')
            
            // Get content from GrapesJS editor
            const html = this.pm.getHtml()
            const css = this.pm.getCss()
            const components = this.pm.getComponents()
            const styles = this.pm.getStyle()
            const assets = this.pm.getAssets()
            
            const publishData = {
                html: html || '',
                css: css || '',
                components: components || [],
                styles: styles || [],
                assets: assets || []
            }
            
            const result = await window.apiClient.publishPage(this.pageId, publishData)
            
            if (!result) {
                throw new Error('Publish failed')
            }
            
            this.showSuccess('Trang đã được xuất bản thành công!')
            if (this.storageManager) {
                this.storageManager.setLastPublished()
            }
            
            // Show published URL if available
            if (result.data && result.data.published_url) {
                setTimeout(() => {
                    if (confirm(`Trang đã xuất bản! Xem tại ${result.data.published_url}?`)) {
                        window.open(result.data.published_url, '_blank')
                    }
                }, 1000)
            }
            
        } catch (error) {
            console.error('Publish failed:', error)
            this.showError('Không thể xuất bản trang. Vui lòng thử lại.')
        } finally {
            this.hideLoading('btn-publish')
        }
    }

    togglePreview() {
        if (!this.pm) return
        
        const isPreview = this.pm.togglePreview()
        const btn = document.getElementById('btn-preview') || document.getElementById('previewToggle')
        
        if (btn) {
            if (isPreview) {
                btn.innerHTML = '<i class="fas fa-edit"></i>'
                btn.classList.remove('active')
            } else {
                btn.innerHTML = '<i class="fas fa-eye"></i>'
                btn.classList.add('active')
            }
        }
    }

    hasUnsavedChanges() {
        if (!this.pm || !this.storageManager) return false
        return this.storageManager.hasUnsavedChanges(this.pm.getContent())
    }

    updateHistoryButtons(state) {
        // Update undo/redo button states if they exist
        const undoBtn = document.getElementById('undoBtn')
        const redoBtn = document.getElementById('redoBtn')
        
        if (undoBtn) {
            undoBtn.disabled = !state.canUndo
            undoBtn.classList.toggle('opacity-50', !state.canUndo)
        }
        
        if (redoBtn) {
            redoBtn.disabled = !state.canRedo
            redoBtn.classList.toggle('opacity-50', !state.canRedo)
        }
    }

    // ===== LEFT SIDEBAR SETUP =====
    setupLeftSidebar() {
        const leftSidebar = document.getElementById('left-sidebar');
        const leftPanel = document.getElementById('left-panel');
        
        if (!leftSidebar || !leftPanel) return;
        
        const sidebarButtons = leftSidebar.querySelectorAll('.sidebar-btn');
        const panelSections = document.querySelectorAll('.panel-section');
        
        // 🚨 CRITICAL: Use class-level flags to prevent duplicate renders
        // Rendering BlockManager.render() will CLEAR all blocks!
        if (!this._blocksRenderedFlag) this._blocksRenderedFlag = false;
        if (!this._layersRenderedFlag) this._layersRenderedFlag = false;
        if (!this._assetsRenderedFlag) this._assetsRenderedFlag = false;
        
        sidebarButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const panelName = btn.getAttribute('data-panel');
                const isActive = btn.classList.contains('active');
                
                // If clicking same button - deactivate it
                if (isActive) {
                    btn.classList.remove('active');
                    leftPanel.classList.remove('active');
                } else {
                    // Activate new button and show corresponding panel
                    sidebarButtons.forEach(b => b.classList.remove('active'));
                    panelSections.forEach(p => p.classList.remove('active'));
                    
                    btn.classList.add('active');
                    leftPanel.classList.add('active');
                    
                    const targetPanel = document.getElementById(`${panelName}-panel`);
                    if (targetPanel) {
                        targetPanel.classList.add('active');
                    }
                    
                    // Handle Blocks panel
                    // 🚨 CRITICAL: Only render blocks ONCE on first panel open
                    // Re-rendering will CLEAR all existing blocks!
                    if (panelName === 'blocks' && this.pm && !this._blocksRenderedFlag) {
                        setTimeout(() => {
                            console.log('🎯 First-time blocks render triggered by sidebar click')
                            this.renderBlocks();
                            this._blocksRenderedFlag = true;
                        }, 50);
                    } else if (panelName === 'blocks' && this._blocksRenderedFlag) {
                        console.log('✅ Blocks already rendered, skipping re-render to preserve blocks')
                    }
                    
                    // Handle Layers panel
                    if (panelName === 'layers' && this.pm && !this._layersRenderedFlag) {
                        setTimeout(() => {
                            this.renderLayers();
                            this._layersRenderedFlag = true;
                        }, 50);
                    }
                    
                    // Handle Assets panel
                    if (panelName === 'assets' && this.pm) {
                        setTimeout(() => {
                            this.setupAssetsPanel();
                        }, 100);
                        
                        if (!this._assetsRenderedFlag) {
                            setTimeout(() => {
                                this.renderAssets();
                                this._assetsRenderedFlag = true;
                            }, 50);
                        }
                    }
                }
                
                // Update canvas layout after sidebar toggle
                setTimeout(() => this.updateCanvasLayout(), 100);
            });
        });
    }
    
    // ===== RIGHT PANEL TABS SETUP =====
    setupRightPanelTabs() {
        const rightPanelTabs = document.querySelectorAll('.right-panel-tab');
        const rightPanelContents = document.querySelectorAll('.right-panel-content');
        
        rightPanelTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                
                // Remove active from all tabs and contents
                rightPanelTabs.forEach(t => t.classList.remove('active'));
                rightPanelContents.forEach(c => c.classList.remove('active'));
                
                // Add active to clicked tab and corresponding content
                tab.classList.add('active');
                const contentEl = document.getElementById(`${tabName}-tab`);
                if (contentEl) {
                    contentEl.classList.add('active');
                }
            });
        });
    }
    
    // ===== LEFT PANEL TABS SETUP =====
    // REFACTORED: Pure CSS toggle, no filtering logic
    setupLeftPanelTabs() {
        const leftPanelTabs = document.querySelectorAll('.left-panel-tab');
        
        leftPanelTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                
                console.log(`🔄 Switching to tab: "${tabName}"`);
                
                // Update active state on tabs
                leftPanelTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show/hide containers via CSS toggle
                const basicContainer = document.getElementById('basic-blocks-container');
                const siteContainer = document.getElementById('site-blocks-container');
                
                if (!basicContainer || !siteContainer) {
                    console.error('❌ Block containers not found!');
                    return;
                }
                
                if (tabName === 'site-blocks') {
                    // Show Site Blocks, hide Basic Blocks
                    siteContainer.classList.add('active');
                    basicContainer.classList.remove('active');
                    console.log('✅ Site Blocks container activated');
                } else if (tabName === 'basic-blocks') {
                    // Show Basic Blocks, hide Site Blocks
                    basicContainer.classList.add('active');
                    siteContainer.classList.remove('active');
                    console.log('✅ Basic Blocks container activated');
                } else {
                    console.warn(`⚠️ Unknown tab name: "${tabName}"`);
                }
            });
        });
        
        console.log('✅ Left panel tabs initialized with CSS toggle logic');
    }
    
    // ===== DEVICE SWITCHER SETUP =====
    setupDeviceSwitcher() {
        const deviceButtons = document.querySelectorAll('.device-btn[data-device]');
        
        deviceButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const device = btn.getAttribute('data-device');
                
                // Update active state
                deviceButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Change device in editor
                if (this.pm) {
                    this.pm.setDevice(device);
                }
            });
        });
    }
    
    // ===== CANVAS LAYOUT MANAGEMENT =====
    setupCanvasLayout() {
        // Initial layout update
        setTimeout(() => this.updateCanvasLayout(), 100);
    }
    
    updateCanvasLayout() {
        const canvasArea = document.getElementById('canvas-area');
        const leftPanel = document.getElementById('left-panel');
        const rightPanel = document.getElementById('right-panel');
        
        if (!canvasArea) return;
        
        const leftPanelVisible = leftPanel && leftPanel.classList.contains('active');
        const rightPanelVisible = rightPanel && !rightPanel.classList.contains('hidden');
        
        // Remove all canvas state classes
        canvasArea.classList.remove('both-sidebars', 'left-only', 'right-only', 'no-sidebars');
        
        // Add appropriate class based on sidebar states
        if (leftPanelVisible && rightPanelVisible) {
            canvasArea.classList.add('both-sidebars');
        } else if (leftPanelVisible && !rightPanelVisible) {
            canvasArea.classList.add('left-only');
        } else if (!leftPanelVisible && rightPanelVisible) {
            canvasArea.classList.add('right-only');
        } else {
            canvasArea.classList.add('no-sidebars');
        }
    }
    
    // ===== RENDER METHODS =====
    // REFACTORED: Smart rendering to separate containers
    renderBlocks() {
        if (!this.pm) return;
        
        console.log('🎯 renderBlocks() - Smart filtering to separate containers');
        
        const basicContainer = document.getElementById('basic-blocks-container');
        const siteContainer = document.getElementById('site-blocks-container');
        
        if (!basicContainer || !siteContainer) {
            console.error('❌ Block containers not found!');
            return;
        }
        
        // Get all blocks from BlockManager
        const allBlocks = this.pm.BlockManager.getAll();
        console.log(`📊 Total blocks loaded: ${allBlocks.length}`);
        
        // Categorize blocks
        const categorizedBlocks = this.categorizeBlocks(allBlocks);
        
        console.log(`📋 Basic blocks: ${categorizedBlocks.basic.length} blocks`);
        console.log(`📋 Site blocks: ${categorizedBlocks.site.length} blocks`);
        
        // Render to separate containers
        this.renderBlocksToContainer(categorizedBlocks.basic, basicContainer);
        this.renderBlocksToContainer(categorizedBlocks.site, siteContainer);
        
        console.log('✅ Blocks rendered to separate containers');
    }
    
    /**
     * Categorize blocks into Basic and Site based on category attribute
     * @param {Array} blocks - All blocks from BlockManager
     * @returns {Object} { basic: [], site: [] }
     */
    categorizeBlocks(blocks) {
        const basic = [];
        const site = [];
        
        blocks.forEach(block => {
            const rawCategory = block.get('category');
            const categoryLabel = this.normalizeCategory(rawCategory);
            
            // Debug log - kiểm tra phân loại
            console.log('Block:', block.getId(), 'Category:', categoryLabel);
            
            // Logic phân loại: Nếu category chứa chữ 'basic' (case-insensitive) → Basic tab
            const isBasicBlock = categoryLabel.toLowerCase().includes('basic');
            
            if (isBasicBlock) {
                basic.push(block);
            } else {
                site.push(block);
            }
        });
        
        console.log(`📋 Basic blocks: ${basic.length} blocks`);
        console.log(`📋 Site blocks: ${site.length} blocks`);
        
        return { basic, site };
    }
    
    /**
     * Render blocks to a specific container
     * @param {Array} blocks - Blocks to render
     * @param {HTMLElement} container - Target container
     */
    /**
     * Normalize category to string (handle both string and GrapesJS Category Object)
     * @param {string|Object} category - Category value from block
     * @returns {string} Normalized category name
     */
    normalizeCategory(category) {
        if (!category) return 'Uncategorized';
        
        // If category is a string, return directly
        if (typeof category === 'string') {
            return category;
        }
        
        // If category is an object (GrapesJS format: {id: 'basic', label: 'Basic Blocks'})
        if (category && typeof category === 'object') {
            // Priority: label > id > name
            const categoryLabel = category.label || category.id || category.name || 'Uncategorized';
            return categoryLabel;
        }
        
        return 'Uncategorized';
    }
    
    renderBlocksToContainer(blocks, container) {
        if (!blocks || blocks.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: #9ca3af;">No blocks available</div>';
            return;
        }
        
        // Group blocks by category
        const blocksByCategory = {};
        
        blocks.forEach(block => {
            const rawCategory = block.get('category');
            const categoryLabel = this.normalizeCategory(rawCategory);
            
            // Debug log - BẮT BUỘC để kiểm tra cấu trúc dữ liệu
            console.log('Block:', block.getId(), 'Category:', categoryLabel, 'Raw:', rawCategory);
            
            if (!blocksByCategory[categoryLabel]) {
                blocksByCategory[categoryLabel] = [];
            }
            blocksByCategory[categoryLabel].push(block);
        });
        
        // Clear container
        container.innerHTML = '';
        
        // SVG caret icon - EXACT same as GrapesJS native Style Manager
        // Source: grapesjs/src/style_manager/view/SectorView.js
        const caretSVG = `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"></path></svg>`;
        
        // Render each category using EXACT native GrapesJS sector structure
        // This matches Style Manager 100%: .gjs-sm-sector > .gjs-sm-sector-title > (.gjs-sm-sector-caret + .gjs-sm-sector-label)
        Object.keys(blocksByCategory).sort().forEach(categoryName => {
            const categoryBlocks = blocksByCategory[categoryName];
            
            // === SECTOR CONTAINER ===
            // Exact structure: <div class="gjs-sm-sector gjs-sm-open no-select">
            const sectorEl = document.createElement('div');
            sectorEl.className = 'gjs-sm-sector gjs-sm-open no-select';
            
            // === SECTOR TITLE (clickable header) ===
            // Exact structure: <div class="gjs-sm-sector-title">
            const sectorTitle = document.createElement('div');
            sectorTitle.className = 'gjs-sm-sector-title';
            
            // === CARET ICON ===
            // Exact structure: <div class="gjs-sm-sector-caret">
            const caretEl = document.createElement('div');
            caretEl.className = 'gjs-sm-sector-caret';
            caretEl.innerHTML = caretSVG;
            
            // === LABEL ===
            // Exact structure: <div class="gjs-sm-sector-label">
            const labelEl = document.createElement('div');
            labelEl.className = 'gjs-sm-sector-label';
            labelEl.textContent = categoryName;
            
            sectorTitle.appendChild(caretEl);
            sectorTitle.appendChild(labelEl);
            
            // Toggle logic: click title to open/close (same behavior as Style Manager)
            sectorTitle.addEventListener('click', () => {
                sectorEl.classList.toggle('gjs-sm-open');
            });
            
            // === PROPERTIES CONTAINER ===
            // Exact structure: <div class="gjs-sm-properties">
            const propertiesEl = document.createElement('div');
            propertiesEl.className = 'gjs-sm-properties';
            
            // Blocks grid container
            const blocksWrapper = document.createElement('div');
            blocksWrapper.className = 'gjs-blocks-c';
            
            // Add each block
            categoryBlocks.forEach(block => {
                const blockEl = this.createBlockElement(block);
                blocksWrapper.appendChild(blockEl);
            });
            
            propertiesEl.appendChild(blocksWrapper);
            sectorEl.appendChild(sectorTitle);
            sectorEl.appendChild(propertiesEl);
            container.appendChild(sectorEl);
        });
    }
    
    /**
     * Create a block element for rendering
     * @param {Object} block - Block model
     * @returns {HTMLElement} Block element
     */
    createBlockElement(block) {
        const blockEl = document.createElement('div');
        blockEl.className = 'gjs-block';
        blockEl.setAttribute('draggable', 'true');
        // NOTE: Removed inline styles - CSS classes in editor.css handle styling
        // See: .gjs-block, .gjs-block:hover in editor.css lines 260-305
        
        const blockId = block.get('id');
        const blockLabel = block.get('label') || blockId;
        const blockMedia = block.get('media') || '';
        
        // Media (icon or image)
        if (blockMedia) {
            const mediaEl = document.createElement('div');
            mediaEl.className = 'gjs-block__media';
            mediaEl.innerHTML = blockMedia;
            // NOTE: Removed inline styles - CSS handles styling via .gjs-block__media
            blockEl.appendChild(mediaEl);
        }
        
        // Label
        const labelEl = document.createElement('div');
        labelEl.className = 'gjs-block-label';
        labelEl.textContent = blockLabel;
        // NOTE: Removed inline styles - CSS handles styling via .gjs-block-label
        blockEl.appendChild(labelEl);
        
        // Drag & drop events
        blockEl.addEventListener('dragstart', (e) => {
            if (this.pm) {
                this.pm.trigger('block:drag:start', block);
            }
        });
        
        blockEl.addEventListener('click', () => {
            if (this.pm) {
                const content = block.get('content');
                this.pm.addComponents(content);
            }
        });
        
        // NOTE: Removed JS hover listeners - CSS :hover handles hover effects
        // See: .gjs-block:hover in editor.css lines 295-305
        
        return blockEl;
    }
    
    renderLayers() {
        if (!this.pm) return;
        
        const layersContainer = document.getElementById('layers-container');
        if (!layersContainer) return;
        
        const layerManager = this.pm.LayerManager;
        const layersEl = layerManager.render();
        
        if (layersEl) {
            layersContainer.innerHTML = '';
            layersContainer.appendChild(layersEl);
            console.log('✅ Layers rendered');
        }
    }
    
    renderAssets() {
        if (!this.pm) return;
        
        const assetsContainer = document.getElementById('assets-container');
        if (!assetsContainer) return;
        
        const assetManager = this.pm.AssetManager;
        
        if (assetManager) {
            // Clear container
            assetsContainer.innerHTML = '';
            
            // Render with custom config
            const assetsEl = assetManager.render();
            
            if (assetsEl) {
                assetsContainer.appendChild(assetsEl);
                console.log('✅ Assets rendered in correct place');
            }
        }
    }
    
    setupAssetsPanel() {
        console.log('🎨 Assets panel opened, setting up upload...');
        // Asset upload setup will be handled by AssetPanel component
    }

    // UI Helper methods
    showLoading(buttonId) {
        const btn = document.getElementById(buttonId)
        if (btn) {
            btn.disabled = true
            btn.classList.add('loading')
        }
    }

    hideLoading(buttonId) {
        const btn = document.getElementById(buttonId)
        if (btn) {
            btn.disabled = false
            btn.classList.remove('loading')
        }
    }

    showSuccess(message) {
        // TODO: Implement toast notification
        console.log('✅', message)
        alert(message) // Temporary implementation
    }

    showError(message) {
        // TODO: Implement error toast
        console.error('❌', message)
        alert(message) // Temporary implementation
    }
}

// Initialize app when DOM is ready OR immediately if already loaded
async function initPageMadeApp() {
    console.log('🎬 Initializing PageMade App...')
    window.pageMadeApp = new PageMadeApp()
    await window.pageMadeApp.init()
}

// Check if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
    console.log('⏳ Waiting for DOM to load...')
    document.addEventListener('DOMContentLoaded', initPageMadeApp)
} else {
    // DOM is already ready (script loaded dynamically)
    console.log('✅ DOM already loaded, initializing immediately')
    initPageMadeApp()
}

// Export for global access
window.PageMadeApp = PageMadeApp