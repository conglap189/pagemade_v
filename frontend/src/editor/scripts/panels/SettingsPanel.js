/**
 * Settings Panel Component
 * Manages the settings panel for editor configuration and preferences
 */

export class SettingsPanel {
    constructor() {
        this.editor = null
        this.panel = null
        this.settings = new Map()
        this.isInitialized = false
        
        console.log('⚙️ SettingsPanel component created')
    }

    setEditor(editor) {
        this.editor = editor
        this.setupEditorSettings()
        console.log('⚙️ SettingsPanel editor instance set')
    }

    init() {
        this.initializeElements()
        this.setupEventListeners()
        this.loadDefaultSettings()
        this.renderSettings()
        this.isInitialized = true
        console.log('⚙️ SettingsPanel initialized')
    }

    initializeElements() {
        this.panel = document.getElementById('settings-panel')
        
        if (!this.panel) {
            console.warn('Settings panel not found')
            return
        }

        // Create panel header
        this.createPanelHeader()
        
        console.log('⚙️ SettingsPanel elements initialized')
    }

    createPanelHeader() {
        const headerEl = document.createElement('div')
        headerEl.className = 'settings-header'
        headerEl.innerHTML = `
            <div class="settings-title">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
            </div>
            <div class="settings-actions">
                <button class="btn btn-sm btn-secondary" id="export-settings-btn" title="Export settings">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-sm btn-secondary" id="import-settings-btn" title="Import settings">
                    <i class="fas fa-upload"></i>
                </button>
                <button class="btn btn-sm btn-secondary" id="reset-settings-btn" title="Reset to defaults">
                    <i class="fas fa-undo"></i>
                </button>
            </div>
        `

        this.panel.insertBefore(headerEl, this.panel.firstChild)

        // Setup action buttons
        this.setupActionButtons(headerEl)
    }

    setupActionButtons(headerEl) {
        // Export settings
        const exportBtn = headerEl.querySelector('#export-settings-btn')
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportSettings()
            })
        }

        // Import settings
        const importBtn = headerEl.querySelector('#import-settings-btn')
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importSettings()
            })
        }

        // Reset settings
        const resetBtn = headerEl.querySelector('#reset-settings-btn')
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSettings()
            })
        }
    }

    setupEventListeners() {
        // Listen to editor configuration changes
        if (this.editor) {
            this.editor.on('storage:load', () => {
                this.loadSettingsFromStorage()
            })

            this.editor.on('storage:store', () => {
                this.saveSettingsToStorage()
            })
        }

        console.log('⚙️ SettingsPanel event listeners setup complete')
    }

    setupEditorSettings() {
        if (!this.editor) return

        // Get current editor configuration
        const config = this.editor.getConfig()
        
        // Initialize settings from editor config
        this.settings.set('canvasWidth', config.canvasWidth || '100%')
        this.settings.set('canvasHeight', config.canvasHeight || 'auto')
        this.settings.set('gridSize', config.gridSize || 10)
        this.settings.set('snapToGrid', config.snapToGrid || false)
        this.settings.set('showOffsets', config.showOffsets || true)
        this.settings.set('highlightable', config.highlightable || true)
        this.settings.set('selectable', config.selectable || true)
        this.settings.set('editable', config.editable || true)
        this.settings.set('draggable', config.draggable || true)
        this.settings.set('resizable', config.resizable || true)
        this.settings.set('removable', config.removable || true)
        this.settings.set('stylable', config.stylable || true)
        this.settings.set('textEditable', config.textEditable || true)
        this.settings.set('undoLimit', config.undoLimit || 50)
        this.settings.set('autoSave', config.autoSave || false)
        this.settings.set('autoSaveInterval', config.autoSaveInterval || 30000)

        console.log('⚙️ Editor settings setup complete')
    }

    loadDefaultSettings() {
        // Load settings from localStorage if available
        this.loadSettingsFromStorage()

        // Set defaults for missing settings
        const defaultSettings = {
            canvasWidth: '100%',
            canvasHeight: 'auto',
            gridSize: 10,
            snapToGrid: false,
            showOffsets: true,
            highlightable: true,
            selectable: true,
            editable: true,
            draggable: true,
            resizable: true,
            removable: true,
            stylable: true,
            textEditable: true,
            undoLimit: 50,
            autoSave: false,
            autoSaveInterval: 30000,
            theme: 'light',
            language: 'en',
            showRulers: false,
            showGuides: true,
            showComponentOutline: true,
            enableKeyboardShortcuts: true,
            enableTooltips: true,
            enableAutoComplete: true,
            enableSyntaxHighlighting: true,
            enableLivePreview: true,
            enableResponsiveMode: true,
            defaultDevice: 'desktop'
        }

        Object.entries(defaultSettings).forEach(([key, value]) => {
            if (!this.settings.has(key)) {
                this.settings.set(key, value)
            }
        })

        console.log('⚙️ Default settings loaded')
    }

    renderSettings() {
        if (!this.panel) return

        // Clear existing content (except header)
        const existingContent = this.panel.querySelectorAll('.settings-content')
        existingContent.forEach(el => el.remove())

        // Create settings content
        const contentEl = document.createElement('div')
        contentEl.className = 'settings-content'

        // Group settings by category
        const categories = this.groupSettingsByCategory()

        categories.forEach((settings, category) => {
            const categoryEl = this.renderSettingsCategory(category, settings)
            contentEl.appendChild(categoryEl)
        })

        this.panel.appendChild(contentEl)
    }

    groupSettingsByCategory() {
        const categories = new Map()

        // Canvas settings
        categories.set('Canvas', [
            { key: 'canvasWidth', type: 'text', label: 'Canvas Width', placeholder: '100%' },
            { key: 'canvasHeight', type: 'text', label: 'Canvas Height', placeholder: 'auto' },
            { key: 'gridSize', type: 'number', label: 'Grid Size', min: 1, max: 100 },
            { key: 'snapToGrid', type: 'checkbox', label: 'Snap to Grid' },
            { key: 'showOffsets', type: 'checkbox', label: 'Show Offsets' },
            { key: 'showRulers', type: 'checkbox', label: 'Show Rulers' },
            { key: 'showGuides', type: 'checkbox', label: 'Show Guides' }
        ])

        // Component settings
        categories.set('Components', [
            { key: 'highlightable', type: 'checkbox', label: 'Highlightable' },
            { key: 'selectable', type: 'checkbox', label: 'Selectable' },
            { key: 'editable', type: 'checkbox', label: 'Editable' },
            { key: 'draggable', type: 'checkbox', label: 'Draggable' },
            { key: 'resizable', type: 'checkbox', label: 'Resizable' },
            { key: 'removable', type: 'checkbox', label: 'Removable' },
            { key: 'stylable', type: 'checkbox', label: 'Stylable' },
            { key: 'textEditable', type: 'checkbox', label: 'Text Editable' },
            { key: 'showComponentOutline', type: 'checkbox', label: 'Show Component Outline' }
        ])

        // Editor settings
        categories.set('Editor', [
            { key: 'undoLimit', type: 'number', label: 'Undo Limit', min: 10, max: 200 },
            { key: 'autoSave', type: 'checkbox', label: 'Auto Save' },
            { key: 'autoSaveInterval', type: 'number', label: 'Auto Save Interval (ms)', min: 5000, max: 300000 },
            { key: 'theme', type: 'select', label: 'Theme', options: ['light', 'dark', 'auto'] },
            { key: 'language', type: 'select', label: 'Language', options: ['en', 'vi', 'es', 'fr', 'de'] },
            { key: 'defaultDevice', type: 'select', label: 'Default Device', options: ['desktop', 'tablet', 'mobile'] }
        ])

        // Features settings
        categories.set('Features', [
            { key: 'enableKeyboardShortcuts', type: 'checkbox', label: 'Enable Keyboard Shortcuts' },
            { key: 'enableTooltips', type: 'checkbox', label: 'Enable Tooltips' },
            { key: 'enableAutoComplete', type: 'checkbox', label: 'Enable Auto Complete' },
            { key: 'enableSyntaxHighlighting', type: 'checkbox', label: 'Enable Syntax Highlighting' },
            { key: 'enableLivePreview', type: 'checkbox', label: 'Enable Live Preview' },
            { key: 'enableResponsiveMode', type: 'checkbox', label: 'Enable Responsive Mode' }
        ])

        return categories
    }

    renderSettingsCategory(category, settings) {
        const categoryEl = document.createElement('div')
        categoryEl.className = 'settings-category'

        const titleEl = document.createElement('div')
        titleEl.className = 'settings-category-title'
        titleEl.innerHTML = `
            <i class="fas fa-${this.getCategoryIcon(category)}"></i>
            <span>${category}</span>
        `
        categoryEl.appendChild(titleEl)

        const settingsEl = document.createElement('div')
        settingsEl.className = 'settings-list'

        settings.forEach(setting => {
            const settingEl = this.renderSetting(setting)
            settingsEl.appendChild(settingEl)
        })

        categoryEl.appendChild(settingsEl)
        return categoryEl
    }

    renderSetting(setting) {
        const settingEl = document.createElement('div')
        settingEl.className = 'setting-item'
        settingEl.dataset.settingKey = setting.key

        const value = this.settings.get(setting.key)

        settingEl.innerHTML = `
            <div class="setting-label">
                <label for="setting-${setting.key}">${setting.label}</label>
            </div>
            <div class="setting-field">
                ${this.renderSettingField(setting, value)}
            </div>
        `

        // Setup field events
        this.setupSettingFieldEvents(settingEl, setting)

        return settingEl
    }

    renderSettingField(setting, value) {
        const { key, type, placeholder, min, max, options } = setting

        switch (type) {
            case 'text':
                return `
                    <input type="text" id="setting-${key}" value="${value || ''}" 
                           placeholder="${placeholder || ''}" class="setting-input">
                `

            case 'number':
                return `
                    <input type="number" id="setting-${key}" value="${value || ''}" 
                           class="setting-input"
                           ${min !== undefined ? `min="${min}"` : ''}
                           ${max !== undefined ? `max="${max}"` : ''}>
                `

            case 'checkbox':
                const checked = value ? 'checked' : ''
                return `
                    <label class="setting-checkbox-wrapper">
                        <input type="checkbox" id="setting-${key}" ${checked} class="setting-checkbox">
                        <span class="setting-checkbox-label"></span>
                    </label>
                `

            case 'select':
                const selectOptions = options.map(option => {
                    const selected = option === value ? 'selected' : ''
                    return `<option value="${option}" ${selected}>${option}</option>`
                }).join('')

                return `
                    <select id="setting-${key}" class="setting-select">
                        ${selectOptions}
                    </select>
                `

            case 'range':
                return `
                    <div class="setting-range-wrapper">
                        <input type="range" id="setting-${key}" value="${value || ''}" 
                               ${min !== undefined ? `min="${min}"` : ''}
                               ${max !== undefined ? `max="${max}"` : ''}
                               class="setting-range">
                        <span class="setting-range-value">${value || ''}</span>
                    </div>
                `

            case 'color':
                return `
                    <div class="setting-color-wrapper">
                        <input type="color" id="setting-${key}" value="${value || '#000000'}" 
                               class="setting-color-input">
                        <input type="text" id="setting-${key}-text" value="${value || ''}" 
                               placeholder="${placeholder || ''}" class="setting-input setting-color-text">
                    </div>
                `

            default:
                return `
                    <input type="text" id="setting-${key}" value="${value || ''}" 
                           placeholder="${placeholder || ''}" class="setting-input">
                `
        }
    }

    setupSettingFieldEvents(settingEl, setting) {
        const { key, type } = setting

        // Text inputs
        const textInput = settingEl.querySelector(`#setting-${key}`)
        if (textInput && (type === 'text' || type === 'number')) {
            textInput.addEventListener('input', (e) => {
                this.updateSetting(key, e.target.value)
            })

            textInput.addEventListener('change', (e) => {
                this.updateSetting(key, e.target.value)
            })
        }

        // Checkbox inputs
        const checkboxInput = settingEl.querySelector(`#setting-${key}`)
        if (checkboxInput && type === 'checkbox') {
            checkboxInput.addEventListener('change', (e) => {
                this.updateSetting(key, e.target.checked)
            })
        }

        // Select inputs
        const selectInput = settingEl.querySelector(`#setting-${key}`)
        if (selectInput && type === 'select') {
            selectInput.addEventListener('change', (e) => {
                this.updateSetting(key, e.target.value)
            })
        }

        // Range inputs
        const rangeInput = settingEl.querySelector(`#setting-${key}`)
        const rangeValue = settingEl.querySelector('.setting-range-value')
        if (rangeInput && type === 'range') {
            rangeInput.addEventListener('input', (e) => {
                this.updateSetting(key, e.target.value)
                if (rangeValue) rangeValue.textContent = e.target.value
            })
        }

        // Color inputs
        if (type === 'color') {
            const colorInput = settingEl.querySelector(`#setting-${key}`)
            const textInput = settingEl.querySelector(`#setting-${key}-text`)

            if (colorInput) {
                colorInput.addEventListener('input', (e) => {
                    this.updateSetting(key, e.target.value)
                    if (textInput) textInput.value = e.target.value
                })
            }

            if (textInput) {
                textInput.addEventListener('input', (e) => {
                    this.updateSetting(key, e.target.value)
                    if (colorInput && this.isValidColor(e.target.value)) {
                        colorInput.value = e.target.value
                    }
                })
            }
        }
    }

    updateSetting(key, value) {
        this.settings.set(key, value)
        this.applySetting(key, value)
        this.saveSettingsToStorage()
        console.log('⚙️ Setting updated:', key, value)
    }

    applySetting(key, value) {
        if (!this.editor) return

        switch (key) {
            case 'canvasWidth':
            case 'canvasHeight':
                // Update canvas dimensions
                const canvas = this.editor.Canvas
                if (canvas) {
                    canvas.set('width', this.settings.get('canvasWidth'))
                    canvas.set('height', this.settings.get('canvasHeight'))
                }
                break

            case 'gridSize':
                // Update grid size
                this.editor.set('gridSize', parseInt(value))
                break

            case 'snapToGrid':
                // Update snap to grid
                this.editor.set('snapToGrid', value)
                break

            case 'showOffsets':
                // Update show offsets
                this.editor.set('showOffsets', value)
                break

            case 'highlightable':
            case 'selectable':
            case 'editable':
            case 'draggable':
            case 'resizable':
            case 'removable':
            case 'stylable':
            case 'textEditable':
                // Update component settings
                this.editor.set(key, value)
                break

            case 'undoLimit':
                // Update undo limit
                this.editor.set('undoLimit', parseInt(value))
                break

            case 'theme':
                // Update theme
                document.documentElement.setAttribute('data-theme', value)
                break

            case 'language':
                // Update language
                this.editor.set('language', value)
                break

            case 'defaultDevice':
                // Update default device
                this.editor.set('defaultDevice', value)
                break
        }
    }

    getCategoryIcon(category) {
        const iconMap = {
            'Canvas': 'border-all',
            'Components': 'cube',
            'Editor': 'edit',
            'Features': 'star'
        }

        return iconMap[category] || 'cog'
    }

    isValidColor(color) {
        const s = new Option().style
        s.color = color
        return s.color !== ''
    }

    // Settings persistence
    saveSettingsToStorage() {
        try {
            const settingsObject = Object.fromEntries(this.settings)
            localStorage.setItem('pagemade-settings', JSON.stringify(settingsObject))
        } catch (error) {
            console.error('⚙️ Failed to save settings:', error)
        }
    }

    loadSettingsFromStorage() {
        try {
            const saved = localStorage.getItem('pagemade-settings')
            if (saved) {
                const settingsObject = JSON.parse(saved)
                Object.entries(settingsObject).forEach(([key, value]) => {
                    this.settings.set(key, value)
                })
                console.log('⚙️ Settings loaded from storage')
            }
        } catch (error) {
            console.error('⚙️ Failed to load settings:', error)
        }
    }

    exportSettings() {
        try {
            const settingsObject = Object.fromEntries(this.settings)
            const dataStr = JSON.stringify(settingsObject, null, 2)
            const dataBlob = new Blob([dataStr], { type: 'application/json' })
            
            const link = document.createElement('a')
            link.href = URL.createObjectURL(dataBlob)
            link.download = 'pagemade-settings.json'
            link.click()
            
            console.log('⚙️ Settings exported')
        } catch (error) {
            console.error('⚙️ Failed to export settings:', error)
        }
    }

    importSettings() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0]
            if (!file) return

            const reader = new FileReader()
            reader.onload = (event) => {
                try {
                    const settingsObject = JSON.parse(event.target.result)
                    Object.entries(settingsObject).forEach(([key, value]) => {
                        this.settings.set(key, value)
                        this.applySetting(key, value)
                    })
                    this.renderSettings()
                    this.saveSettingsToStorage()
                    console.log('⚙️ Settings imported')
                } catch (error) {
                    console.error('⚙️ Failed to import settings:', error)
                }
            }
            reader.readAsText(file)
        })
        
        input.click()
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            this.settings.clear()
            this.loadDefaultSettings()
            this.renderSettings()
            
            // Apply all settings
            this.settings.forEach((value, key) => {
                this.applySetting(key, value)
            })
            
            this.saveSettingsToStorage()
            console.log('⚙️ Settings reset to defaults')
        }
    }

    // Public API methods
    getSetting(key) {
        return this.settings.get(key)
    }

    setSetting(key, value) {
        this.updateSetting(key, value)
    }

    getAllSettings() {
        return Object.fromEntries(this.settings)
    }

    refresh() {
        this.renderSettings()
    }

    // State management
    getState() {
        return {
            settings: Object.fromEntries(this.settings),
            settingCount: this.settings.size,
            isInitialized: this.isInitialized
        }
    }

    // Debug methods
    debug() {
        return {
            state: this.getState(),
            panel: this.panel,
            editorConfig: this.editor ? this.editor.getConfig() : null
        }
    }

    // Cleanup
    destroy() {
        if (this.panel) {
            // Clear panel content
            const content = this.panel.querySelectorAll('.settings-header, .settings-content')
            content.forEach(el => el.remove())
        }

        this.settings.clear()
        this.isInitialized = false
        console.log('⚙️ SettingsPanel component destroyed')
    }
}

export default SettingsPanel