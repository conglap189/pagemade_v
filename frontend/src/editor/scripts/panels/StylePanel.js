/**
 * Style Panel Component
 * Manages styles panel with CSS properties editor
 */

export class StylePanel {
    constructor() {
        this.editor = null
        this.panel = null
        this.selectedComponent = null
        this.styleManager = null
        this.sectors = []
        this.isInitialized = false
        
        console.log('🎨 StylePanel component created')
    }

    setEditor(editor) {
        this.editor = editor
        this.styleManager = editor.StyleManager
        this.setupEditorStyles()
        console.log('🎨 StylePanel editor instance set')
    }

    init() {
        this.initializeElements()
        this.setupEventListeners()
        this.createStyleSectors()
        this.isInitialized = true
        console.log('🎨 StylePanel initialized')
    }

    initializeElements() {
        this.panel = document.getElementById('styles-panel')
        
        if (!this.panel) {
            console.warn('Styles panel not found')
            return
        }

        console.log('🎨 StylePanel elements initialized')
    }

    setupEventListeners() {
        if (!this.editor) return

        // Listen to component selection
        this.editor.on('component:selected', (component) => {
            this.handleComponentSelect(component)
        })

        this.editor.on('component:deselected', () => {
            this.handleComponentDeselect()
        })

        this.editor.on('component:update', (component) => {
            this.handleComponentUpdate(component)
        })

        // Listen to style changes
        this.editor.on('style:update', (css) => {
            this.handleStyleUpdate(css)
        })

        console.log('🎨 StylePanel event listeners setup complete')
    }

    setupEditorStyles() {
        if (!this.styleManager) return

        // Configure style manager sectors
        this.styleManager.addSectors(this.getSectorConfig())

        console.log('🎨 Editor style manager configured')
    }

    createStyleSectors() {
        if (!this.panel) return

        this.panel.innerHTML = `
            <div class="style-panel-header">
                <h3>Style Properties</h3>
                <div class="style-actions">
                    <button class="btn btn-icon btn-sm" id="reset-styles" title="Reset Styles">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="btn btn-icon btn-sm" id="copy-styles" title="Copy Styles">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="style-panel-content" id="style-properties">
                <div class="no-selection">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>Select an element to edit styles</p>
                </div>
            </div>
        `

        this.setupStyleActions()
    }

    setupStyleActions() {
        const resetBtn = document.getElementById('reset-styles')
        const copyBtn = document.getElementById('copy-styles')

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetStyles()
            })
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyStyles()
            })
        }
    }

    getSectorConfig() {
        return [
            {
                name: 'Layout',
                open: false,
                buildProps: ['display', 'flex-direction', 'justify-content', 'align-items', 'align-content', 'flex-wrap', 'gap', 'float', 'clear', 'overflow', 'overflow-x', 'overflow-y', 'position', 'top', 'right', 'bottom', 'left', 'z-index'],
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
                        property: 'position',
                        default: 'static',
                        options: [
                            { value: 'static', name: 'Static' },
                            { value: 'relative', name: 'Relative' },
                            { value: 'absolute', name: 'Absolute' },
                            { value: 'fixed', name: 'Fixed' },
                            { value: 'sticky', name: 'Sticky' },
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
                buildProps: ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'color', 'text-align', 'text-decoration', 'text-transform', 'text-shadow'],
                properties: [
                    {
                        property: 'font-family',
                        type: 'select',
                        default: 'sans-serif',
                        options: [
                            { value: 'sans-serif', name: 'Sans Serif' },
                            { value: 'serif', name: 'Serif' },
                            { value: 'monospace', name: 'Monospace' },
                            { value: 'cursive', name: 'Cursive' },
                            { value: 'fantasy', name: 'Fantasy' },
                        ]
                    },
                    {
                        property: 'font-size',
                        type: 'integer',
                        units: ['px', 'em', 'rem', '%', 'vw'],
                        default: 16,
                        min: 8,
                        max: 200
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
                    },
                    {
                        property: 'color',
                        type: 'color'
                    },
                    {
                        property: 'text-align',
                        type: 'radio',
                        default: 'left',
                        options: [
                            { value: 'left', name: 'Left', className: 'fa fa-align-left' },
                            { value: 'center', name: 'Center', className: 'fa fa-align-center' },
                            { value: 'right', name: 'Right', className: 'fa fa-align-right' },
                            { value: 'justify', name: 'Justify', className: 'fa fa-align-justify' },
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
                name: 'Size',
                open: false,
                buildProps: ['width', 'height', 'max-width', 'min-width', 'max-height', 'min-height'],
                properties: [
                    {
                        property: 'width',
                        type: 'integer',
                        units: ['px', '%', 'vw', 'em', 'rem', 'auto'],
                        default: 'auto'
                    },
                    {
                        property: 'height',
                        type: 'integer',
                        units: ['px', '%', 'vh', 'em', 'rem', 'auto'],
                        default: 'auto'
                    },
                    {
                        property: 'max-width',
                        type: 'integer',
                        units: ['px', '%', 'vw', 'em', 'rem', 'none'],
                        default: 'none'
                    },
                    {
                        property: 'min-height',
                        type: 'integer',
                        units: ['px', '%', 'vh', 'em', 'rem'],
                        default: 'auto'
                    }
                ]
            },
            {
                name: 'Appearance',
                open: false,
                buildProps: ['background-color', 'background-image', 'background-size', 'background-position', 'background-repeat', 'border', 'border-radius', 'box-shadow', 'opacity', 'transform'],
                properties: [
                    {
                        property: 'background-color',
                        type: 'color'
                    },
                    {
                        property: 'background-image',
                        type: 'file',
                        full: true
                    },
                    {
                        property: 'border-radius',
                        type: 'integer',
                        units: ['px', '%'],
                        default: 0,
                        min: 0
                    },
                    {
                        property: 'border',
                        type: 'composite',
                        properties: [
                            { property: 'border-width', type: 'integer', units: ['px'], default: 0 },
                            { property: 'border-style', type: 'select', default: 'solid', options: [
                                { value: 'none', name: 'None' },
                                { value: 'solid', name: 'Solid' },
                                { value: 'dashed', name: 'Dashed' },
                                { value: 'dotted', name: 'Dotted' },
                                { value: 'double', name: 'Double' },
                            ]},
                            { property: 'border-color', type: 'color' }
                        ]
                    },
                    {
                        property: 'box-shadow',
                        type: 'composite',
                        properties: [
                            { property: 'box-shadow-x', type: 'integer', units: ['px'], default: 0 },
                            { property: 'box-shadow-y', type: 'integer', units: ['px'], default: 0 },
                            { property: 'box-shadow-blur', type: 'integer', units: ['px'], default: 0 },
                            { property: 'box-shadow-spread', type: 'integer', units: ['px'], default: 0 },
                            { property: 'box-shadow-color', type: 'color' }
                        ]
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
            },
            {
                name: 'Effects',
                open: false,
                buildProps: ['transform', 'transition', 'animation', 'filter'],
                properties: [
                    {
                        property: 'transform',
                        type: 'composite',
                        properties: [
                            { property: 'transform-rotate', type: 'integer', units: ['deg'], default: 0 },
                            { property: 'transform-scale', type: 'integer', units: [''], default: 1, min: 0.1, max: 3, step: 0.1 },
                            { property: 'transform-translate-x', type: 'integer', units: ['px'], default: 0 },
                            { property: 'transform-translate-y', type: 'integer', units: ['px'], default: 0 }
                        ]
                    },
                    {
                        property: 'filter',
                        type: 'composite',
                        properties: [
                            { property: 'filter-blur', type: 'integer', units: ['px'], default: 0 },
                            { property: 'filter-brightness', type: 'integer', units: ['%'], default: 100 },
                            { property: 'filter-contrast', type: 'integer', units: ['%'], default: 100 },
                            { property: 'filter-grayscale', type: 'integer', units: ['%'], default: 0 },
                            { property: 'filter-sepia', type: 'integer', units: ['%'], default: 0 }
                        ]
                    }
                ]
            }
        ]
    }

    handleComponentSelect(component) {
        this.selectedComponent = component
        this.renderStyleProperties(component)
        
        console.log('🎨 Component selected for styling:', component.getName())
    }

    handleComponentDeselect() {
        this.selectedComponent = null
        this.renderNoSelection()
        
        console.log('🎨 Component deselected')
    }

    handleComponentUpdate(component) {
        if (this.selectedComponent === component) {
            this.renderStyleProperties(component)
        }
    }

    handleStyleUpdate(css) {
        console.log('🎨 Style updated:', css)
    }

    renderStyleProperties(component) {
        const propertiesContainer = document.getElementById('style-properties')
        if (!propertiesContainer) return

        propertiesContainer.innerHTML = `
            <div class="component-info">
                <h4>${component.getName() || 'Element'}</h4>
                <span class="component-tag">${component.getType()}</span>
            </div>
            <div class="style-sectors" id="style-sectors">
                <!-- Style sectors will be rendered here -->
            </div>
        `

        this.renderStyleSectors(component)
    }

    renderStyleSectors(component) {
        const sectorsContainer = document.getElementById('style-sectors')
        if (!sectorsContainer) return

        const sectors = this.getSectorConfig()
        
        sectors.forEach(sector => {
            const sectorEl = this.renderSector(sector, component)
            sectorsContainer.appendChild(sectorEl)
        })
    }

    renderSector(sector, component) {
        const sectorEl = document.createElement('div')
        sectorEl.className = 'style-sector'
        
        if (!sector.open) {
            sectorEl.classList.add('collapsed')
        }

        const headerEl = document.createElement('div')
        headerEl.className = 'style-sector-header'
        headerEl.innerHTML = `
            <h4>${sector.name}</h4>
            <i class="fas fa-chevron-down"></i>
        `

        const contentEl = document.createElement('div')
        contentEl.className = 'style-sector-content'
        
        if (sector.open) {
            contentEl.style.display = 'block'
        }

        // Render properties
        sector.properties.forEach(property => {
            const propertyEl = this.renderProperty(property, component)
            contentEl.appendChild(propertyEl)
        })

        headerEl.addEventListener('click', () => {
            sectorEl.classList.toggle('collapsed')
            contentEl.style.display = contentEl.style.display === 'none' ? 'block' : 'none'
        })

        sectorEl.appendChild(headerEl)
        sectorEl.appendChild(contentEl)

        return sectorEl
    }

    renderProperty(property, component) {
        const propertyEl = document.createElement('div')
        propertyEl.className = 'style-property'

        const labelEl = document.createElement('label')
        labelEl.textContent = this.formatPropertyLabel(property.property)
        propertyEl.appendChild(labelEl)

        const inputEl = this.createPropertyInput(property, component)
        propertyEl.appendChild(inputEl)

        return propertyEl
    }

    createPropertyInput(property, component) {
        const currentValue = component.getStyle(property.property)
        
        switch (property.type) {
            case 'color':
                return this.createColorInput(property, currentValue)
            case 'select':
                return this.createSelectInput(property, currentValue)
            case 'integer':
                return this.createIntegerInput(property, currentValue)
            case 'slider':
                return this.createSliderInput(property, currentValue)
            case 'radio':
                return this.createRadioInput(property, currentValue)
            case 'file':
                return this.createFileInput(property, currentValue)
            case 'composite':
                return this.createCompositeInput(property, component)
            default:
                return this.createTextInput(property, currentValue)
        }
    }

    createColorInput(property, value) {
        const wrapper = document.createElement('div')
        wrapper.className = 'color-input-wrapper'
        
        const colorInput = document.createElement('input')
        colorInput.type = 'color'
        colorInput.value = value || '#000000'
        colorInput.addEventListener('change', (e) => {
            this.updateStyle(property.property, e.target.value)
        })

        const textInput = document.createElement('input')
        textInput.type = 'text'
        textInput.value = value || ''
        textInput.placeholder = '#000000'
        textInput.addEventListener('change', (e) => {
            this.updateStyle(property.property, e.target.value)
            colorInput.value = e.target.value
        })

        wrapper.appendChild(colorInput)
        wrapper.appendChild(textInput)
        
        return wrapper
    }

    createSelectInput(property, value) {
        const select = document.createElement('select')
        select.value = value || property.default || ''
        
        property.options.forEach(option => {
            const optionEl = document.createElement('option')
            optionEl.value = option.value
            optionEl.textContent = option.name
            select.appendChild(optionEl)
        })

        select.addEventListener('change', (e) => {
            this.updateStyle(property.property, e.target.value)
        })

        return select
    }

    createIntegerInput(property, value) {
        const wrapper = document.createElement('div')
        wrapper.className = 'integer-input-wrapper'
        
        const input = document.createElement('input')
        input.type = 'number'
        input.value = value || property.default || 0
        input.min = property.min || 0
        input.max = property.max || 9999
        input.step = property.step || 1
        
        if (property.units && property.units.length > 0) {
            const unitSelect = document.createElement('select')
            property.units.forEach(unit => {
                const option = document.createElement('option')
                option.value = unit
                option.textContent = unit
                unitSelect.appendChild(option)
            })
            
            // Extract current unit from value
            const currentUnit = this.extractUnit(value) || property.units[0]
            unitSelect.value = currentUnit
            
            wrapper.appendChild(input)
            wrapper.appendChild(unitSelect)
            
            input.addEventListener('change', () => {
                const unit = unitSelect.value
                this.updateStyle(property.property, input.value + unit)
            })
            
            unitSelect.addEventListener('change', () => {
                const unit = unitSelect.value
                this.updateStyle(property.property, input.value + unit)
            })
        } else {
            input.addEventListener('change', (e) => {
                this.updateStyle(property.property, e.target.value)
            })
            wrapper.appendChild(input)
        }

        return wrapper
    }

    createSliderInput(property, value) {
        const wrapper = document.createElement('div')
        wrapper.className = 'slider-input-wrapper'
        
        const slider = document.createElement('input')
        slider.type = 'range'
        slider.min = property.min || 0
        slider.max = property.max || 100
        slider.step = property.step || 1
        slider.value = value || property.default || 0
        
        const valueDisplay = document.createElement('span')
        valueDisplay.textContent = slider.value
        
        slider.addEventListener('input', (e) => {
            valueDisplay.textContent = e.target.value
            this.updateStyle(property.property, e.target.value)
        })

        wrapper.appendChild(slider)
        wrapper.appendChild(valueDisplay)
        
        return wrapper
    }

    createRadioInput(property, value) {
        const wrapper = document.createElement('div')
        wrapper.className = 'radio-input-wrapper'
        
        property.options.forEach(option => {
            const radioWrapper = document.createElement('div')
            radioWrapper.className = 'radio-option'
            
            const radio = document.createElement('input')
            radio.type = 'radio'
            radio.name = property.property
            radio.value = option.value
            radio.checked = value === option.value
            radio.id = `${property.property}-${option.value}`
            
            const label = document.createElement('label')
            label.htmlFor = radio.id
            
            if (option.className) {
                const icon = document.createElement('i')
                icon.className = option.className
                label.appendChild(icon)
            }
            
            label.appendChild(document.createTextNode(option.name))
            
            radio.addEventListener('change', (e) => {
                this.updateStyle(property.property, e.target.value)
            })
            
            radioWrapper.appendChild(radio)
            radioWrapper.appendChild(label)
            wrapper.appendChild(radioWrapper)
        })

        return wrapper
    }

    createTextInput(property, value) {
        const input = document.createElement('input')
        input.type = 'text'
        input.value = value || ''
        input.placeholder = property.default || ''
        
        input.addEventListener('change', (e) => {
            this.updateStyle(property.property, e.target.value)
        })

        return input
    }

    createFileInput(property, value) {
        const wrapper = document.createElement('div')
        wrapper.className = 'file-input-wrapper'
        
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        
        const preview = document.createElement('div')
        preview.className = 'file-preview'
        
        if (value) {
            preview.style.backgroundImage = `url(${value})`
            preview.classList.add('has-image')
        }
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    const url = e.target.result
                    preview.style.backgroundImage = `url(${url})`
                    preview.classList.add('has-image')
                    this.updateStyle(property.property, `url(${url})`)
                }
                reader.readAsDataURL(file)
            }
        })

        wrapper.appendChild(input)
        wrapper.appendChild(preview)
        
        return wrapper
    }

    createCompositeInput(property, component) {
        const wrapper = document.createElement('div')
        wrapper.className = 'composite-input-wrapper'
        
        property.properties.forEach(subProperty => {
            const subPropertyEl = this.createPropertyInput(subProperty, component)
            wrapper.appendChild(subPropertyEl)
        })

        return wrapper
    }

    renderNoSelection() {
        const propertiesContainer = document.getElementById('style-properties')
        if (!propertiesContainer) return

        propertiesContainer.innerHTML = `
            <div class="no-selection">
                <i class="fas fa-mouse-pointer"></i>
                <p>Select an element to edit styles</p>
            </div>
        `
    }

    updateStyle(property, value) {
        if (!this.selectedComponent) return

        this.selectedComponent.addStyle({ [property]: value })
        
        console.log('🎨 Style updated:', property, '=', value)
    }

    resetStyles() {
        if (!this.selectedComponent) return

        this.selectedComponent.setStyle({})
        this.renderStyleProperties(this.selectedComponent)
        
        console.log('🎨 Styles reset')
    }

    copyStyles() {
        if (!this.selectedComponent) return

        const styles = this.selectedComponent.getStyle()
        const cssText = this.selectedComponent.toCSS()
        
        navigator.clipboard.writeText(cssText).then(() => {
            console.log('🎨 Styles copied to clipboard')
        }).catch(err => {
            console.error('Failed to copy styles:', err)
        })
    }

    formatPropertyLabel(property) {
        return property
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
    }

    extractUnit(value) {
        if (typeof value !== 'string') return ''
        const match = value.match(/[a-zA-Z%]+$/)
        return match ? match[0] : ''
    }

    // Public API methods
    getSelectedComponent() {
        return this.selectedComponent
    }

    updateComponent(component) {
        if (this.selectedComponent === component) {
            this.renderStyleProperties(component)
        }
    }

    // State management
    getState() {
        return {
            selectedComponent: this.selectedComponent ? this.selectedComponent.getId() : null,
            componentName: this.selectedComponent ? this.selectedComponent.getName() : null,
            sectorCount: this.getSectorConfig().length,
            isInitialized: this.isInitialized
        }
    }

    // Debug methods
    debug() {
        return {
            state: this.getState(),
            panel: this.panel,
            styleManager: this.styleManager,
            selectedComponentStyles: this.selectedComponent ? this.selectedComponent.getStyle() : null
        }
    }

    // Cleanup
    destroy() {
        this.selectedComponent = null
        this.styleManager = null
        
        if (this.panel) {
            this.panel.innerHTML = ''
        }

        this.isInitialized = false
        console.log('🧹 StylePanel component destroyed')
    }
}

export default StylePanel