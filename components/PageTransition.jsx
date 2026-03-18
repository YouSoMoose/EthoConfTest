'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

const ATTENDEE_TABS = ['/app/my-card', '/app', '/app/schedule', '/app/wallet', '/app/scan', '/app/chat'];
const ADMIN_TABS = ['/admin', '/admin/checkin', '/admin/messages', '/admin/schedule', '/admin/users'];

function getTabIndex(path) {
  // Separate handling for Admin vs App
  if (path.startsWith('/admin')) {
    if (path === '/admin') return 0;
    const idx = ADMIN_TABS.findIndex(t => path.startsWith(t) && t !== '/admin');
    return idx === -1 ? 0 : idx;
  }
  
  // App/Attendee paths
  if (path === '/app') return 1; // '/app' is Home, index 1 (after my-card)
  if (path.startsWith('/app/my-card')) return 0;
  
  const idx = ATTENDEE_TABS.findIndex(t => path.startsWith(t) && t !== '/app' && t !== '/app/my-card');
  return idx === -1 ? 1 : idx;
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
      
      // Direction calculation
      // Direction 1 means new page comes from Right, old page exits Left
      let direction = newIndex >= oldIndex ? 1 : -1;
      
      // Special logic: If crossing from Admin to App or vice versa, default to 1 (or -1 depending on preference)
      // But usually they don't cross without a full layout change.
      
      // Swipe animation only for sibling-level transitions or tab changes
      // If we are on very different areas, maybe do a different animation
      const isCrossTab = (pathname.startsWith('/admin') && prevPathRef.current.startsWith('/admin')) ||
                        (pathname.startsWith('/app') && prevPathRef.current.startsWith('/app'));
                        
      let doSwipe = isCrossTab;
      
      // Override if the URL explicitly requested a scale drill-down animation
      if (typeof window !== 'undefined' && window.location.search.includes('anim=scale')) {
        doSwipe = false;
      }
      
      setDir(direction);
      setSwipeAnim(doSwipe);
      setPhase('out');
      prevPathRef.current = pathname; 

      const timer1 = setTimeout(() => {
        setDisplayChildren(children);
        setPhase('prep');
        
        const timer2 = setTimeout(() => {
          setPhase('in');
          
          const timer3 = setTimeout(() => {
            setPhase('idle');
          }, 400); 
        }, 30); 
      }, 150); 

      return () => {
        clearTimeout(timer1);
      };
    } else {
      if (phase === 'idle') {
        setDisplayChildren(children);
      }
    }
  }, [pathname, children]);

  const easeOutBack = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const easeIn = 'ease-in';
  
  let transform = 'translateX(0) scale(1)';
  let opacity = 1;
  let transition = '';

  if (phase === 'out') {
    if (swipeAnim) {
      transform = `translateX(${dir * -12}vw) scale(0.97)`;
    } else {
      transform = `scale(0.92) translateY(10px)`;
    }
    opacity = 0;
    transition = `transform 0.15s ${easeIn}, opacity 0.15s ease`;
  } else if (phase === 'prep') {
    if (swipeAnim) {
      transform = `translateX(${dir * 25}vw) scale(0.97)`;
    } else {
      transform = `scale(1.05) translateY(-5px)`;
    }
    opacity = 0;
    transition = 'none'; 
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
        overflowX: 'hidden'
      }}
    >
      {displayChildren}
    </div>
  );
}
