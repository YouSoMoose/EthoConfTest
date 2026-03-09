import { NextResponse } from 'next/server'

export async function middleware(request) {
    const { pathname } = request.nextUrl

    // Check for Supabase auth cookies (they start with "sb-")
    const allCookies = request.cookies.getAll()
    const hasAuthCookie = allCookies.some(
        (c) => c.name.includes('auth-token') || c.name.startsWith('sb-')
    )

    // Protected: /app/* and /admin/* require auth cookie
    if ((pathname.startsWith('/app') || pathname.startsWith('/admin')) && !hasAuthCookie) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Redirect logged-in users away from landing and login pages
    if (hasAuthCookie && (pathname === '/' || pathname === '/login')) {
        const url = request.nextUrl.clone()
        url.pathname = '/app'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
