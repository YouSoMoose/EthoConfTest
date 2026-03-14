'use client';

import { signIn } from 'next-auth/react';
import Btn from '@/components/Btn';

export default function LoginPage() {
  return (
    <div className="page-enter" style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r)',
        padding: '40px 28px',
        maxWidth: 380,
        width: '100%',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🌿</span>
        <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 26, color: 'var(--text)', marginBottom: 6 }}>
          Welcome Back
        </h1>
        <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', marginBottom: 28 }}>
          Sign in to access Ethos 2026
        </p>

        <Btn onClick={() => signIn('google', { callbackUrl: '/' })}>
          Sign in with Google
        </Btn>
      </div>
    </div>
  );
}
