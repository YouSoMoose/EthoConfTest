'use client';

import BottomNav from '@/components/BottomNav';
import PageTransition from '@/components/PageTransition';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AttendeeLayoutContent({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === '1';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  return (
    <div style={{ 
      minHeight: 'var(--app-height, 100dvh)',
      height: 'var(--app-height, 100dvh)',
      background: 'var(--bg)', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      position: 'relative',
      touchAction: 'none'
    }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <PageTransition>{children}</PageTransition>
      </div>
      {!isOnboarding && <BottomNav />}
    </div>
  );
}

export default function AttendeeLayout({ children }) {
  return (
    <Suspense fallback={null}>
      <AttendeeLayoutContent>{children}</AttendeeLayoutContent>
    </Suspense>
  );
}
