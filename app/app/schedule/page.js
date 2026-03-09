'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatTime, formatDate } from '@/lib/utils'
import Loader from '@/components/Loader'
import Topbar from '@/components/Topbar'

export default function SchedulePage() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        supabase.from('schedule_items').select('*').order('start_time')
            .then(({ data }) => { setItems(data || []); setLoading(false) })
    }, [])

    const rooms = ['all', ...new Set(items.map(i => i.location).filter(Boolean))]
    const filtered = filter === 'all' ? items : items.filter(i => i.location === filter)

    const grouped = filtered.reduce((acc, item) => {
        const day = formatDate(item.start_time)
        if (!acc[day]) acc[day] = []
        acc[day].push(item)
        return acc
    }, {})

    return (
        <>
            <Topbar title="Schedule" />
            <div className="content">
                <div className="chip-row" style={{ overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 4 }}>
                    {rooms.map(r => (
                        <button key={r} className={`chip ${filter === r ? 'active' : ''}`} onClick={() => setFilter(r)}>
                            {r === 'all' ? 'All Rooms' : r}
                        </button>
                    ))}
                </div>
                {loading && <Loader />}
                {Object.entries(grouped).map(([day, evts]) => (
                    <div key={day}>
                        <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 16, marginBottom: 10, marginTop: 16, paddingBottom: 6, borderBottom: '2px solid var(--accent)' }}>
                            {day}
                        </div>
                        {evts.map(item => (
                            <div key={item.id} className="sched-item" onClick={() => router.push(`/app/schedule/${item.id}`)}>
                                <div className="sched-time">{formatTime(item.start_time)}</div>
                                <div className="sched-body">
                                    <div className="sched-name">{item.title}</div>
                                    <div className="sched-loc">{item.location}{item.speaker ? ` · ${item.speaker}` : ''}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                {!loading && filtered.length === 0 && (
                    <div className="empty">
                        <div className="empty-ico">🗓️</div>
                        <div className="empty-txt">No events yet — check back soon!</div>
                    </div>
                )}
            </div>
        </>
    )
}
