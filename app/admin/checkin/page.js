'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/providers/ToastProvider'
import { strColor, initials } from '@/lib/utils'
import Loader from '@/components/Loader'

export default function AdminCheckin() {
    const supabase = createClient()
    const { showToast } = useToast()
    const [users, setUsers] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.from('profiles').select('id,full_name,email,avatar_url,checked_in,access_level')
            .order('full_name')
            .then(({ data }) => { setUsers(data || []); setLoading(false) })
    }, [])

    async function toggleCheckin(user) {
        const newVal = !user.checked_in
        await supabase.from('profiles').update({ checked_in: newVal }).eq('id', user.id)
        setUsers(u => u.map(x => x.id === user.id ? { ...x, checked_in: newVal } : x))
        showToast(newVal ? `${user.full_name} checked in ✓` : `${user.full_name} un-checked`)
    }

    const filtered = users.filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    const checkedIn = filtered.filter(u => u.checked_in).length

    return (
        <div className="anim-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 18 }}>Check-in</div>
                <div style={{ fontSize: 13, color: 'var(--green)' }}>✓ {checkedIn} / {filtered.length}</div>
            </div>
            <div className="search-wrap">
                <svg className="search-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                <input className="search-input" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loading && <Loader />}
            {filtered.map(u => (
                <div key={u.id} className="tile" onClick={() => toggleCheckin(u)}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: strColor(u.full_name || ''), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'var(--fh)', color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
                        {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(u.full_name)}
                    </div>
                    <div className="tile-body">
                        <div className="tile-name">{u.full_name}</div>
                        <div className="tile-desc">{u.email}</div>
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: u.checked_in ? 'var(--green)' : 'var(--s3)', border: u.checked_in ? 'none' : '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: u.checked_in ? '#111' : 'var(--muted)', flexShrink: 0, transition: 'all .2s' }}>
                        {u.checked_in ? '✓' : ''}
                    </div>
                </div>
            ))}
        </div>
    )
}
