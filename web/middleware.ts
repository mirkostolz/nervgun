import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth');
  if (isApiAuth) return NextResponse.next();

  // Re-enable authentication for production security
  const hasSession = req.cookies.has('next-auth.session-token') || 
                    req.cookies.has('__Secure-next-auth.session-token');
  
  if (!hasSession) {
    const login = new URL('/api/auth/signin', req.url);
    return NextResponse.redirect(login);
  }
  
  // Add security headers
  const response = NextResponse.next();
  
  // Security headers for production
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), clipboard-read=(), clipboard-write=()');
  
  // Content Security Policy
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "img-src 'self' data: blob:; " +
    "script-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'"
  );
  
  return response;
}

export const config = { 
  matcher: ['/', '/report/:path*', '/api/reports/:path*'] 
};