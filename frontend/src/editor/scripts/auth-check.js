/**
 * Authentication Guard for PageMade Editor
 * Ensures user is authenticated before accessing editor
 */

class AuthGuard {
    constructor() {
        // NOTE: Do NOT process URL token here - it's handled in checkAuth() to prevent race conditions
        this.accessToken = localStorage.getItem('access_token')
        this.refreshToken = localStorage.getItem('refresh_token')
        this.user = JSON.parse(localStorage.getItem('user') || 'null')
    }

    /**
     * Check if user is authenticated (URL token or stored authentication)
     */
    isAuthenticated() {
        // First check: Do we have a stored access token (from URL or localStorage)?
        if (this.accessToken) {
            console.log('🔑 Access token found, authentication likely valid')
            return true
        }
        
        // Second check: Do we have stored user info (shared cookie approach)?
        const storedUser = this.getStoredUser()
        if (storedUser) {
            console.log('👤 Stored user found, authentication likely valid')
            return true
        }
        
        console.log('❌ No authentication found (no token, no stored user)')
        return false
    }

    /**
     * Get stored user from localStorage
     */
    getStoredUser() {
        try {
            const userStr = localStorage.getItem('user')
            return userStr ? JSON.parse(userStr) : null
        } catch (error) {
            console.error('Failed to parse stored user:', error)
            return null
        }
    }

    /**
     * Get current user info
     */
    getCurrentUser() {
        return this.getStoredUser()
    }

    /**
     * Redirect to backend login page with return URL
     */
    redirectToLogin(returnUrl = null) {
        const currentUrl = returnUrl || window.location.href
        // Dynamic login URL based on environment
        const baseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : 'https://app.pagemade.site'
        const loginUrl = `${baseUrl}/login?next=${encodeURIComponent(currentUrl)}`
        
        console.log('🔐 Redirecting to backend login:', loginUrl)
        window.location.href = loginUrl
    }

    /**
     * Redirect to backend dashboard
     */
    redirectToWebsite() {
        console.log('🏠 Redirecting to dashboard')
        const dashboardUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000/dashboard'
            : 'https://app.pagemade.site/dashboard'
        window.location.href = dashboardUrl
    }

    /**
     * Check authentication with backend (supports both token and shared cookie approach)
     * CRITICAL: Prioritize URL token processing before verification
     */
    async checkAuth() {
        console.log('🔐 Starting authentication check...')

        // 🚨 STEP 1: CHECK URL FOR TOKEN FIRST (HIGHEST PRIORITY)
        const urlParams = new URLSearchParams(window.location.search)
        const urlToken = urlParams.get('token')
        
        if (urlToken) {
            console.log('🔑 [PRIORITY] Found token in URL, processing immediately...')
            
            // Save token to localStorage
            localStorage.setItem('access_token', urlToken)
            this.accessToken = urlToken
            
            // Clean URL by removing token parameter
            urlParams.delete('token')
            const cleanUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '')
            window.history.replaceState({}, document.title, cleanUrl)
            
            console.log('✅ [PRIORITY] URL token saved to localStorage and URL cleaned')
            console.log('✅ [PRIORITY] Treating as authenticated - skipping backend verification for now')
            
            // Return TRUE immediately - user has fresh token from backend
            // Backend verification will happen on next API call
            return true
        }

        // 🚨 STEP 2: If no URL token, verify stored token with backend
        console.log('🔐 No URL token found, verifying stored authentication with backend...')

        try {
            const headers = {
                'Content-Type': 'application/json'
            }
            
            // If we have an access token, use Bearer authentication
            if (this.accessToken) {
                headers['Authorization'] = `Bearer ${this.accessToken}`
                console.log('🔑 Using token-based authentication')
            }

            // Dynamic API URL based on environment
            const apiBaseUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:5000'
                : 'https://app.pagemade.site'

            const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
                method: 'GET',
                credentials: 'include', // Include cookies for shared cookie approach
                headers: headers
            })

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('❌ Authentication failed (401) - stored token is invalid')
                    this.clearTokens()
                    
                    // 🚫 DO NOT auto-redirect here - throw error to let caller decide
                    throw new Error('Authentication failed: Token invalid or expired (401)')
                }
                throw new Error(`Authentication check failed: ${response.status}`)
            }

            const data = await response.json()
            console.log('✅ Authentication verified:', data.user)

            // Store user info in localStorage for UI purposes
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user))
                this.user = data.user
            }

            return true

        } catch (error) {
            console.error('❌ Authentication verification failed:', error)
            console.error('❌ Error details:', error.message)
            
            // Clear stored authentication info
            this.clearTokens()
            
            // 🚫 DO NOT auto-redirect - throw error to let main.js decide
            // Only redirect if there's NO token in URL (user came without token)
            const urlParams = new URLSearchParams(window.location.search)
            const urlToken = urlParams.get('token')
            
            if (!urlToken && !this.accessToken) {
                // No token anywhere - legitimate case for redirect
                console.log('🔐 No token found anywhere, redirecting to login is appropriate')
                this.redirectToLogin()
                return false
            } else {
                // Had token but failed - throw error for debugging
                throw new Error(`Authentication verification failed: ${error.message}`)
            }
        }
    }

    /**
     * Clear all authentication tokens
     */
    clearTokens() {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        
        this.accessToken = null
        this.refreshToken = null
        this.user = null
        
        console.log('🗑️ Authentication tokens cleared')
    }

    /**
     * Handle authentication errors from API calls
     */
    handleAuthError(error) {
        if (error.status === 401 || error.message === 'Token expired' || error.status === 401) {
            console.log('🔐 Authentication expired, redirecting to website login')
            this.clearTokens()
            this.redirectToLogin()
            return true
        }
        
        return false
    }

    /**
     * Get authorization header
     */
    getAuthHeader() {
        return this.accessToken ? `Bearer ${this.accessToken}` : null
    }

    /**
     * Setup periodic token refresh
     */
    setupTokenRefresh() {
        setInterval(async () => {
            if (this.accessToken) {
                try {
                    const payload = JSON.parse(atob(this.accessToken.split('.')[1]))
                    const expiryTime = payload.exp * 1000
                    const currentTime = Date.now()
                    const timeUntilExpiry = expiryTime - currentTime
                    
                    // Refresh if token expires in less than 5 minutes
                    if (timeUntilExpiry < 5 * 60 * 1000) {
                        await this.refreshToken()
                    }
                } catch (error) {
                    console.error('Token refresh check failed:', error)
                }
            }
        }, 60000) // Check every minute
    }

    /**
     * Refresh access token (not needed with HttpOnly shared cookies)
     */
    async refreshToken() {
        // With HttpOnly shared cookies, token refresh is handled by backend
        // This method is kept for backward compatibility but does nothing
        console.log('🔄 Token refresh not needed with shared cookies')
        return true
    }
}

// Create global auth guard instance
window.authGuard = new AuthGuard()

// Export for module usage
export default AuthGuard