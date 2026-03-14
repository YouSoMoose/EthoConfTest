'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import Btn from '@/components/Btn';

export default function PassportPage() {
  const router = useRouter();
  const [booths, setBooths] = useState([]);
  const [stamps, setStamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/booths').then(r => r.json()),
      fetch('/api/stamp').then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([b, s]) => {
      setBooths(b || []);
      setStamps(Array.isArray(s) ? s : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const stampedIds = new Set(stamps.map(s => s.booth_id));
  const rooms = ['poster', 'conference'];

  return (
    <div className="page-enter">
      <Topbar title="🛂 Passport" />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
        {/* Progress bars */}
        {rooms.map(room => {
          const roomBooths = booths.filter(b => b.room === room);
          const stamped = roomBooths.filter(b => stampedIds.has(b.id)).length;
          const total = roomBooths.length;
          const pct = total ? (stamped / total) * 100 : 0;

          return (
            <div key={room} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--fb)', fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>
                  {room} Room
                </span>
                <span style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--muted)' }}>
                  {stamped}/{total}
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 8, background: 'var(--s2)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: 8,
                  background: 'var(--g)',
                  width: `${pct}%`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          );
        })}

        {/* Booths grid */}
        <p className="section-label" style={{ marginTop: 20 }}>BOOTH STAMPS</p>
        {booths.length === 0 ? (
          <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: 40 }}>
            No booths available yet
          </p>
        ) : (
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {booths.map(booth => {
              const isStamped = stampedIds.has(booth.id);
              return (
                <div key={booth.id} style={{
                  background: isStamped ? 'var(--gl)' : 'var(--white)',
                  border: `1px solid ${isStamped ? 'var(--gb)' : 'var(--border)'}`,
                  borderRadius: 'var(--r)',
                  padding: '16px 8px',
                  textAlign: 'center',
                  animation: isStamped ? 'stampBounce 0.5s ease both' : 'none',
                }}>
                  <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>
                    {isStamped ? '✅' : '⬜'}
                  </span>
                  <span style={{
                    fontFamily: 'var(--fb)',
                    fontSize: 11,
                    fontWeight: 500,
                    color: isStamped ? 'var(--g)' : 'var(--muted)',
                  }}>
                    {booth.name || `Booth ${booth.id.slice(0, 4)}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Scan button */}
        <div style={{ marginTop: 24 }}>
          <Btn onClick={() => router.push('/app/scan')}>📷 Scan QR Code</Btn>
        </div>
      </div>
    </div>
  );
}
