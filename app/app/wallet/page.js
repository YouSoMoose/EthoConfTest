'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import Empty from '@/components/Empty';

export default function WalletPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
                <div key={item.id} style={{
                  background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
                  padding: 16, display: 'flex', alignItems: 'center', gap: 16, position: 'relative',
                }}>
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
                      {p.email}
                    </p>
                    {p.phone && (
                      <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', margin: '2px 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        📞 {p.phone}
                      </p>
                    )}
                    {p.bio && (
                      <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--muted)', margin: '6px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        "{p.bio}"
                      </p>
                    )}
                    {p.resume_link && (
                      <a href={p.resume_link} target="_blank" rel="noopener noreferrer" style={{
                        display: 'inline-block', marginTop: 8, fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--fb)', textDecoration: 'none'
                      }}>
                        📄 View Resume
                      </a>
                    )}
                  </div>
                  <button onClick={() => remove(item.id)} style={{
                    background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 14, color: 'var(--muted)', padding: 8,
                  }}>✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
