'use client';

import BottomNav from '@/components/BottomNav';
import PageTransition from '@/components/PageTransition';
import { useSearchParams } from 'next/navigation';

export default function AttendeeLayout({ children }) {
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === '1';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: isOnboarding ? 0 : 72 }}>
      <PageTransition>{children}</PageTransition>
      {!isOnboarding && <BottomNav />}
    </div>
  );
}
