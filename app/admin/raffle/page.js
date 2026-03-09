'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/providers/ToastProvider'
import { strColor, initials } from '@/lib/utils'
import Loader from '@/components/Loader'

export default function AdminRaffle() {
    const supabase = createClient()
    const { showToast } = useToast()
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [winner, setWinner] = useState(null)
    const [spinning, setSpinning] = useState(false)

    useEffect(() => { load() }, [])

    async function load() {
        const { data } = await supabase.from('raffle_entries').select('*').order('entered_at', { ascending: false })
        setEntries(data || [])
        setLoading(false)
    }

    function drawWinner() {
        if (entries.length === 0) { showToast('No entries to draw from!'); return }
        setSpinning(true)
        setWinner(null)
        let counter = 0
        const total = 15 + Math.floor(Math.random() * 10)
        const interval = setInterval(() => {
            const random = entries[Math.floor(Math.random() * entries.length)]
            setWinner(random)
            counter++
            if (counter >= total) {
                clearInterval(interval)
                setSpinning(false)
                showToast(`🎉 Winner: ${random.name}!`)
            }
        }, 120)
    }

    return (
        <div className="anim-fade">
            <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Raffle</div>
            <div className="card accent" style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎰</div>
                <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>{entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}</div>
                <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 16, lineHeight: 1.5 }}>Attendees enter automatically by completing their passport and voting.</div>
                <button className="btn btn-accent btn-full" onClick={drawWinner} disabled={spinning || entries.length === 0} style={{ position: 'relative' }}>
                    {spinning ? '🎰 Drawing…' : '🎲 Draw Winner'}
                </button>
            </div>
            {winner && !spinning && (
                <div className="card" style={{ textAlign: 'center', borderColor: 'var(--green)', marginBottom: 20 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                    <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 20, color: 'var(--green)' }}>{winner.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--sub)' }}>{winner.email}</div>
                </div>
            )}
            {spinning && winner && (
                <div className="card" style={{ textAlign: 'center', borderColor: 'var(--yellow)', animation: 'pulse .3s ease infinite', marginBottom: 20 }}>
                    <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 20, color: 'var(--yellow)' }}>{winner.name}</div>
                </div>
            )}
            <div className="sec">All Entries</div>
            {loading && <Loader />}
            {entries.map(e => (
                <div key={e.user_id} className="tile" style={{ cursor: 'default' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: strColor(e.name || ''), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'var(--fh)', flexShrink: 0 }}>{initials(e.name)}</div>
                    <div className="tile-body">
                        <div className="tile-name">{e.name}</div>
                        <div className="tile-desc">{e.email}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}
