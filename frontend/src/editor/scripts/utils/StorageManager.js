/**
 * Storage Manager
 * Handles localStorage operations with compression and error handling
 */

export class StorageManager {
    constructor() {
        this.prefix = 'pagemade-'
        this.compressionEnabled = true
        this.maxStorageSize = 5 * 1024 * 1024 // 5MB
        this.isInitialized = false
    }

    init() {
        this.checkStorageAvailability()
        this.cleanupOldData()
        this.isInitialized = true
        console.log('💾 StorageManager initialized')
    }

    checkStorageAvailability() {
        try {
            const test = '__storage_test__'
            localStorage.setItem(test, test)
            localStorage.removeItem(test)
            return true
        } catch (e) {
            console.warn('localStorage not available:', e)
            return false
        }
    }

    // Basic storage operations
    set(key, value, options = {}) {
        if (!this.checkStorageAvailability()) return false

        const fullKey = this.prefix + key
        const data = {
            value: value,
            timestamp: Date.now(),
            ttl: options.ttl || null,
            version: options.version || '1.0.0'
        }

        try {
            const serialized = JSON.stringify(data)
            const compressed = this.compressionEnabled ? this.compress(serialized) : serialized
            
            // Check storage size
            if (this.getStorageSize() + compressed.length > this.maxStorageSize) {
                this.cleanupOldData()
            }

            localStorage.setItem(fullKey, compressed)
            return true
        } catch (error) {
            console.error('Failed to store data:', error)
            return false
        }
    }

    get(key, defaultValue = null) {
        if (!this.checkStorageAvailability()) return defaultValue

        const fullKey = this.prefix + key
        
        try {
            const stored = localStorage.getItem(fullKey)
            if (!stored) return defaultValue

            const decompressed = this.compressionEnabled ? this.decompress(stored) : stored
            const data = JSON.parse(decompressed)

            // Check TTL
            if (data.ttl && Date.now() > data.timestamp + data.ttl) {
                this.remove(key)
                return defaultValue
            }

            return data.value
        } catch (error) {
            console.error('Failed to retrieve data:', error)
            return defaultValue
        }
    }

    remove(key) {
        if (!this.checkStorageAvailability()) return false

        const fullKey = this.prefix + key
        localStorage.removeItem(fullKey)
        return true
    }

    exists(key) {
        if (!this.checkStorageAvailability()) return false
        const fullKey = this.prefix + key
        return localStorage.getItem(fullKey) !== null
    }

    // Editor-specific methods
    saveEditorContent(pageId, content, styles = {}, assets = []) {
        const editorData = {
            pageId: pageId,
            content: content,
            styles: styles,
            assets: assets,
            lastModified: Date.now()
        }

        return this.set(`editor-${pageId}`, editorData, {
            ttl: 7 * 24 * 60 * 60 * 1000 // 7 days
        })
    }

    loadEditorContent(pageId) {
        return this.get(`editor-${pageId}`, {
            content: '',
            styles: {},
            assets: [],
            lastModified: null
        })
    }

    // Auto-save functionality
    setAutoSave(pageId, content) {
        return this.set(`autosave-${pageId}`, {
            content: content,
            timestamp: Date.now()
        }, {
            ttl: 24 * 60 * 60 * 1000 // 24 hours
        })
    }

    getAutoSave(pageId) {
        return this.get(`autosave-${pageId}`)
    }

    clearAutoSave(pageId) {
        return this.remove(`autosave-${pageId}`)
    }

    // Draft functionality
    saveDraft(pageId, content) {
        return this.set(`draft-${pageId}`, {
            content: content,
            timestamp: Date.now()
        })
    }

    getDraft(pageId) {
        return this.get(`draft-${pageId}`)
    }

    hasDraft(pageId) {
        return this.exists(`draft-${pageId}`)
    }

    clearDraft(pageId) {
        return this.remove(`draft-${pageId}`)
    }

    // User preferences
    savePreferences(preferences) {
        return this.set('preferences', preferences)
    }

    getPreferences() {
        return this.get('preferences', {
            theme: 'light',
            autoSave: true,
            autoSaveInterval: 30000,
            showGrid: false,
            snapToGrid: false
        })
    }

    // Recent pages
    addRecentPage(pageId, title, url) {
        const recentPages = this.getRecentPages()
        const existingIndex = recentPages.findIndex(page => page.id === pageId)

        if (existingIndex > -1) {
            recentPages.splice(existingIndex, 1)
        }

        recentPages.unshift({
            id: pageId,
            title: title,
            url: url,
            lastVisited: Date.now()
        })

        // Keep only last 10 pages
        const limitedPages = recentPages.slice(0, 10)
        return this.set('recent-pages', limitedPages)
    }

    getRecentPages() {
        return this.get('recent-pages', [])
    }

    clearRecentPages() {
        return this.remove('recent-pages')
    }

    // Save/Publish tracking
    setLastSaved() {
        return this.set('last-saved', Date.now())
    }

    getLastSaved() {
        return this.get('last-saved', null)
    }

    setLastPublished() {
        return this.set('last-published', Date.now())
    }

    getLastPublished() {
        return this.get('last-published', null)
    }

    // Change detection
    hasUnsavedChanges(currentContent) {
        const lastSaved = this.getLastSaved()
        if (!lastSaved) return true

        const pageId = this.getCurrentPageId()
        const savedContent = this.loadEditorContent(pageId)
        
        return JSON.stringify(currentContent) !== JSON.stringify(savedContent.content)
    }

    getCurrentPageId() {
        // Extract from URL or return default
        const pathParts = window.location.pathname.split('/')
        if (pathParts.length > 2 && pathParts[1] === 'editor') {
            return pathParts[2]
        }
        return '1'
    }

    // Storage management
    getStorageSize() {
        let total = 0
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length
            }
        }
        return total
    }

    getStorageUsage() {
        const used = this.getStorageSize()
        const available = this.maxStorageSize
        const percentage = (used / available) * 100

        return {
            used: used,
            available: available,
            percentage: percentage,
            formatted: {
                used: this.formatBytes(used),
                available: this.formatBytes(available),
                percentage: percentage.toFixed(2) + '%'
            }
        }
    }

    cleanupOldData() {
        const keys = Object.keys(localStorage)
        const now = Date.now()
        const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days

        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                try {
                    const stored = localStorage.getItem(key)
                    const decompressed = this.compressionEnabled ? this.decompress(stored) : stored
                    const data = JSON.parse(decompressed)

                    // Remove old data
                    if (data.ttl && now > data.timestamp + data.ttl) {
                        localStorage.removeItem(key)
                    }
                } catch (error) {
                    // Remove corrupted data
                    localStorage.removeItem(key)
                }
            }
        })
    }

    clearAll() {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key)
            }
        })
    }

    // Simple compression (can be replaced with better algorithm)
    compress(data) {
        // Simple LZ-string like compression
        return btoa(encodeURIComponent(data))
    }

    decompress(data) {
        try {
            return decodeURIComponent(atob(data))
        } catch (error) {
            return data
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Export/Import functionality
    exportData() {
        const data = {}
        const keys = Object.keys(localStorage)
        
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                data[key] = localStorage.getItem(key)
            }
        })

        return {
            version: '1.0.0',
            timestamp: Date.now(),
            data: data
        }
    }

    importData(exportedData) {
        if (!exportedData || !exportedData.data) return false

        try {
            Object.keys(exportedData.data).forEach(key => {
                localStorage.setItem(key, exportedData.data[key])
            })
            return true
        } catch (error) {
            console.error('Failed to import data:', error)
            return false
        }
    }

    // Debug methods
    debug() {
        const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix))
        const usage = this.getStorageUsage()
        
        return {
            keys: keys,
            count: keys.length,
            usage: usage,
            available: this.checkStorageAvailability()
        }
    }

    // Cleanup method
    destroy() {
        this.isInitialized = false
        console.log('🧹 StorageManager destroyed')
    }
}

// Export singleton instance for easy access
export const storageManager = new StorageManager()

export default storageManager