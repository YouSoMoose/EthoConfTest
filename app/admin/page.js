'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Loader from '@/components/Loader';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const level = session?.profile?.access_level || 0;

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
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', href: '/admin/users', minLevel: 3 },
    { label: 'Checked In', value: stats?.checkedIn || 0, icon: '✅', href: '/admin/checkin', minLevel: 2 },
    { label: 'Companies', value: stats?.companies || 0, icon: '🏢', href: '/admin/companies', minLevel: 2 },
    { label: 'Total Votes', value: stats?.totalVotes || 0, icon: '🗳️' },
    { label: 'Unread Messages', value: stats?.unreadMessages || 0, icon: '💬', href: '/admin/messages', minLevel: 2 },
    { label: 'Raffle Entries', value: stats?.raffleEntries || 0, icon: '🎰', href: '/admin/raffle', minLevel: 3 },
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
          {cards.map(card => {
            const canAccess = card.href && (!card.minLevel || level >= card.minLevel);

            const content = (
              <div style={{
                background: 'var(--as2)',
                border: '1px solid var(--aborder)',
                borderRadius: 'var(--r)',
                padding: 20,
                textAlign: 'center',
                cursor: canAccess ? 'pointer' : 'default',
                opacity: (card.minLevel && level < card.minLevel) ? 0.45 : 1,
                height: '100%',
              }}>
                <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{card.icon}</span>
                <p style={{ fontFamily: 'var(--fhs)', fontWeight: 800, fontSize: 28, color: 'var(--accent)' }}>
                  {card.value}
                </p>
                <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--asub)', marginTop: 4 }}>
                  {card.label}
                </p>
              </div>
            );

            return canAccess ? (
              <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
                {content}
              </Link>
            ) : (
              <div key={card.label}>{content}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
