/**
 * Device Switcher Component
 * Handles responsive device switching (Desktop, Tablet, Mobile)
 * with canvas scaling to fit available space while keeping panels visible
 */

export class DeviceSwitcher {
    constructor() {
        this.editor = null
        this.deviceButtons = []
        this.currentDevice = 'desktop'
        this.currentScale = 1
        this.devices = {
            desktop: { name: 'Desktop', width: null, height: null, icon: 'fa-desktop' },
            tablet: { name: 'Tablet', width: '768px', height: null, icon: 'fa-tablet-alt' },  // No height - like desktop
            mobile: { name: 'Mobile', width: '375px', height: '667px', icon: 'fa-mobile-alt' }
        }
        this.panelWidths = {
            left: 280,
            right: 320
        }
        this.isInitialized = false
        this.scaleIndicator = null
        
        console.log('📱 DeviceSwitcher component created')
    }

    setEditor(editor) {
        this.editor = editor
        this.setupEditorDevices()
        console.log('📱 DeviceSwitcher editor instance set')
    }

    init() {
        this.initializeElements()
        this.createScaleIndicator()
        this.setupEventListeners()
        this.updateActiveState()
        this.isInitialized = true
        console.log('📱 DeviceSwitcher initialized')
    }

    initializeElements() {
        this.deviceButtons = document.querySelectorAll('.device-btn')
        
        if (this.deviceButtons.length === 0) {
            console.warn('Device switcher buttons not found')
            return
        }

        // Set initial active state
        this.updateActiveState()
    }

    /**
     * Create scale indicator element
     */
    createScaleIndicator() {
        // Check if already exists
        if (document.querySelector('.scale-indicator')) {
            this.scaleIndicator = document.querySelector('.scale-indicator')
            return
        }
        
        this.scaleIndicator = document.createElement('div')
        this.scaleIndicator.className = 'scale-indicator'
        this.scaleIndicator.textContent = '100%'
        document.body.appendChild(this.scaleIndicator)
    }

    setupEventListeners() {
        this.deviceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleDeviceSwitch(e.target.closest('.device-btn'))
            })

            // Keyboard accessibility
            btn.addEventListener('keydown', (e) => {
                this.handleKeydown(e, btn)
            })
        })

        // Listen to editor device changes
        document.addEventListener('toolbar:device', (e) => {
            if (e.detail.device !== this.currentDevice) {
                this.setDevice(e.detail.device, false) // Don't emit event to prevent loop
            }
        })
        
        // Listen to window resize for recalculating scale
        window.addEventListener('resize', this.debounce(() => {
            if (this.currentDevice !== 'desktop') {
                this.applyCanvasScale(this.currentDevice)
            }
        }, 150))

        console.log('📱 DeviceSwitcher event listeners setup complete')
    }

    setupEditorDevices() {
        if (!this.editor) return

        // Configure editor devices if not already configured
        const editorDevices = this.editor.Devices.getAll()
        
        if (editorDevices.length === 0) {
            // Add devices to editor
            Object.entries(this.devices).forEach(([key, device]) => {
                this.editor.Devices.add({
                    id: key,
                    name: device.name,
                    width: device.width
                })
            })
        }

        console.log('📱 Editor devices configured')
    }

    handleDeviceSwitch(deviceBtn) {
        if (!deviceBtn) return

        const device = deviceBtn.dataset.device
        if (!device || !this.devices[device]) return

        this.setDevice(device, true)
    }

    setDevice(device, emitEvent = true) {
        if (!this.devices[device] || device === this.currentDevice) return

        const previousDevice = this.currentDevice
        this.currentDevice = device

        // Update UI
        this.updateActiveState()
        this.updateCanvasSize(device)

        // Update editor device
        if (this.editor) {
            try {
                this.editor.setDevice(this.devices[device].name)
                
                // Apply canvas scaling for tablet/mobile
                // Wait for frame resize animation to complete
                setTimeout(() => {
                    this.applyCanvasScale(device)
                    
                    // Refresh canvas to fix highlighter misalignment
                    if (this.editor && this.editor.Canvas) {
                        this.editor.Canvas.refresh({ all: true })
                        console.log('📱 Canvas refreshed after device switch')
                    }
                }, 350)
            } catch (error) {
                console.warn('Failed to set editor device:', error)
            }
        }

        // Emit event
        if (emitEvent) {
            const deviceEvent = new CustomEvent('device-switcher:changed', {
                detail: { 
                    device,
                    previousDevice,
                    deviceInfo: this.devices[device],
                    scale: this.currentScale
                }
            })
            document.dispatchEvent(deviceEvent)
        }

        console.log('📱 Device switched to:', device)
    }

    /**
     * Calculate the scale ratio for canvas based on available space
     * @param {string} device - Current device type
     * @returns {number} Scale ratio (0-1)
     */
    calculateScaleRatio(device) {
        const deviceInfo = this.devices[device]
        
        // Desktop doesn't need scaling
        if (!deviceInfo.width) {
            return 1
        }
        
        // Get frame width (parse from string like "768px")
        const frameWidth = parseInt(deviceInfo.width, 10)
        
        // Calculate available space
        const canvasArea = document.getElementById('canvas-area')
        if (!canvasArea) {
            console.warn('Canvas area not found')
            return 1
        }
        
        const canvasAreaWidth = canvasArea.offsetWidth
        const padding = 40 // 20px on each side
        const availableWidth = canvasAreaWidth - padding
        
        // Calculate scale ratio - only scale down, never up
        const scaleRatio = Math.min(1, availableWidth / frameWidth)
        
        // Minimum scale to keep usable
        const minScale = 0.3
        const finalScale = Math.max(minScale, scaleRatio)
        
        console.log(`📐 Scale calculation: available=${availableWidth}px, frame=${frameWidth}px, scale=${finalScale.toFixed(2)}`)
        
        return finalScale
    }

    /**
     * Apply scale (zoom) to canvas view container
     * Using CSS zoom which affects layout (unlike transform)
     * @param {string} device - Current device type
     */
    applyCanvasScale(device) {
        // Target the gjs-cv-canvas container
        const cvCanvas = document.querySelector('#gjs .gjs-cv-canvas')
        if (!cvCanvas) {
            console.warn('Canvas view not found, retrying...')
            setTimeout(() => this.applyCanvasScale(device), 100)
            return
        }
        
        const scale = this.calculateScaleRatio(device)
        this.currentScale = scale
        
        // Apply scale via CSS variable (used by zoom property)
        cvCanvas.style.setProperty('--canvas-scale', scale)
        
        // Update scale indicator
        this.updateScaleIndicator(scale)
        
        console.log(`📱 Applied canvas scale: ${(scale * 100).toFixed(0)}%`)
    }

    /**
     * Update scale indicator badge
     * @param {number} scale - Current scale ratio
     */
    updateScaleIndicator(scale) {
        if (!this.scaleIndicator) return
        
        const percentage = Math.round(scale * 100)
        this.scaleIndicator.textContent = `${percentage}%`
        
        // Show indicator only when scaled (not 100%)
        if (scale < 1) {
            this.scaleIndicator.classList.add('visible')
            
            // Auto-hide after 2 seconds
            setTimeout(() => {
                this.scaleIndicator.classList.remove('visible')
            }, 2000)
        } else {
            this.scaleIndicator.classList.remove('visible')
        }
    }

    updateActiveState() {
        this.deviceButtons.forEach(btn => {
            const device = btn.dataset.device
            if (device === this.currentDevice) {
                btn.classList.add('active')
                btn.setAttribute('aria-pressed', 'true')
            } else {
                btn.classList.remove('active')
                btn.setAttribute('aria-pressed', 'false')
            }
        })
    }

    updateCanvasSize(device) {
        const canvas = document.getElementById('canvas-area')  // Fixed: was 'pm-canvas' which doesn't exist
        const gjsEditor = document.getElementById('gjs')
        const editorWrapper = document.getElementById('editor-wrapper')
        
        const deviceInfo = this.devices[device]
        
        // Remove existing device classes from canvas-area
        if (canvas) {
            canvas.classList.remove('device-desktop', 'device-tablet', 'device-mobile')
            canvas.classList.add(`device-${device}`)
        }
        
        // Add device class to #gjs for CSS targeting
        if (gjsEditor) {
            gjsEditor.classList.remove('device-desktop', 'device-tablet', 'device-mobile')
            gjsEditor.classList.add(`device-${device}`)
            
            // Reset scale for desktop
            if (device === 'desktop') {
                const cvCanvas = document.querySelector('#gjs .gjs-cv-canvas')
                if (cvCanvas) {
                    cvCanvas.style.setProperty('--canvas-scale', '1')
                }
                this.currentScale = 1
                this.updateScaleIndicator(1)
            }
        }
        
        // Add device class to #editor-wrapper for reliable CSS targeting (no :has() needed)
        if (editorWrapper) {
            editorWrapper.classList.remove('device-desktop', 'device-tablet', 'device-mobile')
            editorWrapper.classList.add(`device-${device}`)
        }

        // Update canvas wrapper classes (for any container-level styling)
        const canvasWrapper = document.getElementById('canvas-container')
        if (canvasWrapper) {
            canvasWrapper.classList.remove('canvas-desktop', 'canvas-tablet', 'canvas-mobile')
            canvasWrapper.classList.add(`canvas-${device}`)
        }
        
        // NOTE: Frame sizing is now handled entirely by GrapesJS native deviceManager
        // GrapesJS sets width/height on .gjs-frame-wrapper via FrameWrapView.__handleSize()
        // We only need to update CSS classes here for any additional styling needs

        // Emit canvas resize event
        const resizeEvent = new CustomEvent('device-switcher:canvas-resized', {
            detail: { 
                device,
                width: deviceInfo.width,
                height: deviceInfo.height,
                canvas: canvas,
                canvasWrapper: canvasWrapper,
                scale: this.currentScale
            }
        })
        document.dispatchEvent(resizeEvent)
    }

    handleKeydown(e, button) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault()
                this.handleDeviceSwitch(button)
                break
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault()
                this.focusNextDevice(button)
                break
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault()
                this.focusPreviousDevice(button)
                break
            case 'Home':
                e.preventDefault()
                this.focusFirstDevice()
                break
            case 'End':
                e.preventDefault()
                this.focusLastDevice()
                break
        }
    }

    focusNextDevice(currentButton) {
        const nextButton = currentButton.nextElementSibling
        if (nextButton && nextButton.classList.contains('device-btn')) {
            nextButton.focus()
        } else {
            // Wrap to first
            const firstButton = this.deviceButtons[0]
            if (firstButton) firstButton.focus()
        }
    }

    focusPreviousDevice(currentButton) {
        const prevButton = currentButton.previousElementSibling
        if (prevButton && prevButton.classList.contains('device-btn')) {
            prevButton.focus()
        } else {
            // Wrap to last
            const lastButton = this.deviceButtons[this.deviceButtons.length - 1]
            if (lastButton) lastButton.focus()
        }
    }

    focusFirstDevice() {
        const firstButton = this.deviceButtons[0]
        if (firstButton) firstButton.focus()
    }

    focusLastDevice() {
        const lastButton = this.deviceButtons[this.deviceButtons.length - 1]
        if (lastButton) lastButton.focus()
    }

    // Public API methods
    getCurrentDevice() {
        return this.currentDevice
    }

    getCurrentScale() {
        return this.currentScale
    }

    getDeviceInfo(device) {
        return this.devices[device] || null
    }

    getAllDevices() {
        return { ...this.devices }
    }

    switchToDesktop() {
        this.setDevice('desktop')
    }

    switchToTablet() {
        this.setDevice('tablet')
    }

    switchToMobile() {
        this.setDevice('mobile')
    }

    nextDevice() {
        const deviceKeys = Object.keys(this.devices)
        const currentIndex = deviceKeys.indexOf(this.currentDevice)
        const nextIndex = (currentIndex + 1) % deviceKeys.length
        this.setDevice(deviceKeys[nextIndex])
    }

    previousDevice() {
        const deviceKeys = Object.keys(this.devices)
        const currentIndex = deviceKeys.indexOf(this.currentDevice)
        const prevIndex = (currentIndex - 1 + deviceKeys.length) % deviceKeys.length
        this.setDevice(deviceKeys[prevIndex])
    }

    // Responsive behavior
    handleViewportChange() {
        const width = window.innerWidth
        
        // Auto-switch based on viewport size (optional)
        if (width < 640) {
            // Mobile viewport - suggest mobile view
            this.suggestDevice('mobile')
        } else if (width < 1024) {
            // Tablet viewport - suggest tablet view
            this.suggestDevice('tablet')
        } else {
            // Desktop viewport - suggest desktop view
            this.suggestDevice('desktop')
        }
    }

    suggestDevice(device) {
        // Emit suggestion event instead of auto-switching
        const suggestionEvent = new CustomEvent('device-switcher:suggested', {
            detail: { 
                device,
                currentDevice: this.currentDevice,
                viewportWidth: window.innerWidth
            }
        })
        document.dispatchEvent(suggestionEvent)
    }

    // Animation methods
    animateSwitch(fromDevice, toDevice) {
        const canvas = document.getElementById('pm-canvas')
        if (!canvas) return

        canvas.style.transition = 'all 0.3s ease'
        
        // Add animation class
        canvas.classList.add('device-switching')
        
        setTimeout(() => {
            canvas.classList.remove('device-switching')
        }, 300)
    }

    // State management
    getState() {
        return {
            currentDevice: this.currentDevice,
            currentScale: this.currentScale,
            currentDeviceInfo: this.devices[this.currentDevice],
            allDevices: this.getAllDevices(),
            buttonCount: this.deviceButtons.length,
            isInitialized: this.isInitialized
        }
    }

    // Accessibility helpers
    focus() {
        const activeButton = document.querySelector('.device-btn.active')
        if (activeButton) {
            activeButton.focus()
        }
    }

    getAriaLabel(device) {
        const deviceInfo = this.devices[device]
        if (!deviceInfo) return ''
        
        const isActive = device === this.currentDevice
        return `${deviceInfo.name} view${isActive ? ', currently active' : ''}`
    }

    // Integration methods
    onDeviceChange(callback) {
        if (typeof callback !== 'function') return

        document.addEventListener('device-switcher:changed', (e) => {
            callback(e.detail)
        })
    }

    onCanvasResize(callback) {
        if (typeof callback !== 'function') return

        document.addEventListener('device-switcher:canvas-resized', (e) => {
            callback(e.detail)
        })
    }
    
    // Utility: Debounce function
    debounce(func, wait) {
        let timeout
        return (...args) => {
            clearTimeout(timeout)
            timeout = setTimeout(() => func.apply(this, args), wait)
        }
    }

    // Debug methods
    debug() {
        return {
            currentDevice: this.currentDevice,
            currentScale: this.currentScale,
            devices: this.devices,
            buttons: Array.from(this.deviceButtons).map(btn => ({
                device: btn.dataset.device,
                active: btn.classList.contains('active'),
                text: btn.textContent.trim()
            })),
            canvas: document.getElementById('pm-canvas'),
            editorDevices: this.editor ? this.editor.Devices.getAll() : null
        }
    }

    // Cleanup
    destroy() {
        // Remove event listeners
        this.deviceButtons.forEach(btn => {
            const newBtn = btn.cloneNode(true)
            btn.parentNode.replaceChild(newBtn, btn)
        })
        
        // Remove scale indicator
        if (this.scaleIndicator && this.scaleIndicator.parentNode) {
            this.scaleIndicator.parentNode.removeChild(this.scaleIndicator)
        }

        this.deviceButtons = []
        this.scaleIndicator = null
        this.isInitialized = false
        console.log('🧹 DeviceSwitcher component destroyed')
    }
}

export default DeviceSwitcher