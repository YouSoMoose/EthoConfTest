import { useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import { initials, strColor } from '../../lib/utils'
import { ACCESS_LEVELS } from '../../lib/constants'
import Modal from '../../components/Modal'
import Loader from '../../components/Loader'
import RoleChip from '../../components/RoleChip'

export default function AdminUsers() {
  const { showToast } = useToast()
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [level,   setLevel]   = useState(0)
  const [search,  setSearch]  = useState('')
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    sb.from('profiles').select('*').order('full_name')
      .then(({ data }) => { setUsers(data || []); setLoading(false) })
  }, [])

  async function updateLevel() {
    setSaving(true)
    await sb.from('profiles').update({ access_level: level }).eq('id', editing.id)
    setUsers(us => us.map(u => u.id === editing.id ? { ...u, access_level: level } : u))
    setEditing(null)
    setSaving(false)
    showToast('Access level updated ✓')
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '16px 16px 40px' }}>
      <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 20, marginBottom: 14 }}>
        Users ({users.length})
      </div>

      <div className="search-wrap">
        <svg className="search-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input className="search-input" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading && <Loader />}

      {filtered.map(u => (
        <div key={u.id} className="tile" style={{ cursor: 'default' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: strColor(u.full_name || ''),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, fontFamily: 'var(--fh)', color: '#fff', flexShrink: 0,
            overflow: 'hidden',
          }}>
            {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(u.full_name)}
          </div>
          <div className="tile-body">
            <div className="tile-name">{u.full_name}</div>
            <div className="tile-desc">{u.email}</div>
          </div>
          <div className="tile-right" style={{ gap: 6 }}>
            <RoleChip level={u.access_level} />
            <button
              style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--fh)', fontWeight: 700, padding: 4 }}
              onClick={() => { setEditing(u); setLevel(u.access_level ?? 0) }}
            >
              Edit
            </button>
          </div>
        </div>
      ))}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Update Access Level">
        {editing && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, marginBottom: 4 }}>{editing.full_name}</div>
              <div style={{ fontSize: 13, color: 'var(--sub)' }}>{editing.email}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Access Level</label>
              <select className="form-input" value={level} onChange={e => setLevel(+e.target.value)}>
                {Object.entries(ACCESS_LEVELS).map(([k, v]) => (
                  <option key={k} value={k}>Level {k} — {v.label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16, padding: 12, background: 'var(--s2)', borderRadius: 8, fontSize: 12, color: 'var(--sub)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text)' }}>L0 Attendee</strong> — view only<br />
              <strong style={{ color: 'var(--text)' }}>L1 Presenter</strong> — can create company card, view pitches<br />
              <strong style={{ color: 'var(--text)' }}>L2 Staff</strong> — check-in panel, read/reply messages<br />
              <strong style={{ color: 'var(--text)' }}>L3 Super Admin</strong> — full control
            </div>
            <button className="btn btn-accent btn-full" onClick={updateLevel} disabled={saving} style={{ marginBottom: 16 }}>
              {saving ? 'Saving…' : 'Update Level'}
            </button>
          </>
        )}
      </Modal>
    </div>
  )
}
