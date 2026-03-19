'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, CheckCircle2, X } from 'lucide-react';
import QRCode from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function CheckInOverlay({ profile, onComplete }) {
  const router = useRouter();
  const [isCheckinSuccess, setIsCheckinSuccess] = useState(false);

  // Helper to handle both boolean and string "TRUE"
  const isCheckedIn = (val) => val === true || val === 'TRUE';

  useEffect(() => {
    if (!profile?.id || isCheckedIn(profile.checked_in)) return;

    const handleSuccess = () => {
      setIsCheckinSuccess(true);
      if (onComplete) onComplete();
    };

    // 1. Primary: Realtime Listener
    const channel = supabase
      .channel(`checkin-overlay-${profile.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${profile.id}`
      }, (payload) => {
        if (isCheckedIn(payload.new.checked_in)) {
          handleSuccess();
        }
      })
      .subscribe();

    // 2. Fallback: Polling every 2 seconds
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (isCheckedIn(data.checked_in)) {
            handleSuccess();
          }
        }
      } catch (e) {
        console.error('Check-in poll error:', e);
      }
    }, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [profile?.id, profile?.checked_in, onComplete]);

  if (isCheckinSuccess) {
    return (
      <div style={styles.fullscreenSuccess}>
        <div style={styles.successIconBox}>
          <CheckCircle2 size={64} />
        </div>
        <h2 style={styles.successTitle}>Check-in Success!</h2>
        <p style={styles.successText}>Welcome to the conference.</p>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes stampBounce {
            0% { transform: scale(0) rotate(-20deg); opacity: 0; }
            50% { transform: scale(1.2) rotate(5deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.iconBox}>
            <QrCode size={40} />
          </div>
          <h2 style={styles.title}>Waiting for Scan</h2>
          <p style={styles.subtitle}>
            Please present this code to a staff member at the registration desk to check in.
          </p>
        </div>

        <div style={styles.qrContainer}>
          <QRCode value={profile.id} size={240} level="H" />
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            You will be automatically redirected once your badge is scanned.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 99999,
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'min(80px, 15vh) 24px',
    animation: 'fadeUp 0.6s var(--liquid) both',
    overflowY: 'auto',
  },
  content: {
    maxWidth: 500,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 32,
  },
  header: {
    textAlign: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'var(--g)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    boxShadow: '0 8px 24px rgba(62, 92, 38, 0.2)',
  },
  title: {
    fontFamily: 'var(--fh)',
    fontSize: 32,
    fontWeight: 800,
    color: 'var(--g)',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'var(--fb)',
    fontSize: 16,
    color: 'var(--sub)',
    fontWeight: 600,
    maxWidth: 320,
    margin: '0 auto',
    lineHeight: 1.5,
  },
  qrContainer: {
    background: '#fff',
    padding: 32,
    borderRadius: 40,
    boxShadow: '0 40px 100px rgba(0,0,0,0.1)',
    border: '4px solid var(--g)',
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: 'var(--muted)',
    fontWeight: 600,
    maxWidth: 240,
  },
  fullscreenSuccess: {
    position: 'fixed',
    inset: 0,
    zIndex: 100000,
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.5s ease both',
  },
  successIconBox: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: 'var(--g)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    animation: 'stampBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  },
  successTitle: {
    fontFamily: 'var(--fh)',
    fontSize: 28,
    fontWeight: 800,
    color: 'var(--g)',
    marginBottom: 8,
  },
  successText: {
    fontFamily: 'var(--fb)',
    fontSize: 16,
    color: 'var(--sub)',
    fontWeight: 600,
  },
};
