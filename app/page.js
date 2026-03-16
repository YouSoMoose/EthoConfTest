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
      position: 'relative'
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
            opacity: current === i ? 1 : 0,
            transition: 'opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
          }} />
        ))}
      </div>

      {/* Top branding */}
      <div style={{
        padding: 'max(20px, env(safe-area-inset-top)) 24px 0',
        textAlign: 'center',
        zIndex: 10
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
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none',  // IE/Edge
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
            scrollSnapAlign: 'start',
            padding: '24px',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: 32,
              border: '1px solid rgba(255,255,255,0.1)',
              padding: 'clamp(30px, 6vh, 48px) 32px',
              maxWidth: 380,
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            }}>
              <span style={{
                fontSize: 'clamp(48px, 10vh, 64px)', display: 'block', marginBottom: 'clamp(16px, 3vh, 24px)',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
              }}>{s.icon}</span>
              <h2 style={{
                fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 'clamp(24px, 4.5vh, 28px)',
                color: s.textMode === 'light' ? '#fff' : 'var(--text)', marginBottom: 12, transition: 'color 0.6s ease',
              }}>{s.title}</h2>
              <p style={{
                fontFamily: 'var(--fb)', fontSize: 'clamp(14px, 2.5vh, 15px)',
                color: s.textMode === 'light' ? 'rgba(255,255,255,.7)' : 'var(--sub)', transition: 'color 0.6s ease',
                lineHeight: 1.6,
              }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dots and CTA */}
      <div style={{
        padding: '0 24px max(24px, env(safe-area-inset-bottom))',
        maxWidth: 400, width: '100%', margin: '0 auto',
        zIndex: 10
      }}>
        {/* Dots */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center',
          marginBottom: 32,
        }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: current === i ? 28 : 8, height: 8,
              borderRadius: 4,
              background: current === i
                ? (slide.textMode === 'light' ? '#fff' : 'var(--text)')
                : (slide.textMode === 'light' ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,0.1)'),
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
            }} />
          ))}
        </div>

        {isLast ? (
          <button onClick={finishCarousel} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', padding: '18px 24px',
            background: slide.textMode === 'light' ? '#fff' : 'var(--text)',
            color: slide.textMode === 'light' ? '#1a1814' : '#fff',
            borderRadius: 18, fontFamily: 'var(--fb)',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            border: 'none', transition: 'all 0.3s',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          }}>
            Get Started 🚀
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={finishCarousel} style={{
              flex: 1, padding: '16px 20px', textAlign: 'center',
              background: slide.textMode === 'light' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: slide.textMode === 'light' ? 'rgba(255,255,255,.8)' : 'var(--sub)',
              borderRadius: 18, fontFamily: 'var(--fb)',
              fontSize: 15, fontWeight: 600, border: `1px solid ${slide.textMode === 'light' ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,0.1)'}`, cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              Skip
            </button>
            <button onClick={next} style={{
              flex: 2, padding: '16px 20px',
              background: slide.textMode === 'light' ? 'rgba(255,255,255,0.2)' : 'var(--text)',
              color: '#fff',
              borderRadius: 18, fontFamily: 'var(--fb)',
              fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
