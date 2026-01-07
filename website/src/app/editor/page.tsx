'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EditorLandingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [sites, setSites] = useState<any[]>([])
  const [pages, setPages] = useState<any[]>([])
  const [selectedSite, setSelectedSite] = useState<any>(null)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      setLoading(true)
      
      // Check if user info exists in localStorage
      const userStr = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');
      
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setAuthenticated(true);
        console.log('✅ User loaded from localStorage:', userData.email);
        
        // Get user's sites using token
        const apiUrl = '/api/auth/me'; // Use Next.js proxy
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers,
        });
        
        if (!response.ok) {
          console.warn('⚠️ API validation failed, using cached user data');
        }
        
        // Continue with loading sites...
        return;
      }
      
      // If no cached user, try API
      const apiUrl = '/api/auth/me';
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data.user) {
          setAuthenticated(true)
          setUser(result.data.user)
          
          // Get user's sites
          const sitesResponse = await fetch(`${apiUrl}/api/sites`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (sitesResponse.ok) {
            const sitesResult = await sitesResponse.json()
            if (sitesResult.success && sitesResult.data.sites.length > 0) {
              setSites(sitesResult.data.sites)
              const firstSite = sitesResult.data.sites[0]
              setSelectedSite(firstSite)
              
              // Get pages for this site
              const pagesResponse = await fetch(`${apiUrl}/api/sites/${firstSite.id}/pages`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
              })

              if (pagesResponse.ok) {
                const pagesResult = await pagesResponse.json()
                if (pagesResult.success) {
                  setPages(pagesResult.data.pages || [])
                }
              }
            } else {
              // If no sites, redirect to dashboard to create one
              router.push('/dashboard')
              return
            }
          }
        } else {
          setAuthenticated(false)
        }
      } else {
        setAuthenticated(false)
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleGoToLogin = () => {
    router.push('/signin')
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  const handleSiteChange = async (siteId: string) => {
    const site = sites.find(s => s.id === siteId)
    if (site) {
      setSelectedSite(site)
      setLoading(true)
      
      // Get pages for this site
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://app.pagemade.site';
        const pagesResponse = await fetch(`${apiUrl}/api/sites/${siteId}/pages`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (pagesResponse.ok) {
          const pagesResult = await pagesResponse.json()
          if (pagesResult.success) {
            setPages(pagesResult.data.pages || [])
          }
        }
      } catch (error) {
        console.error('Error loading pages:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleEditPage = (pageId: string) => {
    // Open editor in new tab/window instead of redirecting
    const editorUrl = process.env.NEXT_PUBLIC_EDITOR_URL || 'http://editor.pagemade.site';
    window.open(`${editorUrl}/editor/${pageId}`, '_blank')
  }

  const handleCreatePage = () => {
    if (selectedSite) {
      // Navigate to create page interface
      router.push(`/dashboard/sites/${selectedSite.id}/pages/new`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-blue-500 text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu Cầu Đăng Nhập</h1>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để truy cập PageMade Editor
          </p>
          <div className="space-y-3">
            <button
              onClick={handleGoToLogin}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated, show editor interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PageMade Editor</h1>
              <p className="text-sm text-gray-500">Chào mừng, {user?.name}!</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleGoToDashboard}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/dashboard/sites/new')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tạo Site Mới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Site Selection */}
            {sites.length > 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Chọn Website</h2>
                <select
                  value={selectedSite?.id || ''}
                  onChange={(e) => handleSiteChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Pages List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Trang của {selectedSite?.name}
                  </h2>
                  <button
                    onClick={handleCreatePage}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Tạo Trang Mới
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {pages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">📄</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có trang nào</h3>
                    <p className="text-gray-500 mb-4">
                      Tạo trang đầu tiên để bắt đầu thiết kế website
                    </p>
                    <button
                      onClick={handleCreatePage}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Tạo Trang Đầu Tiên
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pages.map((page) => (
                      <div key={page.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-medium text-gray-900 mb-2">{page.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{page.slug}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPage(page.id)}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={() => window.open(`/preview/${page.slug}`, '_blank')}
                            className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-300 transition-colors"
                          >
                            Xem trước
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}