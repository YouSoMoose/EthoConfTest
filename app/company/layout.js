'use client';

import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

const tabs = [
  { label: 'Portal', href: '/company', icon: '🏢' },
];

export default function CompanyLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Desktop Topbar */}
      <header style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        paddingTop: 'max(12px, env(safe-area-inset-top))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🌿</span>
          <div>
            <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 17, color: 'var(--text)', margin: 0 }}>
              Company Portal
            </h1>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--sub)' }}>
              {session?.profile?.name}
            </p>
          </div>
        </div>

        <div style={{ display: 'none', alignItems: 'center', gap: 20 }} className="desktop-nav">
          {tabs.map(tab => (
            <Link key={tab.href} href={tab.href} style={{
              fontFamily: 'var(--fb)', fontSize: 14, fontWeight: pathname === tab.href ? 600 : 400,
              color: pathname === tab.href ? 'var(--g)' : 'var(--sub)',
            }}>
              {tab.label}
            </Link>
          ))}
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{
            background: 'none', border: 'none', color: 'var(--sub)', fontFamily: 'var(--fb)', fontSize: 14, cursor: 'pointer',
          }}>
            Sign Out
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/app" style={{
            background: 'var(--gl)', border: '1px solid var(--gb)', borderRadius: 8,
            padding: '6px 12px', fontFamily: 'var(--fb)', fontSize: 12,
            fontWeight: 600, color: 'var(--g)', whiteSpace: 'nowrap',
          }}>
            👤 Attendee View
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{
            background: 'none', border: 'none', color: 'var(--sub)', fontFamily: 'var(--fb)', fontSize: 12, cursor: 'pointer',
          }}>
            Sign Out
          </button>
        </div>
      </header>

      <main style={{ paddingBottom: 72 }}>
        {children}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-signout { display: none !important; }
        }
      `}} />
    </div>
  );
}
