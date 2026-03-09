'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatTime } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import Loader from '@/components/Loader'

export default function ScheduleDetail() {
    const params = useParams()
    const id = params.id
    const [item, setItem] = useState(null)
    const supabase = createClient()

    useEffect(() => {
        supabase.from('schedule_items').select('*').eq('id', id).single()
            .then(({ data }) => setItem(data))
    }, [id])

    if (!item) return <Loader fullPage />

    return (
        <>
            <Topbar title={item.title} backTo="/app/schedule" />
            <div className="content-notab" style={{ padding: 20 }}>
                <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 26, marginBottom: 8, lineHeight: 1.2 }}>
                    {item.title}
                </div>
                <div className="chip-row">
                    {item.location && <span className="chip active" style={{ cursor: 'default' }}>{item.location}</span>}
                    {item.type && <span className="chip" style={{ cursor: 'default' }}>{item.type}</span>}
                </div>
                <div className="card">
                    {item.start_time && (
                        <div className="info-row">
                            <span className="info-key">Time</span>
                            <span className="info-val">
                                {formatTime(item.start_time)}{item.end_time ? ` – ${formatTime(item.end_time)}` : ''}
                            </span>
                        </div>
                    )}
                    {item.speaker && (
                        <div className="info-row">
                            <span className="info-key">Speaker</span>
                            <span className="info-val">{item.speaker}</span>
                        </div>
                    )}
                    {item.location && (
                        <div className="info-row">
                            <span className="info-key">Location</span>
                            <span className="info-val">{item.location}</span>
                        </div>
                    )}
                </div>
                {item.description && (
                    <div className="card">
                        <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--sub)' }}>{item.description}</div>
                    </div>
                )}
            </div>
        </>
    )
}
