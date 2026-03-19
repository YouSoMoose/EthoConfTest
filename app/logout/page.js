'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  useEffect(() => {
    // Attempt to manually clear any errant cookies if possible on the client
    document.cookie.split(";").forEach((c) => { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Call NextAuth signout
    signOut({ callbackUrl: '/' });
  }, []);

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: 'var(--fb)'
    }}>
      <Loader2 size={48} className="spin" color="var(--g)" />
      <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 800, margin: 0 }}>Logging Out...</h2>
      <p style={{ color: 'var(--sub)', margin: 0 }}>Clearing your session securely.</p>
    </div>
  );
}
