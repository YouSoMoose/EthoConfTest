'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const attendeeTabs = [
  { label: 'Home', href: '/app', icon: '🏠' },
  { label: 'Schedule', href: '/app/schedule', icon: '📅' },
  { label: 'Companies', href: '/app/pitches', icon: '🏢' },
  { label: 'Passport', href: '/app/passport', icon: '🛂' },
  { label: 'Chat', href: '/app/chat', icon: '💬' },
];

export default function BottomNav({ items, admin }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unread, setUnread] = useState(0);
  const tabs = items || attendeeTabs;
  const manyTabs = tabs.length > 5;

  useEffect(() => {
    if (admin || !session?.profile?.id) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/messages?unread=true');
        if (res.ok) { const d = await res.json(); setUnread(d.unreadCount || 0); }
      } catch { }
    };
    fetchUnread();
    const iv = setInterval(fetchUnread, 15000);
    return () => clearInterval(iv);
  }, [session?.profile?.id, admin]);

  const bg = admin ? 'var(--as1)' : 'var(--white)';
  const border = admin ? 'var(--aborder)' : 'var(--border)';
  const activeColor = admin ? 'var(--accent)' : 'var(--g)';
  const inactiveColor = admin ? 'var(--amuted)' : 'var(--muted)';

  return (
    <nav className={admin ? 'admin-bottom-nav' : ''} style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: bg,
      borderTop: `1px solid ${border}`,
      paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: manyTabs ? 'flex-start' : 'space-around',
        alignItems: 'center',
        maxWidth: admin ? '100%' : 500,
        margin: '0 auto',
        width: '100%',
        height: 56,
        overflowX: manyTabs ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
        gap: manyTabs ? 0 : 0,
        paddingLeft: manyTabs ? 8 : 0,
        paddingRight: manyTabs ? 8 : 0,
      }}>
        {tabs.map((tab) => {
          const isActive = tab.href === (admin ? '/admin' : '/app')
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link key={tab.href} href={tab.href} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: manyTabs ? '6px 6px' : '6px 12px',
              position: 'relative',
              color: isActive ? activeColor : inactiveColor,
              fontFamily: 'var(--fb)',
              fontSize: manyTabs ? 9 : 10,
              fontWeight: isActive ? 600 : 400,
              transition: 'color 0.2s',
              minWidth: manyTabs ? 48 : 44,
              flexShrink: 0,
              minHeight: 44,
              flex: manyTabs ? '1 0 auto' : undefined,
            }}>
              {isActive && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 3,
                  borderRadius: 3,
                  background: activeColor,
                }} />
              )}
              <span style={{ fontSize: manyTabs ? 18 : 20 }}>{tab.icon}</span>
              <span>{tab.label}</span>
              {!admin && tab.label === 'Chat' && unread > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: 4,
                  background: '#e44',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  borderRadius: 10,
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
