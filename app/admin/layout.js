'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import AdminSwitch from '@/components/AdminSwitch';

import { LayoutDashboard, CheckCircle, MessageSquare, Calendar, Users, User, Leaf, Menu, X, CreditCard, LogOut, AlertTriangle } from 'lucide-react';

const tabs = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, show: (level) => level >= 3 },
  { label: 'Check-in', href: '/admin/checkin', icon: CheckCircle, show: (level) => level >= 2 },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare, show: (level) => level >= 3 },
  { label: 'Schedule', href: '/admin/schedule', icon: Calendar, show: (level) => level >= 3 },
  { label: 'ID Cards', href: '/admin/cards', icon: CreditCard, show: (level) => level >= 3 },
  { label: 'Users', href: '/admin/users', icon: Users, show: (level) => level >= 3 },
  { label: 'Logout Users', href: '/admin/logout', icon: LogOut, show: (level) => level >= 3 },
  { label: 'Hard Reset QR', href: '/admin/reset', icon: AlertTriangle, show: (level) => level >= 3 },
];

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const level = session?.profile?.access_level || 0;
  const visibleTabs = tabs.filter(t => t.show(level));

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (level === 2 && pathname !== '/admin/checkin' && status === 'authenticated') {
      router.replace('/admin/checkin');
    }
  }, [level, pathname, router, status]);

  const isActive = (href) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  if (level === 2) {
    return (
      <div style={{ minHeight: 'var(--app-height, 100dvh)', height: 'var(--app-height, 100dvh)', background: 'var(--abg)', color: 'var(--atext)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          background: 'rgba(74, 63, 53, 0.85)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--aborder)',
          padding: '12px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          position: 'sticky', top: 0, zIndex: 60,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h1 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 16, color: 'var(--atext)' }}>Staff Scanner</h1>
            <button
              type="button"
              onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
              className="signout-btn"
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
                padding: '6px 12px', fontFamily: 'var(--fb)', fontSize: 12,
                fontWeight: 600, color: 'var(--accent)', cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
          <div style={{ maxWidth: 500, width: '100%', margin: '0 auto' }}>
            <AdminSwitch admin />
          </div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', position: 'relative', minHeight: 0 }}>
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'var(--app-height, 100dvh)', height: 'var(--app-height, 100dvh)', background: 'var(--abg)', color: 'var(--atext)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Desktop sidebar */}
      <aside className="admin-sidebar" style={{
        background: 'rgba(74, 63, 53, 0.85)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--aborder)',
        padding: '20px 0',
        animation: 'slideDown 0.8s var(--liquid) both',
      }}>
        <div style={{ padding: '0 16px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Leaf size={24} color="var(--accent)" />
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
          {visibleTabs.map((tab) => (
            <Link key={tab.href} href={tab.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: isActive(tab.href) ? 'var(--ad)' : 'transparent',
              color: isActive(tab.href) ? 'var(--accent)' : 'var(--asub)',
              fontFamily: 'var(--fb)', fontSize: 13, fontWeight: isActive(tab.href) ? 600 : 400,
              transition: 'all 0.4s var(--liquid)',
            }}
            onMouseOver={e => !isActive(tab.href) && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseOut={e => !isActive(tab.href) && (e.currentTarget.style.background = 'transparent')}
            className="liquid-hover"
            >
              <tab.icon size={16} />
              {tab.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '12px 16px' }}>
          <div style={{ padding: '0 8px' }}>
            <AdminSwitch admin />
          </div>
          <button
            type="button"
            onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
            className="signout-btn"
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--amuted)', borderRadius: 10,
              fontFamily: 'var(--fb)', fontSize: 13, cursor: 'pointer',
              padding: '8px 12px', width: '100%', textAlign: 'left',
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="admin-mobile-header" style={{
        display: 'none',
        background: 'rgba(74, 63, 53, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--aborder)',
        padding: '12px 16px 16px',
        flexDirection: 'column',
        gap: 16,
        position: 'sticky', top: 0,
        zIndex: 60,
        animation: 'slideDown 0.8s var(--liquid) both',
      }}>
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setMenuOpen(true)} style={{
              background: 'none', border: 'none', color: 'var(--atext)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0
            }} aria-label="Menu">
              <Menu size={22} />
            </button>
            <Link href="/admin" style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 15, color: 'var(--atext)' }}>Admin</Link>
          </div>
          <button
            type="button"
            onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
            className="signout-btn"
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
              padding: '5px 10px', fontFamily: 'var(--fb)', fontSize: 11,
              fontWeight: 600, color: 'var(--accent)', cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
        <div style={{ maxWidth: 500, width: '100%', margin: '0 auto' }}>
          <AdminSwitch admin />
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
            width: 260,
            background: 'rgba(74, 63, 53, 0.95)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderRight: '1px solid var(--aborder)',
            zIndex: 210, padding: '20px 0',
            display: 'flex', flexDirection: 'column',
            animation: 'slideInLeft 0.22s ease both',
          }}>
            <div style={{ padding: '0 16px', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Leaf size={24} color="var(--accent)" />
                  <div>
                    <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 16, color: 'var(--atext)' }}>Admin</h2>
                    <p style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--asub)' }}>{session?.profile?.name}</p>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} style={{
                  background: 'none', border: 'none', color: 'var(--asub)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', padding: 4,
                }} aria-label="Close">
                  <X size={20} />
                </button>
              </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px', flex: 1 }}>
              {visibleTabs.map((tab) => (
                <Link key={tab.href} href={tab.href} onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 12px', borderRadius: 10,
                  background: isActive(tab.href) ? 'var(--ad)' : 'transparent',
                  color: isActive(tab.href) ? 'var(--accent)' : 'var(--asub)',
                  fontFamily: 'var(--fb)', fontSize: 14, fontWeight: isActive(tab.href) ? 600 : 400,
                  transition: 'all 0.4s var(--liquid)',
                }}
                className="liquid-hover"
                >
                  <tab.icon size={18} />
                  {tab.label}
                </Link>
              ))}
            </nav>

            <div style={{ padding: '16px', borderTop: '1px solid var(--aborder)' }}>
              <button
                type="button"
                onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
                className="signout-btn"
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--amuted)', borderRadius: 10,
                  fontFamily: 'var(--fb)', fontSize: 13, cursor: 'pointer',
                  padding: '10px 12px', width: '100%', textAlign: 'left',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <main className="admin-main" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', position: 'relative', minHeight: 0 }}>
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
