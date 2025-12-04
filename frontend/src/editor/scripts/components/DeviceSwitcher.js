/**
 * Device Switcher Component
 * Handles responsive device switching (Desktop, Tablet, Mobile)
 * 
 * SIMPLIFIED VERSION: Delegates all sizing to GrapesJS native deviceManager.
 * No custom scale/zoom logic - GrapesJS handles frame sizing via FrameWrapView.
 */

export class DeviceSwitcher {
    constructor() {
        this.editor = null
        this.deviceButtons = []
        this.currentDevice = 'desktop'
        this.devices = {
            desktop: { name: 'Desktop', width: null, icon: 'fa-desktop' },
            tablet: { name: 'Tablet', width: '768px', icon: 'fa-tablet-alt' },
            mobile: { name: 'Mobile', width: '375px', icon: 'fa-mobile-alt' }
        }
        this.isInitialized = false
        
        console.log('📱 DeviceSwitcher component created')
    }

    setEditor(editor) {
        this.editor = editor
        this.setupEditorDevices()
        console.log('📱 DeviceSwitcher editor instance set')
    }

    init() {
        this.initializeElements()
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
        this.updateCanvasClasses(device)

        // Update editor device - GrapesJS handles all sizing
        if (this.editor) {
            try {
                this.editor.setDevice(this.devices[device].name)
                console.log(`📱 GrapesJS device set to: ${this.devices[device].name}`)
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
                    deviceInfo: this.devices[device]
                }
            })
            document.dispatchEvent(deviceEvent)
        }

        console.log('📱 Device switched to:', device)
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

    /**
     * Update CSS classes on canvas elements for styling purposes only.
     * GrapesJS deviceManager handles actual frame sizing.
     */
    updateCanvasClasses(device) {
        const canvas = document.getElementById('canvas-area')
        const gjsEditor = document.getElementById('gjs')
        const editorWrapper = document.getElementById('editor-wrapper')
        
        // Remove existing device classes and add new one
        const deviceClasses = ['device-desktop', 'device-tablet', 'device-mobile']
        
        if (canvas) {
            canvas.classList.remove(...deviceClasses)
            canvas.classList.add(`device-${device}`)
        }
        
        if (gjsEditor) {
            gjsEditor.classList.remove(...deviceClasses)
            gjsEditor.classList.add(`device-${device}`)
        }
        
        if (editorWrapper) {
            editorWrapper.classList.remove(...deviceClasses)
            editorWrapper.classList.add(`device-${device}`)
        }

        // Emit canvas resize event for any listeners
        const deviceInfo = this.devices[device]
        const resizeEvent = new CustomEvent('device-switcher:canvas-resized', {
            detail: { 
                device,
                width: deviceInfo.width,
                canvas: canvas
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

    // State management
    getState() {
        return {
            currentDevice: this.currentDevice,
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

    // Debug methods
    debug() {
        return {
            currentDevice: this.currentDevice,
            devices: this.devices,
            buttons: Array.from(this.deviceButtons).map(btn => ({
                device: btn.dataset.device,
                active: btn.classList.contains('active'),
                text: btn.textContent.trim()
            })),
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

        this.deviceButtons = []
        this.isInitialized = false
        console.log('🧹 DeviceSwitcher component destroyed')
    }
}

export default DeviceSwitcher
