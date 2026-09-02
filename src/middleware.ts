import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, Next.js assets, and api/auth routes
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

  // 1. If not authenticated and trying to access protected routes -> redirect to /login
  if (!isAuthenticated && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If authenticated and visiting /login or root / -> redirect to appropriate dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/')) {
    const target = role === 'assistant' ? '/cars' : '/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 3. Assistant Role restriction: Can ONLY access /cars and subroutes under /cars
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
