import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard') || 
                          request.nextUrl.pathname.startsWith('/update-activity');

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (token && isAuthPage) {
    const decoded = verifyToken(token);
    if (decoded) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If user is not logged in and trying to access protected pages, redirect to login
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If user has invalid token and trying to access protected pages, redirect to login
  if (token && isProtectedPage) {
    const decoded = verifyToken(token);
    if (!decoded) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.set('token', '', { maxAge: 0 });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/update-activity/:path*', '/auth/:path*']
};