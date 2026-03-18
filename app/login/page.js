'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.profile) {
      const level = session.profile.access_level ?? 0;
      if (level >= 2) router.replace('/admin');
      else if (level === 1) router.replace('/company');
      else router.replace('/app');
    }
  }, [session, status, router]);

  async function handleGoogle() {
    setLoading(true);
    // Single unified login — backend determines role from email
    signIn('google', { callbackUrl: '/' });
  }

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
      }
    }
  };

  if (status === 'loading' || (status === 'authenticated' && session?.profile)) {
    return (
      <div style={{
        minHeight: '100dvh', background: 'var(--hero)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 24, height: 24, border: '3px solid rgba(255,255,255,.2)',
          borderTopColor: '#fff', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
        }} />
        <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'rgba(255,255,255,.5)' }}>Checking session…</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #FFE2D6 0%, #FCBD9D 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      transition: 'background 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    }}>
      {/* Info button to see carousel */}
      <Link href="/?carousel=1" style={{
        position: 'absolute', top: 'max(24px, env(safe-area-inset-top))', right: 24,
        width: 32, height: 32, borderRadius: 16,
        background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--sub)', textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer',
      }}>
        <Info size={18} />
      </Link>

      {/* Hero branding — centered in the remaining space */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 24px',
      }}>
        <div style={{
          width: 'clamp(64px, 14vh, 80px)', height: 'clamp(64px, 14vh, 80px)', borderRadius: '50%',
          background: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(15px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', overflow: 'hidden', padding: 4,
          boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
        }}>
          <img src="/assets/ethos-logo-insignia.png" alt="The Circular Economy Conference" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '.25em',
            color: 'var(--sub)', textTransform: 'uppercase', marginBottom: 12,
          }}>
            Annual Conference · 2026
          </p>
          <h1 style={{ fontFamily: 'var(--fh)', fontSize: 36, fontWeight: 800, color: 'var(--text)', margin: '4px 0 8px', lineHeight: 1 }}>
            The Circular Economy Conference
          </h1>
          <p style={{
            fontSize: 14, color: 'var(--sub)',
            fontFamily: 'var(--fb)', fontWeight: 600, letterSpacing: '0.05em'
          }}>
            SUSTAINABILITY & INNOVATION
          </p>
        </div>
      </div>

      {/* Login dock */}
      <div style={{
        background: '#fff',
        borderRadius: '32px 32px 0 0',
        padding: '32px 24px max(32px, env(safe-area-inset-bottom))',
        boxShadow: '0 -15px 50px rgba(0,0,0,0.12)',
      }}>
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '18px 24px',
            background: 'var(--text)',
            color: '#fff',
            border: 'none',
            borderRadius: 18,
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'var(--fb)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s',
            marginBottom: 16,
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? 'Processing…' : 'Sign in with Google'}
        </button>

        <button 
          onClick={requestNotifications}
          style={{
            width: '100%', padding: '12px', background: 'transparent',
            border: 'none', color: 'var(--muted)', fontSize: 13, fontWeight: 600,
            fontFamily: 'var(--fb)', cursor: 'pointer', marginBottom: 20,
            textDecoration: 'underline'
          }}
        >
          Enable Browser Notifications 🔔
        </button>

        <p style={{
          fontSize: 12, color: '#8E8E93', textAlign: 'center',
          lineHeight: 1.6, fontFamily: 'var(--fb)',
        }}>
          Sign in with your organizational Google account — staff/admin access is assigned automatically based on your email.
        </p>
      </div>
    </div>
  );
}
