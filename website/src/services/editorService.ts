/**
 * PageMade Editor Integration Service
 * Handles communication between frontend (port 3000) and backend (port 5000)
 */

export interface PageData {
  page_id: number
  page_title: string
  site_id: number
  site_subdomain: string
  site_title: string
  user_id: number
  user_name: string
  user_email: string
  token_expires_at: number
}

export interface EditorResponse {
  success: boolean
  data?: PageData
  message?: string
}

export interface PageContentResponse {
  success: boolean
  data?: {
    page: any
    site: any
    user: any
    endpoints: any
  }
  message?: string
}

class EditorService {
  private readonly BACKEND_URL = 'http://localhost:5000'
  private readonly FRONTEND_EDITOR_URL = 'http://localhost:3001/editor'

  /**
   * Verify editor token with backend
   */
  async verifyToken(token: string): Promise<EditorResponse> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/editor/verify-token/${token}`, {
        method: 'GET',
        credentials: 'include', // Important for session cookies
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Token verification error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred'
      }
    }
  }

  /**
   * Get page content for editor
   */
  async getPageContent(pageId: number, token: string): Promise<PageContentResponse> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/editor/template-data/${pageId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get page content error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to load page content'
      }
    }
  }

  /**
   * Save page content
   */
  async savePageContent(pageId: number, content: any, token: string): Promise<EditorResponse> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/pages/${pageId}/pagemaker/save`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Save page content error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save page content'
      }
    }
  }

  /**
   * Publish page
   */
  async publishPage(pageId: number, token: string): Promise<EditorResponse> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/pages/${pageId}/publish`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Publish page error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to publish page'
      }
    }
  }

  /**
   * Upload asset
   */
  async uploadAsset(pageId: number, file: File, token: string): Promise<any> {
    try {
      const formData = new FormData()
      formData.append('files', file)

      const response = await fetch(`${this.BACKEND_URL}/api/pages/${pageId}/upload-asset`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Upload asset error:', error)
      throw error
    }
  }

  /**
   * Generate preview
   */
  async generatePreview(pageId: number, token: string): Promise<EditorResponse> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/pages/${pageId}/preview`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Generate preview error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate preview'
      }
    }
  }

  /**
   * Get editor URL with token
   */
  getEditorUrl(pageId: number, token: string): string {
    return `${this.FRONTEND_EDITOR_URL}/${pageId}?token=${token}&verified=true`
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(expiresAt: number): boolean {
    return Date.now() / 1000 > expiresAt
  }

  /**
   * Format expiration time
   */
  formatExpirationTime(expiresAt: number): string {
    return new Date(expiresAt * 1000).toLocaleString()
  }
}

// Export singleton instance
export const editorService = new EditorService()

// Export types
export type { EditorService }