/**
 * Asset Panel Component
 * Manages assets panel with upload and gallery functionality
 */

export class AssetPanel {
    constructor(app = null) {
        this.app = app // Reference to PageMadeApp (for siteId access)
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
        this.updateEmptyState() // Show empty state if no assets loaded
        this.isInitialized = true
        console.log('🖼️ AssetPanel initialized')
    }

    initializeElements() {
        this.panel = document.getElementById('assets-panel')
        
        if (!this.panel) {
            console.warn('Assets panel not found')
            return
        }

        // Use existing elements from HTML instead of creating new ones
        this.uploadArea = this.panel.querySelector('.asset-upload-btn')?.parentElement
        this.assetGrid = document.getElementById('user-assets-grid')
        this.emptyState = document.getElementById('asset-empty-state')
        this.loadingState = document.getElementById('asset-loading-state')
        
        console.log('🖼️ AssetPanel elements initialized', {
            panel: !!this.panel,
            uploadArea: !!this.uploadArea,
            assetGrid: !!this.assetGrid,
            emptyState: !!this.emptyState
        })
    }

    createUploadArea() {
        // Upload area already exists in HTML, no need to create
        // This method is kept for compatibility but does nothing
    }

    createAssetGrid() {
        // Asset grid already exists in HTML (#user-assets-grid), no need to create
        // This method is kept for compatibility but does nothing
    }

    setupEventListeners() {
        const fileInput = document.getElementById('asset-file-input')

        // File input change - this is the primary upload mechanism
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files)
                // Reset input so same file can be selected again
                e.target.value = ''
            })
        }

        // Drag and drop on the assets panel content area
        const assetsContent = document.getElementById('assets-content')
        if (assetsContent) {
            assetsContent.addEventListener('dragover', (e) => {
                e.preventDefault()
                assetsContent.classList.add('drag-over')
            })

            assetsContent.addEventListener('dragleave', (e) => {
                e.preventDefault()
                assetsContent.classList.remove('drag-over')
            })

            assetsContent.addEventListener('drop', (e) => {
                e.preventDefault()
                assetsContent.classList.remove('drag-over')
                this.handleFileSelect(e.dataTransfer.files)
            })
        }

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

        // Note: AssetManager configuration is done during editor init via config object
        // We just sync with existing assets here

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
        console.log('📤 [ASSET PANEL] uploadFile() called');
        console.log('📤 [ASSET PANEL] File:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        try {
            this.showUploadProgress(file.name)

            // Get siteId from app reference
            const siteId = this.app?.siteId
            console.log('📤 [ASSET PANEL] Site ID:', siteId);
            console.log('📤 [ASSET PANEL] App object:', this.app);
            
            if (!siteId) {
                console.error('❌ [ASSET PANEL] Site ID not available!');
                throw new Error('Site ID not available')
            }

            console.log('📤 [ASSET PANEL] Calling apiClient.uploadAsset()...');
            // uploadAsset expects (file, siteId), not FormData
            const result = await window.apiClient.uploadAsset(file, siteId)
            
            console.log('📤 [ASSET PANEL] Upload result:', result);
            
            if (!result || !result.url) {
                console.error('❌ [ASSET PANEL] Upload failed - no URL returned');
                throw new Error('Upload failed - no URL returned')
            }
            
            console.log('✅ [ASSET PANEL] Upload successful! URL:', result.url);
            
            // Add to editor asset manager
            if (this.assetManager) {
                console.log('📤 [ASSET PANEL] Adding to GrapesJS asset manager...');
                this.assetManager.add(result.url)
            }

            // Add to local assets
            console.log('📤 [ASSET PANEL] Adding to local asset list...');
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
            console.log('✅ [ASSET PANEL] Upload complete!');

        } catch (error) {
            console.error('❌ [ASSET PANEL] Upload failed:', error);
            console.error('❌ [ASSET PANEL] Error message:', error.message);
            console.error('❌ [ASSET PANEL] Error stack:', error.stack);
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
        this.updateEmptyState()

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
            
            this.updateEmptyState()

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
            <button class="asset-btn asset-delete" title="Xóa">
                <i class="fas fa-trash"></i>
            </button>
            <button class="asset-btn asset-select" title="Chọn ảnh">
                Chọn
            </button>
        `

        // Drag events
        assetEl.addEventListener('dragstart', (e) => {
            this.handleAssetDragStart(e, asset)
        })

        assetEl.addEventListener('dragend', (e) => {
            this.handleAssetDragEnd(e)
        })

        // Double click to insert
        assetEl.addEventListener('dblclick', () => {
            this.insertAssetToCanvas(asset)
        })

        // Button events
        const selectBtn = assetEl.querySelector('.asset-select')
        const deleteBtn = assetEl.querySelector('.asset-delete')

        selectBtn.addEventListener('click', () => {
            this.insertAssetToCanvas(asset)
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
        if (!this.editor) {
            console.error('🖼️ No editor instance')
            return
        }

        try {
            // Get selected component or wrapper
            const selected = this.editor.getSelected()
            const wrapper = this.editor.getWrapper()
            const target = selected || wrapper

            // Add image component
            const imgComponent = target.append(`<img src="${asset.src}" alt="${asset.name}" style="max-width: 100%; height: auto;">`)[0]
            
            // Select the new image
            if (imgComponent) {
                this.editor.select(imgComponent)
            }

            console.log('🖼️ Asset inserted to canvas:', asset.name)
            this.showSuccess('Đã thêm ảnh vào canvas')
        } catch (error) {
            console.error('🖼️ Failed to insert asset:', error)
            this.showError('Không thể thêm ảnh')
        }
    }

    copyAssetUrl(asset) {
        navigator.clipboard.writeText(asset.src).then(() => {
            this.showSuccess('Asset URL copied to clipboard')
        }).catch(err => {
            console.error('Failed to copy URL:', err)
            this.showError('Failed to copy URL')
        })
    }

    async deleteAsset(assetId) {
        console.log('🗑️ [ASSET PANEL] deleteAsset() called with ID:', assetId, 'Type:', typeof assetId);
        
        if (!confirm('Bạn có chắc chắn muốn xóa ảnh này không?')) {
            console.log('🗑️ [ASSET PANEL] User cancelled delete');
            return;
        }

        console.log('🗑️ [ASSET PANEL] User confirmed. Starting delete process...');
        console.log('🗑️ [ASSET PANEL] window.apiClient exists:', !!window.apiClient);
        
        try {
            // Call API to delete from database and file system
            console.log('🗑️ [ASSET PANEL] Calling window.apiClient.deleteAsset(' + assetId + ')');
            const result = await window.apiClient.deleteAsset(assetId);
            
            console.log('🗑️ [ASSET PANEL] Delete result:', result);
            console.log('🗑️ [ASSET PANEL] result.success:', result?.success);
            console.log('🗑️ [ASSET PANEL] result.message:', result?.message);
            
            if (result && result.success) {
                console.log('✅ [ASSET PANEL] Backend confirmed delete success');
                
                // Remove from local state and UI
                console.log('🗑️ [ASSET PANEL] Calling this.removeAsset(' + assetId + ')');
                const removed = this.removeAsset(assetId);
                console.log('🗑️ [ASSET PANEL] removeAsset returned:', removed);
                
                if (removed) {
                    const message = result.message || 'Ảnh đã được xóa thành công!';
                    this.showSuccess(message);
                    console.log('✅ [ASSET PANEL] Asset deleted from database and UI');
                    console.log('✅ [ASSET PANEL] Message:', message);
                } else {
                    this.showError('Không thể xóa ảnh khỏi giao diện');
                    console.error('❌ [ASSET PANEL] removeAsset failed - asset not found in local array');
                }
            } else {
                const errorMsg = result && result.message ? result.message : 'Không thể xóa ảnh từ server';
                this.showError(errorMsg);
                console.error('❌ [ASSET PANEL] Delete failed:', errorMsg);
                console.error('❌ [ASSET PANEL] Full result:', result);
            }
        } catch (error) {
            console.error('❌ [ASSET PANEL] Delete error:', error);
            console.error('❌ [ASSET PANEL] Error stack:', error.stack);
            this.showError('Lỗi khi xóa ảnh: ' + error.message);
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
            // Show loading state
            if (this.loadingState) this.loadingState.style.display = 'block'
            if (this.emptyState) this.emptyState.style.display = 'none'
            if (this.assetGrid) this.assetGrid.style.display = 'none'
            
            // Get siteId from app reference
            const siteId = this.app?.siteId
            if (!siteId) {
                console.warn('🖼️ No siteId available, cannot load assets from API')
                if (this.loadingState) this.loadingState.style.display = 'none'
                this.loadAssetsFromStorage()
                return
            }
            
            console.log('🖼️ Loading assets for site:', siteId)
            const assets = await window.apiClient.getAssets(siteId)
            
            // Hide loading state
            if (this.loadingState) this.loadingState.style.display = 'none'
            
            if (assets && assets.length > 0) {
                console.log('🖼️ Loaded', assets.length, 'assets from API')
                assets.forEach(asset => {
                    this.addAsset({
                        id: asset.id,
                        src: asset.url,
                        name: asset.filename || asset.name,
                        type: asset.mime_type || 'image/jpeg',
                        size: asset.file_size || 0
                    })
                })
            } else {
                console.log('🖼️ No assets found for this site')
            }
            
            this.updateEmptyState()
        } catch (error) {
            console.error('Failed to load assets:', error)
            if (this.loadingState) this.loadingState.style.display = 'none'
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

    updateEmptyState() {
        if (!this.emptyState || !this.assetGrid) return
        
        const hasAssets = this.assets.length > 0
        
        if (hasAssets) {
            this.emptyState.style.display = 'none'
            this.assetGrid.style.display = 'grid'
        } else {
            this.emptyState.style.display = 'block'
            this.assetGrid.style.display = 'none'
        }
        
        console.log('🖼️ Empty state updated:', hasAssets ? 'hidden' : 'shown', `(${this.assets.length} assets)`)
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
        // Remove existing progress if any
        this.hideUploadProgress()
        
        const progressEl = document.createElement('div')
        progressEl.className = 'upload-progress-bar'
        progressEl.innerHTML = `
            <div class="upload-progress-info">
                <i class="fas fa-cloud-upload-alt"></i>
                <span class="upload-filename">${filename}</span>
            </div>
            <div class="upload-progress-track">
                <div class="upload-progress-fill"></div>
            </div>
        `
        
        // Insert after panel header, before content
        const panelHeader = this.panel.querySelector('.panel-header')
        if (panelHeader && panelHeader.nextSibling) {
            panelHeader.parentNode.insertBefore(progressEl, panelHeader.nextSibling)
        } else {
            this.panel.appendChild(progressEl)
        }
    }

    hideUploadProgress() {
        const progressEl = this.panel?.querySelector('.upload-progress-bar')
        if (progressEl) {
            progressEl.classList.add('fade-out')
            setTimeout(() => progressEl.remove(), 300)
        }
    }

    showSuccess(message) {
        console.log('✅', message)
        this.showToast(message, 'success')
    }

    showError(message) {
        console.error('❌', message)
        this.showToast(message, 'error')
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.pm-toast')
        existingToasts.forEach(toast => toast.remove())

        // Create toast element
        const toast = document.createElement('div')
        toast.className = `pm-toast pm-toast-${type}`
        
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
        toast.innerHTML = `
            <span class="pm-toast-icon">${icon}</span>
            <span class="pm-toast-message">${message}</span>
        `
        
        // Add to body
        document.body.appendChild(toast)
        
        // Trigger animation
        setTimeout(() => toast.classList.add('pm-toast-show'), 10)
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('pm-toast-show')
            setTimeout(() => toast.remove(), 300)
        }, 3000)
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