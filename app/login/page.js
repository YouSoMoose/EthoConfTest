'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Info, Bell, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';

// iOS PWA / bookmark fix — 100dvh lies in standalone mode
function useIOSHeight() {
  useEffect(() => {
    const set = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    set();
    window.addEventListener('resize', set);
    window.addEventListener('orientationchange', set);
    return () => {
      window.removeEventListener('resize', set);
      window.removeEventListener('orientationchange', set);
    };
  }, []);
}

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  useIOSHeight();

  useEffect(() => {
    if (status === 'authenticated' && session?.profile) {
      const level = session.profile.access_level ?? 0;
      if (level >= 2) router.replace('/admin');
      else if (level === 1) router.replace('/company');
      else router.replace('/app');
    }
  }, [session, status, router]);

  async function handleGoogle() {
    setLoading(true);
    signIn('google', { callbackUrl: '/' });
  }

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
      }
    }
  };

  if (status === 'loading' || (status === 'authenticated' && session?.profile)) {
    return (
      <div style={{
        height: 'var(--app-height, 100dvh)',
        background: 'var(--hero)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          width: 24, height: 24, border: '3px solid rgba(255,255,255,.2)',
          borderTopColor: '#fff', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
        }} />
        <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'rgba(255,255,255,.5)' }}>Checking session…</p>
      </div>
    );
  }

  return (
    <div style={{
      height: 'var(--app-height, 100dvh)',
      background: 'linear-gradient(135deg, #FFE2D6 0%, #FCBD9D 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden', // ← key: prevent any overflow from causing scroll
      transition: 'background 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    }}>
      {/* Info button */}
      <Link href="/?carousel=1" style={{
        position: 'absolute', top: 'max(24px, env(safe-area-inset-top))', right: 24,
        width: 32, height: 32, borderRadius: 16,
        background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--sub)', textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer',
        zIndex: 10,
      }}>
        <Info size={18} />
      </Link>

      {/* Hero branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 24px',
        // Prevent content from overflowing this flex child
        minHeight: 0,
        overflow: 'hidden',
      }}>
        <div style={{
          width: 'clamp(64px, 14vh, 80px)', height: 'clamp(64px, 14vh, 80px)', borderRadius: '50%',
          background: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(15px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', overflow: 'hidden', padding: 4,
          boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
          flexShrink: 0,
        }}>
          <img src="/assets/ethos-logo-insignia.png" alt="The Circular Economy Conference" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '.25em',
            color: 'var(--sub)', textTransform: 'uppercase', marginBottom: 12,
          }}>
            Annual Conference · 2026
          </p>
          <h1 style={{ fontFamily: 'var(--fh)', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: 'var(--text)', margin: '4px 0 8px', lineHeight: 1 }}>
            The Circular Economy Conference
          </h1>
          <p style={{
            fontSize: 14, color: 'var(--sub)',
            fontFamily: 'var(--fb)', fontWeight: 600, letterSpacing: '0.05em'
          }}>
            SUSTAINABILITY & INNOVATION
          </p>
        </div>
      </div>

      {/* Login dock */}
      <div style={{
        background: '#fff',
        borderRadius: '32px 32px 0 0',
        padding: `32px 24px max(32px, env(safe-area-inset-bottom))`,
        boxShadow: '0 -15px 50px rgba(0,0,0,0.12)',
        flexShrink: 0, // ← don't let this shrink and push content
      }}>
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '18px 24px',
            background: 'var(--text)',
            color: '#fff',
            border: 'none',
            borderRadius: 18,
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'var(--fb)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s',
            marginBottom: 16,
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? 'Processing…' : 'Sign in with Google'}
        </button>

        <button
          onClick={() => setTermsOpen(true)}
          style={{
            width: '100%', padding: '10px 12px', background: 'transparent',
            border: 'none', color: 'var(--sub)', fontSize: 13, fontWeight: 700,
            fontFamily: 'var(--fb)', cursor: 'pointer', marginBottom: 4,
            textDecoration: 'underline', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}
        >
          Terms of Use & Privacy Policy <ShieldCheck size={14} />
        </button>

        <button
          onClick={requestNotifications}
          style={{
            width: '100%', padding: '10px 12px', background: 'transparent',
            border: 'none', color: 'var(--muted)', fontSize: 13, fontWeight: 600,
            fontFamily: 'var(--fb)', cursor: 'pointer', marginBottom: 16,
            textDecoration: 'underline', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}
        >
          Enable Browser Notifications <Bell size={14} />
        </button>

        <Modal open={termsOpen} onClose={() => setTermsOpen(false)} title="Legal Information" center>
          <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8, textAlign: 'left', fontFamily: 'var(--fb)' }}>
            <h3 style={{ fontFamily: 'var(--fh)', fontSize: 18, marginBottom: 8 }}>Terms of Use</h3>
            <p style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 16 }}>Effective Date: 03/21/2026</p>

            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>1. Acceptance of Terms</h4>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>By accessing or using the Ethos Sustainability Conference App ("App"), you agree to be bound by these Terms of Use. If you do not agree, do not use the App.</p>
            </section>
            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>2. Purpose of the App</h4>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>The App is provided by Ethos Sustainable Business and STEAM Education ("Ethos") to manage conference participation, provide schedules/updates, and enable networking.</p>
            </section>
            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>3. User Accounts</h4>
              <ul style={{ fontSize: 13, lineHeight: 1.5, paddingLeft: 20 }}>
                <li>You may be required to create an account.</li>
                <li>You agree to provide accurate, complete information.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              </ul>
            </section>
            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>4. Acceptable Use</h4>
              <p style={{ fontSize: 13, marginBottom: 8 }}>You agree NOT to:</p>
              <ul style={{ fontSize: 13, lineHeight: 1.5, paddingLeft: 20 }}>
                <li>Use the App for unlawful purposes</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Upload malicious code or attempt to disrupt the App</li>
                <li>Misrepresent your identity</li>
              </ul>
              <p style={{ fontSize: 13, marginTop: 8 }}>Ethos reserves the right to suspend or terminate accounts violating these rules.</p>
            </section>
            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>5. Data Access and Visibility</h4>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>By using the App, you acknowledge: Ethos administrators may access and review user-submitted data (e.g., profiles, messages, submissions, attendance) strictly for event management, safety, and moderation.</p>
            </section>
            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>6. Intellectual Property</h4>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>All content on the App (logos, branding, materials) is owned by Ethos or its partners and may not be reproduced without permission.</p>
            </section>
            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>7. Event Changes</h4>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>Ethos may modify event schedules, speaker lineups, or App features at any time without prior notice.</p>
            </section>
            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>8. Disclaimer of Warranties</h4>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>The App is provided "as is" without warranties of any kind regarding availability, accuracy, or reliability.</p>
            </section>
            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>9. Limitation of Liability</h4>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>Ethos is not liable for technical issues, data loss, or indirect damages arising from App use.</p>
            </section>
            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>10. Governing Law</h4>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>These Terms are governed by the laws of the State of Texas, United States.</p>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />

            <h3 style={{ fontFamily: 'var(--fh)', fontSize: 18, marginBottom: 8 }}>Privacy Policy</h3>
            <p style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 16 }}>Effective Date: 03/21/2026</p>

            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>1. Information We Collect</h4>
              <p style={{ fontSize: 13, marginBottom: 8 }}><strong>a. Information You Provide:</strong> Name, email, organization, profile details, messages, or submissions.</p>
              <p style={{ fontSize: 13 }}><strong>b. Automatically Collected Data:</strong> Device information, log data, and IP address.</p>
            </section>
            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>2. Data Access (Important Transparency Clause)</h4>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>Ethos administrators can view and access user data within the App. This includes profiles, messages, and activity logs. Access is limited to authorized personnel and used only for operational purposes.</p>
            </section>
            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>3. Data Sharing</h4>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>We do NOT sell or rent your personal data to third parties. We may share data only with necessary service providers or if required by law.</p>
            </section>
            <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>4. Your Rights</h4>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>You may request access to, correction of, or deletion of your data by contacting: info@ethossustainability.org</p>
            </section>
            <p style={{ fontSize: 12, color: 'var(--sub)', marginTop: 32, textAlign: 'center' }}>
              For full details or questions, contact:<br />
              <strong>info@ethossustainability.org</strong>
            </p>
          </div>
          <div style={{ marginTop: 24 }}>
            <button
              onClick={() => setTermsOpen(false)}
              style={{
                width: '100%', padding: '14px', background: 'var(--g)', color: '#fff',
                border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--fb)'
              }}
            >
              I Understand & Accept
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}