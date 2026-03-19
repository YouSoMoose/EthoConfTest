'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ResetPage() {
  useEffect(() => {
    // Blast all NextAuth cookies
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.callback-url',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Secure-next-auth.callback-url',
      '__Host-next-auth.csrf-token',
      // Supabase specific if you use them elsewhere
      'sb-access-token', 
      'sb-refresh-token'
    ];
    
    cookiesToClear.forEach(name => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // Blast local storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Hard navigate to login to completely refresh Next.js state
    window.location.href = '/login';
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
