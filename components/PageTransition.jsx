'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitioning, setTransitioning] = useState(false);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      setTransitioning(true);
      
      // After the exit animation, swap content and animate in
      const exitTimer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitioning(false);
        prevPathRef.current = pathname;
      }, 150);

      return () => clearTimeout(exitTimer);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <div
      style={{
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? 'translateX(8px)' : 'translateX(0)',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        willChange: 'opacity, transform',
      }}
    >
      {displayChildren}
    </div>
  );
}
