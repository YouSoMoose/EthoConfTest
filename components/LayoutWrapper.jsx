'use client';

import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <div className={isAdmin ? 'full-container' : 'mobile-container'}>
      {children}
    </div>
  );
}
