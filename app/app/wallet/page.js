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
    fetch('/api/wallet').then(r => r.json())
      .then(d => { setItems(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const remove = async (companyId) => {
    await fetch(`/api/wallet?company_id=${companyId}`, { method: 'DELETE' });
    setItems(p => p.filter(w => w.company_id !== companyId));
    toast.success('Removed');
  };

  if (loading) return <Loader />;

  return (
    <div className="page-enter">
      <Topbar title="💼 Wallet" />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
        {items.length === 0 ? (
          <Empty icon="💼" text="No saved companies yet" />
        ) : (
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {items.map(item => {
              const c = item.companies;
              if (!c) return null;
              return (
                <div key={item.id} style={{
                  background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
                  padding: 16, textAlign: 'center', position: 'relative',
                }}>
                  <button onClick={() => remove(item.company_id)} style={{
                    position: 'absolute', top: 8, right: 8, background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 12, color: 'var(--muted)',
                  }}>✕</button>
                  <Link href={`/app/pitches/${c.id}`}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, background: 'var(--s1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 10px', overflow: 'hidden',
                    }}>
                      {c.logo_url ? (
                        <img src={c.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : <span style={{ fontSize: 22 }}>🏢</span>}
                    </div>
                    <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </h3>
                    {c.category && (
                      <span style={{ fontFamily: 'var(--fb)', fontSize: 10, color: 'var(--muted)' }}>
                        {c.category}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
