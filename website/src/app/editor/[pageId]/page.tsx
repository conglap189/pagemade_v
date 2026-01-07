'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Head from 'next/head'

interface PageData {
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

interface EditorResponse {
  success: boolean
  data?: PageData
  message?: string
}

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [editorUrl, setEditorUrl] = useState<string>('')

  useEffect(() => {
    const token = searchParams.get('token')
    const pageId = searchParams.get('pageId')

    if (!token || !pageId) {
      setError('Missing token or pageId')
      setLoading(false)
      return
    }

    verifyTokenAndLoadEditor(token, pageId)
  }, [searchParams])

  const verifyTokenAndLoadEditor = async (token: string, pageId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Verify token with backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://app.pagemade.site';
      const response = await fetch(`${apiUrl}/api/editor/verify-token/${token}`, {
        method: 'GET',
        credentials: 'include', // Important for session cookies
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result: EditorResponse = await response.json()

      if (!result.success || !result.data) {
        setError(result.message || 'Token verification failed')
        setLoading(false)
        return
      }

      // Verify pageId matches
      if (result.data.page_id.toString() !== pageId) {
        setError('Page ID mismatch')
        setLoading(false)
        return
      }

      setPageData(result.data)

      // Construct PageMade Editor URL
      const editorBaseUrl = process.env.NEXT_PUBLIC_EDITOR_URL || 'http://editor.pagemade.site';
      const editorUrl = `${editorBaseUrl}/editor/${pageId}?token=${token}&verified=true`
      setEditorUrl(editorUrl)

      setLoading(false)
    } catch (err) {
      console.error('Token verification error:', err)
      setError('Failed to verify token. Please try again.')
      setLoading(false)
    }
  }

  const handleGoToEditor = () => {
    if (editorUrl) {
      window.location.href = editorUrl
    }
  }

  const handleGoBack = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xác thực token và tải editor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lỗi Xác Thực</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleGoBack}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Quay lại Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử Lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>PageMade Editor - {pageData?.page_title || 'Loading...'}</title>
        <meta name="description" content="PageMade Editor - Professional page builder" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Chào mừng, {pageData?.user_name}!
          </h1>
          <p className="text-gray-600 mb-2">
            Đang chỉnh sửa: <span className="font-semibold">{pageData?.page_title}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Site: {pageData?.site_title} ({pageData?.site_subdomain}.pagemade.site)
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>PageMade Editor v3</strong> đang sẵn sàng!
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Editor sẽ mở trong tab mới với đầy đủ tính năng
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoToEditor}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Mở PageMade Editor
            </button>
            <button
              onClick={handleGoBack}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Quay lại Dashboard
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-400">
            <p>Token expires: {pageData ? new Date(pageData.token_expires_at * 1000).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
      </div>
    </>
  )
}