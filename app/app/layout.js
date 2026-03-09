'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import Loader from '@/components/Loader'

export default function AttendeeLayout({ children }) {
    const { profile, loading } = useAuth()
    const [hasUnread, setHasUnread] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (!profile?.id) return
        checkUnread()
        const interval = setInterval(checkUnread, 15000)
        return () => clearInterval(interval)
    }, [profile?.id])

    async function checkUnread() {
        if (!profile?.id) return
        const { data } = await supabase
            .from('messages')
            .select('id')
            .eq('to_user_id', profile?.id)
            .eq('read', false)
            .limit(1)
        setHasUnread((data || []).length > 0)
    }

    if (loading || !profile) return <Loader fullPage />

    return (
        <div className="page-wrap">
            {children}
            <BottomNav hasUnread={hasUnread} />
        </div>
    )
}
