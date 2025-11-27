/**
 * Toolbar Component
 * Manages the main editor toolbar functionality
 */

export class Toolbar {
    constructor() {
        this.editor = null
        this.isInitialized = false
        this.elements = {}
        this.shortcuts = new Map()
        
        console.log('🔧 Toolbar component created')
    }

    setEditor(editor) {
        this.editor = editor
        this.setupToolbarActions()
        console.log('🔧 Toolbar editor instance set')
    }

    init() {
        this.initializeElements()
        this.setupEventListeners()
        this.setupKeyboardShortcuts()
        this.isInitialized = true
        console.log('🔧 Toolbar initialized')
    }

    initializeElements() {
        this.elements = {
            toolbar: document.getElementById('top-toolbar'),
            saveBtn: document.getElementById('saveBtn'),
            publishBtn: document.getElementById('publishBtn'),
            previewToggle: document.getElementById('previewToggle'),
            darkModeToggle: document.getElementById('darkModeToggle'),
            pageTitle: document.getElementById('page-title-display'),
            deviceButtons: document.querySelectorAll('.device-btn'),
            panelTabs: document.querySelectorAll('.panel-tab')
        }
    }

    setupEventListeners() {
        // Save button
        if (this.elements.saveBtn) {
            this.elements.saveBtn.addEventListener('click', () => {
                this.handleSave()
            })
        }

        // Publish button
        if (this.elements.publishBtn) {
            this.elements.publishBtn.addEventListener('click', () => {
                this.handlePublish()
            })
        }

        // Preview toggle
        if (this.elements.previewToggle) {
            this.elements.previewToggle.addEventListener('click', () => {
                this.handlePreviewToggle()
            })
        }

        // Device switcher
        this.elements.deviceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleDeviceSwitch(e.target.closest('.device-btn'))
            })
        })

        // Panel tabs
        this.elements.panelTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handlePanelSwitch(e.target.closest('.panel-tab'))
            })
        })

        // Window events
        window.addEventListener('resize', () => {
            this.handleResize()
        })

        console.log('🔧 Toolbar event listeners setup complete')
    }

    setupKeyboardShortcuts() {
        this.shortcuts.set('ctrl+s', () => this.handleSave())
        this.shortcuts.set('cmd+s', () => this.handleSave())
        this.shortcuts.set('ctrl+p', () => this.handlePublish())
        this.shortcuts.set('cmd+p', () => this.handlePublish())
        this.shortcuts.set('ctrl+shift+p', () => this.handlePreviewToggle())
        this.shortcuts.set('cmd+shift+p', () => this.handlePreviewToggle())
        this.shortcuts.set('escape', () => this.exitFullscreen())

        document.addEventListener('keydown', (e) => {
            const key = this.getShortcutKey(e)
            if (this.shortcuts.has(key)) {
                e.preventDefault()
                this.shortcuts.get(key)()
            }
        })

        console.log('🔧 Toolbar keyboard shortcuts setup complete')
    }

    setupToolbarActions() {
        if (!this.editor) return

        // Add custom commands to editor
        this.editor.Commands.add('save', {
            run: () => this.handleSave(),
            stop: () => {}
        })

        this.editor.Commands.add('publish', {
            run: () => this.handlePublish(),
            stop: () => {}
        })

        this.editor.Commands.add('toggle-preview', {
            run: () => this.handlePreviewToggle(),
            stop: () => {}
        })

        this.editor.Commands.add('fullscreen', {
            run: () => this.toggleFullscreen(),
            stop: () => {}
        })

        console.log('🔧 Toolbar actions added to editor')
    }

    // Action handlers
    async handleSave() {
        if (!this.editor) return

        try {
            this.setButtonLoading(this.elements.saveBtn, true)
            
            const content = this.editor.runCommand('gjs-get-instances-html')
            const css = this.editor.getStyle()
            const components = this.editor.getComponents()
            
            // Emit save event for main app to handle
            const saveEvent = new CustomEvent('toolbar:save', {
                detail: { content, css, components }
            })
            document.dispatchEvent(saveEvent)

            console.log('💾 Save action triggered')
            
        } catch (error) {
            console.error('Save failed:', error)
            this.showNotification('Save failed: ' + error.message, 'error')
        } finally {
            this.setButtonLoading(this.elements.saveBtn, false)
        }
    }

    async handlePublish() {
        if (!this.editor) return

        try {
            this.setButtonLoading(this.elements.publishBtn, true)
            
            const content = this.editor.runCommand('gjs-get-instances-html')
            const css = this.editor.getStyle()
            const components = this.editor.getComponents()
            
            // Emit publish event for main app to handle
            const publishEvent = new CustomEvent('toolbar:publish', {
                detail: { content, css, components }
            })
            document.dispatchEvent(publishEvent)

            console.log('🚀 Publish action triggered')
            
        } catch (error) {
            console.error('Publish failed:', error)
            this.showNotification('Publish failed: ' + error.message, 'error')
        } finally {
            this.setButtonLoading(this.elements.publishBtn, false)
        }
    }

    handlePreviewToggle() {
        if (!this.editor) return

        const isPreview = this.editor.runCommand('toggle-preview')
        this.updatePreviewButton(isPreview)
        
        // Emit preview event
        const previewEvent = new CustomEvent('toolbar:preview', {
            detail: { isPreview }
        })
        document.dispatchEvent(previewEvent)

        console.log('👁️ Preview toggled:', isPreview)
    }

    handleDeviceSwitch(deviceBtn) {
        if (!deviceBtn || !this.editor) return

        const device = deviceBtn.dataset.device
        if (!device) return

        // Update active state
        this.elements.deviceButtons.forEach(btn => btn.classList.remove('active'))
        deviceBtn.classList.add('active')

        // Switch editor device
        this.editor.setDevice(device.charAt(0).toUpperCase() + device.slice(1))

        // Emit device change event
        const deviceEvent = new CustomEvent('toolbar:device', {
            detail: { device }
        })
        document.dispatchEvent(deviceEvent)

        console.log('📱 Device switched to:', device)
    }

    handlePanelSwitch(panelTab) {
        if (!panelTab) return

        const panelName = panelTab.dataset.panel
        if (!panelName) return

        // Update active tab
        this.elements.panelTabs.forEach(tab => tab.classList.remove('active'))
        panelTab.classList.add('active')

        // Show corresponding panel
        const panels = document.querySelectorAll('.panel')
        panels.forEach(panel => panel.classList.remove('active'))
        
        const targetPanel = document.getElementById(`${panelName}-panel`)
        if (targetPanel) {
            targetPanel.classList.add('active')
        }

        // Emit panel switch event
        const panelEvent = new CustomEvent('toolbar:panel', {
            detail: { panel: panelName }
        })
        document.dispatchEvent(panelEvent)

        console.log('📋 Panel switched to:', panelName)
    }

    handleResize() {
        // Handle responsive toolbar behavior
        const width = window.innerWidth
        const toolbar = this.elements.toolbar

        if (width < 640) {
            toolbar.classList.add('mobile')
        } else {
            toolbar.classList.remove('mobile')
        }
    }

    // UI helper methods
    setButtonLoading(button, isLoading) {
        if (!button) return

        if (isLoading) {
            button.disabled = true
            button.classList.add('loading')
            const originalContent = button.innerHTML
            button.dataset.originalContent = originalContent
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...'
        } else {
            button.disabled = false
            button.classList.remove('loading')
            if (button.dataset.originalContent) {
                button.innerHTML = button.dataset.originalContent
                delete button.dataset.originalContent
            }
        }
    }

    updatePreviewButton(isPreview) {
        if (!this.elements.previewToggle) return

        if (isPreview) {
            this.elements.previewToggle.innerHTML = '<i class="fas fa-edit"></i> Edit'
            this.elements.previewToggle.classList.add('btn-primary')
            this.elements.previewToggle.classList.remove('btn-secondary')
        } else {
            this.elements.previewToggle.innerHTML = '<i class="fas fa-eye"></i> Preview'
            this.elements.previewToggle.classList.remove('btn-primary')
            this.elements.previewToggle.classList.add('btn-secondary')
        }
    }

    updatePageTitle(title) {
        if (this.elements.pageTitle) {
            this.elements.pageTitle.textContent = title
        }
    }

    toggleFullscreen() {
        const editorContainer = document.getElementById('editor-container')
        
        if (!document.fullscreenElement) {
            editorContainer.requestFullscreen().catch(err => {
                console.error('Fullscreen failed:', err)
            })
        } else {
            document.exitFullscreen()
        }
    }

    exitFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen()
        }
    }

    getShortcutKey(e) {
        const parts = []
        
        if (e.ctrlKey || e.metaKey) {
            parts.push(navigator.platform.includes('Mac') ? 'cmd' : 'ctrl')
        }
        if (e.shiftKey) parts.push('shift')
        if (e.altKey) parts.push('alt')
        
        parts.push(e.key.toLowerCase())
        
        return parts.join('+')
    }

    showNotification(message, type = 'info') {
        // TODO: Implement proper notification system
        console.log(`[${type.toUpperCase()}] ${message}`)
        
        // Temporary implementation using alert
        if (type === 'error') {
            alert(message)
        }
    }

    // Public API methods
    enableSaveButton() {
        if (this.elements.saveBtn) {
            this.elements.saveBtn.disabled = false
        }
    }

    disableSaveButton() {
        if (this.elements.saveBtn) {
            this.elements.saveBtn.disabled = true
        }
    }

    enablePublishButton() {
        if (this.elements.publishBtn) {
            this.elements.publishBtn.disabled = false
        }
    }

    disablePublishButton() {
        if (this.elements.publishBtn) {
            this.elements.publishBtn.disabled = true
        }
    }

    setActiveDevice(device) {
        const deviceBtn = document.querySelector(`[data-device="${device}"]`)
        if (deviceBtn) {
            this.handleDeviceSwitch(deviceBtn)
        }
    }

    setActivePanel(panel) {
        const panelTab = document.querySelector(`[data-panel="${panel}"]`)
        if (panelTab) {
            this.handlePanelSwitch(panelTab)
        }
    }

    // State management
    getState() {
        return {
            activeDevice: document.querySelector('.device-btn.active')?.dataset.device,
            activePanel: document.querySelector('.panel-tab.active')?.dataset.panel,
            isPreview: this.elements.previewToggle?.classList.contains('btn-primary'),
            pageTitle: this.elements.pageTitle?.textContent
        }
    }

    // Cleanup
    destroy() {
        // Remove event listeners
        this.elements.deviceButtons.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true))
        })
        
        this.elements.panelTabs.forEach(tab => {
            tab.replaceWith(tab.cloneNode(true))
        })

        // Clear shortcuts
        this.shortcuts.clear()
        
        this.isInitialized = false
        console.log('🧹 Toolbar component destroyed')
    }
}

export default Toolbar