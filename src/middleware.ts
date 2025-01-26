import { NextRequest, NextResponse } from 'next/server';

// E.g,
// moz-extension://be7a91c9-3d06-42ae-8015-0a4e3b7d8155/manifest.json
// chrome-extension://hjgfggmfonhempnfochlbaehjncoknma/popup.html
const allowedOrigins = ['chrome-extension', 'moz-extension'];

const corsOptions = {
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT, BEACON',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export function middleware(request: NextRequest) {
  // Check the origin from the request
  const origin = request.headers.get('origin') ?? '';
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Handle preflighted requests
  const isPreflight = request.method === 'OPTIONS';

  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  // Handle actual request
  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
