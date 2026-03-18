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
      height: '100dvh', 
      background: 'var(--bg)', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
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
