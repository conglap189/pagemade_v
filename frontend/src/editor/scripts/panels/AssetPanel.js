/**
 * Asset Panel Component
 * Manages assets panel with upload and gallery functionality
 */

export class AssetPanel {
    constructor() {
        this.editor = null
        this.panel = null
        this.assets = []
        this.assetManager = null
        this.uploadArea = null
        this.assetGrid = null
        this.isInitialized = false
        
        console.log('🖼️ AssetPanel component created')
    }

    setEditor(editor) {
        this.editor = editor
        this.assetManager = editor.AssetManager
        this.setupEditorAssets()
        console.log('🖼️ AssetPanel editor instance set')
    }

    init() {
        this.initializeElements()
        this.setupEventListeners()
        this.loadAssets()
        this.isInitialized = true
        console.log('🖼️ AssetPanel initialized')
    }

    initializeElements() {
        this.panel = document.getElementById('assets-panel')
        
        if (!this.panel) {
            console.warn('Assets panel not found')
            return
        }

        this.createUploadArea()
        this.createAssetGrid()
        
        console.log('🖼️ AssetPanel elements initialized')
    }

    createUploadArea() {
        this.uploadArea = document.createElement('div')
        this.uploadArea.className = 'asset-upload-area'
        this.uploadArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p><strong>Click to upload</strong> or drag and drop</p>
            <p>PNG, JPG, GIF up to 10MB</p>
            <input type="file" id="asset-file-input" multiple accept="image/*" style="display: none;">
        `

        this.panel.appendChild(this.uploadArea)
    }

    createAssetGrid() {
        this.assetGrid = document.createElement('div')
        this.assetGrid.className = 'asset-grid'
        this.panel.appendChild(this.assetGrid)
    }

    setupEventListeners() {
        if (!this.uploadArea) return

        const fileInput = document.getElementById('asset-file-input')

        // Click to upload
        this.uploadArea.addEventListener('click', () => {
            fileInput?.click()
        })

        // File input change
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files)
            })
        }

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault()
            this.uploadArea.classList.add('drag-over')
        })

        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault()
            this.uploadArea.classList.remove('drag-over')
        })

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault()
            this.uploadArea.classList.remove('drag-over')
            this.handleFileSelect(e.dataTransfer.files)
        })

        // Listen to asset events from editor
        if (this.editor) {
            this.editor.on('asset:add', (asset) => {
                this.handleAssetAdd(asset)
            })

            this.editor.on('asset:remove', (asset) => {
                this.handleAssetRemove(asset)
            })

            this.editor.on('asset:update', (asset) => {
                this.handleAssetUpdate(asset)
            })
        }

        console.log('🖼️ AssetPanel event listeners setup complete')
    }

    setupEditorAssets() {
        if (!this.assetManager) return

        // Get existing assets from editor
        const editorAssets = this.assetManager.getAll()
        
        editorAssets.forEach(asset => {
            this.addAsset(asset)
        })

        // Configure asset manager
        this.assetManager.config({
            upload: true,
            uploadFile: (e) => this.handleAssetUpload(e),
            assets: this.assets
        })

        console.log('🖼️ Editor assets setup complete')
    }

    async handleFileSelect(files) {
        if (!files || files.length === 0) return

        const validFiles = Array.from(files).filter(file => 
            file.type.match('image.*') && file.size <= 10 * 1024 * 1024 // 10MB limit
        )

        if (validFiles.length === 0) {
            this.showError('Please select valid image files (PNG, JPG, GIF) under 10MB')
            return
        }

        for (const file of validFiles) {
            await this.uploadFile(file)
        }
    }

    async uploadFile(file) {
        try {
            this.showUploadProgress(file.name)

            const formData = new FormData()
            formData.append('file', file)

            const result = await window.apiClient.uploadAsset(formData)
            
            if (!result || !result.url) {
                throw new Error('Upload failed')
            }
            
            // Add to editor asset manager
            if (this.assetManager) {
                this.assetManager.add(result.url)
            }

            // Add to local assets
            this.addAsset({
                id: result.id || this.generateAssetId(),
                src: result.url,
                name: file.name,
                type: file.type,
                size: file.size,
                uploaded: new Date().toISOString()
            })

            this.hideUploadProgress()
            this.showSuccess(`${file.name} uploaded successfully`)

        } catch (error) {
            console.error('Upload failed:', error)
            this.hideUploadProgress()
            this.showError(`Failed to upload ${file.name}: ${error.message}`)
        }
    }

    handleAssetUpload(e) {
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files
        this.handleFileSelect(files)
    }

    addAsset(assetData) {
        const asset = {
            id: assetData.id || this.generateAssetId(),
            src: assetData.src || assetData.url,
            name: assetData.name || 'Untitled Asset',
            type: assetData.type || 'image/jpeg',
            size: assetData.size || 0,
            uploaded: assetData.uploaded || new Date().toISOString(),
            ...assetData
        }

        this.assets.push(asset)
        this.renderAsset(asset)

        return asset
    }

    removeAsset(assetId) {
        const index = this.assets.findIndex(asset => asset.id === assetId)
        if (index > -1) {
            const asset = this.assets[index]
            this.assets.splice(index, 1)

            // Remove from DOM
            const assetEl = document.querySelector(`[data-asset-id="${assetId}"]`)
            if (assetEl) {
                assetEl.remove()
            }

            // Remove from editor asset manager
            if (this.assetManager) {
                this.assetManager.remove(asset.src)
            }

            return true
        }
        return false
    }

    renderAsset(asset) {
        if (!this.assetGrid) return

        const assetEl = document.createElement('div')
        assetEl.className = 'asset-item'
        assetEl.dataset.assetId = asset.id
        assetEl.draggable = true

        assetEl.innerHTML = `
            <img src="${asset.src}" alt="${asset.name}" loading="lazy">
            <div class="asset-item-overlay">
                <div class="asset-item-actions">
                    <button class="btn btn-icon btn-sm asset-insert" title="Insert to canvas">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn btn-icon btn-sm asset-copy" title="Copy URL">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-icon btn-sm asset-delete" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="asset-info">
                <span class="asset-name" title="${asset.name}">${asset.name}</span>
                <span class="asset-size">${this.formatFileSize(asset.size)}</span>
            </div>
        `

        // Drag events
        assetEl.addEventListener('dragstart', (e) => {
            this.handleAssetDragStart(e, asset)
        })

        assetEl.addEventListener('dragend', (e) => {
            this.handleAssetDragEnd(e)
        })

        // Button events
        const insertBtn = assetEl.querySelector('.asset-insert')
        const copyBtn = assetEl.querySelector('.asset-copy')
        const deleteBtn = assetEl.querySelector('.asset-delete')

        insertBtn.addEventListener('click', () => {
            this.insertAssetToCanvas(asset)
        })

        copyBtn.addEventListener('click', () => {
            this.copyAssetUrl(asset)
        })

        deleteBtn.addEventListener('click', () => {
            this.deleteAsset(asset.id)
        })

        this.assetGrid.appendChild(assetEl)
    }

    handleAssetDragStart(e, asset) {
        e.dataTransfer.effectAllowed = 'copy'
        e.dataTransfer.setData('text/html', `<img src="${asset.src}" alt="${asset.name}">`)
        e.dataTransfer.setData('asset-id', asset.id)
        
        e.target.classList.add('dragging')
        
        console.log('🖼️ Asset drag started:', asset.name)
    }

    handleAssetDragEnd(e) {
        e.target.classList.remove('dragging')
    }

    insertAssetToCanvas(asset) {
        if (!this.editor) return

        const imageHtml = `<img src="${asset.src}" alt="${asset.name}" style="max-width: 100%; height: auto;">`
        
        this.editor.runCommand('gjs-add-component', {
            content: imageHtml,
            select: true
        })

        console.log('🖼️ Asset inserted to canvas:', asset.name)
    }

    copyAssetUrl(asset) {
        navigator.clipboard.writeText(asset.src).then(() => {
            this.showSuccess('Asset URL copied to clipboard')
        }).catch(err => {
            console.error('Failed to copy URL:', err)
            this.showError('Failed to copy URL')
        })
    }

    deleteAsset(assetId) {
        if (!confirm('Are you sure you want to delete this asset?')) return

        if (this.removeAsset(assetId)) {
            this.showSuccess('Asset deleted successfully')
        } else {
            this.showError('Failed to delete asset')
        }
    }

    handleAssetAdd(asset) {
        console.log('🖼️ Asset added:', asset)
    }

    handleAssetRemove(asset) {
        console.log('🖼️ Asset removed:', asset)
    }

    handleAssetUpdate(asset) {
        console.log('🖼️ Asset updated:', asset)
    }

    loadAssets() {
        // Load assets from API or localStorage
        this.loadAssetsFromAPI()
    }

    async loadAssetsFromAPI() {
        try {
            const assets = await window.apiClient.getAssets()
            if (assets) {
                assets.forEach(asset => {
                    this.addAsset(asset)
                })
            }
        } catch (error) {
            console.error('Failed to load assets:', error)
            // Load from localStorage as fallback
            this.loadAssetsFromStorage()
        }
    }

    loadAssetsFromStorage() {
        const storedAssets = localStorage.getItem('pagemade-assets')
        if (storedAssets) {
            try {
                const assets = JSON.parse(storedAssets)
                assets.forEach(asset => {
                    this.addAsset(asset)
                })
            } catch (error) {
                console.error('Failed to parse stored assets:', error)
            }
        }
    }

    saveAssetsToStorage() {
        try {
            localStorage.setItem('pagemade-assets', JSON.stringify(this.assets))
        } catch (error) {
            console.error('Failed to save assets to storage:', error)
        }
    }

    generateAssetId() {
        return 'asset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // UI feedback methods
    showUploadProgress(filename) {
        const progressEl = document.createElement('div')
        progressEl.className = 'upload-progress'
        progressEl.innerHTML = `
            <div class="upload-progress-content">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Uploading ${filename}...</span>
            </div>
        `
        this.panel.appendChild(progressEl)
    }

    hideUploadProgress() {
        const progressEl = this.panel.querySelector('.upload-progress')
        if (progressEl) {
            progressEl.remove()
        }
    }

    showSuccess(message) {
        console.log('✅', message)
        // TODO: Implement toast notification
    }

    showError(message) {
        console.error('❌', message)
        // TODO: Implement error toast
    }

    // Public API methods
    getAssets() {
        return [...this.assets]
    }

    getAssetById(assetId) {
        return this.assets.find(asset => asset.id === assetId)
    }

    searchAssets(query) {
        const searchTerm = query.toLowerCase()
        return this.assets.filter(asset => 
            asset.name.toLowerCase().includes(searchTerm) ||
            asset.type.toLowerCase().includes(searchTerm)
        )
    }

    refreshAssets() {
        this.assetGrid.innerHTML = ''
        this.assets.forEach(asset => {
            this.renderAsset(asset)
        })
    }

    clearAssets() {
        this.assets = []
        if (this.assetGrid) {
            this.assetGrid.innerHTML = ''
        }
        this.saveAssetsToStorage()
    }

    // State management
    getState() {
        return {
            assets: this.assets,
            assetCount: this.assets.length,
            totalSize: this.assets.reduce((sum, asset) => sum + (asset.size || 0), 0),
            isInitialized: this.isInitialized
        }
    }

    // Integration methods
    onAssetAdd(callback) {
        if (typeof callback !== 'function') return

        document.addEventListener('asset:add', (e) => {
            callback(e.detail)
        })
    }

    // Debug methods
    debug() {
        return {
            state: this.getState(),
            panel: this.panel,
            uploadArea: this.uploadArea,
            assetGrid: this.assetGrid,
            assetManager: this.assetManager
        }
    }

    // Cleanup
    destroy() {
        if (this.panel) {
            this.panel.innerHTML = ''
        }

        this.assets = []
        this.assetManager = null
        this.isInitialized = false
        console.log('🧹 AssetPanel component destroyed')
    }
}

export default AssetPanel