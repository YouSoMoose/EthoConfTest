import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sb } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { ROOM_TYPES } from '../../lib/constants'
import Topbar from '../../components/Topbar'
import Loader from '../../components/Loader'

export default function PassportPage() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const [rooms,   setRooms]   = useState([])
  const [stamps,  setStamps]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [profile.id])

  async function load() {
    const [{ data: companies }, { data: myStamps }] = await Promise.all([
      sb.from('companies').select('id,name,room_type,emoji').in('room_type', ['poster_room', 'conference_room']),
      sb.from('passport_stamps').select('company_id,room_type').eq('user_id', profile.id),
    ])

    const roomMap = Object.entries(ROOM_TYPES).map(([key, meta]) => ({
      id: key, ...meta,
      booths: (companies || []).filter(c => c.room_type === key),
    }))

    setRooms(roomMap)
    setStamps(myStamps || [])
    setLoading(false)
  }

  const hasStamp = (cid, rt) => stamps.some(s => s.company_id === cid && s.room_type === rt)

  const totalDone = rooms.reduce((acc, r) => acc + r.booths.filter(b => hasStamp(b.id, r.id)).length, 0)
  const totalAll  = rooms.reduce((acc, r) => acc + r.booths.length, 0)
  const allDone   = totalAll > 0 && totalDone === totalAll

  return (
    <>
      <Topbar title="Conference Passport" actions={
        <button className="topbar-action accent" onClick={() => navigate('/app/scan')}>📷 Scan</button>
      } />
      <div className="content">
        {/* Passport wallet card */}
        <div className="wallet-card">
          <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
            My Passport
          </div>
          <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 16 }}>
            Scan booth QR codes to collect stamps
          </div>
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--sub)', marginBottom: 6 }}>
              <span>Overall Progress</span>
              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{totalDone}/{totalAll}</span>
            </div>
            <div className="prog-wrap">
              <div className="prog-bar" style={{
                width: totalAll ? `${Math.round(totalDone / totalAll * 100)}%` : '0%',
                background: 'var(--accent)',
              }} />
            </div>
          </div>
          {allDone && (
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
              🎉 Passport complete!
            </div>
          )}
        </div>

        {loading && <Loader />}

        {rooms.map(room => {
          const done = room.booths.filter(b => hasStamp(b.id, room.id)).length
          const pct  = room.booths.length ? Math.round(done / room.booths.length * 100) : 0

          return (
            <div key={room.id} style={{
              background: 'var(--s1)', border: '1px solid var(--border)',
              borderRadius: 'var(--r)', padding: 16, marginBottom: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 16 }}>
                  {room.emoji} {room.label}
                </div>
                <span style={{ fontSize: 12, color: 'var(--sub)' }}>{done}/{room.booths.length}</span>
              </div>

              <div className="prog-wrap" style={{ marginBottom: 14 }}>
                <div className="prog-bar" style={{ width: `${pct}%`, background: room.color }} />
              </div>

              {room.booths.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {room.booths.map(booth => {
                    const got = hasStamp(booth.id, room.id)
                    return (
                      <div key={booth.id} className={`stamp ${got ? 'earned' : ''}`} title={booth.name}>
                        {booth.emoji || booth.name?.[0] || '🏢'}
                        {got && <div className="stamp-check">✓</div>}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: 12 }}>
                  No booths in this room yet
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
