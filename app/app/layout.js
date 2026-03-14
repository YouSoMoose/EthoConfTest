'use client';

import BottomNav from '@/components/BottomNav';
import PageTransition from '@/components/PageTransition';

export default function AttendeeLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 72 }}>
      <PageTransition>{children}</PageTransition>
      <BottomNav />
    </div>
  );
}
