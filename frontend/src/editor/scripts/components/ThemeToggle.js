/**
 * Theme Toggle Component
 * Handles dark/light theme switching button
 */

export class ThemeToggle {
    constructor(themeManager) {
        this.themeManager = themeManager
        this.toggleButton = null
        this.isInitialized = false
        this.currentTheme = 'light'
        
        console.log('🎨 ThemeToggle component created')
    }

    init() {
        this.initializeElements()
        this.setupEventListeners()
        this.updateButtonState()
        this.isInitialized = true
        console.log('🎨 ThemeToggle initialized')
    }

    initializeElements() {
        this.toggleButton = document.getElementById('darkModeToggle')
        
        if (!this.toggleButton) {
            console.warn('Theme toggle button not found')
            return
        }

        // Set initial icon
        this.updateButtonIcon()
    }

    setupEventListeners() {
        if (!this.toggleButton) return

        this.toggleButton.addEventListener('click', () => {
            this.handleToggle()
        })

        // Listen to theme changes from ThemeManager
        document.addEventListener('themechange', (e) => {
            this.currentTheme = e.detail.theme
            this.updateButtonState()
        })

        // Listen to system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', () => {
            // Only update if user hasn't manually set preference
            if (!localStorage.getItem('pagemade-theme')) {
                this.updateButtonState()
            }
        })

        console.log('🎨 ThemeToggle event listeners setup complete')
    }

    handleToggle() {
        if (!this.themeManager) return

        const newTheme = this.themeManager.toggleTheme()
        this.currentTheme = newTheme
        this.updateButtonState()

        // Emit custom event
        const toggleEvent = new CustomEvent('theme-toggle:changed', {
            detail: { 
                theme: newTheme,
                isDark: newTheme === 'dark',
                source: 'user'
            }
        })
        document.dispatchEvent(toggleEvent)

        console.log('🎨 Theme toggled to:', newTheme)
    }

    updateButtonState() {
        if (!this.toggleButton) return

        this.updateButtonIcon()
        this.updateButtonTitle()
        this.updateButtonAria()
    }

    updateButtonIcon() {
        if (!this.toggleButton) return

        const icon = this.toggleButton.querySelector('i')
        if (!icon) return

        const currentTheme = this.themeManager ? this.themeManager.getCurrentTheme() : 'light'
        
        // Remove all theme icon classes
        icon.classList.remove('fa-moon', 'fa-sun')
        
        // Add appropriate icon
        if (currentTheme === 'dark') {
            icon.classList.add('fa-sun')
        } else {
            icon.classList.add('fa-moon')
        }
    }

    updateButtonTitle() {
        if (!this.toggleButton) return

        const currentTheme = this.themeManager ? this.themeManager.getCurrentTheme() : 'light'
        const title = currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
        this.toggleButton.setAttribute('title', title)
    }

    updateButtonAria() {
        if (!this.toggleButton) return

        const currentTheme = this.themeManager ? this.themeManager.getCurrentTheme() : 'light'
        const label = currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        this.toggleButton.setAttribute('aria-label', label)
    }

    // Keyboard accessibility
    handleKeydown(e) {
        if (!this.toggleButton) return

        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault()
                this.handleToggle()
                break
            case 'Escape':
                this.toggleButton.blur()
                break
        }
    }

    // Public API methods
    setTheme(theme) {
        if (!this.themeManager || !['light', 'dark'].includes(theme)) return

        this.themeManager.setTheme(theme)
        this.currentTheme = theme
        this.updateButtonState()
    }

    getCurrentTheme() {
        return this.currentTheme
    }

    isDarkMode() {
        return this.currentTheme === 'dark'
    }

    isLightMode() {
        return this.currentTheme === 'light'
    }

    // Animation methods
    animateToggle() {
        if (!this.toggleButton) return

        this.toggleButton.style.transform = 'rotate(180deg)'
        this.toggleButton.style.transition = 'transform 0.3s ease'

        setTimeout(() => {
            this.toggleButton.style.transform = 'rotate(0deg)'
        }, 300)
    }

    // State management
    getState() {
        return {
            currentTheme: this.currentTheme,
            isDark: this.isDarkMode(),
            isLight: this.isLightMode(),
            hasButton: !!this.toggleButton,
            isInitialized: this.isInitialized
        }
    }

    // Accessibility helpers
    focus() {
        if (this.toggleButton) {
            this.toggleButton.focus()
        }
    }

    blur() {
        if (this.toggleButton) {
            this.toggleButton.blur()
        }
    }

    // Visual feedback
    showFeedback() {
        if (!this.toggleButton) return

        this.toggleButton.classList.add('theme-toggle-feedback')
        
        setTimeout(() => {
            this.toggleButton.classList.remove('theme-toggle-feedback')
        }, 500)
    }

    // Integration with other components
    onThemeChange(callback) {
        if (typeof callback !== 'function') return

        document.addEventListener('themechange', (e) => {
            callback(e.detail)
        })
    }

    onToggle(callback) {
        if (typeof callback !== 'function') return

        document.addEventListener('theme-toggle:changed', (e) => {
            callback(e.detail)
        })
    }

    // Debug methods
    debug() {
        return {
            element: this.toggleButton,
            currentTheme: this.currentTheme,
            themeManagerState: this.themeManager ? this.themeManager.getThemeStats() : null,
            localStorageTheme: localStorage.getItem('pagemade-theme'),
            systemPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
        }
    }

    // Cleanup
    destroy() {
        if (this.toggleButton) {
            // Clone element to remove all event listeners
            const newButton = this.toggleButton.cloneNode(true)
            this.toggleButton.parentNode.replaceChild(newButton, this.toggleButton)
            this.toggleButton = newButton
        }

        this.isInitialized = false
        console.log('🧹 ThemeToggle component destroyed')
    }
}

export default ThemeToggle