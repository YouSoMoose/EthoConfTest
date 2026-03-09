'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { strColor, initials } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import Loader from '@/components/Loader'

export default function WalletPage() {
    const { profile } = useAuth()
    const supabase = createClient()
    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.from('collected_cards').select('*').eq('collected_by', profile.id).order('created_at', { ascending: false })
            .then(({ data }) => { setCards(data || []); setLoading(false) })
    }, [profile.id])

    return (
        <>
            <Topbar title="Booth Wallet" onBack={() => window.history.back()} />
            <div className="content">
                {loading && <Loader />}
                {!loading && cards.length === 0 && (<div className="empty"><div className="empty-ico">💼</div><div className="empty-txt">No cards yet — scan someone&apos;s QR to save their info!</div></div>)}
                {cards.map(c => (
                    <div key={c.id} className="card" style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: strColor(c.name || ''), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--fh)', flexShrink: 0 }}>{initials(c.name)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontFamily: 'var(--fh)', fontWeight: 700 }}>{c.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--sub)' }}>{c.email}</div>
                                {c.role && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{c.role}</div>}
                            </div>
                            {c.resume && <a href={c.resume} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', flexShrink: 0 }}>📎 Resume</a>}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
