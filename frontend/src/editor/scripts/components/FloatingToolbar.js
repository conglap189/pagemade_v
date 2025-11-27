/**
 * Floating Toolbar Component
 * Provides quick access to common editing tools
 */

export class FloatingToolbar {
    constructor(app) {
        this.app = app
        this.isVisible = false
        this.position = { x: 20, y: 100 }
        this.isDragging = false
        this.dragOffset = { x: 0, y: 0 }
        
        this.tools = [
            { id: 'select', icon: 'fas fa-mouse-pointer', title: 'Select Tool', active: true },
            { id: 'text', icon: 'fas fa-font', title: 'Text Tool' },
            { id: 'image', icon: 'fas fa-image', title: 'Image Tool' },
            { id: 'button', icon: 'fas fa-square', title: 'Button Tool' },
            { id: 'container', icon: 'fas fa-square-full', title: 'Container Tool' },
            { id: 'divider', icon: 'fas fa-minus', title: 'Divider Tool' }
        ]
        
        console.log('🎯 FloatingToolbar component created')
    }

    init() {
        this.createToolbar()
        this.setupEventListeners()
        this.positionToolbar()
        console.log('🎯 FloatingToolbar initialized')
    }

    createToolbar() {
        // Create toolbar element
        this.toolbar = document.createElement('div')
        this.toolbar.id = 'floating-toolbar'
        this.toolbar.className = 'floating-toolbar'
        this.toolbar.innerHTML = `
            <div class="toolbar-header">
                <i class="fas fa-grip-vertical drag-handle"></i>
                <span class="toolbar-title">Tools</span>
                <button class="toolbar-toggle" title="Toggle Toolbar">
                    <i class="fas fa-chevron-left"></i>
                </button>
            </div>
            <div class="toolbar-content">
                ${this.tools.map(tool => `
                    <button class="tool-btn ${tool.active ? 'active' : ''}" 
                            data-tool="${tool.id}" 
                            title="${tool.title}">
                        <i class="${tool.icon}"></i>
                    </button>
                `).join('')}
                <div class="toolbar-divider"></div>
                <button class="tool-btn" data-tool="undo" title="Undo (Ctrl+Z)">
                    <i class="fas fa-undo"></i>
                </button>
                <button class="tool-btn" data-tool="redo" title="Redo (Ctrl+Y)">
                    <i class="fas fa-redo"></i>
                </button>
                <div class="toolbar-divider"></div>
                <button class="tool-btn" data-tool="zoom-in" title="Zoom In">
                    <i class="fas fa-search-plus"></i>
                </button>
                <button class="tool-btn" data-tool="zoom-out" title="Zoom Out">
                    <i class="fas fa-search-minus"></i>
                </button>
                <button class="tool-btn" data-tool="zoom-reset" title="Reset Zoom">
                    <i class="fas fa-compress"></i>
                </button>
            </div>
        `

        // Add to document
        document.body.appendChild(this.toolbar)
    }

    setupEventListeners() {
        // Tool buttons
        this.toolbar.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool
                this.handleToolClick(tool)
            })
        })

        // Toggle button
        const toggleBtn = this.toolbar.querySelector('.toolbar-toggle')
        toggleBtn.addEventListener('click', () => {
            this.toggle()
        })

        // Drag functionality
        const dragHandle = this.toolbar.querySelector('.drag-handle')
        dragHandle.addEventListener('mousedown', (e) => {
            this.startDrag(e)
        })

        // Global mouse events for dragging
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.drag(e)
            }
        })

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.endDrag()
            }
        })

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide()
            }
            if (e.key === 't' && e.altKey) {
                e.preventDefault()
                this.toggle()
            }
        })

        console.log('🎯 FloatingToolbar event listeners setup')
    }

    handleToolClick(tool) {
        switch (tool) {
            case 'select':
            case 'text':
            case 'image':
            case 'button':
            case 'container':
            case 'divider':
                this.setActiveTool(tool)
                break
            case 'undo':
                if (this.app.historyManager) {
                    this.app.historyManager.undo()
                }
                break
            case 'redo':
                if (this.app.historyManager) {
                    this.app.historyManager.redo()
                }
                break
            case 'zoom-in':
                this.zoom(1.2)
                break
            case 'zoom-out':
                this.zoom(0.8)
                break
            case 'zoom-reset':
                this.resetZoom()
                break
        }
    }

    setActiveTool(toolId) {
        // Update active state
        this.toolbar.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active')
        })

        const activeBtn = this.toolbar.querySelector(`[data-tool="${toolId}"]`)
        if (activeBtn) {
            activeBtn.classList.add('active')
        }

        // Update tools array
        this.tools.forEach(tool => {
            tool.active = tool.id === toolId
        })

        // Emit tool change event
        const toolChangeEvent = new CustomEvent('floating-toolbar:tool-changed', {
            detail: { tool: toolId }
        })
        document.dispatchEvent(toolChangeEvent)

        console.log('🎯 Tool changed to:', toolId)
    }

    startDrag(e) {
        this.isDragging = true
        this.dragOffset.x = e.clientX - this.position.x
        this.dragOffset.y = e.clientY - this.position.y
        this.toolbar.classList.add('dragging')
        e.preventDefault()
    }

    drag(e) {
        this.position.x = e.clientX - this.dragOffset.x
        this.position.y = e.clientY - this.dragOffset.y

        // Constrain to viewport
        const rect = this.toolbar.getBoundingClientRect()
        const maxX = window.innerWidth - rect.width
        const maxY = window.innerHeight - rect.height

        this.position.x = Math.max(0, Math.min(this.position.x, maxX))
        this.position.y = Math.max(0, Math.min(this.position.y, maxY))

        this.updatePosition()
    }

    endDrag() {
        this.isDragging = false
        this.toolbar.classList.remove('dragging')
        
        // Save position to localStorage
        localStorage.setItem('floating-toolbar-position', JSON.stringify(this.position))
    }

    positionToolbar() {
        // Load saved position
        const saved = localStorage.getItem('floating-toolbar-position')
        if (saved) {
            try {
                this.position = JSON.parse(saved)
            } catch (e) {
                console.warn('Failed to load toolbar position:', e)
            }
        }

        this.updatePosition()
    }

    updatePosition() {
        this.toolbar.style.left = `${this.position.x}px`
        this.toolbar.style.top = `${this.position.y}px`
    }

    toggle() {
        if (this.isVisible) {
            this.hide()
        } else {
            this.show()
        }
    }

    show() {
        this.isVisible = true
        this.toolbar.classList.remove('collapsed')
        this.toolbar.classList.add('visible')
        
        const toggleIcon = this.toolbar.querySelector('.toolbar-toggle i')
        toggleIcon.className = 'fas fa-chevron-left'
    }

    hide() {
        this.isVisible = false
        this.toolbar.classList.add('collapsed')
        this.toolbar.classList.remove('visible')
        
        const toggleIcon = this.toolbar.querySelector('.toolbar-toggle i')
        toggleIcon.className = 'fas fa-chevron-right'
    }

    zoom(factor) {
        if (!this.app || !this.app.pm) return

        const canvas = this.app.pm.Canvas
        const currentZoom = canvas.getZoom() || 1
        const newZoom = Math.max(0.1, Math.min(3, currentZoom * factor))
        
        canvas.setZoom(newZoom)
        
        // Emit zoom event
        const zoomEvent = new CustomEvent('floating-toolbar:zoom-changed', {
            detail: { zoom: newZoom, previousZoom: currentZoom }
        })
        document.dispatchEvent(zoomEvent)
    }

    resetZoom() {
        if (!this.app || !this.app.pm) return

        this.app.pm.Canvas.setZoom(1)
        
        // Emit zoom event
        const zoomEvent = new CustomEvent('floating-toolbar:zoom-changed', {
            detail: { zoom: 1, previousZoom: this.app.pm.Canvas.getZoom() }
        })
        document.dispatchEvent(zoomEvent)
    }

    // Public API methods
    getActiveTool() {
        const activeTool = this.tools.find(tool => tool.active)
        return activeTool ? activeTool.id : null
    }

    getPosition() {
        return { ...this.position }
    }

    setPosition(x, y) {
        this.position.x = x
        this.position.y = y
        this.updatePosition()
    }

    addTool(tool) {
        this.tools.push(tool)
        this.refreshToolbar()
    }

    removeTool(toolId) {
        this.tools = this.tools.filter(tool => tool.id !== toolId)
        this.refreshToolbar()
    }

    refreshToolbar() {
        // Recreate toolbar with updated tools
        if (this.toolbar) {
            this.toolbar.remove()
        }
        this.createToolbar()
        this.setupEventListeners()
        this.updatePosition()
    }

    // Debug methods
    debug() {
        return {
            isVisible: this.isVisible,
            position: this.position,
            activeTool: this.getActiveTool(),
            tools: this.tools.length,
            isDragging: this.isDragging
        }
    }

    // Cleanup
    destroy() {
        if (this.toolbar) {
            this.toolbar.remove()
        }
        
        // Remove event listeners
        document.removeEventListener('mousemove', this.drag)
        document.removeEventListener('mouseup', this.endDrag)
        
        console.log('🧹 FloatingToolbar destroyed')
    }
}

export default FloatingToolbar