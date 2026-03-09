'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { strColor } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'
import QRCode from '@/components/QRCode'

export default function PitchesPage() {
    const { profile } = useAuth()
    const router = useRouter()
    const supabase = createClient()
    const [companies, setCompanies] = useState([])
    const [myVotes, setMyVotes] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [qrCompany, setQrCompany] = useState(null)

    useEffect(() => {
        Promise.all([
            supabase.from('companies').select('*').eq('type', 'pitch').order('name'),
            supabase.from('votes').select('company_id').eq('voter_id', profile?.id),
        ]).then(([{ data: c }, { data: v }]) => {
            setCompanies(c || [])
            setMyVotes((v || []).map(x => x.company_id))
            setLoading(false)
        })
    }, [profile?.id])

    const filtered = companies.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.industry?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <>
            <Topbar title="Pitch Room" actions={
                <button className="topbar-action accent" onClick={() => router.push('/app/scan')}>📷 Scan</button>
            } />
            <div className="content">
                <div className="search-wrap">
                    <svg className="search-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input className="search-input" placeholder="Search companies…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {loading && <Loader />}
                {filtered.map(c => (
                    <div key={c.id} className={`pitch-card ${myVotes.includes(c.id) ? 'voted' : ''}`} onClick={() => router.push(`/app/pitches/${c.id}`)}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                            <div className="pitch-logo" style={{ background: strColor(c.name || '') }}>
                                {c.logo_url ? <img src={c.logo_url} alt={c.name} /> : <span style={{ color: '#fff', fontFamily: 'var(--fh)', fontWeight: 800 }}>{(c.name || '?')[0]}</span>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {c.name}
                                    {myVotes.includes(c.id) && <span className="badge badge-accent">Voted ✓</span>}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>
                                    {c.industry}{c.presenter_name ? ` · ${c.presenter_name}` : ''}
                                </div>
                            </div>
                            <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4, fontSize: 18, flexShrink: 0 }} onClick={e => { e.stopPropagation(); setQrCompany(c) }} title="Show QR">⊞</button>
                        </div>
                        {c.description && (
                            <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.5 }}>
                                {c.description.slice(0, 120)}{c.description.length > 120 ? '…' : ''}
                            </div>
                        )}
                    </div>
                ))}
                {!loading && filtered.length === 0 && (
                    <div className="empty"><div className="empty-ico">🏆</div><div className="empty-txt">No pitches found</div></div>
                )}
            </div>
            <Modal open={!!qrCompany} onClose={() => setQrCompany(null)} title={qrCompany?.name}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingBottom: 20 }}>
                    {qrCompany && <QRCode value={`PITCH-${qrCompany.id}`} size={200} />}
                    <div style={{ fontSize: 13, color: 'var(--sub)', textAlign: 'center' }}>Scan to jump to this pitch</div>
                </div>
            </Modal>
        </>
    )
}
