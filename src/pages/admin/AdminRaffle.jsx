import { useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import { timeAgo } from '../../lib/utils'
import Loader from '../../components/Loader'

export default function AdminRaffle() {
  const { showToast } = useToast()
  const [entries, setEntries] = useState([])
  const [winner,  setWinner]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sb.from('raffle_entries').select('*').order('entered_at')
      .then(({ data }) => { setEntries(data || []); setLoading(false) })
  }, [])

  function pickWinner() {
    if (!entries.length) { showToast('No eligible entries yet'); return }
    setWinner(entries[Math.floor(Math.random() * entries.length)])
  }

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '16px 16px 40px' }}>
      <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Raffle</div>
      <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 20, lineHeight: 1.6 }}>
        Users are silently entered when they complete all passport stamps in both rooms and vote on at least one pitch.
        They don't know about the raffle — they just see their passport progress.
      </div>

      {winner && (
        <div className="card" style={{ marginBottom: 20, textAlign: 'center', borderColor: 'var(--yellow)', background: 'rgba(245,200,66,.06)' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
          <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 24, marginBottom: 4 }}>{winner.name}</div>
          <div style={{ fontSize: 14, color: 'var(--sub)' }}>{winner.email}</div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => setWinner(null)}>Reset</button>
        </div>
      )}

      <button className="btn btn-accent btn-full" style={{ marginBottom: 20 }} onClick={pickWinner}>
        🎟️ Draw Random Winner
      </button>

      <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
        {entries.length} Eligible {entries.length === 1 ? 'Entry' : 'Entries'}
      </div>

      {loading && <Loader />}

      {!loading && entries.length === 0 && (
        <div className="empty">
          <div className="empty-ico">🎟️</div>
          <div className="empty-txt">No eligible entries yet.<br />Users need to complete passport stamps + vote.</div>
        </div>
      )}

      {entries.map(e => (
        <div key={e.id} className="tile" style={{ cursor: 'default', borderColor: winner?.id === e.id ? 'var(--yellow)' : undefined }}>
          <div className="tile-ico ico-g">🎟️</div>
          <div className="tile-body">
            <div className="tile-name">{e.name}</div>
            <div className="tile-desc">{e.email}</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{timeAgo(e.entered_at)}</div>
        </div>
      ))}
    </div>
  )
}
