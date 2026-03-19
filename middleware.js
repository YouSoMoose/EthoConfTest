import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Helper: properly expire a cookie so the browser actually deletes it
function killCookie(response, name) {
  response.cookies.set(name, '', {
    maxAge: 0,
    path: '/',
    expires: new Date(0),
  });
  // Also try the __Secure- and __Host- prefixed variants
  response.cookies.set(`__Secure-${name}`, '', {
    maxAge: 0,
    path: '/',
    expires: new Date(0),
    secure: true,
  });
}

const ALL_COOKIES = [
  'next-auth.session-token',
  'next-auth.callback-url',
  'next-auth.csrf-token',
  '__Host-next-auth.csrf-token',
  'sb-access-token',
  'sb-refresh-token',
];

export async function middleware(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';

    const hasLegacyCookies =
      request.cookies.has('sb-access-token') ||
      request.cookies.has('sb-refresh-token');

    // Cookie header too large OR legacy Supabase cookies present → nuke & redirect to login
    if (cookieHeader.length > 8000 || hasLegacyCookies) {
      const errorResponse = NextResponse.redirect(new URL('/login', request.url));
      ALL_COOKIES.forEach(name => killCookie(errorResponse, name));
      return errorResponse;
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    const isStaticOrAuth = (
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/_next') ||
      pathname.includes('favicon') ||
      pathname.startsWith('/assets') ||
      pathname.startsWith('/carbon-game/') ||
      pathname.startsWith('/api/carbon-game') ||
      pathname === '/reset' || pathname === '/logout'
    );

    if (pathname === '/carbon-game' || pathname === '/carbon-game/') {
      return NextResponse.rewrite(new URL('/carbon-game/index.html', request.url));
    }

    if (isStaticOrAuth) return NextResponse.next();

    if (token && (pathname === '/' || pathname === '/login')) {
      return NextResponse.redirect(new URL('/app', request.url));
    }

    if (pathname === '/' || pathname === '/login' || pathname === '/staff-invite' || pathname === '/app/staff-invite') {
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const accessLevel = token.profile?.access_level ?? 0;

    if (pathname.startsWith('/admin')) {
      if (accessLevel < 2) {
        return NextResponse.redirect(new URL('/app', request.url));
      }

      const isManagementPage =
        pathname === '/admin' ||
        pathname.startsWith('/admin/users') ||
        pathname.startsWith('/admin/cards') ||
        pathname.startsWith('/admin/announcements') ||
        pathname.startsWith('/admin/voting-settings');

      if (accessLevel === 2 && isManagementPage && pathname !== '/admin/checkin') {
        return NextResponse.redirect(new URL('/admin/checkin', request.url));
      }
    }

    const isPublicPath =
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/_next') ||
      pathname === '/favicon.ico' ||
      pathname === '/' ||
      pathname === '/login';

    if (token && !isPublicPath && !pathname.startsWith('/api') && !pathname.startsWith('/app/my-card')) {
      const profile = token.profile || {};
      const isCheckedIn = profile.checked_in === true || profile.checked_in === 'TRUE';
      if (!isCheckedIn && accessLevel < 2) {
        return NextResponse.redirect(new URL('/app/my-card?onboarding=1', request.url));
      }
    }

    return NextResponse.next();

  } catch (err) {
    // Bad/stale cookie — nuke everything and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    ALL_COOKIES.forEach(name => killCookie(response, name));
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};