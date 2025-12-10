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
        this.siteId = null
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
            
            // Debug: Log extracted values
            console.log('📍 Extracted pageId:', this.pageId, 'token:', this.token ? 'present' : 'none')
            
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
        // Debug: Log full URL info
        console.log('🔍 URL Debug:', {
            href: window.location.href,
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash
        })
        
        const urlParams = new URLSearchParams(window.location.search)
        const pathParts = window.location.pathname.split('/')
        
        // Try to get from URL path first: /editor/123
        // Only use path if pathParts[2] is a non-empty value
        if (pathParts.length > 2 && pathParts[1] === 'editor' && pathParts[2]) {
            console.log('📍 Page ID from path:', pathParts[2])
            return pathParts[2]
        }
        
        // Then try query parameter: ?id=123
        const id = urlParams.get('id')
        if (id) {
            console.log('📍 Page ID from query:', id)
            return id
        }
        
        // Default to 1 for development
        console.log('⚠️ No page ID found, defaulting to 1')
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
            // Store token metadata if available (from verifyToken)
            const tokenMetadata = this.pageData || {}
            console.log('📋 Token metadata:', tokenMetadata)
            
            // ALWAYS load page content from API - token only has metadata, not content!
            console.log('📥 Loading page content via API for page:', this.pageId)
            const contentData = await window.apiClient.getPage(this.pageId)
            
            if (!contentData) {
                throw new Error('Failed to load page content from API')
            }
            
            console.log('📦 Raw content data from API:', contentData)
            
            // Backend /content endpoint returns content data directly:
            // { "gjs-html": "...", "gjs-css": "...", "gjs-components": [...], ... }
            // contentData IS the content object, NOT { content: {...} }
            
            // Check if contentData already has gjs-* keys (new format from /content endpoint)
            const hasGjsKeys = contentData['gjs-html'] !== undefined || 
                               contentData['gjs-components'] !== undefined ||
                               contentData['gjs-css'] !== undefined
            
            let parsedContent = {}
            
            if (hasGjsKeys) {
                // New format: contentData directly contains gjs-* keys
                console.log('📄 Using direct gjs-* format from API')
                parsedContent = contentData
            } else if (contentData.content) {
                // Old format: contentData has a .content field
                console.log('📄 Parsing legacy content field')
                try {
                    parsedContent = typeof contentData.content === 'string' 
                        ? JSON.parse(contentData.content) 
                        : contentData.content || {}
                } catch (e) {
                    console.warn('⚠️ Failed to parse page content JSON, using as HTML:', e)
                    parsedContent = { 'gjs-html': contentData.content }
                }
            } else if (contentData.html_content) {
                // Template format: has html_content and css_content directly
                console.log('📄 Using template format (html_content/css_content)')
                parsedContent = {
                    'gjs-html': contentData.html_content,
                    'gjs-css': contentData.css_content || ''
                }
            } else {
                console.warn('⚠️ No content found in API response')
                parsedContent = {}
            }
            
            console.log('📊 Parsed content:', {
                hasHtml: !!(parsedContent['gjs-html'] || parsedContent['pm-html']),
                hasCss: !!(parsedContent['gjs-css'] || parsedContent['pm-css']),
                componentsCount: (parsedContent['gjs-components'] || parsedContent['pm-components'] || []).length,
                stylesCount: (parsedContent['gjs-styles'] || parsedContent['pm-styles'] || []).length
            })
            
            // Store page data in PageMade format, merging token metadata with content
            this.pageData = {
                page: {
                    id: this.pageId,
                    title: tokenMetadata.page_title || contentData.title || 'Untitled Page',
                    content: parsedContent['pm-html'] || parsedContent['gjs-html'] || contentData.html_content || '',
                    css: parsedContent['pm-css'] || parsedContent['gjs-css'] || contentData.css_content || '',
                    components: parsedContent['pm-components'] || parsedContent['gjs-components'] || [],
                    styles: parsedContent['pm-styles'] || parsedContent['gjs-styles'] || [],
                    assets: parsedContent['pm-assets'] || parsedContent['gjs-assets'] || []
                },
                site: {
                    title: tokenMetadata.site_title || contentData.site_name || 'PageMade Site',
                    subdomain: tokenMetadata.site_subdomain || contentData.subdomain || 'demo'
                },
                user: {
                    name: tokenMetadata.user_name || contentData.user_name || 'PageMade User'
                }
            }
            
            // Update page title in UI
            const pageTitleEl = document.getElementById('page-title')
            const pageTitleDisplayEl = document.querySelector('.page-title')
            if (pageTitleEl) pageTitleEl.textContent = this.pageData.page.title
            if (pageTitleDisplayEl) pageTitleDisplayEl.textContent = this.pageData.page.title
            
            console.log('✅ Page data loaded and merged:', this.pageData)
            
            // Setup back button to go to site detail page
            // Try tokenMetadata first, fallback to contentData
            const siteId = tokenMetadata.site_id || contentData.site_id
            this.siteId = siteId // Store siteId for use by components (e.g., AssetPanel)
            console.log('🔍 DEBUG: tokenMetadata.site_id:', tokenMetadata.site_id)
            console.log('🔍 DEBUG: contentData.site_id:', contentData.site_id)
            console.log('🔍 DEBUG: Final siteId for back button:', siteId)
            this.setupBackButton(siteId)
            
        } catch (error) {
            console.error('❌ CRITICAL: Failed to load page data:', error)
            console.error('❌ Page ID:', this.pageId)
            console.error('❌ Error details:', error.message)
            
            // 🚫 DO NOT use fallback data - throw error to stop initialization
            // Let the main init() catch block handle the error display
            throw new Error(`Failed to load page data: ${error.message}`)
        }
    }

    /**
     * Setup back button to navigate to site detail page
     */
    setupBackButton(siteId) {
        const backButton = document.getElementById('back-button')
        if (!backButton) {
            console.warn('⚠️ Back button not found')
            return
        }
        
        // Determine the back URL based on site_id
        let backUrl = 'http://localhost:5000/dashboard' // Default fallback
        
        if (siteId) {
            backUrl = `http://localhost:5000/site/${siteId}`
            console.log('🔙 Back button configured to site detail:', backUrl)
        } else {
            console.log('🔙 Back button configured to dashboard (no site_id)')
        }
        
        backButton.addEventListener('click', () => {
            window.location.href = backUrl
        })
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
            
            // Initialize AssetPanel with editor instance
            if (this.assetPanel) {
                this.assetPanel.setEditor(this.pm)
                this.assetPanel.init()
            }
            
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
        
        // Canvas scrolling is handled by GrapesJS native behavior with scrollableCanvas: true
        // Frame will use height: 100% from CSS, and internal scrollbar appears when content overflows
        this.enableCanvasScrolling();
        
        // Inject scrollbar styles into canvas iframe
        this.injectCanvasScrollbarStyles();
        
        // Setup empty state management
        this.setupEmptyStateManagement();
        
        // Setup asset management overrides
        this.setupAssetManagementOverrides();
    }
    
    /**
     * Inject scrollbar styles into canvas iframe
     * Match the same style as the main editor scrollbars
     */
    injectCanvasScrollbarStyles() {
        if (!this.pm) return;
        
        const injectStyles = () => {
            try {
                const canvasDoc = this.pm.Canvas.getDocument();
                if (!canvasDoc || !canvasDoc.head) return;
                
                // Check if styles already injected
                if (canvasDoc.getElementById('pagemade-scrollbar-styles')) return;
                
                const styleEl = canvasDoc.createElement('style');
                styleEl.id = 'pagemade-scrollbar-styles';
                styleEl.textContent = `
                    /* Canvas Scrollbar Styles - Match editor scrollbar */
                    ::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                    }
                    
                    ::-webkit-scrollbar-track {
                        background: #e5e7eb;
                    }
                    
                    ::-webkit-scrollbar-thumb {
                        background: #6b7280;
                        border-radius: 4px;
                    }
                    
                    ::-webkit-scrollbar-thumb:hover {
                        background: #4b5563;
                    }
                    
                    /* Firefox scrollbar */
                    * {
                        scrollbar-width: thin;
                        scrollbar-color: #6b7280 #e5e7eb;
                    }
                `;
                canvasDoc.head.appendChild(styleEl);
                console.log('✅ Canvas scrollbar styles injected');
            } catch (err) {
                console.warn('⚠️ Could not inject canvas scrollbar styles:', err);
            }
        };
        
        // Inject after canvas is ready
        setTimeout(injectStyles, 500);
        
        // Re-inject when canvas frame changes (e.g., device switch)
        this.pm.on('canvas:frame:load', () => {
            setTimeout(injectStyles, 100);
        });
    }
    
    /**
     * Enable canvas scrolling - Use GrapesJS native behavior.
     * 
     * GrapesJS handles canvas scrolling natively when:
     * 1. scrollableCanvas: true in config
     * 2. CSS does NOT override .gjs-frame height (removed in Phase 1)
     * 
     * Canvas auto-expands/shrinks based on content with native GrapesJS logic.
     */
    enableCanvasScrolling() {
        if (!this.pm) return;
        
        // RESET: Re-enabled setupCanvasHeightEvents() with 100% native GrapesJS CSS
        // Now that we're using pure GrapesJS native canvas CSS, this should work properly
        this.setupCanvasHeightEvents();
        
        console.log('✅ Canvas: Using 100% GrapesJS native CSS (all custom overrides removed)');
    }
    
    /**
     * Setup event listeners to manage canvas height when components change.
     * This ensures canvas shrinks properly when elements are removed.
     * Works alongside MutationObserver in FrameWrapView.ts for robust height management.
     */
    setupCanvasHeightEvents() {
        if (!this.pm) return;
        
        // Debounce function to prevent excessive recalculations
        const debounce = (func, wait) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        };
        
        // Force recalculate canvas height
        const recalculateCanvasHeight = debounce(() => {
            try {
                const canvasFrame = this.pm.Canvas.getFrame();
                if (!canvasFrame) return;
                
                const frameView = canvasFrame.view;
                if (frameView && frameView.updateDim) {
                    // Trigger dimension update which recalculates height
                    frameView.updateDim();
                    console.log('🔄 Canvas height recalculated');
                }
            } catch (err) {
                console.warn('⚠️ Could not recalculate canvas height:', err);
            }
        }, 100);
        
        // Listen for component changes
        this.pm.on('component:add', () => {
            recalculateCanvasHeight();
        });
        
        this.pm.on('component:remove', () => {
            recalculateCanvasHeight();
        });
        
        this.pm.on('component:update', () => {
            recalculateCanvasHeight();
        });
        
        console.log('✅ Canvas height event listeners setup');
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
        
        if (body && !body.querySelector('.pagemade-empty-state')) {
            body.innerHTML = `
                <div class="pagemade-empty-state" style="
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
        const emptyState = canvas.querySelector('.pagemade-empty-state');
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
        
        // Preview toggle (GrapesJS internal preview mode)
        const previewBtn = document.getElementById('btn-preview') || document.getElementById('previewToggle');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.togglePreview()
            })
        }

        // Component Outline toggle
        const outlineBtn = document.getElementById('btn-outline');
        if (outlineBtn) {
            outlineBtn.addEventListener('click', () => {
                // Toggle component outline visibility using GrapesJS command
                const cmd = this.pm.Commands;
                const cmdId = 'core:component-outline';
                if (cmd.isActive(cmdId)) {
                    cmd.stop(cmdId);
                    outlineBtn.classList.remove('active');
                } else {
                    cmd.run(cmdId);
                    outlineBtn.classList.add('active');
                }
            })
        }

        // Undo button - using GrapesJS native UndoManager
        const undoBtn = document.getElementById('btn-undo') || document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                if (this.pm && this.pm.UndoManager) {
                    this.pm.UndoManager.undo();
                }
            })
        }

        // Redo button - using GrapesJS native UndoManager
        const redoBtn = document.getElementById('btn-redo') || document.getElementById('redoBtn');
        if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                if (this.pm && this.pm.UndoManager) {
                    this.pm.UndoManager.redo();
                }
            })
        }
        
        // Listen to GrapesJS UndoManager changes to update button states
        if (this.pm) {
            const updateHistoryBtns = () => {
                const um = this.pm.UndoManager;
                if (undoBtn) undoBtn.disabled = !um.hasUndo();
                if (redoBtn) redoBtn.disabled = !um.hasRedo();
            };
            
            // Update on any change
            this.pm.on('change:changesCount', updateHistoryBtns);
            
            // Initial state
            updateHistoryBtns();
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
                            if (this.pm && this.pm.UndoManager) {
                                this.pm.UndoManager.undo()
                            }
                        }
                        break
                    case 'y':
                        e.preventDefault()
                        if (this.pm && this.pm.UndoManager) {
                            this.pm.UndoManager.redo()
                        }
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
            
            console.log('💾 [SAVE] Starting save process...')
            console.log('💾 [SAVE] Page ID:', this.pageId)
            
            // Get content from GrapesJS editor
            const html = this.pm.getHtml()
            const css = this.pm.getCss()
            const components = this.pm.getComponents()
            const styles = this.pm.getStyle()
            // Get assets from AssetManager
            const assets = this.pm.AssetManager ? this.pm.AssetManager.getAll() : []
            
            console.log('💾 [SAVE] Content extracted:', {
                htmlLength: html?.length || 0,
                cssLength: css?.length || 0,
                componentsCount: Array.isArray(components) ? components.length : (typeof components),
                stylesCount: Array.isArray(styles) ? styles.length : (typeof styles),
                assetsCount: Array.isArray(assets) ? assets.length : 0
            })
            
            // Prepare GrapesJS data in format expected by backend
            // Backend expects: gjs-html, gjs-css, gjs-components, gjs-styles, gjs-assets
            const gjsData = {
                'gjs-html': html || '',
                'gjs-css': css || '',
                'gjs-components': components || [],
                'gjs-styles': styles || [],
                'gjs-assets': assets || []
            }
            
            console.log('💾 [SAVE] Sending data to API:', JSON.stringify(gjsData).substring(0, 500) + '...')
            
            // Use PageMade-specific save endpoint
            const success = await window.apiClient.savePageMadeContent(this.pageId, gjsData)
            
            console.log('💾 [SAVE] API response success:', success)
            
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

    /**
     * Toggle Preview Mode - Giống hệt file cũ editor_old_file.html
     * Không dùng GrapesJS preview command, chỉ hide/show panels thủ công
     */
    togglePreview() {
        const btn = document.getElementById('btn-preview')
        if (!btn) return
        
        const isActive = btn.classList.contains('active')
        
        if (isActive) {
            // Exit preview mode
            btn.classList.remove('active')
            document.body.classList.remove('preview-mode')
            
            // Hide floating toolbar
            const floatingToolbar = document.getElementById('floating-preview-toolbar')
            if (floatingToolbar) {
                floatingToolbar.style.display = 'none'
            }
            
            // Show all elements
            const elementsToShow = [
                '#top-toolbar',
                '#left-sidebar', 
                '#left-panel',
                '#right-panel'
            ]
            
            elementsToShow.forEach(selector => {
                const el = document.querySelector(selector)
                if (el) el.style.display = ''
            })
            
            // Reset canvas area
            const canvasArea = document.getElementById('canvas-area')
            if (canvasArea) {
                canvasArea.style.cssText = ''
            }
            
            console.log('✏️ Exited Preview Mode')
            
        } else {
            // Enter preview mode
            btn.classList.add('active')
            document.body.classList.add('preview-mode')
            
            // Hide all panels
            const elementsToHide = [
                '#top-toolbar',
                '#left-sidebar',
                '#left-panel', 
                '#right-panel'
            ]
            
            elementsToHide.forEach(selector => {
                const el = document.querySelector(selector)
                if (el) el.style.display = 'none'
            })
            
            // Make canvas full screen
            const canvasArea = document.getElementById('canvas-area')
            if (canvasArea) {
                canvasArea.style.cssText = `
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 9999 !important;
                    background: white !important;
                    padding: 0 !important;
                    margin: 0 !important;
                `
            }
            
            // Show floating toolbar
            this.showFloatingPreviewToolbar()
            
            console.log('👁️ Entered Preview Mode')
        }
    }
    
    /**
     * Show floating toolbar for preview mode - Giống hệt file cũ
     */
    showFloatingPreviewToolbar() {
        let toolbar = document.getElementById('floating-preview-toolbar')
        
        // Create toolbar if it doesn't exist (giống hệt HTML trong file cũ)
        if (!toolbar) {
            toolbar = document.createElement('div')
            toolbar.id = 'floating-preview-toolbar'
            toolbar.style.display = 'none'
            toolbar.innerHTML = `
                <!-- Close button -->
                <button id="floating-close" class="floating-btn floating-btn-close" title="Thoát Preview">
                    <i class="fas fa-times"></i>
                </button>
                
                <!-- Device switcher -->
                <div class="floating-device-switcher">
                    <button class="floating-device-btn active" data-device="Desktop" title="Desktop">
                        <i class="fas fa-desktop"></i>
                    </button>
                    <button class="floating-device-btn" data-device="Tablet" title="Tablet">
                        <i class="fas fa-tablet-alt"></i>
                    </button>
                    <button class="floating-device-btn" data-device="Mobile" title="Mobile">
                        <i class="fas fa-mobile-alt"></i>
                    </button>
                </div>
                
                <!-- Action buttons -->
                <button id="floating-save" class="floating-btn floating-btn-save" title="Lưu">
                    <span>Lưu</span>
                </button>
                
                <button id="floating-publish" class="floating-btn floating-btn-publish" title="Xuất bản">
                    <span>Xuất bản</span>
                </button>
            `
            document.body.appendChild(toolbar)
            
            // Close button - trigger exit preview mode
            document.getElementById('floating-close')?.addEventListener('click', () => {
                const previewBtn = document.getElementById('btn-preview')
                if (previewBtn && previewBtn.classList.contains('active')) {
                    previewBtn.click()
                }
            })
            
            // Floating device switcher functionality
            toolbar.querySelectorAll('.floating-device-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active from all floating device buttons
                    toolbar.querySelectorAll('.floating-device-btn').forEach(b => b.classList.remove('active'))
                    btn.classList.add('active')
                    
                    // Also update main device switcher
                    const device = btn.dataset.device
                    const mainDeviceBtn = document.querySelector(`.device-btn[data-device="${device}"]`)
                    if (mainDeviceBtn) {
                        document.querySelectorAll('.device-btn[data-device]').forEach(b => b.classList.remove('active'))
                        mainDeviceBtn.classList.add('active')
                    }
                    
                    // Set device in editor
                    if (this.pm) {
                        this.pm.setDevice(device)
                    }
                })
            })
            
            // Save button
            document.getElementById('floating-save')?.addEventListener('click', () => {
                this.savePage()
            })
            
            // Publish button
            document.getElementById('floating-publish')?.addEventListener('click', () => {
                this.publishPage()
            })
            
            // Setup drag functionality for snapping to 4 edges
            this.setupFloatingToolbarDrag(toolbar)
        }
        
        // Sync floating device switcher with main device switcher
        this.syncFloatingDeviceSwitcher()
        
        toolbar.style.display = 'flex'
    }
    
    /**
     * Sync floating device switcher with main device switcher
     */
    syncFloatingDeviceSwitcher() {
        const activeMainBtn = document.querySelector('.device-btn[data-device].active')
        if (activeMainBtn) {
            const device = activeMainBtn.dataset.device
            const floatingBtn = document.querySelector(`.floating-device-btn[data-device="${device}"]`)
            if (floatingBtn) {
                document.querySelectorAll('.floating-device-btn').forEach(b => b.classList.remove('active'))
                floatingBtn.classList.add('active')
            }
        }
    }
    
    /**
     * Setup draggable functionality for floating toolbar
     * Allows dragging to snap to 4 edges (top, bottom, left, right)
     */
    setupFloatingToolbarDrag(toolbar) {
        let isDragging = false
        let dragStartX = 0
        let dragStartY = 0
        let toolbarStartX = 0
        let toolbarStartY = 0
        
        // Save/load position from localStorage
        const saveToolbarPosition = (position) => {
            try {
                localStorage.setItem('floatingToolbarPosition', position)
            } catch (e) {
                console.warn('Could not save toolbar position to localStorage:', e)
            }
        }
        
        const getToolbarPosition = () => {
            try {
                return localStorage.getItem('floatingToolbarPosition') || 'top'
            } catch (e) {
                console.warn('Could not read toolbar position from localStorage:', e)
                return 'top'
            }
        }
        
        // Apply position class
        const setToolbarPosition = (position) => {
            // Remove all position classes
            toolbar.classList.remove('position-top', 'position-left', 'position-right', 'position-bottom')
            
            // Add new position class
            toolbar.classList.add(`position-${position}`)
            
            // Save position
            saveToolbarPosition(position)
        }
        
        // Calculate snap position based on drag end
        const calculateSnapPosition = (x, y) => {
            const windowWidth = window.innerWidth
            const windowHeight = window.innerHeight
            const toolbarRect = toolbar.getBoundingClientRect()
            
            const toolbarCenterX = x + toolbarRect.width / 2
            const toolbarCenterY = y + toolbarRect.height / 2
            
            // Determine which edge is closest
            const distances = {
                top: Math.abs(toolbarCenterY - 100), // 100px from top
                bottom: Math.abs(toolbarCenterY - (windowHeight - 100)), // 100px from bottom
                left: Math.abs(toolbarCenterX - 100), // 100px from left
                right: Math.abs(toolbarCenterX - (windowWidth - 100)) // 100px from right
            }
            
            const minDistance = Math.min(...Object.values(distances))
            const closestEdge = Object.keys(distances).find(key => distances[key] === minDistance)
            
            return closestEdge
        }
        
        // Throttle function for performance
        const throttle = (func, limit) => {
            let inThrottle
            return function() {
                const args = arguments
                const context = this
                if (!inThrottle) {
                    func.apply(context, args)
                    inThrottle = true
                    setTimeout(() => inThrottle = false, limit)
                }
            }
        }
        
        // Mouse down - start dragging
        toolbar.addEventListener('mousedown', (e) => {
            // Only allow dragging on the toolbar itself, not on buttons or their children
            if (e.target.closest('.floating-btn') || 
                e.target.closest('.floating-device-btn') ||
                e.target.closest('.floating-device-switcher')) {
                return
            }
            
            isDragging = true
            dragStartX = e.clientX
            dragStartY = e.clientY
            
            const rect = toolbar.getBoundingClientRect()
            toolbarStartX = rect.left
            toolbarStartY = rect.top
            
            // Remove position classes while dragging
            toolbar.classList.remove('position-top', 'position-left', 'position-right', 'position-bottom')
            
            // Set inline styles for dragging
            toolbar.style.position = 'fixed'
            toolbar.style.left = toolbarStartX + 'px'
            toolbar.style.top = toolbarStartY + 'px'
            toolbar.style.transform = 'none'
            toolbar.style.right = 'auto'
            toolbar.style.bottom = 'auto'
            toolbar.style.flexDirection = 'row'
            
            e.preventDefault()
        })
        
        // Mouse move - drag (with throttling)
        const handleMouseMove = throttle((e) => {
            if (!isDragging) return
            
            const deltaX = e.clientX - dragStartX
            const deltaY = e.clientY - dragStartY
            
            const newX = toolbarStartX + deltaX
            const newY = toolbarStartY + deltaY
            
            toolbar.style.left = newX + 'px'
            toolbar.style.top = newY + 'px'
        }, 16) // ~60fps
        
        document.addEventListener('mousemove', handleMouseMove)
        
        // Mouse up - stop dragging and snap
        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return
            
            isDragging = false
            
            const rect = toolbar.getBoundingClientRect()
            const snapPosition = calculateSnapPosition(rect.left, rect.top)
            
            // Clear inline styles
            toolbar.style.position = ''
            toolbar.style.left = ''
            toolbar.style.top = ''
            toolbar.style.transform = ''
            toolbar.style.right = ''
            toolbar.style.bottom = ''
            toolbar.style.flexDirection = ''
            
            // Apply snap position
            setToolbarPosition(snapPosition)
            
            console.log(`📍 Floating toolbar snapped to: ${snapPosition}`)
        })
        
        // Restore saved position
        const savedPosition = getToolbarPosition()
        setToolbarPosition(savedPosition)
        
        console.log('🖱️ Floating toolbar drag functionality initialized')
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
        
        // Setup right panel close button and component selection events
        this.setupRightPanelClose();
    }
    
    // ===== RIGHT PANEL CLOSE BUTTON SETUP =====
    setupRightPanelClose() {
        const rightPanelClose = document.getElementById('right-panel-close');
        const rightPanel = document.getElementById('right-panel');
        
        // Close button click handler
        if (rightPanelClose && rightPanel) {
            rightPanelClose.addEventListener('click', () => {
                rightPanel.classList.add('hidden');
                this.updateCanvasLayout();
                console.log('🔒 Right panel closed');
            });
        }
        
        // Show right panel when component is selected
        if (this.pm) {
            this.pm.on('component:selected', (component) => {
                if (component && rightPanel) {
                    rightPanel.classList.remove('hidden');
                    this.updateCanvasLayout();
                    console.log('📋 Right panel opened for component:', component.get('type') || 'unknown');
                }
            });
            
            // Optionally hide right panel when no component is selected
            this.pm.on('component:deselected', () => {
                // Optional: uncomment to auto-hide panel when deselecting
                // rightPanel.classList.add('hidden');
                // this.updateCanvasLayout();
            });
        }
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
    // NOTE: Device switching is handled entirely by DeviceSwitcher component (this.deviceSwitcher)
    // which is initialized in initPageMadeEditor() via this.deviceSwitcher.init()
    // DeviceSwitcher correctly converts device names to proper case (Desktop/Tablet/Mobile)
    // for GrapesJS deviceManager
    setupDeviceSwitcher() {
        // DeviceSwitcher component handles all device switching logic
        // No additional setup needed here - keeping method for backward compatibility
        console.log('📱 Device switching delegated to DeviceSwitcher component');
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
        // Sort by numeric prefix (1. Hero Section, 2. Footer Section, etc.)
        // Categories without number prefix go to the end
        Object.keys(blocksByCategory).sort((a, b) => {
            // Extract leading number from category name (e.g., "0. Header Section" → 0)
            // FIX: Use ?? instead of || because parseInt("0") returns 0 which is falsy
            // 0 || 999 = 999 (WRONG!) but 0 ?? 999 = 0 (CORRECT!)
            const matchA = a.match(/^(\d+)\./);
            const matchB = b.match(/^(\d+)\./);
            const numA = matchA ? parseInt(matchA[1]) : 999;
            const numB = matchB ? parseInt(matchB[1]) : 999;
            return numA - numB;
        }).forEach(categoryName => {
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
        
        // Drag & drop events - using GrapesJS BlockManager native drag system
        blockEl.addEventListener('dragstart', (e) => {
            if (this.pm) {
                const bm = this.pm.BlockManager;
                if (bm && bm.__startDrag) {
                    // Use BlockManager's native __startDrag method
                    bm.__startDrag(block, e);
                    // Start custom droppable for each frame
                    bm.__getFrameViews().forEach(fv => fv.droppable?.startCustom());
                }
            }
        });
        
        blockEl.addEventListener('drag', (e) => {
            if (this.pm) {
                const bm = this.pm.BlockManager;
                if (bm && bm.__drag) {
                    bm.__drag(e);
                }
            }
        });
        
        blockEl.addEventListener('dragend', (e) => {
            if (this.pm) {
                const bm = this.pm.BlockManager;
                if (bm) {
                    // End custom droppable for each frame
                    bm.__getFrameViews().forEach(fv => fv.droppable?.endCustom(false));
                    if (bm.__endDrag) {
                        bm.__endDrag();
                    }
                }
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
        
        // Only render if container is empty (GrapesJS may have already rendered via appendTo config)
        if (layersContainer.children.length === 0) {
            const layersEl = layerManager.render();
            
            if (layersEl) {
                layersContainer.appendChild(layersEl);
                console.log('✅ Layers rendered');
            }
        } else {
            console.log('✅ Layers already rendered by GrapesJS');
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
            
            // Set flag to allow Asset Manager render (required by setupAssetManagementOverrides)
            window.assetsRenderedInCorrectPlace = true;
            
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