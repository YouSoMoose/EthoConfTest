'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const AuthCtx = createContext({
    session: undefined,
    profile: null,
    loading: true,
    signOut: () => { },
    refreshProfile: () => { },
    setProfile: () => { },
    supabase: null,
})

export function AuthProvider({ children }) {
    const [session, setSession] = useState(undefined)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session) loadProfile(session.user)
            else setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (session) loadProfile(session.user)
            else { setProfile(null); setLoading(false) }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function loadProfile(user) {
        setLoading(true)
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()

        if (error || !data) {
            const newProfile = {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                avatar_url: user.user_metadata?.avatar_url || null,
                access_level: 0,
                resume_url: null,
                checked_in: false,
                created_at: new Date().toISOString(),
            }
            await supabase.from('profiles').insert(newProfile)
            setProfile(newProfile)
        } else {
            setProfile(data)
        }
        setLoading(false)
    }

    async function signOut() {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    async function refreshProfile() {
        if (!session?.user) return
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (data) setProfile(data)
    }

    return (
        <AuthCtx.Provider value={{ session, profile, loading, signOut, refreshProfile, setProfile, supabase }}>
            {children}
        </AuthCtx.Provider>
    )
}

export function useAuth() {
    return useContext(AuthCtx)
}
