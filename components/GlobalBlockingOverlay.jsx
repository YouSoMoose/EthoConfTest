'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import LiabilityWaiver from './LiabilityWaiver';
import CheckInOverlay from './CheckInOverlay';

export default function GlobalBlockingOverlay({ children }) {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();

  // Define routes that should NOT be blocked
  const isExcluded = 
    pathname === '/login' || 
    pathname === '/staff-invite' || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin'); // Keep admin accessible to avoid lockouts for scanners

  // Handle loading state
  if (status === 'loading') return children;
  
  // If not logged in or on an excluded route, don't block
  if (!session?.profile || isExcluded) return children;

  const profile = session.profile;
  const isCheckedIn = profile.checked_in === true || profile.checked_in === 'TRUE';

  // 1. Liability Check (Priority 1)
  if (profile.liability !== true) {
    return (
      <div style={styles.fullscreenWrapper}>
        <LiabilityWaiver onComplete={() => update()} />
      </div>
    );
  }

  // 2. Check-in Check (Priority 2)
  // Only show check-in prompt if they have already made their card
  if (!isCheckedIn && profile.card_made === true) {
    return (
      <div style={styles.fullscreenWrapper}>
        <CheckInOverlay profile={profile} onComplete={() => update()} />
      </div>
    );
  }

  // If everything is fine, show the app
  return children;
}

const styles = {
  fullscreenWrapper: {
    position: 'fixed',
    inset: 0,
    zIndex: 99999,
    background: 'var(--bg)',
    overflowY: 'auto',
  }
};
