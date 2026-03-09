import { useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import { initials, strColor } from '../../lib/utils'
import { ACCESS_LEVELS } from '../../lib/constants'
import Loader from '../../components/Loader'
import RoleChip from '../../components/RoleChip'

export default function AdminCheckin() {
  const { showToast } = useToast()
  const [users,    setUsers]    = useState([])
  const [checkins, setCheckins] = useState(new Set())
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      sb.from('profiles').select('*').order('full_name'),
      sb.from('checkins').select('user_id'),
    ]).then(([{ data: u }, { data: c }]) => {
      setUsers(u || [])
      setCheckins(new Set((c || []).map(x => x.user_id)))
      setLoading(false)
    })
  }, [])

  async function checkin(userId) {
    await sb.from('checkins').upsert({ user_id: userId, checked_in_at: new Date().toISOString() }, { onConflict: 'user_id' })
    setCheckins(s => new Set([...s, userId]))
    showToast('Checked in ✓')
  }

  async function undo(userId) {
    await sb.from('checkins').delete().eq('user_id', userId)
    setCheckins(s => { const n = new Set(s); n.delete(userId); return n })
    showToast('Check-in removed')
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const checkedIn = filtered.filter(u => checkins.has(u.id)).length

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '16px 16px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 20 }}>Check-in</div>
        <div style={{ fontSize: 13, color: 'var(--sub)' }}>
          <span style={{ color: 'var(--green)', fontWeight: 700 }}>{checkedIn}</span> / {filtered.length}
        </div>
      </div>

      <div className="search-wrap">
        <svg className="search-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input className="search-input" placeholder="Search attendees…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading && <Loader />}

      {filtered.map(u => (
        <div key={u.id} className="tile" style={{ cursor: 'default' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: strColor(u.full_name || ''),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, fontFamily: 'var(--fh)', color: '#fff', flexShrink: 0,
          }}>
            {initials(u.full_name)}
          </div>
          <div className="tile-body">
            <div className="tile-name">{u.full_name}</div>
            <div className="tile-desc">{u.email}</div>
          </div>
          <div className="tile-right" style={{ gap: 6 }}>
            <RoleChip level={u.access_level} />
            {checkins.has(u.id)
              ? <span className="badge badge-green" style={{ cursor: 'pointer' }} onClick={() => undo(u.id)}>✓ In</span>
              : <button className="btn btn-sm btn-ghost" onClick={() => checkin(u.id)}>Check In</button>
            }
          </div>
        </div>
      ))}
    </div>
  )
}
