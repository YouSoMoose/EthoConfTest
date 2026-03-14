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
      <body className="font-body bg-amber-50 min-h-screen">
        <SessionProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: '12px',
                background: '#14532d',
                color: '#fff',
                fontFamily: 'DM Sans, sans-serif',
              },
            }}
          />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
