'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Avatar from './Avatar';
import { supabase } from '@/lib/supabase';

export default function MessageNotification() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [lastNotifiedId, setLastNotifiedId] = useState(null);
  const [activeMsg, setActiveMsg] = useState(null);
  const [exiting, setExiting] = useState(false);

  // Use refs so the callback stays stable
  const lastNotifiedIdRef = useRef(lastNotifiedId);
  lastNotifiedIdRef.current = lastNotifiedId;
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const checkNewMessages = useCallback(async () => {
    if (!session?.profile?.id) return;
    if (pathnameRef.current === '/app/chat' || pathnameRef.current === '/admin/messages') return;

    try {
      const res = await fetch('/api/messages?unread=true&latest=true');
      if (res.ok) {
        const msg = await res.json();
        if (msg && msg.id !== lastNotifiedIdRef.current) {
          setLastNotifiedId(msg.id);
          setActiveMsg(msg);
          setExiting(false);
          
          setTimeout(() => {
            setExiting(true);
            setTimeout(() => setActiveMsg(null), 400);
          }, 6000);
        }
      }
    } catch {}
  }, [session?.profile?.id]);

  // Supabase Realtime subscription for new messages
  useEffect(() => {
    if (!session?.profile?.id) return;

    const channel = supabase
      .channel(`msg-notif-${session.profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${session.profile.id}`,
      }, () => { checkNewMessages(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session?.profile?.id, checkNewMessages]);

  if (!session?.profile || !activeMsg) return null;

  const sender = activeMsg.sender;
  const isStaff = sender?.access_level >= 2;

  const handleClick = () => {
    setActiveMsg(null);
    router.push(session?.profile?.access_level >= 2 ? '/admin/messages' : '/app/chat');
  };

  return (
    <div 
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 10000,
        padding: 'max(12px, env(safe-area-inset-top)) 12px 0',
        pointerEvents: 'none',
      }}
    >
      <div style={{
        background: 'rgba(30,30,30,0.85)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRadius: 16,
        padding: '14px 16px',
        display: 'flex', alignItems: 'flex-start', gap: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        border: '0.5px solid rgba(255,255,255,0.12)',
        cursor: 'pointer',
        pointerEvents: 'auto',
        maxWidth: 420,
        margin: '0 auto',
        width: '100%',
        animation: exiting 
          ? 'notifExit 0.3s ease forwards' 
          : 'notifEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, #2d5016 0%, #1a4a3c 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 16, fontFamily: 'var(--fh)', fontWeight: 800, color: '#fff',
        }}>E</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ 
              fontFamily: 'var(--fb)', fontWeight: 800, fontSize: 13, color: 'rgba(255,255,255,0.95)' 
            }}>{sender?.name || 'New Message'}</span>
            {isStaff && (
              <span style={{ 
                fontSize: 10, background: 'var(--g)', color: 'var(--text)', 
                padding: '1px 5px', borderRadius: 4, fontWeight: 700,
                textTransform: 'uppercase'
              }}>Staff</span>
            )}
          </div>
          <p style={{
            fontFamily: 'var(--fb)', fontSize: 14, color: '#fff',
            margin: 0, fontWeight: 600, lineHeight: 1.3
          }}>{activeMsg.content}</p>
        </div>
      </div>
    </div>
  );
}
