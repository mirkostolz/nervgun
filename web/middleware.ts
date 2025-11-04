import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth');
  if (isApiAuth) return NextResponse.next();

  const isApiRoute = req.nextUrl.pathname.startsWith('/api/');
  
  // Handle CORS preflight requests (OPTIONS) for API routes
  if (isApiRoute && req.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
    return response;
  }

  // Add security headers for all environments
  const response = NextResponse.next();
  
  // Add CORS headers for API routes (for Chrome extension support)
  if (isApiRoute) {
    response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  // Security headers for production
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), clipboard-read=(), clipboard-write=()');
  
  // Content Security Policy - relaxed for Next.js development
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "img-src 'self' data: blob:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'"
  );
  
  // Skip auth redirect for API routes (auth is handled in the routes themselves)
  if (isApiRoute) {
    return response;
  }
  
  // In production enforce auth redirect for pages; in development allow access for testing
  if (process.env.NODE_ENV === 'production') {
    const hasSession = req.cookies.has('next-auth.session-token') ||
                      req.cookies.has('__Secure-next-auth.session-token');
    if (!hasSession) {
      const login = new URL('/api/auth/signin', req.url);
      return NextResponse.redirect(login);
    }
  }

  return response;
}

export const config = { 
  matcher: ['/', '/report/:path*', '/api/reports/:path*'] 
};