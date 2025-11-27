/**
 * Layer Panel Component
 * Manages the layers panel for hierarchical component navigation
 */

export class LayerPanel {
    constructor() {
        this.editor = null
        this.panel = null
        this.layers = []
        this.searchInput = null
        this.isInitialized = false
        
        console.log('📚 LayerPanel component created')
    }

    setEditor(editor) {
        this.editor = editor
        this.setupEditorLayers()
        console.log('📚 LayerPanel editor instance set')
    }

    init() {
        this.initializeElements()
        this.setupEventListeners()
        this.renderLayers()
        this.isInitialized = true
        console.log('📚 LayerPanel initialized')
    }

    initializeElements() {
        this.panel = document.getElementById('layers-panel')
        
        if (!this.panel) {
            console.warn('Layers panel not found')
            return
        }

        // Create search input
        this.createSearchInput()
        
        console.log('📚 LayerPanel elements initialized')
    }

    createSearchInput() {
        const searchContainer = document.createElement('div')
        searchContainer.className = 'layer-search'
        searchContainer.innerHTML = `
            <input type="text" placeholder="Search layers..." class="layer-search-input">
            <i class="fas fa-search layer-search-icon"></i>
        `

        this.panel.insertBefore(searchContainer, this.panel.firstChild)
        this.searchInput = searchContainer.querySelector('.layer-search-input')
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value)
            })
        }

        // Listen to component events from editor
        if (this.editor) {
            this.editor.on('component:add', () => {
                this.refreshLayers()
            })

            this.editor.on('component:remove', () => {
                this.refreshLayers()
            })

            this.editor.on('component:update', () => {
                this.refreshLayers()
            })

            this.editor.on('component:select', (component) => {
                this.highlightLayer(component)
            })
        }

        console.log('📚 LayerPanel event listeners setup complete')
    }

    setupEditorLayers() {
        if (!this.editor) return

        // Get initial layers from editor
        this.refreshLayers()

        console.log('📚 Editor layers setup complete')
    }

    refreshLayers() {
        if (!this.editor) return

        // Get all components from editor
        const components = this.editor.getComponents()
        this.layers = this.buildLayerHierarchy(components)

        // Re-render layers
        this.renderLayers()

        console.log('📚 Layers refreshed')
    }

    buildLayerHierarchy(components) {
        const layers = []
        
        components.forEach(component => {
            const layer = this.createComponentLayer(component)
            layers.push(layer)
        })

        return layers
    }

    createComponentLayer(component) {
        const layer = {
            id: component.getId(),
            name: component.getName() || component.getType(),
            type: component.getType(),
            component: component,
            children: [],
            visible: component.isVisible(),
            locked: component.isLocked(),
            selected: component.isSelected(),
            depth: this.getComponentDepth(component)
        }

        // Add children
        component.components().forEach(child => {
            const childLayer = this.createComponentLayer(child)
            layer.children.push(childLayer)
        })

        return layer
    }

    getComponentDepth(component) {
        let depth = 0
        let parent = component.parent()
        
        while (parent) {
            depth++
            parent = parent.parent()
        }
        
        return depth
    }

    renderLayers(searchTerm = '') {
        if (!this.panel) return

        // Clear existing content (except search)
        const existingContent = this.panel.querySelectorAll('.layer-tree, .no-results')
        existingContent.forEach(el => el.remove())

        const filteredLayers = this.getFilteredLayers(searchTerm)

        if (filteredLayers.length === 0) {
            this.renderNoResults(searchTerm)
            return
        }

        // Create layer tree
        const treeEl = document.createElement('div')
        treeEl.className = 'layer-tree'

        filteredLayers.forEach(layer => {
            const layerEl = this.renderLayer(layer)
            treeEl.appendChild(layerEl)
        })

        this.panel.appendChild(treeEl)
    }

    renderLayer(layer, depth = 0) {
        const layerEl = document.createElement('div')
        layerEl.className = 'layer-item'
        layerEl.dataset.layerId = layer.id
        layerEl.style.paddingLeft = `${depth * 20}px`

        layerEl.innerHTML = `
            <div class="layer-content">
                <div class="layer-controls">
                    <button class="layer-toggle ${layer.children.length > 0 ? 'has-children' : ''}" data-layer-id="${layer.id}">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <button class="layer-visibility ${layer.visible ? 'visible' : 'hidden'}" data-layer-id="${layer.id}">
                        <i class="fas fa-eye${layer.visible ? '' : '-slash'}"></i>
                    </button>
                    <button class="layer-lock ${layer.locked ? 'locked' : 'unlocked'}" data-layer-id="${layer.id}">
                        <i class="fas fa-${layer.locked ? 'lock' : 'lock-open'}"></i>
                    </button>
                </div>
                <div class="layer-info">
                    <i class="fas fa-${this.getLayerIcon(layer.type)}"></i>
                    <span class="layer-name">${layer.name}</span>
                    <span class="layer-type">${layer.type}</span>
                </div>
            </div>
        `

        // Add selected class
        if (layer.selected) {
            layerEl.classList.add('selected')
        }

        // Add children if expanded
        if (layer.children.length > 0) {
            const childrenEl = document.createElement('div')
            childrenEl.className = 'layer-children'
            childrenEl.style.display = 'none'

            layer.children.forEach(child => {
                const childEl = this.renderLayer(child, depth + 1)
                childrenEl.appendChild(childEl)
            })

            layerEl.appendChild(childrenEl)
        }

        // Setup event listeners
        this.setupLayerEventListeners(layerEl, layer)

        return layerEl
    }

    setupLayerEventListeners(layerEl, layer) {
        // Layer selection
        const layerContent = layerEl.querySelector('.layer-content')
        layerContent.addEventListener('click', (e) => {
            if (!e.target.closest('.layer-controls')) {
                this.selectLayer(layer)
            }
        })

        // Toggle children
        const toggleBtn = layerEl.querySelector('.layer-toggle')
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                this.toggleLayerChildren(layerEl)
            })
        }

        // Visibility toggle
        const visibilityBtn = layerEl.querySelector('.layer-visibility')
        if (visibilityBtn) {
            visibilityBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                this.toggleLayerVisibility(layer)
            })
        }

        // Lock toggle
        const lockBtn = layerEl.querySelector('.layer-lock')
        if (lockBtn) {
            lockBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                this.toggleLayerLock(layer)
            })
        }

        // Double click to rename
        const layerName = layerEl.querySelector('.layer-name')
        if (layerName) {
            layerName.addEventListener('dblclick', (e) => {
                e.stopPropagation()
                this.renameLayer(layer, layerName)
            })
        }
    }

    renderNoResults(searchTerm) {
        const noResultsEl = document.createElement('div')
        noResultsEl.className = 'no-results'
        noResultsEl.innerHTML = `
            <i class="fas fa-search"></i>
            <p>No layers found for "${searchTerm}"</p>
            <button class="btn btn-secondary btn-sm" onclick="this.closest('.layer-panel').querySelector('.layer-search-input').value = ''; this.closest('.layer-panel').querySelector('.layer-search-input').dispatchEvent(new Event('input'))">
                Clear search
            </button>
        `
        this.panel.appendChild(noResultsEl)
    }

    handleSearch(searchTerm) {
        this.renderLayers(searchTerm.toLowerCase())
    }

    selectLayer(layer) {
        if (!this.editor) return

        // Select component in editor
        this.editor.select(layer.component)

        // Update UI
        this.highlightLayer(layer.component)

        console.log('📚 Layer selected:', layer.name)
    }

    highlightLayer(component) {
        // Remove previous selections
        const layerItems = this.panel.querySelectorAll('.layer-item')
        layerItems.forEach(item => item.classList.remove('selected'))

        // Add selection to current layer
        const layerEl = this.panel.querySelector(`[data-layer-id="${component.getId()}"]`)
        if (layerEl) {
            layerEl.classList.add('selected')
            layerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
    }

    toggleLayerChildren(layerEl) {
        const childrenEl = layerEl.querySelector('.layer-children')
        const toggleBtn = layerEl.querySelector('.layer-toggle i')

        if (childrenEl) {
            const isExpanded = childrenEl.style.display !== 'none'
            childrenEl.style.display = isExpanded ? 'none' : 'block'
            toggleBtn.className = isExpanded ? 'fas fa-chevron-right' : 'fas fa-chevron-down'
        }
    }

    toggleLayerVisibility(layer) {
        if (!layer.component) return

        const isVisible = layer.component.isVisible()
        layer.component.setVisible(!isVisible)
        layer.visible = !isVisible

        // Update UI
        const layerEl = this.panel.querySelector(`[data-layer-id="${layer.id}"]`)
        if (layerEl) {
            const visibilityBtn = layerEl.querySelector('.layer-visibility')
            visibilityBtn.className = `layer-visibility ${layer.visible ? 'visible' : 'hidden'}`
            visibilityBtn.innerHTML = `<i class="fas fa-eye${layer.visible ? '' : '-slash'}"></i>`
        }

        console.log('📚 Layer visibility toggled:', layer.name, layer.visible)
    }

    toggleLayerLock(layer) {
        if (!layer.component) return

        const isLocked = layer.component.isLocked()
        layer.component.setLocked(!isLocked)
        layer.locked = !isLocked

        // Update UI
        const layerEl = this.panel.querySelector(`[data-layer-id="${layer.id}"]`)
        if (layerEl) {
            const lockBtn = layerEl.querySelector('.layer-lock')
            lockBtn.className = `layer-lock ${layer.locked ? 'locked' : 'unlocked'}`
            lockBtn.innerHTML = `<i class="fas fa-${layer.locked ? 'lock' : 'lock-open'}"></i>`
        }

        console.log('📚 Layer lock toggled:', layer.name, layer.locked)
    }

    renameLayer(layer, nameElement) {
        const currentName = layer.component.getName() || layer.type
        const input = document.createElement('input')
        input.type = 'text'
        input.value = currentName
        input.className = 'layer-rename-input'

        nameElement.innerHTML = ''
        nameElement.appendChild(input)
        input.focus()
        input.select()

        const saveName = () => {
            const newName = input.value.trim() || currentName
            layer.component.setName(newName)
            nameElement.textContent = newName
        }

        input.addEventListener('blur', saveName)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                saveName()
            } else if (e.key === 'Escape') {
                nameElement.textContent = currentName
            }
        })
    }

    getFilteredLayers(searchTerm) {
        if (!searchTerm) {
            return this.layers
        }

        const filterLayer = (layer) => {
            const matchesSearch = 
                layer.name.toLowerCase().includes(searchTerm) ||
                layer.type.toLowerCase().includes(searchTerm)

            if (matchesSearch) {
                return true
            }

            // Check children
            return layer.children.some(child => filterLayer(child))
        }

        return this.layers.filter(filterLayer)
    }

    getLayerIcon(type) {
        const iconMap = {
            'text': 'font',
            'heading': 'heading',
            'image': 'image',
            'link': 'link',
            'button': 'square',
            'form': 'edit',
            'input': 'keyboard',
            'textarea': 'align-left',
            'select': 'caret-square-down',
            'checkbox': 'check-square',
            'radio': 'dot-circle',
            'video': 'video',
            'iframe': 'window-maximize',
            'map': 'map',
            'table': 'table',
            'list': 'list',
            'div': 'square',
            'section': 'square',
            'header': 'header',
            'footer': 'minus',
            'nav': 'bars',
            'main': 'square',
            'article': 'file-alt',
            'aside': 'columns'
        }

        return iconMap[type] || 'cube'
    }

    // Public API methods
    getLayers() {
        return [...this.layers]
    }

    refresh() {
        this.refreshLayers()
    }

    searchLayers(query) {
        this.handleSearch(query)
    }

    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = ''
            this.renderLayers()
        }
    }

    expandAll() {
        const layerItems = this.panel.querySelectorAll('.layer-item')
        layerItems.forEach(item => {
            const childrenEl = item.querySelector('.layer-children')
            const toggleBtn = item.querySelector('.layer-toggle i')
            
            if (childrenEl) {
                childrenEl.style.display = 'block'
                if (toggleBtn) {
                    toggleBtn.className = 'fas fa-chevron-down'
                }
            }
        })
    }

    collapseAll() {
        const layerItems = this.panel.querySelectorAll('.layer-item')
        layerItems.forEach(item => {
            const childrenEl = item.querySelector('.layer-children')
            const toggleBtn = item.querySelector('.layer-toggle i')
            
            if (childrenEl) {
                childrenEl.style.display = 'none'
                if (toggleBtn) {
                    toggleBtn.className = 'fas fa-chevron-right'
                }
            }
        })
    }

    // State management
    getState() {
        return {
            layers: this.layers,
            layerCount: this.countLayers(this.layers),
            searchTerm: this.searchInput ? this.searchInput.value : '',
            isInitialized: this.isInitialized
        }
    }

    countLayers(layers) {
        let count = layers.length
        layers.forEach(layer => {
            count += this.countLayers(layer.children)
        })
        return count
    }

    // Debug methods
    debug() {
        return {
            state: this.getState(),
            panel: this.panel,
            searchInput: this.searchInput,
            editorComponents: this.editor ? this.editor.getComponents() : null
        }
    }

    // Cleanup
    destroy() {
        if (this.panel) {
            // Clear panel content
            const content = this.panel.querySelectorAll('.layer-search, .layer-tree, .no-results')
            content.forEach(el => el.remove())
        }

        this.layers = []
        this.isInitialized = false
        console.log('📹 LayerPanel component destroyed')
    }
}

export default LayerPanel