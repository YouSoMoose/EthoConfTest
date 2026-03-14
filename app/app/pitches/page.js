'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import Empty from '@/components/Empty';
import StarRating from '@/components/StarRating';

export default function PitchesPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/companies').then(r => r.json())
      .then(d => { setCompanies(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const filtered = companies.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter">
      <Topbar title="🏢 Companies" />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '16px 16px' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search companies..."
          style={{
            width: '100%',
            background: 'var(--white)',
            border: '1.5px solid var(--border)',
            borderRadius: 10,
            padding: '11px 14px',
            fontSize: 14,
            fontFamily: 'var(--fb)',
            color: 'var(--text)',
            outline: 'none',
            marginBottom: 16,
          }}
        />

        {filtered.length === 0 ? (
          <Empty icon="🏢" text="No companies found" />
        ) : (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(c => (
              <Link key={c.id} href={`/app/pitches/${c.id}`} style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--s1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}>
                  {c.logo_url ? (
                    <img src={c.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 22 }}>🏢</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                    {c.name}
                  </h3>
                  {c.category && (
                    <span style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--muted)' }}>
                      {c.category}
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <StarRating value={Math.round(c.avg_overall || 0)} readonly size={14} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
