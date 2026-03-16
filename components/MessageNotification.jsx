'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Avatar from './Avatar';

export default function MessageNotification() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [lastNotifiedId, setLastNotifiedId] = useState(null);
  const [activeMsg, setActiveMsg] = useState(null);
  const [exiting, setExiting] = useState(false);

  const checkNewMessages = useCallback(async () => {
    if (!session?.profile?.id) return;
    // Don't show notifications if we are already in the chat or admin messages page
    if (pathname === '/app/chat' || pathname === '/admin/messages') return;

    try {
      const res = await fetch('/api/messages?unread=true&latest=true');
      if (res.ok) {
        const msg = await res.json();
        if (msg && msg.id !== lastNotifiedId) {
          setLastNotifiedId(msg.id);
          setActiveMsg(msg);
          setExiting(false);
          
          // Auto-hide after 6 seconds
          setTimeout(() => {
            setExiting(true);
            setTimeout(() => setActiveMsg(null), 400);
          }, 6000);
        }
      }
    } catch {}
  }, [session?.profile?.id, pathname, lastNotifiedId]);

  useEffect(() => {
    const iv = setInterval(checkNewMessages, 5000);
    return () => clearInterval(iv);
  }, [checkNewMessages]);

  if (!activeMsg) return null;

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
        padding: 'max(16px, env(safe-area-inset-top)) 16px 0',
        pointerEvents: 'none',
      }}
    >
      <div style={{
        background: 'rgba(25, 25, 25, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 20,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
        cursor: 'pointer',
        pointerEvents: 'auto',
        maxWidth: 450,
        margin: '0 auto',
        width: '100%',
        animation: exiting 
          ? 'notifExit 0.35s ease forwards' 
          : 'notifEnter 0.5s cubic-bezier(0.19, 1, 0.22, 1) both',
      }}>
        <Avatar src={sender?.avatar} name={sender?.name} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ 
              fontFamily: 'var(--fb)', fontWeight: 800, fontSize: 13, color: '#fff' 
            }}>{sender?.name || 'New Message'}</span>
            {isStaff && (
              <span style={{ 
                fontSize: 10, background: 'var(--g)', color: '#fff', 
                padding: '1px 5px', borderRadius: 4, fontWeight: 700,
                textTransform: 'uppercase'
              }}>Staff</span>
            )}
          </div>
          <p style={{
            fontFamily: 'var(--fb)', fontSize: 14, color: 'rgba(255,255,255,0.8)',
            margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>{activeMsg.content}</p>
        </div>
        <div style={{ fontSize: 18, opacity: 0.5 }}>💬</div>
      </div>
    </div>
  );
}
