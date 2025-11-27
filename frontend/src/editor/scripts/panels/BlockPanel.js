/**
 * Block Panel Component
 * Manages the blocks panel with drag-and-drop functionality
 */

export class BlockPanel {
    constructor() {
        this.editor = null
        this.panel = null
        this.blocks = []
        this.categories = new Map()
        this.searchInput = null
        this.isInitialized = false
        
        console.log('🧩 BlockPanel component created')
    }

    setEditor(editor) {
        this.editor = editor
        this.setupEditorBlocks()
        console.log('🧩 BlockPanel editor instance set')
    }

    init() {
        this.initializeElements()
        this.setupEventListeners()
        this.createDefaultBlocks()
        this.renderBlocks()
        this.isInitialized = true
        console.log('🧩 BlockPanel initialized')
    }

    initializeElements() {
        this.panel = document.getElementById('blocks-panel')
        
        if (!this.panel) {
            console.warn('Blocks panel not found')
            return
        }

        // Create search input
        this.createSearchInput()
        
        console.log('🧩 BlockPanel elements initialized')
    }

    createSearchInput() {
        const searchContainer = document.createElement('div')
        searchContainer.className = 'block-search'
        searchContainer.innerHTML = `
            <input type="text" placeholder="Search blocks..." class="block-search-input">
            <i class="fas fa-search block-search-icon"></i>
        `

        this.panel.insertBefore(searchContainer, this.panel.firstChild)
        this.searchInput = searchContainer.querySelector('.block-search-input')
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value)
            })
        }

        // Listen to block events from editor
        document.addEventListener('block:add', (e) => {
            this.handleBlockAdd(e.detail)
        })

        console.log('🧩 BlockPanel event listeners setup complete')
    }

    setupEditorBlocks() {
        if (!this.editor) return

        // Get existing blocks from editor
        const editorBlocks = this.editor.Blocks.getAll()
        
        editorBlocks.forEach(block => {
            this.addBlock(block)
        })

        // Listen to new blocks added to editor
        this.editor.on('block:add', (block) => {
            this.addBlock(block)
        })

        console.log('🧩 Editor blocks setup complete')
    }

    createDefaultBlocks() {
        const defaultBlocks = [
            {
                id: 'section',
                label: 'Section',
                category: 'Layout',
                content: '<section class="p-8"><h1 class="text-3xl font-bold mb-4">Section Title</h1><p class="text-gray-600">Section content goes here...</p></section>',
                attributes: { class: 'fa fa-square' }
            },
            {
                id: 'container',
                label: 'Container',
                category: 'Layout',
                content: '<div class="container mx-auto px-4"></div>',
                attributes: { class: 'fa fa-square-full' }
            },
            {
                id: 'grid',
                label: 'Grid',
                category: 'Layout',
                content: '<div class="grid grid-cols-3 gap-4"><div class="bg-gray-200 p-4">Column 1</div><div class="bg-gray-200 p-4">Column 2</div><div class="bg-gray-200 p-4">Column 3</div></div>',
                attributes: { class: 'fa fa-th' }
            },
            {
                id: 'flex',
                label: 'Flex Container',
                category: 'Layout',
                content: '<div class="flex space-x-4"><div class="flex-1 bg-gray-200 p-4">Flex 1</div><div class="flex-1 bg-gray-200 p-4">Flex 2</div></div>',
                attributes: { class: 'fa fa-arrows-alt-h' }
            },
            {
                id: 'card',
                label: 'Card',
                category: 'Components',
                content: '<div class="bg-white rounded-lg shadow-md p-6"><h3 class="text-lg font-semibold mb-2">Card Title</h3><p class="text-gray-600">Card description...</p></div>',
                attributes: { class: 'fa fa-square' }
            },
            {
                id: 'button',
                label: 'Button',
                category: 'Components',
                content: '<button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Click me</button>',
                attributes: { class: 'fa fa-square' }
            },
            {
                id: 'form',
                label: 'Form',
                category: 'Components',
                content: '<form class="space-y-4"><input type="text" placeholder="Name" class="w-full p-2 border rounded"><textarea placeholder="Message" class="w-full p-2 border rounded"></textarea><button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Submit</button></form>',
                attributes: { class: 'fa fa-square' }
            },
            {
                id: 'navbar',
                label: 'Navigation',
                category: 'Components',
                content: '<nav class="bg-white shadow-md"><div class="container mx-auto px-4 py-4 flex justify-between items-center"><div class="text-xl font-bold">Logo</div><div class="space-x-4"><a href="#" class="text-gray-600 hover:text-gray-900">Home</a><a href="#" class="text-gray-600 hover:text-gray-900">About</a><a href="#" class="text-gray-600 hover:text-gray-900">Contact</a></div></div></nav>',
                attributes: { class: 'fa fa-bars' }
            },
            {
                id: 'footer',
                label: 'Footer',
                category: 'Components',
                content: '<footer class="bg-gray-800 text-white py-8"><div class="container mx-auto px-4 text-center"><p>&copy; 2024 Your Company. All rights reserved.</p></div></footer>',
                attributes: { class: 'fa fa-square' }
            },
            {
                id: 'heading',
                label: 'Heading',
                category: 'Typography',
                content: '<h1 class="text-4xl font-bold">Heading Title</h1>',
                attributes: { class: 'fa fa-heading' }
            },
            {
                id: 'paragraph',
                label: 'Paragraph',
                category: 'Typography',
                content: '<p class="text-gray-700">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
                attributes: { class: 'fa fa-paragraph' }
            },
            {
                id: 'list',
                label: 'List',
                category: 'Typography',
                content: '<ul class="list-disc list-inside space-y-2"><li>First item</li><li>Second item</li><li>Third item</li></ul>',
                attributes: { class: 'fa fa-list' }
            },
            {
                id: 'image',
                label: 'Image',
                category: 'Media',
                content: '<img src="https://via.placeholder.com/400x300" alt="Placeholder image" class="w-full rounded-lg">',
                attributes: { class: 'fa fa-image' }
            },
            {
                id: 'video',
                label: 'Video',
                category: 'Media',
                content: '<div class="aspect-w-16 aspect-h-9"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" class="w-full h-full" frameborder="0" allowfullscreen></iframe></div>',
                attributes: { class: 'fa fa-video' }
            },
            {
                id: 'hero',
                label: 'Hero Section',
                category: 'Templates',
                content: '<section class="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20"><div class="container mx-auto px-4 text-center"><h1 class="text-5xl font-bold mb-4">Welcome to Our Site</h1><p class="text-xl mb-8">Discover amazing features and possibilities</p><button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">Get Started</button></div></section>',
                attributes: { class: 'fa fa-star' }
            },
            {
                id: 'features',
                label: 'Features Section',
                category: 'Templates',
                content: '<section class="py-16"><div class="container mx-auto px-4"><h2 class="text-3xl font-bold text-center mb-12">Our Features</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-8"><div class="text-center"><div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"><i class="fas fa-rocket text-blue-600 text-2xl"></i></div><h3 class="text-xl font-semibold mb-2">Fast</h3><p class="text-gray-600">Lightning fast performance</p></div><div class="text-center"><div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"><i class="fas fa-shield-alt text-green-600 text-2xl"></i></div><h3 class="text-xl font-semibold mb-2">Secure</h3><p class="text-gray-600">Enterprise-grade security</p></div><div class="text-center"><div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"><i class="fas fa-cog text-purple-600 text-2xl"></i></div><h3 class="text-xl font-semibold mb-2">Customizable</h3><p class="text-gray-600">Tailored to your needs</p></div></div></div></section>',
                attributes: { class: 'fa fa-th-large' }
            }
        ]

        defaultBlocks.forEach(block => {
            this.addBlock(block)
        })

        console.log('🧩 Default blocks created')
    }

    addBlock(blockData) {
        const block = {
            id: blockData.id || this.generateBlockId(),
            label: blockData.label || 'Untitled Block',
            category: blockData.category || 'General',
            content: blockData.content || '<div>Block content</div>',
            attributes: blockData.attributes || { class: 'fa fa-cube' }
        }

        this.blocks.push(block)

        // Add to category
        if (!this.categories.has(block.category)) {
            this.categories.set(block.category, [])
        }
        this.categories.get(block.category).push(block)

        // Add to editor if available
        if (this.editor) {
            this.editor.Blocks.add(block.id, {
                label: block.label,
                category: block.category,
                content: block.content,
                attributes: block.attributes
            })
        }

        return block
    }

    removeBlock(blockId) {
        const index = this.blocks.findIndex(block => block.id === blockId)
        if (index > -1) {
            const block = this.blocks[index]
            this.blocks.splice(index, 1)

            // Remove from category
            const categoryBlocks = this.categories.get(block.category)
            if (categoryBlocks) {
                const catIndex = categoryBlocks.findIndex(b => b.id === blockId)
                if (catIndex > -1) {
                    categoryBlocks.splice(catIndex, 1)
                }
            }

            // Remove from editor
            if (this.editor) {
                this.editor.Blocks.remove(blockId)
            }

            return true
        }
        return false
    }

    renderBlocks(searchTerm = '') {
        if (!this.panel) return

        // Clear existing content (except search)
        const existingContent = this.panel.querySelectorAll('.block-category, .no-results')
        existingContent.forEach(el => el.remove())

        const filteredBlocks = this.getFilteredBlocks(searchTerm)

        if (filteredBlocks.length === 0) {
            this.renderNoResults(searchTerm)
            return
        }

        // Group by category
        const blocksByCategory = new Map()
        filteredBlocks.forEach(block => {
            if (!blocksByCategory.has(block.category)) {
                blocksByCategory.set(block.category, [])
            }
            blocksByCategory.get(block.category).push(block)
        })

        // Render categories
        blocksByCategory.forEach((blocks, category) => {
            this.renderCategory(category, blocks)
        })
    }

    renderCategory(category, blocks) {
        const categoryEl = document.createElement('div')
        categoryEl.className = 'block-category'

        const titleEl = document.createElement('div')
        titleEl.className = 'block-category-title'
        titleEl.innerHTML = `
            <i class="fas fa-folder"></i>
            ${category}
            <span class="block-count">(${blocks.length})</span>
        `
        categoryEl.appendChild(titleEl)

        const gridEl = document.createElement('div')
        gridEl.className = 'block-grid'

        blocks.forEach(block => {
            const blockEl = this.renderBlock(block)
            gridEl.appendChild(blockEl)
        })

        categoryEl.appendChild(gridEl)
        this.panel.appendChild(categoryEl)
    }

    renderBlock(block) {
        const blockEl = document.createElement('div')
        blockEl.className = 'block-item'
        blockEl.draggable = true
        blockEl.dataset.blockId = block.id

        blockEl.innerHTML = `
            <i class="fas ${block.attributes.class || 'fa-cube'}"></i>
            <span>${block.label}</span>
        `

        // Drag events
        blockEl.addEventListener('dragstart', (e) => {
            this.handleDragStart(e, block)
        })

        blockEl.addEventListener('dragend', (e) => {
            this.handleDragEnd(e)
        })

        // Click event for mobile
        blockEl.addEventListener('click', () => {
            this.handleBlockClick(block)
        })

        return blockEl
    }

    renderNoResults(searchTerm) {
        const noResultsEl = document.createElement('div')
        noResultsEl.className = 'no-results'
        noResultsEl.innerHTML = `
            <i class="fas fa-search"></i>
            <p>No blocks found for "${searchTerm}"</p>
            <button class="btn btn-secondary btn-sm" onclick="this.closest('.block-panel').querySelector('.block-search-input').value = ''; this.closest('.block-panel').querySelector('.block-search-input').dispatchEvent(new Event('input'))">
                Clear search
            </button>
        `
        this.panel.appendChild(noResultsEl)
    }

    handleSearch(searchTerm) {
        this.renderBlocks(searchTerm.toLowerCase())
    }

    handleDragStart(e, block) {
        e.dataTransfer.effectAllowed = 'copy'
        e.dataTransfer.setData('text/html', block.content)
        e.dataTransfer.setData('block-id', block.id)
        
        // Add visual feedback
        e.target.classList.add('dragging')
        
        console.log('🧩 Block drag started:', block.label)
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging')
    }

    handleBlockClick(block) {
        if (!this.editor) return

        // Add block to canvas
        this.editor.runCommand('gjs-add-component', {
            content: block.content,
            select: true
        })

        console.log('🧩 Block clicked:', block.label)
    }

    handleBlockAdd(detail) {
        console.log('🧩 Block added to canvas:', detail)
    }

    getFilteredBlocks(searchTerm) {
        if (!searchTerm) {
            return this.blocks
        }

        return this.blocks.filter(block => 
            block.label.toLowerCase().includes(searchTerm) ||
            block.category.toLowerCase().includes(searchTerm) ||
            block.content.toLowerCase().includes(searchTerm)
        )
    }

    generateBlockId() {
        return 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }

    // Public API methods
    getBlocks() {
        return [...this.blocks]
    }

    getBlocksByCategory(category) {
        return this.blocks.filter(block => block.category === category)
    }

    getCategories() {
        return Array.from(this.categories.keys())
    }

    searchBlocks(query) {
        this.handleSearch(query)
    }

    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = ''
            this.renderBlocks()
        }
    }

    addCustomBlock(blockData) {
        return this.addBlock(blockData)
    }

    removeCustomBlock(blockId) {
        return this.removeBlock(blockId)
    }

    // State management
    getState() {
        return {
            blocks: this.blocks,
            categories: Array.from(this.categories.keys()),
            blockCount: this.blocks.length,
            categoryCount: this.categories.size,
            searchTerm: this.searchInput ? this.searchInput.value : '',
            isInitialized: this.isInitialized
        }
    }

    // Integration methods
    onBlockAdd(callback) {
        if (typeof callback !== 'function') return

        document.addEventListener('block:add', (e) => {
            callback(e.detail)
        })
    }

    // Debug methods
    debug() {
        return {
            state: this.getState(),
            panel: this.panel,
            searchInput: this.searchInput,
            editorBlocks: this.editor ? this.editor.Blocks.getAll() : null
        }
    }

    // Cleanup
    destroy() {
        if (this.panel) {
            // Clear panel content
            const content = this.panel.querySelectorAll('.block-search, .block-category, .no-results')
            content.forEach(el => el.remove())
        }

        this.blocks = []
        this.categories.clear()
        this.isInitialized = false
        console.log('🧹 BlockPanel component destroyed')
    }
}

export default BlockPanel