'use client'

import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function AttendeeLayout({ children }) {
    const { profile } = useAuth()
    const [hasUnread, setHasUnread] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (!profile) return
        checkUnread()
        const interval = setInterval(checkUnread, 15000)
        return () => clearInterval(interval)
    }, [profile])

    async function checkUnread() {
        const { data } = await supabase
            .from('messages')
            .select('id')
            .eq('to_user_id', profile.id)
            .eq('read', false)
            .limit(1)
        setHasUnread((data || []).length > 0)
    }

    return (
        <div className="page-wrap">
            {children}
            <BottomNav hasUnread={hasUnread} />
        </div>
    )
}
