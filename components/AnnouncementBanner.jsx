'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

function getDismissed(uid) {
  if (!uid) return [];
  try { return JSON.parse(localStorage.getItem(`ethos_dismissed_${uid}`)) || []; } catch { return []; }
}

function addDismissed(uid, id) {
  if (!uid) return;
  const list = getDismissed(uid);
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(`ethos_dismissed_${uid}`, JSON.stringify(list));
  }
}

export default function AnnouncementBanner() {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState([]);
  const [visible, setVisible] = useState([]);
  const [exiting, setExiting] = useState([]);
  // Track IDs we've already processed to prevent double-adding from both sources
  const seenIds = useRef(new Set());

  const addAnnouncement = (ann, uid) => {
    // If we've already processed this ID from either source, skip it
    if (seenIds.current.has(ann.id)) return;
    const dismissed = getDismissed(uid);
    if (dismissed.includes(ann.id)) return;
    seenIds.current.add(ann.id);
    setAnnouncements(prev => [ann, ...prev]);
    setVisible(prev => [...prev, ann.id]);
  };

  // Polling — only runs on mount and checks for new announcements
  useEffect(() => {
    const uid = session?.user?.id || session?.profile?.id;
    if (!uid) return;

    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`/api/announcements?_t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        const dismissed = getDismissed(uid);
        const fresh = (data || []).filter(a => !dismissed.includes(a.id));
        if (fresh.length === 0) return;

        const latest = fresh[0];
        // Auto-dismiss older ones silently
        fresh.slice(1).forEach(a => addDismissed(uid, a.id));
        addAnnouncement(latest, uid);
      } catch { }
    };

    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 10000);
    return () => clearInterval(interval);
  }, [session?.user?.id, session?.profile?.id]);

  // Realtime — listens for new inserts only
  useEffect(() => {
    const uid = session?.user?.id || session?.profile?.id;
    if (!uid) return;

    const channel = supabase
      .channel('announcements-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => {
        addAnnouncement(payload.new, uid);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id, session?.profile?.id]);

  const dismiss = (id) => {
    const uid = session?.user?.id || session?.profile?.id;
    setExiting(e => [...e, id]);
    setTimeout(() => {
      addDismissed(uid, id);
      setVisible(v => v.filter(x => x !== id));
      setExiting(e => e.filter(x => x !== id));
    }, 300);
  };

  const uid = session?.user?.id || session?.profile?.id;
  const activeAnnouncements = announcements.filter(a => visible.includes(a.id)).slice(0, 1);

  if (!uid || activeAnnouncements.length === 0) return null;

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
                }}>The Circular Economy Conference</span>
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
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.4,
                  marginTop: 6,
                }}>{a.content}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}