'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

const tabs = [
  { label: 'Dashboard', href: '/admin', icon: '📊', minLevel: 2 },
  { label: 'Check-in', href: '/admin/checkin', icon: '✅', minLevel: 2 },
  { label: 'Messages', href: '/admin/messages', icon: '💬', minLevel: 2 },
  { label: 'Companies', href: '/admin/companies', icon: '🏢', minLevel: 2 },
  { label: 'Schedule', href: '/admin/schedule', icon: '📅', minLevel: 2 },
  { label: 'Users', href: '/admin/users', icon: '👥', minLevel: 3 },
  { label: 'Raffle', href: '/admin/raffle', icon: '🎰', minLevel: 3 },
];

export default function AdminLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const level = session?.profile?.access_level || 0;
  const visibleTabs = tabs.filter(t => level >= t.minLevel);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--abg)', color: 'var(--atext)' }}>
      {/* Desktop sidebar */}
      <aside className="admin-sidebar" style={{
        background: 'var(--as1)',
        borderRight: '1px solid var(--aborder)',
        padding: '20px 0',
      }}>
        <div style={{ padding: '0 16px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🌿</span>
            <div>
              <h1 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 16, color: 'var(--atext)' }}>
                Admin
              </h1>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--asub)' }}>
                {session?.profile?.name}
              </p>
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' }}>
          {visibleTabs.map(tab => {
            const isActive = tab.href === '/admin' ? pathname === '/admin' : pathname.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                background: isActive ? 'var(--ad)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--asub)',
                fontFamily: 'var(--fb)', fontSize: 13, fontWeight: isActive ? 600 : 400,
                transition: 'background 0.15s, color 0.15s',
              }}>
                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', padding: '20px 16px' }}>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{
            background: 'none', border: 'none', color: 'var(--amuted)',
            fontFamily: 'var(--fb)', fontSize: 13, cursor: 'pointer',
            padding: '8px 0', width: '100%', textAlign: 'left',
          }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="admin-bottom-nav" style={{
        display: 'none',
        background: 'var(--as1)',
        borderBottom: '1px solid var(--aborder)',
        padding: '12px 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌿</span>
          <h1 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 15, color: 'var(--atext)' }}>Admin</h1>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/' })} style={{
          background: 'none', border: 'none', color: 'var(--asub)',
          fontFamily: 'var(--fb)', fontSize: 12, cursor: 'pointer',
        }}>Sign Out</button>
      </div>

      {/* Main content */}
      <main className="admin-main">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav items={visibleTabs.slice(0, 5)} admin />
    </div>
  );
}
