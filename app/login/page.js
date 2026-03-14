'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    signIn('google', { callbackUrl: '/' });
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #2d5016 0%, #1a4a3c 40%, #1a3a5b 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Hero branding — centered in the remaining space */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 24px',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 32, fontFamily: 'var(--fh)', fontWeight: 800, color: '#fff',
        }}>E</div>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '.2em',
          color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 8,
          textAlign: 'center',
        }}>
          Annual Conference · 2026
        </p>
        <h1 style={{
          fontFamily: 'var(--fh)', fontSize: 44, fontWeight: 800,
          color: '#fff', lineHeight: 1.05, marginBottom: 6, textAlign: 'center',
        }}>
          Ethos<br />
          <span style={{ color: 'var(--warm)', fontWeight: 300 }}>2026</span>
        </h1>
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,.5)', marginTop: 10, lineHeight: 1.6,
          fontFamily: 'var(--fb)', textAlign: 'center',
        }}>
          Where student entrepreneurs shape the future
        </p>
      </div>

      {/* White dock at the bottom */}
      <div style={{
        background: '#fff',
        borderRadius: '24px 24px 0 0',
        padding: '28px 24px max(28px, env(safe-area-inset-bottom))',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
      }}>
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '16px 24px',
            background: 'var(--g)',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'var(--fb)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'transform 0.1s, opacity 0.2s',
            marginBottom: 14,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fillOpacity=".7"/>
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fillOpacity=".85"/>
            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fillOpacity=".6"/>
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fillOpacity=".75"/>
          </svg>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        <p style={{
          fontSize: 12, color: 'var(--muted)', textAlign: 'center',
          lineHeight: 1.6, fontFamily: 'var(--fb)',
        }}>
          Sign in to access schedules, company ratings, and your conference passport.
          Staff & admin access requires an approved account.
        </p>
      </div>
    </div>
  );
}
