/**
 * Theme Manager
 * Handles dark/light theme switching with localStorage persistence
 */

export class ThemeManager {
    constructor() {
        this.storageKey = 'pagemade-theme'
        this.darkClass = 'dark'
        this.currentTheme = 'light'
        this.isInitialized = false
    }

    init() {
        this.loadSavedTheme()
        this.setupSystemThemeListener()
        this.isInitialized = true
        console.log('🎨 ThemeManager initialized with theme:', this.currentTheme)
    }

    loadSavedTheme() {
        // Try to get from localStorage first
        const savedTheme = localStorage.getItem(this.storageKey)
        
        if (savedTheme) {
            this.setTheme(savedTheme)
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            this.setTheme(prefersDark ? 'dark' : 'light')
        }
    }

    setupSystemThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        
        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!localStorage.getItem(this.storageKey)) {
                this.setTheme(e.matches ? 'dark' : 'light')
            }
        })
    }

    setTheme(theme) {
        if (!['light', 'dark'].includes(theme)) {
            console.warn('Invalid theme:', theme)
            return
        }

        this.currentTheme = theme
        const html = document.documentElement
        
        if (theme === 'dark') {
            html.classList.add(this.darkClass)
        } else {
            html.classList.remove(this.darkClass)
        }

        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme)
        
        // Emit custom event for other components
        this.emitThemeChange(theme)
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light'
        this.setTheme(newTheme)
        this.saveTheme(newTheme)
        return newTheme
    }

    saveTheme(theme) {
        localStorage.setItem(this.storageKey, theme)
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

    updateMetaThemeColor(theme) {
        const themeColor = theme === 'dark' ? '#1f2937' : '#667eea'
        let metaThemeColor = document.querySelector('meta[name="theme-color"]')
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta')
            metaThemeColor.name = 'theme-color'
            document.head.appendChild(metaThemeColor)
        }
        
        metaThemeColor.content = themeColor
    }

    emitThemeChange(theme) {
        const event = new CustomEvent('themechange', {
            detail: { theme, isDark: theme === 'dark' }
        })
        document.dispatchEvent(event)
    }

    // Get CSS custom properties for current theme
    getThemeColors() {
        const rootStyles = getComputedStyle(document.documentElement)
        
        return {
            primary: rootStyles.getPropertyValue('--color-primary').trim() || '#667eea',
            background: rootStyles.getPropertyValue('--color-background').trim() || (this.isDarkMode() ? '#1f2937' : '#ffffff'),
            surface: rootStyles.getPropertyValue('--color-surface').trim() || (this.isDarkMode() ? '#374151' : '#f9fafb'),
            text: rootStyles.getPropertyValue('--color-text').trim() || (this.isDarkMode() ? '#f9fafb' : '#1f2937'),
            border: rootStyles.getPropertyValue('--color-border').trim() || (this.isDarkMode() ? '#4b5563' : '#e5e7eb')
        }
    }

    // Apply theme to specific element
    applyThemeToElement(element, theme = null) {
        const targetTheme = theme || this.currentTheme
        
        if (targetTheme === 'dark') {
            element.classList.add(this.darkClass)
        } else {
            element.classList.remove(this.darkClass)
        }
    }

    // Reset theme to system preference
    resetToSystemTheme() {
        localStorage.removeItem(this.storageKey)
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.setTheme(prefersDark ? 'dark' : 'light')
    }

    // Get theme statistics
    getThemeStats() {
        return {
            current: this.currentTheme,
            isDark: this.isDarkMode(),
            isLight: this.isLightMode(),
            hasUserPreference: !!localStorage.getItem(this.storageKey),
            systemPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
            colors: this.getThemeColors()
        }
    }

    // Export theme configuration
    exportTheme() {
        return {
            theme: this.currentTheme,
            colors: this.getThemeColors(),
            timestamp: new Date().toISOString()
        }
    }

    // Import theme configuration
    importTheme(config) {
        if (config && config.theme) {
            this.setTheme(config.theme)
            this.saveTheme(config.theme)
            return true
        }
        return false
    }

    // Cleanup method
    destroy() {
        // Remove event listeners if needed
        this.isInitialized = false
        console.log('🧹 ThemeManager destroyed')
    }
}

// Export singleton instance for easy access
export const themeManager = new ThemeManager()

export default themeManager