import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
    let supabaseResponse = NextResponse.next({ request })

    // Skip if Supabase env vars aren't set (e.g. during build)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return supabaseResponse
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    let user = null
    try {
        const { data } = await supabase.auth.getUser()
        user = data?.user ?? null
    } catch {
        return supabaseResponse
    }

    const pathname = request.nextUrl.pathname

    // Auth callback — always allow
    if (pathname.startsWith('/auth/callback')) {
        return supabaseResponse
    }

    // Protected: /app/* requires auth
    if (pathname.startsWith('/app') && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Protected: /admin/* requires auth
    if (pathname.startsWith('/admin') && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from / and /login
    if (user && (pathname === '/' || pathname === '/login')) {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('access_level')
                .eq('id', user.id)
                .single()

            const level = profile?.access_level ?? 0
            const url = request.nextUrl.clone()
            url.pathname = level >= 2 ? '/admin' : '/app'
            return NextResponse.redirect(url)
        } catch {
            const url = request.nextUrl.clone()
            url.pathname = '/app'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
