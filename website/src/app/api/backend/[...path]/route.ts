/**
 * Backend API Proxy
 * 
 * This proxies all requests from /api/backend/* to the Flask backend,
 * bypassing Cloudflare's bot protection on app.pagemade.site
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'DELETE');
}

async function proxyRequest(
  request: NextRequest,
  pathArray: string[],
  method: string
) {
  try {
    const path = pathArray.join('/');
    const backendUrl = `${BACKEND_URL}/${path}`;
    
    console.log(`[Proxy] ${method} ${path} -> ${backendUrl}`);
    
    // Get request body if present
    let body = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text();
      } catch (e) {
        // No body
      }
    }
    
    // Forward headers (excluding host)
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection') {
        headers[key] = value;
      }
    });
    
    // Make request to backend
    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
    });
    
    // Get response body
    const responseBody = await response.text();
    
    // Forward response headers
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (
        key.toLowerCase() !== 'content-encoding' &&
        key.toLowerCase() !== 'transfer-encoding'
      ) {
        responseHeaders.set(key, value);
      }
    });
    
    // Return response
    return new NextResponse(responseBody, {
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
