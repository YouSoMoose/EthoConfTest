'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Avatar from '@/components/Avatar';
import Loader from '@/components/Loader';
import Btn from '@/components/Btn';
import Empty from '@/components/Empty';
import { Ticket, Dices, Trophy } from 'lucide-react';

export default function AdminRafflePage() {
  const [entries, setEntries] = useState([]);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/raffle').then(r => r.json()).then(d => { setEntries(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const pickWinner = () => {
    if (!entries.length) { toast.error('No entries'); return; }
    setWinner(entries[Math.floor(Math.random() * entries.length)]);
    toast.success('Winner picked!');
  };

  if (loading) return <Loader admin />;

  return (
    <div className="page-enter" style={{ padding: '24px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 22, color: 'var(--atext)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Ticket size={24} /> Raffle
          </h2>
          <Btn variant="accent" sm onClick={pickWinner} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Dices size={16} /> Pick Winner
          </Btn>
        </div>

        {winner && (
          <div style={{
            background: 'var(--as2)', border: '2px solid var(--accent)', borderRadius: 'var(--r)',
            padding: 32, textAlign: 'center', marginBottom: 20,
            animation: 'scaleIn 0.3s ease both',
          }}>
            <div style={{ background: 'var(--accent)', color: 'var(--white)', padding: '8px 16px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Trophy size={20} />
              <span style={{ fontFamily: 'var(--fb)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Lucky Winner
              </span>
            </div>
            <p style={{ fontFamily: 'var(--fhs)', fontWeight: 600, fontSize: 14, color: 'var(--asub)', marginBottom: 8 }}>Winner!</p>
            <Avatar src={winner.profiles?.avatar} name={winner.profiles?.name} size={56} />
            <h3 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 20, color: 'var(--accent)', marginTop: 12 }}>
              {winner.profiles?.name}
            </h3>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--asub)', marginTop: 4 }}>
              {winner.profiles?.email}
            </p>
          </div>
        )}

        <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--asub)', marginBottom: 12 }}>
          {entries.length} total entr{entries.length === 1 ? 'y' : 'ies'}
        </p>

        {entries.length === 0 ? (
          <Empty icon={<Ticket size={48} />} text="No raffle entries yet" admin />
        ) : (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map(e => (
              <div key={e.id} style={{
                background: winner?.id === e.id ? 'var(--ad)' : 'var(--as2)',
                border: `1px solid ${winner?.id === e.id ? 'var(--accent)' : 'var(--aborder)'}`,
                borderRadius: 'var(--r)',
                padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <Avatar src={e.profiles?.avatar} name={e.profiles?.name} size={32} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 14, color: 'var(--atext)' }}>
                    {e.profiles?.name}
                  </h3>
                  <p style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--amuted)' }}>{e.profiles?.email}</p>
                </div>
                <span style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--amuted)' }}>
                  {new Date(e.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
