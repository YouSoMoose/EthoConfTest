'use client';

import { useEffect, useState } from 'react';
import StarRating from '@/components/StarRating';
import Loader from '@/components/Loader';
import Empty from '@/components/Empty';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/companies').then(r => r.json()).then(d => { setCompanies(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader admin />;

  return (
    <div className="page-enter" style={{ padding: '24px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 22, color: 'var(--atext)', marginBottom: 20 }}>
          🏢 Companies
        </h2>

        {companies.length === 0 ? (
          <Empty icon="🏢" text="No companies registered yet" admin />
        ) : (
          <>
            {/* Desktop table */}
            <div className="admin-table" style={{
              background: 'var(--as2)', border: '1px solid var(--aborder)', borderRadius: 'var(--r)', overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--fb)', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--as3)' }}>
                    {['Company', 'Category', 'Votes', 'Overall', 'Sustainability', 'Impact', 'Feasibility'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontFamily: 'var(--fhs)', fontWeight: 600, fontSize: 12, color: 'var(--asub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {companies.map(c => (
                    <tr key={c.id} style={{ borderTop: '1px solid var(--aborder)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {c.logo_url ? <img src={c.logo_url} alt="" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover' }} /> : <span>🏢</span>}
                          <span style={{ color: 'var(--atext)', fontWeight: 500 }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--asub)' }}>{c.category || '—'}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--accent)', fontWeight: 600 }}>{c.vote_count || 0}</td>
                      <td style={{ padding: '12px 14px' }}><StarRating value={Math.round(c.avg_overall || 0)} readonly size={14} /></td>
                      <td style={{ padding: '12px 14px', color: 'var(--asub)' }}>{(c.avg_sustainability || 0).toFixed(1)}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--asub)' }}>{(c.avg_impact || 0).toFixed(1)}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--asub)' }}>{(c.avg_feasibility || 0).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="admin-cards stagger">
              {companies.map(c => (
                <div key={c.id} style={{
                  background: 'var(--as2)', border: '1px solid var(--aborder)', borderRadius: 'var(--r)', padding: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    {c.logo_url ? <img src={c.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} /> : <span style={{ fontSize: 20 }}>🏢</span>}
                    <div>
                      <h3 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 14, color: 'var(--atext)' }}>{c.name}</h3>
                      <span style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--amuted)' }}>{c.category || ''}</span>
                    </div>
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--fhs)', fontWeight: 700, color: 'var(--accent)' }}>{c.vote_count || 0} votes</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {[
                      { l: 'Overall', v: c.avg_overall },
                      { l: 'Sustain.', v: c.avg_sustainability },
                      { l: 'Impact', v: c.avg_impact },
                      { l: 'Feasib.', v: c.avg_feasibility },
                    ].map(r => (
                      <div key={r.l} style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--fb)', fontSize: 10, color: 'var(--amuted)', display: 'block' }}>{r.l}</span>
                        <span style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 14, color: 'var(--atext)' }}>{(r.v || 0).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
