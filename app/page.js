'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.profile) {
      const level = session.profile.access_level;
      if (level >= 2) router.push('/admin');
      else if (level === 1) router.push('/company');
      else router.push('/app');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-800 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="gradient-hero text-white safe-top relative">
        {/* Animated orbs */}
        <div className="orb orb-green w-64 h-64 -top-20 -right-20" style={{ position: 'absolute' }}></div>
        <div className="orb orb-amber w-48 h-48 bottom-0 left-10" style={{ position: 'absolute' }}></div>

        <div className="max-w-lg mx-auto px-6 py-20 text-center relative z-10">
          <div className="text-7xl mb-6 animate-float">🌿</div>
          <h1 className="font-heading text-5xl font-bold mb-3 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            Ethos 2026
          </h1>
          <p className="font-body text-green-200 text-lg mb-2 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            Sustainability & Innovation Conference
          </p>
          <p className="font-body text-green-300/80 text-sm mb-10 animate-fade-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            March 21, 2026 • Building a Sustainable Future
          </p>
          <div className="animate-fade-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            <button
              onClick={() => signIn('google')}
              className="bg-white text-green-900 font-heading font-bold py-3.5 px-10 rounded-2xl text-lg hover:shadow-xl transition-all duration-300 active:scale-95 shadow-lg flex items-center gap-3 mx-auto btn-glow"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-lg mx-auto px-6 py-12 page-enter">
        <h2 className="font-heading text-2xl font-bold text-green-900 mb-8 text-center">
          Event Features
        </h2>
        <div className="grid grid-cols-2 gap-4 stagger-in">
          {[
            { icon: '📅', title: 'Live Schedule', desc: 'Real-time event timeline' },
            { icon: '🎤', title: 'Pitch Voting', desc: 'Rate company presentations' },
            { icon: '🛂', title: 'Passport', desc: 'Collect booth stamps' },
            { icon: '💬', title: 'Live Chat', desc: 'Message event staff' },
            { icon: '📝', title: 'Notes', desc: 'Take personal notes' },
            { icon: '💼', title: 'Wallet', desc: 'Save company cards' },
            { icon: '🎫', title: 'My Card', desc: 'Your digital badge' },
            { icon: '📢', title: 'Announcements', desc: 'Stay updated' },
          ].map((f) => (
            <div key={f.title} className="glass-card text-center p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-heading font-bold text-sm text-green-900">{f.title}</h3>
              <p className="text-xs text-gray-500 font-body mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400 font-body mt-auto">
        &copy; 2026 Ethos Conference. All rights reserved.
      </footer>
    </div>
  );
}
