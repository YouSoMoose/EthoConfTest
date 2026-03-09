'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/providers/ToastProvider'
import { strColor, initials } from '@/lib/utils'
import { ACCESS_LEVELS } from '@/lib/constants'
import Loader from '@/components/Loader'
import RoleChip from '@/components/RoleChip'
import Modal from '@/components/Modal'

export default function AdminUsers() {
    const supabase = createClient()
    const { showToast } = useToast()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(null)
    const [newLevel, setNewLevel] = useState(0)
    const [search, setSearch] = useState('')

    useEffect(() => {
        supabase.from('profiles').select('*').order('full_name')
            .then(({ data }) => { setUsers(data || []); setLoading(false) })
    }, [])

    async function saveLevel() {
        if (!editing) return
        await supabase.from('profiles').update({ access_level: newLevel }).eq('id', editing.id)
        setUsers(u => u.map(x => x.id === editing.id ? { ...x, access_level: newLevel } : x))
        showToast(`Updated to ${ACCESS_LEVELS[newLevel]?.label || 'Unknown'} ✓`)
        setEditing(null)
    }

    const filtered = users.filter(u => (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="anim-fade">
            <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>User Management</div>
            <div className="search-wrap">
                <svg className="search-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                <input className="search-input" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loading && <Loader />}
            {filtered.map(u => (
                <div key={u.id} className="tile" onClick={() => { setEditing(u); setNewLevel(u.access_level || 0) }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: strColor(u.full_name || ''), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'var(--fh)', flexShrink: 0, overflow: 'hidden' }}>
                        {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(u.full_name)}
                    </div>
                    <div className="tile-body">
                        <div className="tile-name">{u.full_name}</div>
                        <div className="tile-desc">{u.email}</div>
                    </div>
                    <RoleChip level={u.access_level} />
                </div>
            ))}
            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Access Level">
                {editing && (
                    <>
                        <div className="card" style={{ marginBottom: 12 }}>
                            <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15 }}>{editing.full_name}</div>
                            <div style={{ fontSize: 12, color: 'var(--sub)' }}>{editing.email}</div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Access Level</label>
                            <select className="form-input" value={newLevel} onChange={e => setNewLevel(Number(e.target.value))}>
                                {Object.entries(ACCESS_LEVELS).map(([k, v]) => (<option key={k} value={k}>{v.label} (Level {k})</option>))}
                            </select>
                        </div>
                        <button className="btn btn-accent btn-full" onClick={saveLevel}>Save</button>
                    </>
                )}
            </Modal>
        </div>
    )
}
