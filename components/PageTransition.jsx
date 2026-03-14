'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

const TAB_ORDER = ['/app', '/app/schedule', '/app/pitches', '/app/passport', '/app/chat'];

function getTabIndex(path) {
  if (TAB_ORDER.includes(path)) return TAB_ORDER.indexOf(path);
  for (let i = TAB_ORDER.length - 1; i >= 1; i--) {
    if (path.startsWith(TAB_ORDER[i])) return i;
  }
  return 0;
}

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState('idle');
  const [dir, setDir] = useState(1);
  const [swipeAnim, setSwipeAnim] = useState(true);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      const oldIndex = getTabIndex(prevPathRef.current);
      const newIndex = getTabIndex(pathname);
      // Direction 1 means new page comes from Right, old page exits Left
      let direction = newIndex >= oldIndex ? 1 : -1;
      
      // If changing between non-tab pages, default to slide-up behavior
      let doSwipe = oldIndex !== -1 && newIndex !== -1;
      
      // Override if the URL explicitely requested a scale drill-down animation
      if (typeof window !== 'undefined' && window.location.search.includes('anim=scale')) {
        doSwipe = false;
      }
      
      setDir(direction);
      setSwipeAnim(doSwipe);
      setPhase('out');
      
      const timer1 = setTimeout(() => {
        setDisplayChildren(children);
        setPhase('prep');
        
        const timer2 = setTimeout(() => {
          setPhase('in');
          
          const timer3 = setTimeout(() => {
            setPhase('idle');
            prevPathRef.current = pathname;
          }, 400); // Wait for enter transition
        }, 30); // small delay to ensure DOM applied 'prep' styles without transition
      }, 150); // fast exit transition

      return () => {
        clearTimeout(timer1);
      };
    } else {
      if (phase === 'idle') {
        setDisplayChildren(children);
      }
    }
  }, [pathname, children]);

  // Premium Apple-like easing curves
  const easeOutBack = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const easeIn = 'ease-in';
  
  let transform = 'translateX(0) scale(1)';
  let opacity = 1;
  let transition = '';

  if (phase === 'out') {
    if (swipeAnim) {
      transform = `translateX(${dir * -12}vw) scale(0.97)`;
    } else {
      // Scale out for drill-down
      transform = `scale(0.92) translateY(10px)`;
    }
    opacity = 0;
    transition = `transform 0.15s ${easeIn}, opacity 0.15s ease`;
  } else if (phase === 'prep') {
    if (swipeAnim) {
      transform = `translateX(${dir * 25}vw) scale(0.97)`;
    } else {
      // Prep for scale in
      transform = `scale(1.05) translateY(-5px)`;
    }
    opacity = 0;
    transition = 'none'; // instant, invisible move
  } else if (phase === 'in') {
    transform = 'translateX(0) scale(1) translateY(0)';
    opacity = 1;
    transition = `transform 0.4s ${easeOutBack}, opacity 0.4s ease`;
  } else {
    transition = 'none';
  }

  return (
    <div
      style={{
        opacity,
        transform,
        transition,
        willChange: 'opacity, transform',
        height: '100%',
        width: '100%',
        overflowX: 'hidden' // hide horizontal scrollbars during swipe
      }}
    >
      {displayChildren}
    </div>
  );
}
