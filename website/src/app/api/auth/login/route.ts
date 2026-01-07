/**
 * Backend Auth Login Proxy
 * Proxies login requests to Flask backend to bypass Cloudflare
 * IMPORTANT: Forwards Set-Cookie header from backend for auth
 */

import { NextRequest, NextResponse } from 'next/server';

// In production, use internal network or direct URL
// BACKEND_URL should be set in .env.production or environment
const BACKEND_URL = process.env.BACKEND_URL || (
  process.env.NODE_ENV === 'production' 
    ? 'https://app.pagemade.site' 
    : 'http://localhost:5000'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    console.log('[Proxy] POST /api/auth/login -> ' + BACKEND_URL);
    
    // Forward to backend with production host header
    // This tells Flask we're in production so it sets correct cookie domain
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // CRITICAL: Tell Flask this is from pagemade.site so cookie domain is set correctly
        'Host': 'app.pagemade.site',
        'X-Forwarded-Host': 'app.pagemade.site',
        'X-Forwarded-Proto': 'https',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
      },
      body,
    });
    
    const data = await response.text();
    
    // Build response headers
    const responseHeaders = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    
    // CRITICAL: Forward Set-Cookie header from backend
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      console.log('[Proxy] Forwarding Set-Cookie header');
      responseHeaders.set('Set-Cookie', setCookie);
    }
    
    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Proxy error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
