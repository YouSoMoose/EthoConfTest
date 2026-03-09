'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Loader from '@/components/Loader'

export default function AdminDash() {
    const supabase = createClient()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { load() }, [])

    async function load() {
        const [
            { count: users },
            { count: companies },
            { count: votes },
            { count: checkins },
            { data: unread },
            { count: raffleCt },
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('companies').select('*', { count: 'exact', head: true }),
            supabase.from('votes').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('checked_in', true),
            supabase.from('messages').select('id').eq('to_user_id', 'admin').eq('read', false),
            supabase.from('raffle_entries').select('*', { count: 'exact', head: true }),
        ])
        setStats({ users, companies, votes, checkins, unread: (unread || []).length, raffle: raffleCt })
        setLoading(false)
    }

    if (loading) return <Loader />

    const TILES = [
        { label: 'Total Users', val: stats.users, color: 'var(--accent)' },
        { label: 'Checked In', val: stats.checkins, color: 'var(--green)' },
        { label: 'Companies', val: stats.companies, color: 'var(--blue)' },
        { label: 'Total Votes', val: stats.votes, color: 'var(--purple)' },
        { label: 'Unread Messages', val: stats.unread, color: 'var(--red)' },
        { label: 'Raffle Entries', val: stats.raffle, color: 'var(--yellow)' },
    ]

    return (
        <div className="anim-fade">
            <div className="dash-hero" style={{ margin: '-16px -16px 16px', borderRadius: '0 0 var(--r) var(--r)' }}>
                <div className="dash-label">Admin Dashboard</div>
                <div className="dash-hi">EthoConf<br />Control Center</div>
                <div className="dash-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {TILES.map(t => (
                    <div key={t.label} className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 32, color: t.color }}>{t.val ?? 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 600, fontFamily: 'var(--fh)', letterSpacing: '.04em', textTransform: 'uppercase' }}>{t.label}</div>
                    </div>
                ))}
            </div>
            <button className="btn btn-ghost btn-full" style={{ marginTop: 16 }} onClick={load}>🔄 Refresh</button>
        </div>
    )
}
