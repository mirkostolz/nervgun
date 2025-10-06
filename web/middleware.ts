import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth');
  if (isApiAuth) return NextResponse.next();

  // Temporarily disable auth for testing
  // const hasSession = req.cookies.has('next-auth.session-token') || 
  //                   req.cookies.has('__Secure-next-auth.session-token');
  
  // if (!hasSession) {
  //   const login = new URL('/api/auth/signin', req.url);
  //   return NextResponse.redirect(login);
  // }
  
  return NextResponse.next();
}

export const config = { 
  matcher: ['/', '/report/:path*', '/api/reports/:path*'] 
};