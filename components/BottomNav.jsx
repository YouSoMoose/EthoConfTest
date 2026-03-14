'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const tabs = [
  { label: 'Home', href: '/app', icon: '🏠' },
  { label: 'Schedule', href: '/app/schedule', icon: '📅' },
  { label: 'Pitches', href: '/app/pitches', icon: '🎤' },
  { label: 'Passport', href: '/app/passport', icon: '🛂' },
  { label: 'Chat', href: '/app/chat', icon: '💬' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!session?.profile?.id) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/messages?unread=true');
        if (res.ok) {
          const data = await res.json();
          setUnread(data.unreadCount || 0);
        }
      } catch (e) {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [session?.profile?.id]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom" style={{
      background: 'linear-gradient(to top, rgba(255,255,255,0.98), rgba(255,255,255,0.95))',
      borderTop: '1px solid rgba(217, 164, 89, 0.2)',
      backdropFilter: 'blur(10px)',
    }}>
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.href === '/app'
              ? pathname === '/app'
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 relative ${
                isActive
                  ? 'text-green-800 font-bold scale-110'
                  : 'text-gray-400 hover:text-green-700 active:scale-95'
              }`}
            >
              <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-body">{tab.label}</span>
              {isActive && (
                <span
                  className="absolute -bottom-1 w-6 h-1 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #22c55e, #f59e0b)',
                  }}
                />
              )}
              {tab.label === 'Chat' && unread > 0 && (
                <span className="absolute -top-0.5 right-0 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center pulse-glow">
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
