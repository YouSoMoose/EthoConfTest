import { updateSession } from './lib/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request) {
    try {
        return await updateSession(request)
    } catch (e) {
        // If middleware crashes for any reason, allow the request through
        console.error('Middleware error:', e?.message || e)
        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
