'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Btn from '@/components/Btn';

const features = [
  { icon: '📅', title: 'Live Schedule', desc: 'Real-time event timeline' },
  { icon: '🎤', title: 'Pitch Voting', desc: 'Rate company presentations' },
  { icon: '🛂', title: 'Passport', desc: 'Collect booth stamps' },
  { icon: '💬', title: 'Live Chat', desc: 'Message event staff' },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.profile) {
      const level = session.profile.access_level ?? 0;
      if (level >= 2) router.replace('/admin');
      else if (level === 1) router.replace('/company');
      else router.replace('/app');
    }
  }, [session, router]);

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <div style={{
        background: 'var(--g)',
        color: '#fff',
        textAlign: 'center',
        padding: 'max(40px, env(safe-area-inset-top)) 24px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <span style={{ fontSize: 56, display: 'block', marginBottom: 12 }}>🌿</span>
        <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 38, marginBottom: 8, color: '#fff' }}>
          Ethos 2026
        </h1>
        <p style={{ fontFamily: 'var(--fb)', fontSize: 16, opacity: 0.8, marginBottom: 4 }}>
          Sustainability &amp; Innovation Conference
        </p>
        <p style={{ fontFamily: 'var(--fb)', fontSize: 13, opacity: 0.55 }}>
          March 21, 2026 • Building a Sustainable Future
        </p>

        <div style={{ marginTop: 32, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            disabled={status === 'loading'}
            style={{
              background: 'var(--white)',
              color: 'var(--text)',
              border: 'none',
              borderRadius: 12,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'var(--fb)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              width: '100%',
              transition: 'transform .1s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Sign in with Google
          </button>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '40px 20px 60px' }}>
        <h2 style={{
          fontFamily: 'var(--fh)',
          fontWeight: 700,
          fontSize: 22,
          color: 'var(--g)',
          textAlign: 'center',
          marginBottom: 24,
        }}>
          Event Features
        </h2>

        <div className="stagger" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}>
          {features.map((f) => (
            <div key={f.title} style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r)',
              padding: '20px 16px',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>{f.icon}</span>
              <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>
                {f.title}
              </h3>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
