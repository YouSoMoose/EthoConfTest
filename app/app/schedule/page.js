'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import Empty from '@/components/Empty';
import { Calendar, MapPin, Clock, Info } from 'lucide-react';

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
      <Topbar title="Schedule" />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px', paddingBottom: 100 }}>
        {schedule.length === 0 ? (
          <Empty icon={<Calendar size={48} />} text="No events scheduled yet" />
        ) : (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {schedule.map((item) => (
              <div key={item.id} style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                padding: 18,
                display: 'flex',
                gap: 16,
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 17, color: 'var(--g)' }}>
                      {item.title}
                    </h3>
                  </div>
                  
                  {item.speaker && (
                    <p style={{ fontFamily: 'var(--fb)', fontSize: 13, fontWeight: 700, color: 'var(--sub)', marginBottom: 8 }}>
                      🎤 {item.speaker}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: 'var(--g)' }}>
                    <Clock size={14} />
                    <span style={{ fontFamily: 'var(--fb)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.start_time} {item.end_time ? `— ${item.end_time}` : ''}
                    </span>
                  </div>

                  {item.description && (
                    <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', lineHeight: 1.5, marginBottom: 14 }}>
                      {item.description}
                    </p>
                  )}
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {item.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', background: 'var(--s1)', padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>
                        <MapPin size={12} />
                        <span style={{ fontFamily: 'var(--fb)', fontSize: 11, fontWeight: 700 }}>{item.location}</span>
                      </div>
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
