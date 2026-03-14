'use client';

import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import Loader from '@/components/Loader';

export default function AttendeeDashboard() {
  const { data: session } = useSession();
  const [schedule, setSchedule] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/schedule').then(r => r.json()),
      fetch('/api/announcements').then(r => r.json()),
    ]).then(([sched, ann]) => {
      setSchedule(sched || []);
      setAnnouncements(ann || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const profile = session?.profile;
  const firstName = profile?.name?.split(' ')[0] || 'there';

  // Find the "up next" event (simple heuristic: first event not yet ended)
  const upNext = schedule[0];

  const quickLinks = [
    { icon: '📅', label: 'Schedule', href: '/app/schedule', color: 'from-green-100 to-emerald-50' },
    { icon: '🎤', label: 'Pitches', href: '/app/pitches', color: 'from-amber-100 to-yellow-50' },
    { icon: '🛂', label: 'Passport', href: '/app/passport', color: 'from-blue-100 to-sky-50' },
    { icon: '💬', label: 'Chat', href: '/app/chat', color: 'from-purple-100 to-violet-50' },
    { icon: '📝', label: 'Notes', href: '/app/notes', color: 'from-pink-100 to-rose-50' },
    { icon: '💼', label: 'Wallet', href: '/app/wallet', color: 'from-orange-100 to-amber-50' },
    { icon: '🎫', label: 'My Card', href: '/app/my-card', color: 'from-teal-100 to-cyan-50' },
    { icon: '🔍', label: 'Scan', href: '/app/scan', color: 'from-indigo-100 to-blue-50' },
  ];

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="page-header relative overflow-hidden">
        <div className="orb orb-green w-40 h-40 -top-10 -right-10" style={{ position: 'absolute', opacity: 0.15 }}></div>
        <div className="max-w-lg mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Avatar src={profile?.avatar} name={profile?.name} size={48} />
            <div className="flex-1">
              <h1 className="font-heading text-2xl font-bold text-white">
                Hey, {firstName}! 👋
              </h1>
              <p className="text-green-200 text-sm font-body">Welcome to Ethos 2026</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-green-200 hover:text-white text-xs font-body transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Up Next */}
        {upNext && (
          <div className="animate-fade-up">
            <h2 className="font-heading text-sm font-bold text-green-800 uppercase tracking-wider mb-3">
              📍 Up Next
            </h2>
            <div className="glass-card p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-heading font-bold text-green-900 text-lg">{upNext.title}</h3>
                  <p className="text-gray-500 text-sm font-body mt-1">{upNext.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-green-800 bg-green-100 px-2.5 py-1 rounded-full">
                    {upNext.start_time}
                  </span>
                </div>
              </div>
              {upNext.location && (
                <p className="text-xs text-amber-700 mt-3 font-body">📍 {upNext.location}</p>
              )}
            </div>
          </div>
        )}

        {/* Quick Access Grid */}
        <div>
          <h2 className="font-heading text-sm font-bold text-green-800 uppercase tracking-wider mb-3">
            Quick Access
          </h2>
          <div className="grid grid-cols-4 gap-3 stagger-in">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`glass-card text-center p-3 bg-gradient-to-br ${link.color} hover:scale-105 transition-transform duration-200`}
              >
                <div className="text-2xl mb-1">{link.icon}</div>
                <span className="text-[10px] font-body font-medium text-gray-700">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <div>
            <h2 className="font-heading text-sm font-bold text-green-800 uppercase tracking-wider mb-3">
              📢 Announcements
            </h2>
            <div className="space-y-3 stagger-in">
              {announcements.map((a) => (
                <div key={a.id} className="glass-card p-4">
                  <h3 className="font-heading font-bold text-green-900">{a.title}</h3>
                  <p className="text-gray-600 text-sm font-body mt-1">{a.content}</p>
                  <p className="text-xs text-gray-400 font-body mt-2">
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
