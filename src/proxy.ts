import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const role = request.cookies.get('taban_admin_role')?.value;
  const auth = request.cookies.get('taban_admin_auth')?.value;

  const isAuthenticated = auth === 'authenticated' && !!role;

  // 1. Unauthenticated access -> redirect to /login
  if (!isAuthenticated && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user visiting /login or root / -> redirect to dashboard/cars
  if (isAuthenticated && (pathname === '/login' || pathname === '/')) {
    const target = role === 'assistant' ? '/cars' : '/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 3. Assistant Role restriction: Can ONLY access /cars and subroutes
  if (isAuthenticated && role === 'assistant') {
    if (!pathname.startsWith('/cars') && pathname !== '/api/auth/logout') {
      return NextResponse.redirect(new URL('/cars', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
