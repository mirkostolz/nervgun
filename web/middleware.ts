import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth');
  if (isApiAuth) return NextResponse.next();

  // Add security headers for all environments
  const response = NextResponse.next();
  
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
  
  // In production enforce auth redirect; in development allow access for testing
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