import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { sb } from '../../lib/supabase'
import Loader from '../../components/Loader'

export default function AdminDash() {
  const { profile } = useAuth()
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      sb.from('profiles').select('id', { count: 'exact', head: true }),
      sb.from('companies').select('id', { count: 'exact', head: true }),
      sb.from('votes').select('id', { count: 'exact', head: true }),
      sb.from('passport_stamps').select('id', { count: 'exact', head: true }),
      sb.from('messages').select('id', { count: 'exact', head: true }).eq('read', false).neq('to_user_id', 'broadcast'),
      sb.from('raffle_entries').select('id', { count: 'exact', head: true }),
      sb.from('checkins').select('id', { count: 'exact', head: true }),
    ]).then(results => {
      setStats({
        users:    results[0].count || 0,
        companies:results[1].count || 0,
        votes:    results[2].count || 0,
        stamps:   results[3].count || 0,
        unread:   results[4].count || 0,
        raffle:   results[5].count || 0,
        checkins: results[6].count || 0,
      })
      setLoading(false)
    })
  }, [])

  if (loading) return <Loader />

  const STATS = [
    { n: stats.users,     l: 'Registered Users',  hi: true  },
    { n: stats.checkins,  l: 'Checked In',         hi: false },
    { n: stats.companies, l: 'Companies',           hi: false },
    { n: stats.votes,     l: 'Votes Cast',          hi: false },
    { n: stats.stamps,    l: 'Passport Stamps',     hi: false },
    { n: stats.unread,    l: 'Unread Messages',     hi: stats.unread > 0 },
    { n: stats.raffle,    l: 'Raffle Eligible',     hi: false },
  ]

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '16px 16px 40px' }}>
      <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
        Welcome back, {(profile?.full_name || '').split(' ')[0]}
      </div>
      <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 20 }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>

      <div className="sec">Live Stats</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            background: s.hi ? 'var(--accent-dim)' : 'var(--s2)',
            border: `1px solid ${s.hi ? 'var(--accent-border)' : 'var(--border)'}`,
            borderRadius: 'var(--r)', padding: 14,
          }}>
            <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 30, lineHeight: 1, marginBottom: 4 }}>
              {s.n}
            </div>
            <div style={{ fontSize: 11, color: 'var(--sub)' }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
