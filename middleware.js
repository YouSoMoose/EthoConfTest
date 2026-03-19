import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  try {
    // If the cookie header is insanely large, Node will 431. 
    // We try to catch it here at the Edge before the app server crashes.
    const cookieHeader = request.headers.get('cookie') || '';
    if (cookieHeader.length > 10000) {
      throw new Error('Cookie header too large');
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    // (No short-circuit) - allow middleware to rewrite the /carbon-game root to the static index
    const isStaticOrAuth = (
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/_next') ||
      pathname.includes('favicon') ||
      pathname.startsWith('/assets') ||
      // Allow static assets placed under /carbon-game/*
      pathname.startsWith('/carbon-game/') ||
      pathname.startsWith('/api/carbon-game') ||
      pathname === '/reset' || pathname === '/logout'
    );

    // Serve the static game's index directly when requesting /carbon-game
    if (pathname === '/carbon-game' || pathname === '/carbon-game/') {
      return NextResponse.rewrite(new URL('/carbon-game/index.html', request.url));
    }

    // Always allow auth API, resets, and static assets
    if (isStaticOrAuth) return NextResponse.next();

    // If logged in and visiting landing or login → redirect to their dashboard
    if (token && (pathname === '/' || pathname === '/login')) {
      return NextResponse.redirect(new URL('/app', request.url));
    }

    // Public routes (landing + login + staff-invite) for non-authenticated users
    if (pathname === '/' || pathname === '/login' || pathname === '/staff-invite' || pathname === '/app/staff-invite') {
      return NextResponse.next();
    }

    // Not logged in → redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const accessLevel = token.profile?.access_level ?? 0;

    // Protect /admin
    if (pathname.startsWith('/admin')) {
      // Level 0/1 can't access /admin at all
      if (accessLevel < 2) {
        return NextResponse.redirect(new URL('/app', request.url));
      }
      
      // Level 2 (Event Staff) restriction: Redirect away from management pages to QR Scanner
      const isManagementPage = pathname === '/admin' || 
                               pathname.startsWith('/admin/users') || 
                               pathname.startsWith('/admin/cards') ||
                               pathname.startsWith('/admin/announcements') ||
                               pathname.startsWith('/admin/voting-settings');
                               
      if (accessLevel === 2 && isManagementPage && pathname !== '/admin/checkin') {
        return NextResponse.redirect(new URL('/admin/checkin', request.url));
      }
    }

    // Check-in gating for attendees
    const isPublicPath = pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname === '/favicon.ico' || pathname === '/' || pathname === '/login';
    
    if (token && !isPublicPath && !pathname.startsWith('/api') && pathname !== '/app/my-card') {
      const profile = token.profile || {};
      // Gated by checked_in status (handles both boolean and TRUE/FALSE strings)
      const isCheckedIn = profile.checked_in === true || profile.checked_in === 'TRUE';
      if (!isCheckedIn && accessLevel < 2) {
        return NextResponse.redirect(new URL('/app/my-card?onboarding=1', request.url));
      }
    }

    return NextResponse.next();
    
  } catch (err) {
    // Bad/stale cookie or cookie too large — clear it and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    
    // Clear all possible NextAuth cookies
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('next-auth.callback-url');
    response.cookies.delete('next-auth.csrf-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.callback-url');
    response.cookies.delete('__Host-next-auth.csrf-token');
    
    // Also clear Supabase auth cookies just in case the user meant those
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
