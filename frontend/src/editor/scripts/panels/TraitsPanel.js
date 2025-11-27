/**
 * Traits Panel Component
 * Manages the traits panel for component properties and attributes
 */

export class TraitsPanel {
    constructor() {
        this.editor = null
        this.panel = null
        this.selectedComponent = null
        this.traits = []
        this.isInitialized = false
        
        console.log('⚙️ TraitsPanel component created')
    }

    setEditor(editor) {
        this.editor = editor
        this.setupEditorTraits()
        console.log('⚙️ TraitsPanel editor instance set')
    }

    init() {
        this.initializeElements()
        this.setupEventListeners()
        this.isInitialized = true
        console.log('⚙️ TraitsPanel initialized')
    }

    initializeElements() {
        this.panel = document.getElementById('traits-panel')
        
        if (!this.panel) {
            console.warn('Traits panel not found')
            return
        }

        // Create panel header
        this.createPanelHeader()
        
        console.log('⚙️ TraitsPanel elements initialized')
    }

    createPanelHeader() {
        const headerEl = document.createElement('div')
        headerEl.className = 'traits-header'
        headerEl.innerHTML = `
            <div class="traits-title">
                <i class="fas fa-sliders-h"></i>
                <span>Properties</span>
            </div>
            <div class="traits-actions">
                <button class="btn btn-sm btn-secondary" id="reset-traits-btn" title="Reset to defaults">
                    <i class="fas fa-undo"></i>
                </button>
            </div>
        `

        this.panel.insertBefore(headerEl, this.panel.firstChild)

        // Setup reset button
        const resetBtn = headerEl.querySelector('#reset-traits-btn')
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetTraits()
            })
        }
    }

    setupEventListeners() {
        if (this.editor) {
            this.editor.on('component:selected', (component) => {
                this.onComponentSelected(component)
            })

            this.editor.on('component:deselected', () => {
                this.onComponentDeselected()
            })

            this.editor.on('component:update', () => {
                this.refreshTraits()
            })
        }

        console.log('⚙️ TraitsPanel event listeners setup complete')
    }

    setupEditorTraits() {
        if (!this.editor) return

        // Listen to trait manager events
        if (this.editor.TraitManager) {
            this.editor.TraitManager.on('trait:update', () => {
                this.refreshTraits()
            })
        }

        console.log('⚙️ Editor traits setup complete')
    }

    onComponentSelected(component) {
        this.selectedComponent = component
        this.renderTraits()
        console.log('⚙️ Component selected:', component.getName() || component.getType())
    }

    onComponentDeselected() {
        this.selectedComponent = null
        this.renderEmptyState()
        console.log('⚙️ Component deselected')
    }

    refreshTraits() {
        if (this.selectedComponent) {
            this.renderTraits()
        }
    }

    renderTraits() {
        if (!this.panel) return

        // Clear existing content (except header)
        const existingContent = this.panel.querySelectorAll('.traits-content, .empty-state')
        existingContent.forEach(el => el.remove())

        if (!this.selectedComponent) {
            this.renderEmptyState()
            return
        }

        // Create traits content
        const contentEl = document.createElement('div')
        contentEl.className = 'traits-content'

        // Get component traits
        const traits = this.selectedComponent.getTraits()
        
        if (traits.length === 0) {
            this.renderNoTraits(contentEl)
        } else {
            traits.forEach(trait => {
                const traitEl = this.renderTrait(trait)
                contentEl.appendChild(traitEl)
            })
        }

        this.panel.appendChild(contentEl)
    }

    renderEmptyState() {
        if (!this.panel) return

        // Clear existing content
        const existingContent = this.panel.querySelectorAll('.traits-content, .empty-state')
        existingContent.forEach(el => el.remove())

        const emptyEl = document.createElement('div')
        emptyEl.className = 'empty-state'
        emptyEl.innerHTML = `
            <i class="fas fa-mouse-pointer"></i>
            <p>Select a component to edit its properties</p>
        `

        this.panel.appendChild(emptyEl)
    }

    renderNoTraits(contentEl) {
        const noTraitsEl = document.createElement('div')
        noTraitsEl.className = 'no-traits'
        noTraitsEl.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <p>This component has no editable properties</p>
        `

        contentEl.appendChild(noTraitsEl)
    }

    renderTrait(trait) {
        const traitEl = document.createElement('div')
        traitEl.className = 'trait-item'
        traitEl.dataset.traitId = trait.getId()

        const type = trait.getType()
        const name = trait.getName()
        const value = trait.getValue()
        const label = trait.get('label') || this.formatLabel(name)

        traitEl.innerHTML = `
            <div class="trait-label">
                <label for="trait-${trait.getId()}">${label}</label>
                ${trait.get('tooltip') ? `<i class="fas fa-question-circle trait-tooltip" title="${trait.get('tooltip')}"></i>` : ''}
            </div>
            <div class="trait-field">
                ${this.renderTraitField(trait, type, value)}
            </div>
        `

        // Setup field events
        this.setupTraitFieldEvents(traitEl, trait)

        return traitEl
    }

    renderTraitField(trait, type, value) {
        const traitId = trait.getId()
        const placeholder = trait.get('placeholder') || ''
        const options = trait.get('options') || []
        const min = trait.get('min')
        const max = trait.get('max')
        const step = trait.get('step')

        switch (type) {
            case 'text':
            case 'email':
            case 'url':
            case 'tel':
                return `
                    <input type="${type}" id="trait-${traitId}" value="${value || ''}" 
                           placeholder="${placeholder}" class="trait-input">
                `

            case 'number':
                return `
                    <input type="number" id="trait-${traitId}" value="${value || ''}" 
                           placeholder="${placeholder}" class="trait-input"
                           ${min !== undefined ? `min="${min}"` : ''}
                           ${max !== undefined ? `max="${max}"` : ''}
                           ${step !== undefined ? `step="${step}"` : ''}>
                `

            case 'color':
                return `
                    <div class="trait-color-wrapper">
                        <input type="color" id="trait-${traitId}" value="${value || '#000000'}" 
                               class="trait-color-input">
                        <input type="text" id="trait-${traitId}-text" value="${value || ''}" 
                               placeholder="${placeholder}" class="trait-input trait-color-text">
                    </div>
                `

            case 'select':
                const selectOptions = options.map(option => {
                    const optionValue = typeof option === 'string' ? option : option.value
                    const optionLabel = typeof option === 'string' ? option : option.label
                    const selected = optionValue === value ? 'selected' : ''
                    return `<option value="${optionValue}" ${selected}>${optionLabel}</option>`
                }).join('')

                return `
                    <select id="trait-${traitId}" class="trait-select">
                        <option value="">Select...</option>
                        ${selectOptions}
                    </select>
                `

            case 'checkbox':
                const checked = value ? 'checked' : ''
                return `
                    <label class="trait-checkbox-wrapper">
                        <input type="checkbox" id="trait-${traitId}" ${checked} class="trait-checkbox">
                        <span class="trait-checkbox-label">${trait.get('checkboxLabel') || 'Enable'}</span>
                    </label>
                `

            case 'radio':
                const radioOptions = options.map(option => {
                    const optionValue = typeof option === 'string' ? option : option.value
                    const optionLabel = typeof option === 'string' ? option : option.label
                    const checked = optionValue === value ? 'checked' : ''
                    return `
                        <label class="trait-radio-wrapper">
                            <input type="radio" name="trait-${traitId}" value="${optionValue}" ${checked} class="trait-radio">
                            <span>${optionLabel}</span>
                        </label>
                    `
                }).join('')

                return `
                    <div class="trait-radio-group">
                        ${radioOptions}
                    </div>
                `

            case 'textarea':
                return `
                    <textarea id="trait-${traitId}" placeholder="${placeholder}" 
                              class="trait-textarea" rows="4">${value || ''}</textarea>
                `

            case 'range':
                return `
                    <div class="trait-range-wrapper">
                        <input type="range" id="trait-${traitId}" value="${value || ''}" 
                               ${min !== undefined ? `min="${min}"` : ''}
                               ${max !== undefined ? `max="${max}"` : ''}
                               ${step !== undefined ? `step="${step}"` : ''}
                               class="trait-range">
                        <span class="trait-range-value">${value || ''}</span>
                    </div>
                `

            case 'file':
                return `
                    <div class="trait-file-wrapper">
                        <input type="file" id="trait-${traitId}" class="trait-file" accept="${trait.get('accept') || '*'}">
                        <button type="button" class="btn btn-secondary btn-sm trait-file-btn">
                            <i class="fas fa-upload"></i>
                            Choose File
                        </button>
                    </div>
                `

            case 'button':
                return `
                    <button type="button" id="trait-${traitId}" class="btn btn-primary trait-button">
                        ${trait.get('buttonText') || 'Click'}
                    </button>
                `

            default:
                return `
                    <input type="text" id="trait-${traitId}" value="${value || ''}" 
                           placeholder="${placeholder}" class="trait-input">
                `
        }
    }

    setupTraitFieldEvents(traitEl, trait) {
        const traitId = trait.getId()
        const type = trait.getType()

        // Text inputs
        const textInput = traitEl.querySelector(`#trait-${traitId}`)
        if (textInput && (type === 'text' || type === 'email' || type === 'url' || type === 'tel' || type === 'number' || type === 'textarea')) {
            textInput.addEventListener('input', (e) => {
                this.updateTraitValue(trait, e.target.value)
            })

            textInput.addEventListener('change', (e) => {
                this.updateTraitValue(trait, e.target.value)
            })
        }

        // Color inputs
        if (type === 'color') {
            const colorInput = traitEl.querySelector(`#trait-${traitId}`)
            const textInput = traitEl.querySelector(`#trait-${traitId}-text`)

            if (colorInput) {
                colorInput.addEventListener('input', (e) => {
                    this.updateTraitValue(trait, e.target.value)
                    if (textInput) textInput.value = e.target.value
                })
            }

            if (textInput) {
                textInput.addEventListener('input', (e) => {
                    this.updateTraitValue(trait, e.target.value)
                    if (colorInput && this.isValidColor(e.target.value)) {
                        colorInput.value = e.target.value
                    }
                })
            }
        }

        // Select inputs
        const selectInput = traitEl.querySelector(`#trait-${traitId}`)
        if (selectInput && type === 'select') {
            selectInput.addEventListener('change', (e) => {
                this.updateTraitValue(trait, e.target.value)
            })
        }

        // Checkbox inputs
        const checkboxInput = traitEl.querySelector(`#trait-${traitId}`)
        if (checkboxInput && type === 'checkbox') {
            checkboxInput.addEventListener('change', (e) => {
                this.updateTraitValue(trait, e.target.checked)
            })
        }

        // Radio inputs
        const radioInputs = traitEl.querySelectorAll(`input[name="trait-${traitId}"]`)
        if (radioInputs.length > 0 && type === 'radio') {
            radioInputs.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.updateTraitValue(trait, e.target.value)
                    }
                })
            })
        }

        // Range inputs
        const rangeInput = traitEl.querySelector(`#trait-${traitId}`)
        const rangeValue = traitEl.querySelector('.trait-range-value')
        if (rangeInput && type === 'range') {
            rangeInput.addEventListener('input', (e) => {
                this.updateTraitValue(trait, e.target.value)
                if (rangeValue) rangeValue.textContent = e.target.value
            })
        }

        // File inputs
        if (type === 'file') {
            const fileInput = traitEl.querySelector(`#trait-${traitId}`)
            const fileBtn = traitEl.querySelector('.trait-file-btn')

            if (fileBtn) {
                fileBtn.addEventListener('click', () => {
                    fileInput.click()
                })
            }

            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    this.handleFileUpload(trait, e.target.files[0])
                })
            }
        }

        // Button inputs
        const buttonInput = traitEl.querySelector(`#trait-${traitId}`)
        if (buttonInput && type === 'button') {
            buttonInput.addEventListener('click', () => {
                this.handleButtonClick(trait)
            })
        }
    }

    updateTraitValue(trait, value) {
        if (!this.selectedComponent) return

        try {
            trait.setValue(value)
            console.log('⚙️ Trait updated:', trait.getName(), value)
        } catch (error) {
            console.error('⚙️ Failed to update trait:', error)
        }
    }

    handleFileUpload(trait, file) {
        if (!file) return

        // For now, just set the filename as value
        // In a real implementation, you'd upload the file and set the URL
        this.updateTraitValue(trait, file.name)
        console.log('⚙️ File uploaded:', file.name)
    }

    handleButtonClick(trait) {
        const action = trait.get('action')
        if (action && typeof action === 'function') {
            action(this.selectedComponent, trait)
        }
        console.log('⚙️ Button clicked:', trait.getName())
    }

    resetTraits() {
        if (!this.selectedComponent) return

        const traits = this.selectedComponent.getTraits()
        traits.forEach(trait => {
            const defaultValue = trait.get('default')
            if (defaultValue !== undefined) {
                trait.setValue(defaultValue)
            }
        })

        this.refreshTraits()
        console.log('⚙️ Traits reset to defaults')
    }

    formatLabel(name) {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim()
    }

    isValidColor(color) {
        const s = new Option().style
        s.color = color
        return s.color !== ''
    }

    // Public API methods
    getSelectedComponent() {
        return this.selectedComponent
    }

    getTraits() {
        return this.selectedComponent ? this.selectedComponent.getTraits() : []
    }

    refresh() {
        this.refreshTraits()
    }

    // State management
    getState() {
        return {
            selectedComponent: this.selectedComponent ? {
                id: this.selectedComponent.getId(),
                name: this.selectedComponent.getName(),
                type: this.selectedComponent.getType()
            } : null,
            traits: this.getTraits().map(trait => ({
                id: trait.getId(),
                name: trait.getName(),
                type: trait.getType(),
                value: trait.getValue()
            })),
            isInitialized: this.isInitialized
        }
    }

    // Debug methods
    debug() {
        return {
            state: this.getState(),
            panel: this.panel,
            editorTraitsManager: this.editor ? this.editor.TraitManager : null
        }
    }

    // Cleanup
    destroy() {
        if (this.panel) {
            // Clear panel content
            const content = this.panel.querySelectorAll('.traits-header, .traits-content, .empty-state')
            content.forEach(el => el.remove())
        }

        this.selectedComponent = null
        this.traits = []
        this.isInitialized = false
        console.log('⚙️ TraitsPanel component destroyed')
    }
}

export default TraitsPanel