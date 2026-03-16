'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

const slides = [
  {
    icon: '📅',
    title: 'Live Schedule',
    desc: 'Stay on track with the real-time event timeline. Never miss a session, workshop, or keynote.',
    gradient: 'linear-gradient(135deg, #FFE2D6 0%, #FCBD9D 100%)',
    textMode: 'dark',
  },
  {
    icon: '🏢',
    title: 'Explore Companies',
    desc: 'Browse and rate participating companies. Discover innovative startups and sustainability leaders.',
    gradient: 'linear-gradient(135deg, #FCBD9D 0%, #D4CCC4 100%)',
    textMode: 'dark',
  },
  {
    icon: '🛂',
    title: 'Passport Stamps',
    desc: 'Visit booths and collect stamps on your digital passport. Complete your journey through Ethos.',
    gradient: 'linear-gradient(135deg, #D4CCC4 0%, #A89E94 100%)',
    textMode: 'dark',
  },
  {
    icon: '💬',
    title: 'Live Chat',
    desc: 'Message event staff in real-time. Get answers, share feedback, and stay connected.',
    gradient: 'linear-gradient(135deg, #A89E94 0%, #7D6F63 100%)',
    textMode: 'light',
  },
  {
    icon: '📝',
    title: 'Smart Notes',
    desc: 'Take notes during sessions and save them to your account. Access them anytime, anywhere.',
    gradient: 'linear-gradient(135deg, #7D6F63 0%, #413429 100%)',
    textMode: 'light',
  },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isLoading = status === 'loading';
  const isAuthenticated = !!session?.profile;

  useEffect(() => {
    if (session?.profile) {
      const level = session.profile.access_level ?? 0;
      if (level >= 2) return router.replace('/admin');
      else if (level === 1) return router.replace('/company');
      else return router.replace('/app');
    }

    if (!isLoading && !session?.profile) {
      const isForced = new URLSearchParams(window.location.search).get('carousel') === '1';
      const hasSeen = localStorage.getItem('ethos_seen_carousel');
      if (hasSeen && !isForced) {
        router.replace('/login');
      }
    }
  }, [session, router, isLoading]);

  const finishCarousel = () => {
    localStorage.setItem('ethos_seen_carousel', '1');
    router.push('/login');
  };

  const goTo = (i) => setCurrent(i);
  const next = () => setCurrent(c => Math.min(c + 1, slides.length - 1));
  const prev = () => setCurrent(c => Math.max(c - 1, 0));

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  // Show a branded loading screen while session loads or user is authenticated
  if (isLoading || isAuthenticated) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'var(--hero)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 28, fontFamily: 'var(--fh)', fontWeight: 800, color: '#fff',
        }}>E</div>
        <div style={{
          width: 24, height: 24, border: '3px solid rgba(255,255,255,.2)',
          borderTopColor: '#fff', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'rgba(255,255,255,.5)' }}>
          Please wait…
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: slide.gradient,
      transition: 'background 0.6s ease',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top branding */}
      <div style={{
        padding: 'max(20px, env(safe-area-inset-top)) 24px 0',
        textAlign: 'center',
      }}>
        <div style={{
          width: 'clamp(48px, 10vh, 56px)', height: 'clamp(48px, 10vh, 56px)', borderRadius: 28,
          background: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto clamp(10px, 2vh, 16px)', overflow: 'hidden', padding: 4
        }}>
          <img src="/assets/ethos-logo-insignia.png" alt="Ethos" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="font-size: 28px; font-weight: 800; color: var(--text); font-family: var(--fh)">e</span>'; }} />
        </div>
        <p style={{
          fontSize: 'clamp(10px, 2vh, 11px)', fontWeight: 700, letterSpacing: '.2em',
          color: slide.textMode === 'light' ? 'rgba(255,255,255,.6)' : 'var(--muted)', textTransform: 'uppercase', marginBottom: 8, transition: 'color 0.6s ease'
        }}>
          Annual Conference · 2026
        </p>
        <h1 style={{
          fontFamily: 'var(--fh)', fontSize: 'clamp(32px, 8vh, 42px)', fontWeight: 800,
          color: slide.textMode === 'light' ? '#fff' : 'var(--text)', lineHeight: 1.05, marginBottom: 6, transition: 'color 0.6s ease'
        }}>
          Ethos<br />
        </h1>
        <p style={{
          fontSize: 'clamp(12px, 2.5vh, 14px)', color: slide.textMode === 'light' ? 'rgba(255,255,255,.7)' : 'var(--sub)', marginTop: 8, lineHeight: 1.6,
          fontFamily: 'var(--fb)', transition: 'color 0.6s ease'
        }}>
          SUSTAINABILITY
        </p>
      </div>

      {/* Feature slider */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: 'clamp(16px, 4vh, 32px) 24px 0',
      }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.1)',
          padding: 'clamp(20px, 5vh, 40px) 24px clamp(20px, 4vh, 36px)',
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
          minHeight: 'clamp(180px, 30vh, 220px)',
          transition: 'all 0.3s ease',
        }}>
          <span style={{
            fontSize: 'clamp(40px, 8vh, 52px)', display: 'block', marginBottom: 'clamp(10px, 2vh, 16px)',
            animation: 'scaleIn 0.3s ease both',
          }} key={current + 'icon'}>{slide.icon}</span>
          <h2 style={{
            fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 'clamp(20px, 4vh, 24px)',
            color: slide.textMode === 'light' ? '#fff' : 'var(--text)', marginBottom: 10, transition: 'color 0.6s ease',
            animation: 'fadeUp 0.3s ease both',
          }} key={current + 'title'}>{slide.title}</h2>
          <p style={{
            fontFamily: 'var(--fb)', fontSize: 'clamp(13px, 2.5vh, 14px)',
            color: slide.textMode === 'light' ? 'rgba(255,255,255,.65)' : 'var(--sub)', transition: 'color 0.6s ease',
            lineHeight: 1.6,
            animation: 'fadeUp 0.3s ease 0.05s both',
          }} key={current + 'desc'}>{slide.desc}</p>
        </div>

        {/* Dots */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center',
          marginTop: 24,
        }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: current === i ? 24 : 8, height: 8,
              borderRadius: 4,
              background: current === i
                ? (slide.textMode === 'light' ? '#fff' : 'var(--text)')
                : (slide.textMode === 'light' ? 'rgba(255,255,255,.3)' : 'rgba(65, 52, 41, 0.2)'),
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        padding: '24px 24px max(24px, env(safe-area-inset-bottom))',
        maxWidth: 360, width: '100%', margin: '0 auto',
      }}>
        {isLast ? (
          <button onClick={finishCarousel} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', padding: '16px 24px',
            background: slide.textMode === 'light' ? '#fff' : 'var(--text)',
            color: slide.textMode === 'light' ? '#1a1814' : '#fff',
            borderRadius: 14, fontFamily: 'var(--fb)',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            border: 'none', transition: 'all 0.3s',
          }}>
            Get Started 🚀
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={finishCarousel} style={{
              flex: 1, padding: '14px 20px', textAlign: 'center',
              background: slide.textMode === 'light' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: slide.textMode === 'light' ? 'rgba(255,255,255,.7)' : 'var(--sub)',
              borderRadius: 14, fontFamily: 'var(--fb)',
              fontSize: 14, fontWeight: 600, border: `1px solid ${slide.textMode === 'light' ? 'rgba(255,255,255,.15)' : 'rgba(65, 52, 41, 0.2)'}`, cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              Skip
            </button>
            <button onClick={next} style={{
              flex: 2, padding: '14px 20px',
              background: slide.textMode === 'light' ? 'rgba(255,255,255,0.2)' : 'var(--text)',
              color: slide.textMode === 'light' ? '#fff' : '#fff',
              borderRadius: 14, fontFamily: 'var(--fb)',
              fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
