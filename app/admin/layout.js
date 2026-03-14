'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import PageTransition from '@/components/PageTransition';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const level = session?.profile?.access_level || 0;
  const visibleTabs = tabs.filter(t => level >= t.minLevel);

  const isActive = (href) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

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
          {visibleTabs.map(tab => (
            <Link key={tab.href} href={tab.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: isActive(tab.href) ? 'var(--ad)' : 'transparent',
              color: isActive(tab.href) ? 'var(--accent)' : 'var(--asub)',
              fontFamily: 'var(--fb)', fontSize: 13, fontWeight: isActive(tab.href) ? 600 : 400,
              transition: 'background 0.15s, color 0.15s',
            }}>
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              {tab.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '12px 16px' }}>
          <Link href="/app" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', borderRadius: 10, marginBottom: 4,
            background: 'var(--ad)', color: 'var(--accent)',
            fontFamily: 'var(--fb)', fontSize: 13, fontWeight: 500,
          }}>
            <span style={{ fontSize: 16 }}>👤</span> Attendee View
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{
            background: 'none', border: 'none', color: 'var(--amuted)',
            fontFamily: 'var(--fb)', fontSize: 13, cursor: 'pointer',
            padding: '8px 12px', width: '100%', textAlign: 'left',
          }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="admin-mobile-header" style={{
        display: 'none',
        background: 'var(--as1)',
        borderBottom: '1px solid var(--aborder)',
        padding: '12px 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setMenuOpen(true)} style={{
            background: 'none', border: 'none', color: 'var(--atext)',
            fontSize: 22, cursor: 'pointer', padding: 0, lineHeight: 1,
          }}>☰</button>
          <Link href="/admin" style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 15, color: 'var(--atext)' }}>Admin</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/app" style={{
            background: 'var(--ad)', border: '1px solid var(--ab)', borderRadius: 8,
            padding: '5px 10px', fontFamily: 'var(--fb)', fontSize: 11,
            fontWeight: 600, color: 'var(--accent)', whiteSpace: 'nowrap',
          }}>
            👤 Attendee
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{
            background: 'none', border: 'none', color: 'var(--asub)',
            fontFamily: 'var(--fb)', fontSize: 12, cursor: 'pointer',
          }}>Sign Out</button>
        </div>
      </header>

      {/* Mobile slide-out drawer */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div onClick={() => setMenuOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            zIndex: 200, animation: 'fadeUp 0.15s ease both',
          }} />
          {/* Drawer */}
          <div style={{
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: 260, background: 'var(--as1)',
            borderRight: '1px solid var(--aborder)',
            zIndex: 210, padding: '20px 0',
            display: 'flex', flexDirection: 'column',
            animation: 'slideInLeft 0.22s ease both',
          }}>
            <div style={{ padding: '0 16px', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>🌿</span>
                  <div>
                    <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 16, color: 'var(--atext)' }}>Admin</h2>
                    <p style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--asub)' }}>{session?.profile?.name}</p>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} style={{
                  background: 'none', border: 'none', color: 'var(--asub)',
                  fontSize: 20, cursor: 'pointer', padding: 4,
                }}>✕</button>
              </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px', flex: 1 }}>
              {visibleTabs.map(tab => (
                <Link key={tab.href} href={tab.href} onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 12px', borderRadius: 10,
                  background: isActive(tab.href) ? 'var(--ad)' : 'transparent',
                  color: isActive(tab.href) ? 'var(--accent)' : 'var(--asub)',
                  fontFamily: 'var(--fb)', fontSize: 14, fontWeight: isActive(tab.href) ? 600 : 400,
                  transition: 'background 0.15s, color 0.15s',
                }}>
                  <span style={{ fontSize: 18 }}>{tab.icon}</span>
                  {tab.label}
                </Link>
              ))}
            </nav>

            <div style={{ padding: '16px', borderTop: '1px solid var(--aborder)' }}>
              <button onClick={() => signOut({ callbackUrl: '/' })} style={{
                background: 'none', border: 'none', color: 'var(--amuted)',
                fontFamily: 'var(--fb)', fontSize: 13, cursor: 'pointer',
                padding: '8px 0', width: '100%', textAlign: 'left',
              }}>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <main className="admin-main">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
