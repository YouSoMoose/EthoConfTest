'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Calendar, ShieldCheck, MessageCircle, FileText, ArrowRight, Zap } from 'lucide-react';

// ── Color helpers ──────────────────────────────────────────
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
}
function rgbToHex(r,g,b) {
  return '#' + [r,g,b].map(c => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2,'0')).join('');
}
function lerpColor(a, b, t) {
  const [r1,g1,b1] = hexToRgb(a);
  const [r2,g2,b2] = hexToRgb(b);
  return rgbToHex(r1+(r2-r1)*t, g1+(g2-g1)*t, b1+(b2-b1)*t);
}

// ── Slide data ─────────────────────────────────────────────
const slides = [
  {
    icon: Calendar, title: 'Live Schedule',
    desc: 'Stay on track with the real-time event timeline. Never miss a session, workshop, or keynote.',
    c1: '#FFE2D6', c2: '#FCBD9D', textMode: 'dark',
  },
  {
    icon: ShieldCheck, title: 'Passport Stamps',
    desc: 'Visit booths and collect stamps on your digital passport. Complete your journey through the conference.',
    c1: '#F5F0EA', c2: '#D4CCC4', textMode: 'dark',
  },
  {
    icon: MessageCircle, title: 'Live Chat',
    desc: 'Message event staff in real-time. Get answers, share feedback, and stay connected.',
    c1: '#D4CCC4', c2: '#A89E94', textMode: 'dark',
  },
  {
    icon: FileText, title: 'Smart Notes',
    desc: 'Take notes during sessions and save them to your account. Access them anytime, anywhere.',
    c1: '#A89E94', c2: '#514033', textMode: 'dark',
  },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === 'loading';
  const isAuthenticated = !!session?.profile;

  // ── React state only used for UI re-renders (dots, buttons) ──
  const [current, setCurrent] = useState(0);

  // ── Refs for zero-lag DOM manipulation ──
  const bgRef       = useRef(null);
  const trackRef    = useRef(null);
  const drag        = useRef({ active: false, startX: 0, startIdx: 0, currentX: 0 });
  const slideIdx    = useRef(0);
  const animFrame   = useRef(null);
  const containerW  = useRef(0);

  // ── Redirect logic ──
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
      if (hasSeen && !isForced) router.replace('/login');
    }
  }, [session, router, isLoading]);

  // ── Paint the background gradient for given "virtual position" (0..n-1 float) ──
  const paintBg = useCallback((pos) => {
    if (!bgRef.current) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, pos));
    const lo = Math.floor(clamped);
    const hi = Math.min(lo + 1, slides.length - 1);
    const t = clamped - lo;
    const blendC1 = lerpColor(slides[lo].c1, slides[hi].c1, t);
    const blendC2 = lerpColor(slides[lo].c2, slides[hi].c2, t);
    bgRef.current.style.background = `linear-gradient(135deg, ${blendC1} 0%, ${blendC2} 100%)`;
  }, []);

  // ── Set track translateX (with or without transition) ──
  const moveTrack = useCallback((px, transition) => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = transition || 'none';
    trackRef.current.style.transform = `translateX(${px}px)`;
  }, []);

  // ── Initialize ──
  useEffect(() => {
    paintBg(0);
  }, [paintBg]);

  // ── Calculate slide width on mount + resize ──
  useEffect(() => {
    const measure = () => { containerW.current = window.innerWidth; };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // ── Pointer handlers ──
  const onPointerDown = useCallback((e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    drag.current.active = true;
    drag.current.startX = e.clientX;
    drag.current.startIdx = slideIdx.current;
    drag.current.currentX = e.clientX;
    if (trackRef.current) trackRef.current.style.transition = 'none';
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!drag.current.active) return;
    drag.current.currentX = e.clientX;
    const dx = drag.current.currentX - drag.current.startX;
    const w = containerW.current || window.innerWidth;
    const baseOffset = -drag.current.startIdx * w;
    // Move track 1:1
    moveTrack(baseOffset + dx, null);
    // Compute virtual position as a float
    const virtualPos = drag.current.startIdx - dx / w;
    paintBg(virtualPos);
  }, [moveTrack, paintBg]);

  const onPointerUp = useCallback(() => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const dx = drag.current.currentX - drag.current.startX;
    const w = containerW.current || window.innerWidth;
    const threshold = w * 0.25;
    let target = drag.current.startIdx;
    if (dx < -threshold && target < slides.length - 1) target++;
    if (dx > threshold && target > 0) target--;

    // Snap track with CSS transition
    slideIdx.current = target;
    setCurrent(target);
    moveTrack(-target * w, 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)');

    // Animate remaining gradient blend with rAF
    const startPos = drag.current.startIdx - dx / w;
    const endPos = target;
    const startTime = performance.now();
    const duration = 400;
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const pos = startPos + (endPos - startPos) * eased;
      paintBg(pos);
      if (progress < 1) animFrame.current = requestAnimationFrame(tick);
    };
    animFrame.current = requestAnimationFrame(tick);
  }, [moveTrack, paintBg]);

  // ── Public goTo (for dots & buttons) ──
  const goTo = useCallback((i) => {
    const w = containerW.current || window.innerWidth;
    const from = slideIdx.current;
    slideIdx.current = i;
    setCurrent(i);
    moveTrack(-i * w, 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)');
    // rAF gradient animate
    const startTime = performance.now();
    const duration = 400;
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      paintBg(from + (i - from) * eased);
      if (progress < 1) animFrame.current = requestAnimationFrame(tick);
    };
    animFrame.current = requestAnimationFrame(tick);
  }, [moveTrack, paintBg]);

  const finishCarousel = useCallback(() => {
    localStorage.setItem('ethos_seen_carousel', '1');
    router.push('/login');
  }, [router]);

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  // ── Loading / redirect splash ──
  if (isLoading || isAuthenticated) {
    return (
      <div style={{
        minHeight: '100dvh', background: 'var(--hero)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 'clamp(56px, 12vh, 64px)', height: 'clamp(56px, 12vh, 64px)', borderRadius: 32,
          background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', overflow: 'hidden', padding: 6,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.4)'
        }}>
          <img src="/assets/ethos-logo-insignia.png" alt="The Circular Economy Conference" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
        </div>
        <div style={{
          width: 24, height: 24, border: '3px solid rgba(255,255,255,.2)',
          borderTopColor: '#fff', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
        }} />
        <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'rgba(255,255,255,.5)' }}>Please wait…</p>
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', touchAction: 'pan-y' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Realtime gradient background */}
      <div ref={bgRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* Top branding */}
      <div style={{
        padding: 'max(24px, env(safe-area-inset-top)) 24px 0',
        textAlign: 'center', zIndex: 10, position: 'relative',
      }}>
        <div style={{
          width: 'clamp(56px, 12vh, 64px)', height: 'clamp(56px, 12vh, 64px)', borderRadius: 32,
          background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto clamp(12px, 2.5vh, 20px)', overflow: 'hidden', padding: 6,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.4)'
        }}>
          <img src="/assets/ethos-logo-insignia.png" alt="The Circular Economy Conference" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
        </div>
        <p style={{
          fontSize: 'clamp(10px, 2vh, 11px)', fontWeight: 800, letterSpacing: '.3em',
          color: slide.textMode === 'light' ? 'rgba(255,255,255,.7)' : 'var(--muted)',
          textTransform: 'uppercase', marginBottom: 8, transition: 'color 0.4s ease'
        }}>
          Annual Conference · 2026
        </p>
        <h1 style={{
          fontFamily: 'var(--fh)', fontSize: 'clamp(36px, 9vh, 48px)', fontWeight: 800,
          color: slide.textMode === 'light' ? '#fff' : 'var(--g)',
          lineHeight: 1, marginBottom: 6, transition: 'color 0.4s ease',
          textShadow: slide.textMode === 'light' ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'
        }}>
          Circular Economy
        </h1>
      </div>

      {/* Slide track — positioned via transform, NO scroll */}
      <div style={{ flex: 1, position: 'relative', zIndex: 5, overflow: 'hidden' }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex', height: '100%',
            willChange: 'transform',
          }}
        >
          {slides.map((s, i) => (
            <div key={i} style={{
              minWidth: '100vw', width: '100vw',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center',
              padding: '24px', boxSizing: 'border-box',
              userSelect: 'none', WebkitUserSelect: 'none',
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)',
                borderRadius: 40,
                border: '1px solid rgba(255,255,255,0.25)',
                padding: 'clamp(40px, 8vh, 56px) 32px',
                maxWidth: 400, width: '100%', textAlign: 'center',
                boxShadow: '0 25px 60px rgba(0,0,0,0.12)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Subtle glow */}
                <div style={{
                  position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                  background: `radial-gradient(circle at center, ${s.c2}1A 0%, transparent 70%)`,
                  pointerEvents: 'none'
                }} />

                <s.icon size={containerW.current < 600 ? 56 : 72} color={s.textMode === 'light' ? '#fff' : 'var(--g)'} style={{
                  display: 'block',
                  margin: '0 auto clamp(20px, 4vh, 32px)',
                  filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))',
                }} />
                <h2 style={{
                  fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 'clamp(28px, 5vh, 32px)',
                  color: s.textMode === 'light' ? '#fff' : 'var(--g)', marginBottom: 14,
                }}>{s.title}</h2>
                <p style={{
                  fontFamily: 'var(--fb)', fontSize: 'clamp(14px, 2.8vh, 16px)',
                  color: s.textMode === 'light' ? 'rgba(255,255,255,.85)' : 'var(--sub)',
                  lineHeight: 1.6, fontWeight: 500
                }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots + CTA */}
      <div style={{
        padding: '0 24px max(32px, env(safe-area-inset-bottom))',
        maxWidth: 420, width: '100%', margin: '0 auto', zIndex: 10, position: 'relative',
      }}>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 36 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: current === i ? 36 : 10, height: 10, borderRadius: 5,
              background: current === i
                ? (slide.textMode === 'light' ? '#fff' : 'var(--g)')
                : (slide.textMode === 'light' ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,0.12)'),
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
            }} />
          ))}
        </div>

        {isLast ? (
          <button onClick={finishCarousel} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            width: '100%', padding: '20px 24px',
            background: slide.textMode === 'light' ? '#fff' : 'var(--g)',
            color: slide.textMode === 'light' ? '#1a1814' : '#fff',
            borderRadius: 20, fontFamily: 'var(--fb)',
            fontSize: 17, fontWeight: 800, cursor: 'pointer',
            border: 'none', boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
          }}>
            Begin the Journey <ArrowRight size={20} />
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 14 }}>
            <button onClick={finishCarousel} style={{
              flex: 1, padding: '18px 20px', textAlign: 'center',
              background: slide.textMode === 'light' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)',
              color: slide.textMode === 'light' ? 'rgba(255,255,255,.8)' : 'var(--muted)',
              borderRadius: 20, fontFamily: 'var(--fb)',
              fontSize: 15, fontWeight: 700,
              border: `1px solid ${slide.textMode === 'light' ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,0.08)'}`,
              cursor: 'pointer',
            }}>
              Skip
            </button>
            <button onClick={() => goTo(Math.min(current + 1, slides.length - 1))} style={{
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
