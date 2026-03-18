import './globals.css';
import { Toaster } from 'react-hot-toast';
import SessionProvider from '@/components/SessionProvider';
import MessageNotification from '@/components/MessageNotification';
import AnnouncementBanner from '@/components/AnnouncementBanner';

export const metadata = {
  title: 'The Circular Economy Conference',
  description: 'The official app for The Circular Economy Conference, a sustainability and innovation conference.',
  icons: {
    icon: '/assets/ethos-logo-insignia.png',
    apple: '/assets/ethos-logo-insignia.png',
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'var(--fb)', background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
        <SessionProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: '12px',
                background: 'var(--g)',
                color: '#fff',
                fontFamily: 'var(--fb)',
                fontSize: '14px',
              },
            }}
          />
          <MessageNotification />
          <AnnouncementBanner />
          <div className="mobile-container">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
