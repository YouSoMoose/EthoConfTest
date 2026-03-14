'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import Empty from '@/components/Empty';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/schedule').then(r => r.json())
      .then(d => { setSchedule(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-enter">
      <Topbar title="📅 Schedule" />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
        {schedule.length === 0 ? (
          <Empty icon="📅" text="No events scheduled yet" />
        ) : (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {schedule.map((item) => (
              <div key={item.id} style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                padding: 16,
                display: 'flex',
                gap: 14,
              }}>
                {/* Timeline dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--g)',
                    flexShrink: 0,
                  }} />
                  <div style={{ width: 2, flex: 1, background: 'var(--s2)', marginTop: 4 }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                      {item.title}
                    </h3>
                    <span style={{
                      fontFamily: 'var(--fb)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--g)',
                      background: 'var(--gl)',
                      padding: '3px 8px',
                      borderRadius: 8,
                      flexShrink: 0,
                    }}>
                      {item.start_time}
                    </span>
                  </div>
                  {item.description && (
                    <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', marginTop: 4 }}>
                      {item.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    {item.location && (
                      <span style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--muted)' }}>
                        📍 {item.location}
                      </span>
                    )}
                    {item.end_time && (
                      <span style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--muted)' }}>
                        Until {item.end_time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
