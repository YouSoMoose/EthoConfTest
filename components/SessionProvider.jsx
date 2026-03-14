'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import AnnouncementBanner from '@/components/AnnouncementBanner';

export default function SessionProvider({ children, session }) {
  return (
    <NextAuthSessionProvider session={session} refetchInterval={60} refetchOnWindowFocus={true}>
      <AnnouncementBanner />
      {children}
    </NextAuthSessionProvider>
  );
}
