'use client';

import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import Loader from '@/components/Loader';
import { Home, Calendar, Wallet, Scan, MessageCircle, FileText, CreditCard, ChevronRight, LogOut, Settings } from 'lucide-react';
import { CardPreview } from '@/components/CardPreview';

function AnnouncementCard({ a }) {
  const [expanded, setExpanded] = useState(false);
  const timeSince = Math.round((Date.now() - new Date(a.created_at).getTime()) / 60000);
  const timeLabel = timeSince < 1 ? 'just now' : timeSince < 60 ? `${timeSince}m ago` : `${Math.round(timeSince / 60)}h ago`;

  return (
    <div onClick={() => a.content && setExpanded(!expanded)} style={{
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r)',
      padding: '16px',
      cursor: a.content ? 'pointer' : 'default',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, color: 'var(--text)', margin: 0 }}>
          {a.title}
        </h3>
        <span style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
          {timeLabel}
        </span>
      </div>
      {a.content && (
        <div style={{
          overflow: 'hidden',
          transition: 'max-height 0.3s ease, margin 0.3s ease, opacity 0.3s ease',
          maxHeight: expanded ? 500 : 0,
          marginTop: expanded ? 8 : 0,
          opacity: expanded ? 1 : 0,
        }}>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', lineHeight: 1.4 }}>
            {a.content}
          </p>
        </div>
      )}
      {a.content && !expanded && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <div style={{ width: 32, height: 4, background: 'var(--s1)', borderRadius: 2 }} />
        </div>
      )}
    </div>
  );
}

export default function AttendeeDashboard() {
  const { data: session } = useSession();
  const [schedule, setSchedule] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customizations, setCustomizations] = useState(null);

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

  useEffect(() => {
    if (session?.profile?.id) {
      const saved = localStorage.getItem('ethos_card_customizations');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed[session.profile.id]) {
            setCustomizations(parsed[session.profile.id]);
          }
        } catch(e) {}
      }
    }
  }, [session]);

  if (loading) return <Loader />;

  const profile = session?.profile;
  const firstName = profile?.name?.split(' ')[0] || 'there';
  const upNext = schedule[0];

  return (
    <div className="page-enter">
      {/* Gradient header hero */}
      <div style={{
        background: 'var(--hero)',
        color: 'var(--text)',
        padding: 'max(16px, env(safe-area-inset-top)) 16px 32px',
        boxShadow: '0 4px 20px rgba(65, 52, 41, 0.15)',
      }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar src={profile?.avatar} name={profile?.name} size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 24, margin: 0, color: 'var(--g)', letterSpacing: '-0.02em' }}>
                Hey, {firstName}! 👋
              </h1>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 13, opacity: 0.9, marginTop: 2, color: 'var(--sub)', fontWeight: 500 }}>
                Welcome to Ethos 2026
              </p>
            </div>
            <img src="/assets/ethos-logo-insignia.png" alt="" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0)' }} />
          </div>
          
          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            {profile?.access_level >= 3 && (
              <Link href="/admin" style={{
                flex: 1, background: 'rgba(0,0,0,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 14, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                color: 'var(--g)', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s'
              }}>
                <Settings size={16} /> Admin Panel
              </Link>
            )}
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                signOut({ redirect: true, callbackUrl: '/login' });
              }} 
              className="signout-btn"
              style={{
                flex: profile?.access_level >= 3 ? 0.4 : 1, 
                background: 'rgba(0,0,0,0.04)', 
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 14, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                color: 'var(--g)', fontSize: 13, fontWeight: 700, cursor: 'pointer'
              }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* RESPONSIVE ID CARD PREVIEW */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <p className="section-label" style={{ margin: 0 }}>MY CARD</p>
             <Link href="/app/my-card" style={{ fontSize: 13, fontFamily: 'var(--fb)', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>Virtual ID &rarr;</Link>
          </div>
          
          <Link href="/app/my-card" style={{ textDecoration: 'none', display: 'block', position: 'relative', width: '100%', paddingBottom: '147%' /* (500/340)*100 */ }}>
            <div style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center'
            }}>
              <div style={{ 
                transformOrigin: 'top center', 
                transform: 'scale(calc(min(1, var(--vw-scale, 1))))',
                width: 340, height: 500, // Fixed physical size of the card component
              }}>
                 {/* Internal logic variables for inline VW scale */}
                 <style dangerouslySetInnerHTML={{__html: `
                    :root { --vw-scale: calc((100vw - 32px) / 340); }
                    @media (min-width: 500px) { :root { --vw-scale: calc(468px / 340); } }
                 `}} />
                 <CardPreview user={session.profile} style={customizations || undefined} />
              </div>
            </div>
          </Link>
        </div>
        {/* Up Next */}
        {upNext && (
          <div>
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

        {/* NOTES APP LINK */}
        <div>
           <p className="section-label">WORKSPACE</p>
           <Link href="/app/notes" style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r)',
              padding: 24,
              display: 'flex', alignItems: 'center', gap: 16,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              transition: 'all 0.2s',
           }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--s1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--g)' }}>
                 <FileText size={24} />
              </div>
              <div style={{ flex: 1 }}>
                 <h3 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 16, color: 'var(--text)', margin: 0 }}>Capture Notes</h3>
                 <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', margin: '4px 0 0 0' }}>Jot down insights from your current session.</p>
              </div>
              <ChevronRight color="var(--muted)" />
           </Link>
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <div>
            <p className="section-label">📢 ANNOUNCEMENTS</p>
            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {announcements.map((a) => <AnnouncementCard key={a.id} a={a} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
