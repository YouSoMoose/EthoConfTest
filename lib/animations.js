'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * useScrollHero — iOS-style scroll-linked scale-down effect.
 * 
 * Attaches a rAF-driven scroll listener that scales an element down
 * as it scrolls out of view (like iOS rubberbanding).
 * 
 * Usage:
 *   const heroRef = useScrollHero({ scrollContainer, minScale: 0.95 });
 *   <div ref={heroRef}>...</div>
 * 
 * @param {Object} options
 * @param {RefObject} options.scrollContainer - ref to the scroll container (defaults to window)
 * @param {number} options.minScale - minimum scale when fully scrolled past (default 0.95)
 * @param {number} options.distance - scroll distance for full effect in px (default 200)
 */
export function useScrollHero({ scrollContainer, minScale = 0.95, distance = 200 } = {}) {
  const heroRef = useRef(null);
  const rafId = useRef(null);
  const lastScrollY = useRef(0);

  const lerp = useCallback((a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t)), []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const container = scrollContainer?.current || null;

    const handleScroll = () => {
      if (rafId.current) return; // throttle to 1 per frame
      rafId.current = requestAnimationFrame(() => {
        const scrollY = container ? container.scrollTop : window.scrollY;
        const ratio = Math.max(0, Math.min(1, scrollY / distance));
        const scale = lerp(1, minScale, ratio);
        const opacity = lerp(1, 0.85, ratio);

        el.style.transform = `scale(${scale})`;
        el.style.opacity = opacity;
        el.style.transformOrigin = 'top center';

        lastScrollY.current = scrollY;
        rafId.current = null;
      });
    };

    const target = container || window;
    target.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      target.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [scrollContainer, minScale, distance, lerp]);

  return heroRef;
}

/**
 * useSpringPress — Applies spring press physics to a DOM element via ref.
 * 
 * Usage:
 *   const pressHandlers = useSpringPress();
 *   <div ref={pressHandlers.ref} {...pressHandlers.handlers}>...</div>
 */
export function useSpringPress({ scale = 0.96 } = {}) {
  const ref = useRef(null);
  const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

  const onPointerDown = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transition = 'transform 0.12s ease-out';
    ref.current.style.transform = `scale(${scale})`;
  }, [scale]);

  const onPointerUp = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transition = `transform 0.4s ${SPRING}`;
    ref.current.style.transform = 'scale(1)';
  }, []);

  return {
    ref,
    handlers: {
      onPointerDown,
      onPointerUp,
      onPointerLeave: onPointerUp,
    },
  };
}

/**
 * useHapticPulse — Triggers a visual haptic pulse on an element.
 * 
 * Usage:
 *   const triggerHaptic = useHapticPulse(ref);
 *   <button ref={ref} onClick={() => triggerHaptic(() => doAction())}>Delete</button>
 */
export function useHapticPulse(elRef) {
  const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

  return useCallback((callback) => {
    const el = elRef.current;
    if (!el) { callback?.(); return; }

    el.style.transition = `transform 0.15s ${SPRING}`;
    el.style.transform = 'scale(1.04)';

    setTimeout(() => {
      el.style.transform = 'scale(1)';
      setTimeout(() => callback?.(), 100);
    }, 150);
  }, [elRef]);
}
