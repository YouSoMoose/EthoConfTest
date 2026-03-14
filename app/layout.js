import './globals.css';
import { Toaster } from 'react-hot-toast';
import SessionProvider from '@/components/SessionProvider';

export const metadata = {
  title: 'Ethos 2026 — Sustainability Conference',
  description: 'The official app for Ethos 2026, a sustainability and innovation conference.',
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
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
