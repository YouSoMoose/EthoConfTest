'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Home, Calendar, Wallet, Scan, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const attendeeTabs = [
  { label: 'Home', href: '/app', icon: Home },
  { label: 'Schedule', href: '/app/schedule', icon: Calendar },
  { label: 'Wallet', href: '/app/wallet', icon: Wallet },
  { label: 'Scan', href: '/app/scan', icon: Scan },
  { label: 'Chat', href: '/app/chat', icon: MessageCircle },
];

export default function BottomNav({ items, admin }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unread, setUnread] = useState(0);
  const tabs = items || attendeeTabs;
  const manyTabs = tabs.length > 5;
  const [realtimeTrigger, setRealtimeTrigger] = useState(0);

  // Fetch unread count on mount + whenever Realtime fires
  useEffect(() => {
    if (admin || !session?.profile?.id) return;
    (async () => {
      try {
        const res = await fetch(`/api/messages?unread=true&_t=${Date.now()}`);
        if (res.ok) { const d = await res.json(); setUnread(d.unreadCount || 0); }
      } catch { }
    })();
  }, [session?.profile?.id, admin, realtimeTrigger]);

  // Supabase Realtime — bump trigger on new messages or read updates
  useEffect(() => {
    if (admin) return;
    const channel = supabase
      .channel('unread-badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        setRealtimeTrigger(n => n + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [admin]);

  const bg = admin ? 'var(--as1)' : 'var(--white)';
  const border = admin ? 'var(--aborder)' : 'var(--border)';
  const activeColor = admin ? 'var(--accent)' : 'var(--g)';
  const inactiveColor = admin ? 'var(--amuted)' : 'var(--muted)';

  if (!admin && !session?.profile?.id) return null;

  return (
    <nav className={admin ? 'admin-bottom-nav' : ''} style={{
      position: 'absolute', // Fixed to bottom of container
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: bg,
      borderTop: `1px solid ${border}`,
      paddingBottom: 'calc(max(12px, env(safe-area-inset-bottom)) + 28px)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        maxWidth: admin ? '100%' : 500,
        margin: '0 auto',
        width: '100%',
        height: 64,
      }}>
        {tabs.map((tab) => {
          const isActive = tab.href === (admin ? '/admin' : '/app')
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          const Icon = tab.icon;

          return (
            <Link key={tab.href} href={tab.href} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '8px 12px',
              position: 'relative',
              color: isActive ? activeColor : inactiveColor,
              fontFamily: 'var(--fb)',
              fontSize: 10,
              fontWeight: isActive ? 600 : 500,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              minWidth: 64,
              flexShrink: 0,
              textDecoration: 'none',
            }}>
              {isActive && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32,
                  height: 3,
                  borderRadius: '0 0 4px 4px',
                  background: activeColor,
                }} />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ opacity: isActive ? 1 : 0.8 }}>{tab.label}</span>
              {!admin && tab.label === 'Chat' && unread > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 8,
                  right: 12,
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 800,
                  borderRadius: 10,
                  minWidth: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  animation: 'pulseGlow 2s ease-in-out infinite',
                }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
