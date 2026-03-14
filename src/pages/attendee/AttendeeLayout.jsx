import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import BottomNav from '../../components/BottomNav'
import { sb } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function AttendeeLayout() {
  const { profile } = useAuth()
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    if (!profile) return
    checkUnread()
    const interval = setInterval(checkUnread, 15000)
    return () => clearInterval(interval)
  }, [profile])

  async function checkUnread() {
    const { data } = await sb
      .from('messages')
      .select('id')
      .eq('to_user_id', profile.id)
      .eq('read', false)
      .limit(1)
    setHasUnread((data || []).length > 0)
  }

  return (
    <div className="page-wrap">
      <Outlet />
      <BottomNav hasUnread={hasUnread} />
    </div>
  )
}
