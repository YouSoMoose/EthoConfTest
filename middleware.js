import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Public routes
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Not logged in → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const accessLevel = token.profile?.access_level ?? 0;

  // Protect /admin — requires level >= 2
  if (pathname.startsWith('/admin')) {
    if (accessLevel < 2) {
      return NextResponse.redirect(new URL('/app', request.url));
    }
  }

  // Protect /company — requires level === 1 or level >= 2
  if (pathname.startsWith('/company')) {
    if (accessLevel < 1) {
      return NextResponse.redirect(new URL('/app', request.url));
    }
  }

  // Redirect root-level authenticated users based on access level
  if (pathname === '/login') {
    if (accessLevel >= 2) return NextResponse.redirect(new URL('/admin', request.url));
    if (accessLevel === 1) return NextResponse.redirect(new URL('/company', request.url));
    return NextResponse.redirect(new URL('/app', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
