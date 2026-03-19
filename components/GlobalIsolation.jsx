'use client';

import { usePathname } from 'next/navigation';

export default function GlobalIsolation({ children }) {
  const pathname = usePathname();
  if (pathname === '/staff-invite') return null;
  return children;
}
