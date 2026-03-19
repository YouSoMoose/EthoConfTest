'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, LogIn, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffInvitePage() {
  const { data: session, status } = useSession();
  const [upgrading, setUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyStaff, setAlreadyStaff] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.profile && !success) {
      const level = session.profile.access_level ?? 0;
      if (level < 2) {
        handleUpgrade();
      } else {
        setAlreadyStaff(true);
        handleFinishUpgrade();
      }
    }
  }, [status, session]);

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await fetch('/api/auth/staff-upgrade', { method: 'POST' });
      if (res.ok) {
        handleFinishUpgrade();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to upgrade access');
        setUpgrading(false);
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      setUpgrading(false);
    }
  }

  async function handleFinishUpgrade() {
    setUpgrading(true);
    setSuccess(true);
    // Immediate logout to keep it isolated
    await signOut({ redirect: false });
    setUpgrading(false);
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0a0a0a',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999999,
      fontFamily: 'var(--fb)',
      padding: 24,
      textAlign: 'center',
    }}>
      <div style={{
        maxWidth: 400,
        width: '100%',
        padding: 40,
        background: '#111',
        border: '1px solid #222',
        borderRadius: 32,
        boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: '#1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <img 
            src="/assets/ethos-logo-insignia.png" 
            alt="Logo" 
            style={{ width: 48, height: 48, filter: 'brightness(10)' }} 
          />
        </div>

        <h1 style={{ fontFamily: 'var(--fh)', fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
          Staff Provisioning
        </h1>

        {success ? (
          <div style={{ animation: 'successPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: alreadyStaff ? 'var(--sub)' : 'var(--g)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', color: '#fff'
            }}>
              {alreadyStaff ? <ShieldCheck size={32} /> : <CheckCircle2 size={32} />}
            </div>
            
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              {alreadyStaff ? 'Access Verified' : 'Account Verified'}
            </h2>
            
            <p style={{ color: alreadyStaff ? 'rgba(255,255,255,0.7)' : '#4caf50', fontWeight: 600, fontSize: 16, marginBottom: 24 }}>
              {alreadyStaff ? 'u alr have access' : 'congrats u have staff access'}
            </p>
            
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6, marginBottom: 32 }}>
              {alreadyStaff 
                ? "You're already a staff member. Your session has been cleared for security."
                : "Your permissions have been updated. Your temporary session has been cleared."
              }
            </p>
            
            <button
              onClick={() => window.location.href = '/login'}
              style={{
                width: '100%',
                background: '#fff',
                color: '#000',
                padding: '16px 24px',
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                border: 'none',
              }}
            >
              Sign in to Dashboard <ArrowRight size={18} />
            </button>
          </div>
        ) : (status === 'loading' || upgrading || (status === 'authenticated' && !success)) ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Loader2 className="spin" size={32} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
              {upgrading ? 'Processing permissions...' : 'Verifying Gmail Auth...'}
            </p>
          </div>
        ) : (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginBottom: 32, lineHeight: 1.5 }}>
              Sign in with Gmail to verify your identity and receive Staff Access 2.
            </p>
            <button
              onClick={() => signIn('google', { callbackUrl: '/staff-invite' })}
              style={{
                width: '100%',
                padding: '18px 24px',
                background: '#fff',
                color: '#000',
                border: 'none',
                borderRadius: 16,
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <LogIn size={20} />
              Verify with Gmail
            </button>
          </div>
        )}
      </div>
      
      <p style={{ 
        marginTop: 40, 
        fontSize: 11, 
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }}>
        Isolated Staff Provisioning System
      </p>

      <style jsx>{`
        @keyframes successPop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
