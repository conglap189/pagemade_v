/**
 * History Manager
 * Handles undo/redo functionality and auto-save
 */

export class HistoryManager {
    constructor(editor, options = {}) {
        this.editor = editor
        this.maxHistorySize = options.maxHistorySize || 50
        this.autoSaveInterval = options.autoSaveInterval || 30000 // 30 seconds
        this.history = []
        this.currentIndex = -1
        this.isAutoSaving = false
        this.lastAutoSave = null
        this.autoSaveTimer = null
        
        console.log('📝 HistoryManager initialized')
    }

    init() {
        this.setupEventListeners()
        this.startAutoSave()
        this.saveInitialState()
        console.log('📝 HistoryManager started')
    }

    setupEventListeners() {
        if (!this.editor) return

        // Listen to editor changes
        this.editor.on('component:add', () => this.onEditorChange())
        this.editor.on('component:remove', () => this.onEditorChange())
        this.editor.on('component:update', () => this.onEditorChange())
        this.editor.on('style:update', () => this.onEditorChange())
        this.editor.on('storage:end', () => this.onEditorChange())

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'z':
                        e.preventDefault()
                        if (e.shiftKey) {
                            this.redo()
                        } else {
                            this.undo()
                        }
                        break
                    case 'y':
                        e.preventDefault()
                        this.redo()
                        break
                }
            }
        })

        console.log('📝 HistoryManager event listeners setup')
    }

    saveInitialState() {
        const state = this.getCurrentState()
        this.history.push(state)
        this.currentIndex = 0
        console.log('📝 Initial state saved')
    }

    getCurrentState() {
        if (!this.editor) return null

        try {
            return {
                html: this.editor.getHtml(),
                css: this.editor.getCss(),
                components: this.editor.getComponents(),
                styles: this.editor.getStyle(),
                timestamp: Date.now()
            }
        } catch (error) {
            console.error('Failed to get current state:', error)
            return null
        }
    }

    onEditorChange() {
        // Debounce rapid changes
        clearTimeout(this.changeTimeout)
        this.changeTimeout = setTimeout(() => {
            this.saveState()
        }, 500)
    }

    saveState() {
        const state = this.getCurrentState()
        if (!state) return

        // Remove any states after current index (for redo functionality)
        this.history = this.history.slice(0, this.currentIndex + 1)

        // Add new state
        this.history.push(state)
        this.currentIndex++

        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift()
            this.currentIndex--
        }

        // Emit state change event
        this.emitStateChange()

        console.log('📝 State saved to history:', this.currentIndex + 1, '/', this.history.length)
    }

    undo() {
        if (this.canUndo()) {
            this.currentIndex--
            this.restoreState(this.history[this.currentIndex])
            this.emitStateChange()
            console.log('↩️ Undo performed:', this.currentIndex + 1, '/', this.history.length)
        }
    }

    redo() {
        if (this.canRedo()) {
            this.currentIndex++
            this.restoreState(this.history[this.currentIndex])
            this.emitStateChange()
            console.log('↪️ Redo performed:', this.currentIndex + 1, '/', this.history.length)
        }
    }

    canUndo() {
        return this.currentIndex > 0
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1
    }

    restoreState(state) {
        if (!this.editor || !state) return

        try {
            // Store current scroll position
            const canvas = this.editor.Canvas.getDocument()
            const scrollX = canvas.documentElement.scrollLeft
            const scrollY = canvas.documentElement.scrollTop

            // Restore content
            this.editor.setComponents(state.components)
            this.editor.setStyle(state.styles)

            // Restore scroll position
            setTimeout(() => {
                canvas.documentElement.scrollLeft = scrollX
                canvas.documentElement.scrollTop = scrollY
            }, 100)

        } catch (error) {
            console.error('Failed to restore state:', error)
        }
    }

    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer)
        }

        this.autoSaveTimer = setInterval(() => {
            this.performAutoSave()
        }, this.autoSaveInterval)

        console.log('📝 Auto-save started (interval:', this.autoSaveInterval, 'ms)')
    }

    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer)
            this.autoSaveTimer = null
            console.log('📝 Auto-save stopped')
        }
    }

    async performAutoSave() {
        if (this.isAutoSaving) return

        this.isAutoSaving = true

        try {
            const state = this.getCurrentState()
            if (!state) return

            // Check if there are changes since last auto-save
            if (this.lastAutoSave && this.isStateEqual(state, this.lastAutoSave)) {
                return
            }

            // Emit auto-save event
            const autoSaveEvent = new CustomEvent('history-manager:auto-save', {
                detail: { state }
            })
            document.dispatchEvent(autoSaveEvent)

            this.lastAutoSave = state
            console.log('📝 Auto-save completed')

        } catch (error) {
            console.error('Auto-save failed:', error)
        } finally {
            this.isAutoSaving = false
        }
    }

    isStateEqual(state1, state2) {
        if (!state1 || !state2) return false
        return JSON.stringify(state1.components) === JSON.stringify(state2.components) &&
               JSON.stringify(state1.styles) === JSON.stringify(state2.styles)
    }

    emitStateChange() {
        const stateChangeEvent = new CustomEvent('history-manager:state-changed', {
            detail: {
                canUndo: this.canUndo(),
                canRedo: this.canRedo(),
                currentIndex: this.currentIndex,
                totalStates: this.history.length
            }
        })
        document.dispatchEvent(stateChangeEvent)
    }

    // Public API methods
    getHistory() {
        return [...this.history]
    }

    getCurrentIndex() {
        return this.currentIndex
    }

    clearHistory() {
        this.history = []
        this.currentIndex = -1
        this.saveInitialState()
        console.log('📝 History cleared')
    }

    getStateAt(index) {
        return this.history[index] || null
    }

    jumpToState(index) {
        if (index >= 0 && index < this.history.length) {
            this.currentIndex = index
            this.restoreState(this.history[index])
            this.emitStateChange()
            console.log('📝 Jumped to state:', index + 1, '/', this.history.length)
        }
    }

    // Export/Import functionality
    exportHistory() {
        return {
            history: this.history,
            currentIndex: this.currentIndex,
            timestamp: Date.now()
        }
    }

    importHistory(data) {
        if (data && data.history && Array.isArray(data.history)) {
            this.history = data.history
            this.currentIndex = data.currentIndex || 0
            this.emitStateChange()
            console.log('📝 History imported')
        }
    }

    // Debug methods
    debug() {
        return {
            historySize: this.history.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            autoSaveInterval: this.autoSaveInterval,
            isAutoSaving: this.isAutoSaving,
            lastAutoSave: this.lastAutoSave ? new Date(this.lastAutoSave.timestamp) : null
        }
    }

    // Cleanup
    destroy() {
        this.stopAutoSave()
        clearTimeout(this.changeTimeout)
        this.history = []
        this.currentIndex = -1
        console.log('🧹 HistoryManager destroyed')
    }
}

export default HistoryManager