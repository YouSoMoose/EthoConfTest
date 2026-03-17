'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

const DISMISSED_KEY = 'ethos_dismissed_announcements';

function getDismissed() {
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY)) || []; } catch { return []; }
}

function addDismissed(id) {
  const list = getDismissed();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(list));
  }
}

export default function AnnouncementBanner() {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState([]);
  const [visible, setVisible] = useState([]);
  const [exiting, setExiting] = useState([]);
  const [realtimeTrigger, setRealtimeTrigger] = useState(0);

  // Fetch announcements whenever session loads OR Realtime fires
  useEffect(() => {
    if (!session?.profile) return;
    (async () => {
      try {
        const res = await fetch('/api/announcements');
        if (res.ok) {
          const data = await res.json();
          const dismissed = getDismissed();
          const fresh = (data || []).filter(a => !dismissed.includes(a.id));
          setAnnouncements(fresh);
          setVisible(prev => {
            const newIds = fresh.map(a => a.id).filter(id => !prev.includes(id));
            return [...prev, ...newIds];
          });
        }
      } catch {}
    })();
  }, [session?.profile, realtimeTrigger]);

  // Supabase Realtime — just bump the trigger counter
  useEffect(() => {
    const channel = supabase
      .channel('announcements-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, () => {
        setRealtimeTrigger(n => n + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const dismiss = (id) => {
    setExiting(e => [...e, id]);
    setTimeout(() => {
      addDismissed(id);
      setVisible(v => v.filter(x => x !== id));
      setExiting(e => e.filter(x => x !== id));
    }, 300);
  };

  const activeAnnouncements = announcements.filter(a => visible.includes(a.id));

  if (!session?.profile || activeAnnouncements.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 9999,
      padding: 'max(12px, env(safe-area-inset-top)) 12px 0',
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      {activeAnnouncements.map((a, i) => {
        const isExiting = exiting.includes(a.id);
        const timeSince = Math.round((Date.now() - new Date(a.created_at).getTime()) / 60000);
        const timeLabel = timeSince < 1 ? 'just now' : timeSince < 60 ? `${timeSince}m ago` : `${Math.round(timeSince / 60)}h ago`;

        return (
          <div
            key={a.id}
            onClick={() => dismiss(a.id)}
            style={{
              background: 'rgba(30, 30, 30, 0.85)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              borderRadius: 16,
              padding: '14px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.15)',
              border: '0.5px solid rgba(255,255,255,0.12)',
              cursor: 'pointer',
              pointerEvents: 'auto',
              maxWidth: 420,
              margin: '0 auto',
              width: '100%',
              animation: isExiting
                ? 'notifExit 0.3s ease forwards'
                : 'notifEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
              animationDelay: isExiting ? '0s' : `${i * 0.08}s`,
            }}
          >
            {/* App icon */}
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #2d5016 0%, #1a4a3c 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              fontSize: 16, fontFamily: 'var(--fh)', fontWeight: 800, color: '#fff',
            }}>E</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{
                  fontFamily: 'var(--fb)', fontWeight: 700, fontSize: 13,
                  color: 'rgba(255,255,255,0.95)',
                  textTransform: 'uppercase', letterSpacing: '0.02em',
                }}>ETHOS 2026</span>
                <span style={{
                  fontFamily: 'var(--fb)', fontSize: 11, color: 'rgba(255,255,255,0.4)',
                }}>{timeLabel}</span>
              </div>
              <p style={{
                fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 14,
                color: '#fff', marginBottom: 2, lineHeight: 1.3,
              }}>{a.title}</p>
              {a.content && (
                <p style={{
                  fontFamily: 'var(--fb)', fontSize: 13,
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: 1.35,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>{a.content}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
