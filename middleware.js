import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Always allow auth API, static files
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // If logged in and visiting landing or login → redirect to their dashboard
  if (token && (pathname === '/' || pathname === '/login')) {
    const accessLevel = token.profile?.access_level ?? 0;
    if (accessLevel >= 2) return NextResponse.redirect(new URL('/admin', request.url));
    return NextResponse.redirect(new URL('/app', request.url));
  }

  // Public routes (landing + login) for non-authenticated users
  if (pathname === '/' || pathname === '/login') {
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
  // Onboarding check for ALL logged-in users
  const isPublicPath = pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname === '/favicon.ico' || pathname === '/' || pathname === '/login';
  
  if (token && !isPublicPath && !pathname.startsWith('/api') && pathname !== '/app/my-card') {
    const profile = token.profile || {};
    if (!profile.card_made) {
      return NextResponse.redirect(new URL('/app/my-card?onboarding=1', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
