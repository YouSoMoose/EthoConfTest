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
  const upNext = schedule[0];

  const quickLinks = [
    { icon: '📅', label: 'Schedule', href: '/app/schedule' },
    { icon: '🏢', label: 'Companies', href: '/app/pitches' },
    { icon: '🛂', label: 'Passport', href: '/app/passport' },
    { icon: '💬', label: 'Chat', href: '/app/chat' },
    { icon: '📝', label: 'Notes', href: '/app/notes' },
    { icon: '💼', label: 'Wallet', href: '/app/wallet' },
    { icon: '🎫', label: 'My Card', href: '/app/my-card' },
    { icon: '🔍', label: 'Scan', href: '/app/scan' },
  ];

  return (
    <div className="page-enter">
      {/* Green header hero */}
      <div style={{
        background: 'var(--g)',
        color: '#fff',
        padding: 'max(16px, env(safe-area-inset-top)) 16px 24px',
      }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar src={profile?.avatar} name={profile?.name} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 22, margin: 0, color: '#fff' }}>
                Hey, {firstName}! 👋
              </h1>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 13, opacity: 0.8, marginTop: 2, color: '#fff' }}>
                Welcome to Ethos 2026
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {profile?.access_level >= 2 && (
                <Link href="/admin" style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 8,
                  padding: '5px 10px',
                  fontFamily: 'var(--fb)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                }}>
                  ⚙️ Admin
                </Link>
              )}
              {profile?.access_level === 1 && (
                <Link href="/company" style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 8,
                  padding: '5px 10px',
                  fontFamily: 'var(--fb)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                }}>
                  🏢 Portal
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 12,
                  fontFamily: 'var(--fb)',
                  padding: '6px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
        {/* Up Next */}
        {upNext && (
          <div style={{ marginBottom: 24 }}>
            <p className="section-label">📍 UP NEXT</p>
            <div style={{
              background: 'var(--gl)',
              border: '1px solid var(--gb)',
              borderRadius: 'var(--r)',
              padding: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
                    {upNext.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', marginTop: 4 }}>
                    {upNext.description}
                  </p>
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'var(--fb)',
                  background: 'var(--gl)',
                  border: '1px solid var(--gb)',
                  color: 'var(--g)',
                  padding: '4px 10px',
                  borderRadius: 20,
                  flexShrink: 0,
                }}>
                  {upNext.start_time}
                </span>
              </div>
              {upNext.location && (
                <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--sub)', marginTop: 10 }}>
                  📍 {upNext.location}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Access */}
        <div style={{ marginBottom: 24 }}>
          <p className="section-label">QUICK ACCESS</p>
          <div className="stagger" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
          }}>
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                padding: '14px 8px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}>
                <span style={{ fontSize: 24, display: 'block', marginBottom: 4 }}>{link.icon}</span>
                <span style={{ fontFamily: 'var(--fb)', fontSize: 10, fontWeight: 500, color: 'var(--sub)' }}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <div>
            <p className="section-label">📢 ANNOUNCEMENTS</p>
            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {announcements.map((a) => (
                <div key={a.id} style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                  padding: 16,
                }}>
                  <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                    {a.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', marginTop: 4 }}>
                    {a.content}
                  </p>
                  <p style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
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
