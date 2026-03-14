'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.profile) {
      const level = session.profile.access_level;
      if (level >= 2) router.push('/admin');
      else if (level === 1) router.push('/company');
      else router.push('/app');
    }
  }, [session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
      {/* Background orbs */}
      <div className="orb orb-green w-72 h-72 -top-20 -right-20" style={{ position: 'absolute' }}></div>
      <div className="orb orb-amber w-56 h-56 bottom-10 -left-10" style={{ position: 'absolute' }}></div>

      <div className="glass-card max-w-md w-full text-center p-8 relative z-10 animate-scale-in">
        <div className="text-5xl mb-4 animate-float">🌿</div>
        <h1 className="font-heading text-3xl font-bold text-green-900 mb-2">Welcome Back</h1>
        <p className="font-body text-gray-500 mb-8">Sign in to access Ethos 2026</p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="btn-primary w-full flex items-center justify-center gap-3 py-3 btn-glow"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
