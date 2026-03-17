'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Loader from '@/components/Loader';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';

export default function AdminIDCardsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printingId, setPrintingId] = useState(null);
  const cardRefs = useRef({});

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDownload = async (user) => {
    const ref = cardRefs.current[user.id];
    if (!ref) return;
    const t = toast.loading('Generating image...');
    try {
      const dataUrl = await toPng(ref, { pixelRatio: 3, backgroundColor: '#fff' });
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.height;
        canvas.height = img.width;
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(90 * Math.PI / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        const rotatedDataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Ethos-ID-${(user.name || 'User').replace(/\s+/g, '-')}.png`;
        link.href = rotatedDataUrl;
        link.click();
        toast.success('Downloaded!', { id: t });
      };
    } catch (e) {
      console.error(e);
      toast.error('Failed to download', { id: t });
    }
  };

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
              <div 
                ref={el => cardRefs.current[u.id] = el}
                style={{
                  background: '#ffffff',
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
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: 120, height: 120,
                  background: 'linear-gradient(135deg, rgba(252,189,157,0.2) 0%, rgba(168,158,148,0.05) 100%)',
                  borderRadius: '0 0 0 100%', pointerEvents: 'none'
                }} />

                {/* Details (Left) */}
                <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                      <img src="/assets/ethos-logo.png" alt="E" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--fh)', 
                      fontWeight: 800, 
                      fontSize: (u.name || '').length > 20 ? 14 : (u.name || '').length > 15 ? 16 : 18, 
                      color: '#413429', 
                      margin: 0,
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      lineHeight: 1.2
                    }}>
                      {u.name || 'Anonymous User'}
                    </h3>
                  </div>

                  <p style={{
                    fontFamily: 'var(--fb)', 
                    fontWeight: 700, 
                    fontSize: 12, 
                    color: '#D49B7A', 
                    margin: '0 0 2px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis'
                  }}>
                    {u.role || (u.access_level === 3 ? 'Super Admin' : u.access_level === 2 ? 'Event Staff' : 'Attendee')}
                  </p>

                  <p style={{
                    fontFamily: 'var(--fb)', 
                    fontWeight: 600, 
                    fontSize: 11, 
                    color: '#7D6F63', 
                    margin: '0 0 2px',
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis'
                  }}>
                    {u.company || 'Ethos Attendee'}
                  </p>

                  <p style={{
                    fontFamily: 'var(--fb)', fontSize: 10, color: '#A89E94', margin: 0,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.8
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
                  <QRCodeSVG value={u.id} size={80} level="M" fgColor="#413429" bgColor="#ffffff" />
                </div>
              </div>

              {/* Action Buttons Wrapper */}
              <div className="print-hide" style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  onClick={() => handleDownload(u)}
                  style={{
                    background: 'var(--as1)', border: '1px solid var(--aborder)',
                    borderRadius: 8, padding: '6px 12px', fontSize: 13,
                    fontFamily: 'var(--fh)', fontWeight: 600, color: 'var(--atext)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  📥 Download
                </button>
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
                  🖨️ Print
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
