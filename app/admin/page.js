'use client';

import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/companies').then(r => r.json()),
      fetch('/api/messages?unread=true').then(r => r.json()),
      fetch('/api/raffle').then(r => r.json()).catch(() => []),
    ]).then(([users, companies, unread, raffle]) => {
      const u = Array.isArray(users) ? users : [];
      setStats({
        totalUsers: u.length,
        checkedIn: u.filter(x => x.checked_in).length,
        companies: (companies || []).length,
        totalVotes: (companies || []).reduce((s, c) => s + (c.vote_count || 0), 0),
        unreadMessages: unread?.unreadCount || 0,
        raffleEntries: Array.isArray(raffle) ? raffle.length : 0,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader admin />;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥' },
    { label: 'Checked In', value: stats?.checkedIn || 0, icon: '✅' },
    { label: 'Companies', value: stats?.companies || 0, icon: '🏢' },
    { label: 'Total Votes', value: stats?.totalVotes || 0, icon: '🗳️' },
    { label: 'Unread Messages', value: stats?.unreadMessages || 0, icon: '💬' },
    { label: 'Raffle Entries', value: stats?.raffleEntries || 0, icon: '🎰' },
  ];

  return (
    <div className="page-enter" style={{ padding: '24px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 22, color: 'var(--atext)', marginBottom: 20 }}>
          📊 Dashboard
        </h2>

        <div className="stagger admin-stat-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}>
          {cards.map(card => (
            <div key={card.label} style={{
              background: 'var(--as2)',
              border: '1px solid var(--aborder)',
              borderRadius: 'var(--r)',
              padding: 20,
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{card.icon}</span>
              <p style={{ fontFamily: 'var(--fhs)', fontWeight: 800, fontSize: 28, color: 'var(--accent)' }}>
                {card.value}
              </p>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--asub)', marginTop: 4 }}>
                {card.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
