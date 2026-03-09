'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { timeAgo, formatTime } from '@/lib/utils'

export default function HomePage() {
    const { profile } = useAuth()
    const router = useRouter()
    const supabase = createClient()
    const [announcements, setAnnouncements] = useState([])
    const [nextEvent, setNextEvent] = useState(null)

    useEffect(() => {
        supabase.from('messages')
            .select('*').eq('to_user_id', 'broadcast')
            .order('created_at', { ascending: false }).limit(3)
            .then(({ data }) => setAnnouncements(data || []))

        supabase.from('schedule_items')
            .select('*').gte('start_time', new Date().toISOString())
            .order('start_time').limit(1)
            .then(({ data }) => setNextEvent((data || [])[0] || null))
    }, [])

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const firstName = (profile?.full_name || '').split(' ')[0]

    const QUICK = [
        { ico: '🗓️', name: 'Schedule', desc: 'Full agenda', to: '/app/schedule' },
        { ico: '🏆', name: 'Pitch Room', desc: 'Vote on startups', to: '/app/pitches' },
        { ico: '🗺️', name: 'Passport', desc: 'Track booths', to: '/app/passport' },
        { ico: '📝', name: 'Notes', desc: 'Keynote notes', to: '/app/notes' },
        { ico: '💬', name: 'Chat', desc: 'Message staff', to: '/app/chat' },
        { ico: '🪪', name: 'My Card', desc: 'Your profile QR', to: '/app/my-card' },
    ]

    return (
        <>
            <div className="dash-hero">
                <div className="dash-label">Ethos 2025</div>
                <div className="dash-hi">{greeting},<br />{firstName} 👋</div>
                <div className="dash-date">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="content" style={{ paddingTop: 16 }}>
                {nextEvent && (
                    <div className="card accent" style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, fontFamily: 'var(--fh)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>
                            Up Next
                        </div>
                        <div className="card-title">{nextEvent.title}</div>
                        <div className="card-sub">
                            {nextEvent.location} · {formatTime(nextEvent.start_time)}
                        </div>
                    </div>
                )}

                <div className="sec">Quick Access</div>
                <div className="quick-grid">
                    {QUICK.map(q => (
                        <div key={q.name} className="quick-tile" onClick={() => router.push(q.to)}>
                            <div className="quick-ico">{q.ico}</div>
                            <div className="quick-name">{q.name}</div>
                            <div className="quick-desc">{q.desc}</div>
                        </div>
                    ))}
                </div>

                {announcements.length > 0 && (
                    <>
                        <div className="sec">Announcements</div>
                        {announcements.map(a => (
                            <div key={a.id} className="card" style={{ marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                    <div className="card-title" style={{ fontSize: 13 }}>📣 {a.body?.slice(0, 100)}</div>
                                    <div style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{timeAgo(a.created_at)}</div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </>
    )
}
