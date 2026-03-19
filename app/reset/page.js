'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function ResetPage() {
  useEffect(() => {
    async function hardClear() {
      // Attempt manual wipe for non-HttpOnly cookies (legacy Supabase)
      ['sb-access-token', 'sb-refresh-token'].forEach(name => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      // Blast local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Use NextAuth to properly destroy HttpOnly session cookies
      await signOut({ redirect: true, callbackUrl: '/login' });
    }
    
    hardClear();
  }, []);

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', gap: 16,
      background: 'var(--bg, #f2ece6)', color: 'var(--text, #4a3f35)', 
      fontFamily: 'var(--fb, sans-serif)'
    }}>
      <Loader2 size={48} className="spin" color="var(--g, #5a8139)" />
      <h2 style={{ fontFamily: 'var(--fh, sans-serif)', fontWeight: 800, margin: 0 }}>Resetting Session...</h2>
      <p style={{ color: 'var(--sub, #7e6c5c)', margin: 0 }}>Wiping bad cookies and redirecting.</p>
    </div>
  );
}
