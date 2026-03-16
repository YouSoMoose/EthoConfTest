'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Loader from '@/components/Loader';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminIDCardsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printingId, setPrintingId] = useState(null);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader admin />;

  return (
    <div className={`page-enter ${printingId ? 'is-printing-single' : ''}`} style={{ padding: '24px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Link href="/admin" style={{
            textDecoration: 'none', color: 'var(--asub)', fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 20, background: 'var(--as1)', border: '1px solid var(--aborder)'
          }}>←</Link>
          <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 22, color: 'var(--atext)', margin: 0 }}>
            🪪 Print ID Cards
          </h2>
        </div>

        <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--asub)', marginBottom: 24 }}>
          These digital badges map directly to the Attendee Scanner. Print these out for physical lanyards!
        </p>

        {users.length === 0 && !loading && (
          <div className="print-hide" style={{ textAlign: 'center', padding: '60px 0', background: 'var(--as1)', borderRadius: 'var(--r)', border: '1px dashed var(--aborder)' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>😶</span>
            <p style={{ fontFamily: 'var(--fb)', color: 'var(--asub)' }}>No users found.</p>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 16,
        }}>
          {users.map(u => (
            <div key={u.id} className={printingId && printingId !== u.id ? 'hide-when-printing-single' : ''} style={{ position: 'relative' }}>
              <div style={{
                background: '#ffffff', // Cards are always white for printing
                borderRadius: 12,
                border: '1px solid #ccc',
                width: '87mm',
                height: '57mm',
                padding: 16,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Optional background graphic for the ID card */}
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: 120, height: 120,
                  background: 'linear-gradient(135deg, rgba(252,189,157,0.2) 0%, rgba(168,158,148,0.05) 100%)',
                  borderRadius: '0 0 0 100%', pointerEvents: 'none'
                }} />

                {/* Details (Left) */}
                <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    {/* Small Logo next to Name */}
                    <div style={{ width: 20, height: 20, borderRadius: 4, overflow: 'hidden' }}>
                      <img src="/assets/ethos-logo-insignia.png" alt="E" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 18, color: '#413429', margin: 0,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {u.name || 'Anonymous User'}
                    </h3>
                  </div>

                  <p style={{
                    fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 13, color: '#7D6F63', margin: '0 0 4px',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {u.bio ? u.bio : (u.access_level === 3 ? 'Super Admin' : u.access_level === 2 ? 'Event Staff' : 'Attendee')}
                  </p>

                  <p style={{
                    fontFamily: 'var(--fb)', fontSize: 12, color: '#A89E94', margin: 0,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {u.email}
                  </p>
                </div>

                {/* QR Code (Right) */}
                <div style={{
                  background: '#fff', padding: 6, borderRadius: 10, border: '1px solid #eee',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <QRCodeSVG value={u.id} size={84} level="M" fgColor="#413429" bgColor="#ffffff" />
                </div>
              </div>

              {/* Print Button Wrapper */}
              <div className="print-hide" style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setPrintingId(u.id);
                    setTimeout(() => {
                      window.print();
                      setPrintingId(null);
                    }, 150);
                  }}
                  style={{
                    background: 'var(--as1)', border: '1px solid var(--aborder)',
                    borderRadius: 8, padding: '6px 12px', fontSize: 13,
                    fontFamily: 'var(--fh)', fontWeight: 600, color: 'var(--atext)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  🖨️ Print Card
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
