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
      const userList = Array.isArray(users) ? users : [];
      setStats({
        totalUsers: userList.length,
        checkedIn: userList.filter(u => u.checked_in).length,
        companies: (companies || []).length,
        totalVotes: (companies || []).reduce((sum, c) => sum + (c.vote_count || 0), 0),
        unreadMessages: unread?.unreadCount || 0,
        raffleEntries: Array.isArray(raffle) ? raffle.length : 0,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'from-blue-500 to-blue-600' },
    { label: 'Checked In', value: stats?.checkedIn || 0, icon: '✅', color: 'from-green-500 to-green-600' },
    { label: 'Companies', value: stats?.companies || 0, icon: '🏢', color: 'from-purple-500 to-purple-600' },
    { label: 'Total Votes', value: stats?.totalVotes || 0, icon: '🗳️', color: 'from-amber-500 to-amber-600' },
    { label: 'Unread Messages', value: stats?.unreadMessages || 0, icon: '💬', color: 'from-pink-500 to-pink-600' },
    { label: 'Raffle Entries', value: stats?.raffleEntries || 0, icon: '🎰', color: 'from-teal-500 to-teal-600' },
  ];

  return (
    <div className="page-enter">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="font-heading text-2xl font-bold text-green-900 mb-6">📊 Dashboard</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 stagger-in">
          {cards.map((card) => (
            <div key={card.label} className="glass-card p-5 text-center">
              <div className="text-3xl mb-2">{card.icon}</div>
              <p className="font-heading text-3xl font-bold text-green-900">{card.value}</p>
              <p className="font-body text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
