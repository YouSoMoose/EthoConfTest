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
    gradient: 'linear-gradient(135deg, #FCBD9D 0%, #F5F0EA 100%)',
    textMode: 'dark',
  },
  {
    icon: '🛂',
    title: 'Passport Stamps',
    desc: 'Visit booths and collect stamps on your digital passport. Complete your journey through Ethos.',
    gradient: 'linear-gradient(135deg, #F5F0EA 0%, #D4CCC4 100%)',
    textMode: 'dark',
  },
  {
    icon: '💬',
    title: 'Live Chat',
    desc: 'Message event staff in real-time. Get answers, share feedback, and stay connected.',
    gradient: 'linear-gradient(135deg, #D4CCC4 0%, #A89E94 100%)',
    textMode: 'dark',
  },
  {
    icon: '📝',
    title: 'Smart Notes',
    desc: 'Take notes during sessions and save them to your account. Access them anytime, anywhere.',
    gradient: 'linear-gradient(135deg, #A89E94 0%, #514033 100%)',
    textMode: 'light',
  },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef(null);
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

  const onScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.offsetWidth;
    const index = Math.round(scrollLeft / width);
    if (index !== current && index >= 0 && index < slides.length) {
      setCurrent(index);
    }
  };

  const finishCarousel = () => {
    localStorage.setItem('ethos_seen_carousel', '1');
    router.push('/login');
  };

  const goTo = (i) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: i * scrollRef.current.offsetWidth,
      behavior: 'smooth'
    });
  };

  const next = () => goTo(Math.min(current + 1, slides.length - 1));

  const slide = slides[current];
  const isLast = current === slides.length - 1;

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
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      transition: 'all 0.8s var(--liquid)'
    }}>
      {/* Layered background for smooth transitions */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
      }}>
        {slides.map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            inset: 0,
            background: s.gradient,
            backgroundSize: '200% 200%',
            animation: 'gradientMove 12s ease infinite',
            opacity: current === i ? 1 : 0,
            transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        ))}
      </div>

      {/* Top branding */}
      <div style={{
        padding: 'max(24px, env(safe-area-inset-top)) 24px 0',
        textAlign: 'center',
        zIndex: 10,
        transform: `translateY(${current * -2}px)`,
        transition: 'transform 0.6s var(--liquid)'
      }}>
        <div style={{
          width: 'clamp(56px, 12vh, 64px)', height: 'clamp(56px, 12vh, 64px)', borderRadius: 32,
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto clamp(12px, 2.5vh, 20px)', overflow: 'hidden', padding: 6,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.4)'
        }}>
          <img src="/assets/ethos-logo-insignia.png" alt="Ethos" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
        </div>
        <p style={{
          fontSize: 'clamp(10px, 2vh, 11px)', fontWeight: 800, letterSpacing: '.3em',
          color: slide.textMode === 'light' ? 'rgba(255,255,255,.7)' : 'var(--muted)', 
          textTransform: 'uppercase', marginBottom: 8, transition: 'color 0.6s ease'
        }}>
          Annual Conference · 2026
        </p>
        <h1 style={{
          fontFamily: 'var(--fh)', fontSize: 'clamp(36px, 9vh, 48px)', fontWeight: 800,
          color: slide.textMode === 'light' ? '#fff' : 'var(--g)', 
          lineHeight: 1, marginBottom: 6, transition: 'color 0.6s ease',
          textShadow: slide.textMode === 'light' ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'
        }}>
          Ethos
        </h1>
      </div>

      {/* Feature slider */}
      <div 
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          flex: 1,
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `div::-webkit-scrollbar { display: none; }` }} />
        
        {slides.map((s, i) => (
          <div key={i} style={{
            minWidth: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            scrollSnapAlign: 'center',
            padding: '24px',
            opacity: current === i ? 1 : 0.4,
            transform: `scale(${current === i ? 1 : 0.9})`,
            transition: 'all 0.6s var(--liquid)'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(25px)',
              borderRadius: 40,
              border: '1px solid rgba(255,255,255,0.25)',
              padding: 'clamp(40px, 8vh, 56px) 32px',
              maxWidth: 400,
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0,0,0,0.12)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Subtle liquid glow */}
              <div style={{
                position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                background: `radial-gradient(circle at center, ${s.gradient.split(',').pop().replace(')', ', 0.1)')} 0%, transparent 70%)`,
                pointerEvents: 'none'
              }} />
              
              <span style={{
                fontSize: 'clamp(56px, 12vh, 72px)', display: 'block', marginBottom: 'clamp(20px, 4vh, 32px)',
                filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))',
                transform: current === i ? 'translateY(0)' : 'translateY(20px)',
                transition: 'transform 0.8s var(--liquid)'
              }}>{s.icon}</span>
              <h2 style={{
                fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 'clamp(28px, 5vh, 32px)',
                color: s.textMode === 'light' ? '#fff' : 'var(--g)', marginBottom: 14, 
                transition: 'color 0.6s ease',
              }}>{s.title}</h2>
              <p style={{
                fontFamily: 'var(--fb)', fontSize: 'clamp(14px, 2.8vh, 16px)',
                color: s.textMode === 'light' ? 'rgba(255,255,255,.85)' : 'var(--sub)', 
                transition: 'color 0.6s ease',
                lineHeight: 1.6, fontWeight: 500
              }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dots and CTA */}
      <div style={{
        padding: '0 24px max(32px, env(safe-area-inset-bottom))',
        maxWidth: 420, width: '100%', margin: '0 auto',
        zIndex: 10
      }}>
        {/* Dots */}
        <div style={{
          display: 'flex', gap: 10, justifyContent: 'center',
          marginBottom: 36,
        }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: current === i ? 36 : 10, height: 10,
              borderRadius: 5,
              background: current === i
                ? (slide.textMode === 'light' ? '#fff' : 'var(--g)')
                : (slide.textMode === 'light' ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,0.12)'),
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.5s var(--liquid)',
            }} />
          ))}
        </div>

        {isLast ? (
          <button onClick={finishCarousel} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', padding: '20px 24px',
            background: slide.textMode === 'light' ? '#fff' : 'var(--g)',
            color: slide.textMode === 'light' ? '#1a1814' : '#fff',
            borderRadius: 20, fontFamily: 'var(--fb)',
            fontSize: 17, fontWeight: 800, cursor: 'pointer',
            border: 'none', transition: 'all 0.3s var(--liquid)',
            boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
          }}>
            Begin the Journey 🚀
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 14 }}>
            <button onClick={finishCarousel} style={{
              flex: 1, padding: '18px 20px', textAlign: 'center',
              background: slide.textMode === 'light' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)',
              color: slide.textMode === 'light' ? 'rgba(255,255,255,.8)' : 'var(--muted)',
              borderRadius: 20, fontFamily: 'var(--fb)',
              fontSize: 15, fontWeight: 700, border: `1px solid ${slide.textMode === 'light' ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,0.08)'}`, cursor: 'pointer',
            }}>
              Skip
            </button>
            <button onClick={next} style={{
              flex: 2, padding: '18px 20px',
              background: slide.textMode === 'light' ? 'rgba(255,255,255,0.25)' : 'var(--g)',
              color: '#fff',
              borderRadius: 20, fontFamily: 'var(--fb)',
              fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer',
              boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
            }}>
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
