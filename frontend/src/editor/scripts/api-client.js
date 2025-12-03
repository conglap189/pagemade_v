/**
 * API Client for PageMade Frontend
 * Handles JWT authentication and API calls to backend
 */

class ApiClient {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:5000' 
            : 'https://api.pagemade.site'; // Production API URL
        
        // With Shared Cookie approach, we don't need to store tokens
        // Browser will automatically send HttpOnly cookie with each request
        this.accessToken = null;
        this.refreshToken = null;
        
        // No need for auto-refresh with HttpOnly cookies
        // Token refresh will be handled by backend when needed
    }

    /**
     * Setup automatic token refresh (Not needed with HttpOnly cookies)
     */
    setupTokenRefresh() {
        // With HttpOnly cookies, token refresh is handled by backend
        // No need for client-side token refresh
        return;
    }

    /**
     * Make API request with authentication
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        // Get JWT token from localStorage
        const token = localStorage.getItem('access_token');
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include', // Important: Include cookies for cross-origin requests
            ...options
        };

        // Add JWT Authorization header if token exists
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            // Handle authentication errors
            if (response.status === 401) {
                // 🚫 DO NOT auto-redirect - let caller handle the error
                // With HttpOnly cookies, if we get 401, it means cookie is invalid/expired
                const errorMsg = `Authentication failed (401) - ${data.error || 'Token invalid or expired'}`
                console.error('🚫 API Error:', errorMsg)
                console.error('🚫 URL:', url)
                console.error('🚫 Response:', data)
                
                // Throw error with details instead of auto-redirecting
                throw new Error(errorMsg)
            }

            if (!response.ok) {
                const errorMsg = data.error || `HTTP error! status: ${response.status}`
                console.error('🚫 API Error:', errorMsg)
                console.error('🚫 URL:', url)
                console.error('🚫 Response:', data)
                throw new Error(errorMsg);
            }

            return data;
        } catch (error) {
            console.error('❌ API request failed:', error);
            console.error('❌ Endpoint:', endpoint);
            throw error;
        }
    }

    /**
     * Refresh access token (Not needed with HttpOnly cookies)
     */
    async refreshAccessToken() {
        // With HttpOnly cookies, token refresh is handled by backend
        // This method is kept for backward compatibility but does nothing
        return false;
    }

    /**
     * Login with email and password
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Important: Include cookies
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                // With HttpOnly cookies, we don't store tokens
                // Just store user info in localStorage for UI purposes
                localStorage.setItem('user', JSON.stringify(data.data.user));
                
                return data.data;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            // Call logout endpoint to clear cookie
            await this.request('/api/auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            // Clear local storage
            localStorage.removeItem('user');
            
            // Redirect to website login page (port 3000)
            window.location.href = 'http://localhost:3000/login';
        }
    }

    /**
     * Get current user info
     */
    async getCurrentUser() {
        try {
            const data = await this.request('/api/auth/me');
            return data.success ? data.data.user : null;
        } catch (error) {
            console.error('Get current user failed:', error);
            return null;
        }
    }

    /**
     * Get stored user from localStorage
     */
    getStoredUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Failed to parse stored user:', error);
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        // With HttpOnly cookies, we can't check token directly
        // We'll rely on stored user info and API calls to verify auth
        return !!this.getStoredUser();
    }

    /**
     * Get pages for a site
     */
    async getPages(siteId) {
        try {
            const data = await this.request(`/api/sites/${siteId}/pages`);
            return data.success ? data.data.pages : [];
        } catch (error) {
            console.error('Get pages failed:', error);
            return [];
        }
    }

    /**
     * Get page data
     */
    async getPage(pageId) {
        try {
            const data = await this.request(`/api/pages/${pageId}/content`);
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Get page failed:', error);
            return null;
        }
    }

    /**
     * Save page data (general endpoint - updates metadata)
     */
    async savePage(pageId, pageData) {
        try {
            const data = await this.request(`/api/pages/${pageId}`, {
                method: 'PUT',
                body: JSON.stringify(pageData)
            });
            return data.success;
        } catch (error) {
            console.error('Save page failed:', error);
            return false;
        }
    }

    /**
     * Save PageMade/GrapesJS content
     */
    async savePageMadeContent(pageId, gjsData) {
        try {
            console.log('🔌 [API] savePageMadeContent called for page:', pageId)
            console.log('🔌 [API] Token exists:', !!localStorage.getItem('access_token'))
            
            const data = await this.request(`/api/pages/${pageId}/pagemade/save`, {
                method: 'POST',
                body: JSON.stringify(gjsData)
            });
            
            console.log('🔌 [API] Response:', data)
            return data.success;
        } catch (error) {
            console.error('🔌 [API] Save PageMade content failed:', error);
            return false;
        }
    }

    /**
     * Get sites for current user
     */
    async getSites() {
        try {
            const data = await this.request('/api/sites');
            return data.success ? data.data.sites : [];
        } catch (error) {
            console.error('Get sites failed:', error);
            return [];
        }
    }

    /**
     * Upload asset
     */
    async uploadAsset(file, siteId) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('site_id', siteId);

            const response = await fetch(`${this.baseURL}/api/assets/upload`, {
                method: 'POST',
                credentials: 'include', // Important: Include cookies
                body: formData
            });

            const data = await response.json();
            return data.success ? data.data.asset : null;
        } catch (error) {
            console.error('Upload asset failed:', error);
            return null;
        }
    }

    /**
     * Get assets for a site
     */
    async getAssets(siteId) {
        try {
            const data = await this.request(`/api/sites/${siteId}/assets`);
            return data.success ? data.data.assets : [];
        } catch (error) {
            console.error('Get assets failed:', error);
            return [];
        }
    }

    /**
     * Publish a page
     */
    async publishPage(pageId, pageData) {
        try {
            const data = await this.request(`/api/pages/${pageId}/publish`, {
                method: 'POST',
                body: JSON.stringify(pageData)
            });
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Publish page failed:', error);
            throw error;
        }
    }

    /**
     * Verify editor token
     */
    async verifyEditorToken(token) {
        try {
            const data = await this.request(`/api/editor/verify-token/${token}`);
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Token verification failed:', error);
            throw error;
        }
    }
}

// Export for ES6 module usage
export default ApiClient;