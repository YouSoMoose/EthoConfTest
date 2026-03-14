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
    gradient: 'linear-gradient(135deg, #2d5016 0%, #1a6b3c 100%)',
  },
  {
    icon: '🏢',
    title: 'Explore Companies',
    desc: 'Browse and rate participating companies. Discover innovative startups and sustainability leaders.',
    gradient: 'linear-gradient(135deg, #1a6b3c 0%, #0e5c52 100%)',
  },
  {
    icon: '🛂',
    title: 'Passport Stamps',
    desc: 'Visit booths and collect stamps on your digital passport. Complete your journey through Ethos.',
    gradient: 'linear-gradient(135deg, #0e5c52 0%, #1a4a6b 100%)',
  },
  {
    icon: '💬',
    title: 'Live Chat',
    desc: 'Message event staff in real-time. Get answers, share feedback, and stay connected.',
    gradient: 'linear-gradient(135deg, #1a4a6b 0%, #3a3a6b 100%)',
  },
  {
    icon: '📝',
    title: 'Smart Notes',
    desc: 'Take notes during sessions and save them to your account. Access them anytime, anywhere.',
    gradient: 'linear-gradient(135deg, #3a3a6b 0%, #5a2a5b 100%)',
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
      if (level >= 2) router.replace('/admin');
      else if (level === 1) router.replace('/company');
      else router.replace('/app');
    }
  }, [session, router]);

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
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #2d5016 0%, #1a4a3c 40%, #1a3a5b 100%)',
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
      minHeight: '100vh',
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
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: 28, fontFamily: 'var(--fh)', fontWeight: 800, color: '#fff',
        }}>E</div>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '.2em',
          color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 8,
        }}>
          Annual Conference · 2026
        </p>
        <h1 style={{
          fontFamily: 'var(--fh)', fontSize: 42, fontWeight: 800,
          color: '#fff', lineHeight: 1.05, marginBottom: 6,
        }}>
          Ethos<br />
          <span style={{ color: 'var(--warm)', fontWeight: 300 }}>2026</span>
        </h1>
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,.5)', marginTop: 8, lineHeight: 1.6,
          fontFamily: 'var(--fb)',
        }}>
          Where student entrepreneurs shape the future
        </p>
      </div>

      {/* Feature slider */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '32px 24px 0',
      }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '40px 28px 36px',
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
          minHeight: 220,
          transition: 'all 0.3s ease',
        }}>
          <span style={{
            fontSize: 52, display: 'block', marginBottom: 16,
            animation: 'scaleIn 0.3s ease both',
          }} key={current + 'icon'}>{slide.icon}</span>
          <h2 style={{
            fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 24,
            color: '#fff', marginBottom: 10,
            animation: 'fadeUp 0.3s ease both',
          }} key={current + 'title'}>{slide.title}</h2>
          <p style={{
            fontFamily: 'var(--fb)', fontSize: 14, color: 'rgba(255,255,255,.65)',
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
              background: current === i ? '#fff' : 'rgba(255,255,255,.3)',
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
          <Link href="/login" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', padding: '16px 24px',
            background: '#fff', color: '#1a1814',
            borderRadius: 14, fontFamily: 'var(--fb)',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            border: 'none', transition: 'transform 0.1s',
          }}>
            Get Started 🚀
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/login" style={{
              flex: 1, padding: '14px 20px', textAlign: 'center',
              background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,.7)',
              borderRadius: 14, fontFamily: 'var(--fb)',
              fontSize: 14, fontWeight: 600, border: '1px solid rgba(255,255,255,.15)',
            }}>
              Skip
            </Link>
            <button onClick={next} style={{
              flex: 2, padding: '14px 20px',
              background: 'rgba(255,255,255,0.2)', color: '#fff',
              borderRadius: 14, fontFamily: 'var(--fb)',
              fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
            }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
