'use client';

import BottomNav from '@/components/BottomNav';

export default function AttendeeLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 72 }}>
      {children}
      <BottomNav />
    </div>
  );
}
