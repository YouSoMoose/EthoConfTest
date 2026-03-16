'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import Empty from '@/components/Empty';
import Modal from '@/components/Modal';

export default function WalletPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState(null);

  useEffect(() => {
    fetch('/api/connections').then(r => r.json())
      .then(d => { setItems(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    await fetch(`/api/connections?id=${id}`, { method: 'DELETE' });
    setItems(p => p.filter(w => w.id !== id));
    toast.success('Removed');
  };

  if (loading) return <Loader />;

  return (
    <div className="page-enter">
      <Topbar title="💼 Wallet" />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
        {items.length === 0 ? (
          <Empty icon="💼" text="No connections yet. Scan someone's QR code!" />
        ) : (
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            {items.map(item => {
              const p = item.profile;
              if (!p) return null;
              return (
                <div key={item.id}>
                  <div 
                    onClick={() => setActiveProfile(p)}
                    style={{
                      background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
                      padding: 16, display: 'flex', alignItems: 'center', gap: 16, position: 'relative',
                      cursor: 'pointer', transition: 'transform 0.15s ease'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 24, background: 'var(--s1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                    }}>
                      {p.avatar ? (
                        <img src={p.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : <span style={{ fontSize: 24 }}>👤</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, color: 'var(--text)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {p.name || 'Anonymous User'}
                      </h3>
                      <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', margin: '2px 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {p.company ? `${p.company} • ` : ''}{p.email}
                      </p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); remove(item.id); }} style={{
                      background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 14, color: 'var(--muted)', padding: 8,
                    }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={!!activeProfile} onClose={() => setActiveProfile(null)} center>
        {activeProfile && (
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--s1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '0 auto 16px' }}>
              {activeProfile.avatar ? (
                <img src={activeProfile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : <span style={{ fontSize: 40 }}>👤</span>}
            </div>
            <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 24, color: 'var(--text)', margin: '0 0 4px' }}>
              {activeProfile.name || 'Anonymous User'}
            </h2>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', margin: '0 0 16px' }}>
              {activeProfile.email}
            </p>
            
            {activeProfile.phone && (
              <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', margin: '0 0 16px' }}>
                📞 {activeProfile.phone}
              </p>
            )}
            
            {activeProfile.company && (
              <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', margin: '0 0 16px' }}>
                🏢 {activeProfile.company}
              </p>
            )}

            {activeProfile.linkedin && (
              <a href={activeProfile.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--accent)', margin: '0 0 16px', display: 'block', textDecoration: 'none' }}>
                🔗 LinkedIn Profile
              </a>
            )}
            
            {activeProfile.bio && (
              <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--text)', margin: '0 auto 20px', background: 'var(--s1)', padding: '12px 16px', borderRadius: 12, lineHeight: 1.5, maxWidth: '100%' }}>
                "{activeProfile.bio}"
              </p>
            )}

            {activeProfile.resume_link && (
              <a href={activeProfile.resume_link} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--ad)', color: 'var(--accent)', textDecoration: 'none', padding: '12px 20px', borderRadius: 12, fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 14, width: '100%', marginBottom: 12
              }}>
                📄 View Resume
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
