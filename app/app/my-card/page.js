'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Camera, User, CheckCircle2, ChevronLeft, QrCode, Save, Edit3, Image as ImageIcon, Briefcase, Globe, Linkedin, FileText, Info, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CardPreview } from '@/components/CardPreview';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';

export default function MyCardPage() {
  return (
    <Suspense fallback={<Loader />}>
      <MyCardContent />
    </Suspense>
  );
}

function SuccessAnimation() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.5s ease both',
    }}>
      <div style={{
        width: 120, height: 120, borderRadius: '50%',
        background: 'var(--g)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
        animation: 'stampBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}>
        <CheckCircle2 size={64} />
      </div>
      <h2 style={{ fontFamily: 'var(--fh)', fontSize: 28, fontWeight: 800, color: 'var(--g)', marginBottom: 8 }}>
        Check-in Success!
      </h2>
      <p style={{ fontFamily: 'var(--fb)', fontSize: 16, color: 'var(--sub)', fontWeight: 600 }}>
        Welcome to the conference.
      </p>
      
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

function MyCardContent() {
  const { data: session, update: updateSession } = useSession();
  const profile = session?.profile;
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === '1';

  // If card_made is false, open editing page. Otherwise, show QR.
  const [isEditing, setIsEditing] = useState(isOnboarding || profile?.card_made === false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);
  const [showSuccessQR, setShowSuccessQR] = useState(false);
  const [isCheckinSuccess, setIsCheckinSuccess] = useState(false);
  const [isBeingScanned, setIsBeingScanned] = useState(false);

  const cardRef = useRef(null);
  const domRefs = useRef({});

  // Helper to handle both boolean and string "TRUE"
  const isCheckedIn = (val) => val === true || val === 'TRUE';

  // Combined listener and polling
  useEffect(() => {
    if (!profile?.id || isCheckedIn(profile.checked_in)) return;

    const handleSuccess = () => {
      console.log('[DEBUG] Check-in success detected!');
      setIsCheckinSuccess(true);
      updateSession();
      setTimeout(() => router.push('/app'), 2200);
    };

    // 1. Primary: Realtime Listener
    const channel = supabase
      .channel(`checkin-${profile.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${profile.id}`
      }, (payload) => {
        console.log('[DEBUG] Realtime Update:', payload);
        if (isCheckedIn(payload.new.checked_in)) {
          handleSuccess();
        }
      })
      .subscribe((status) => {
        console.log('[DEBUG] Realtime Status:', status);
      });

    // 2. High-frequency polling ONLY when the QR screen is active
    let pollInterval;
    if (showSuccessQR && !isCheckinSuccess) {
      console.log('[DEBUG] Starting 1s internal API poll...');
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/profile');
          if (res.ok) {
            const data = await res.json();
            if (isCheckedIn(data.checked_in)) {
              console.log('[DEBUG] 1s API Poll: SUCCESS!');
              handleSuccess();
            }
          }
        } catch (e) {
          console.error('[DEBUG] Poll error:', e);
        }
      }, 1000);
    }

    return () => {
      supabase.removeChannel(channel);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [profile?.id, profile?.checked_in, router, updateSession, showSuccessQR, isCheckinSuccess]);

  // 3. New Connection Realtime Listener (for "You got scanned")
  useEffect(() => {
    if (!profile?.id) return;
    console.log('[DEBUG] Setting up Scanned listener for ID:', profile.id);

    const channel = supabase
      .channel(`scanned-realtime-${profile.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'connections',
        filter: `scanned_id=eq.${profile.id}`
      }, (payload) => {
        console.log('[DEBUG] Connection Insert (Scanned!):', payload);
        setIsBeingScanned(true);
        setTimeout(() => setIsBeingScanned(false), 4000);
      })
      .subscribe((status) => {
        console.log('[DEBUG] Scanned Realtime Channel Status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[DEBUG] Successfully listening for scans on profile:', profile.id);
        }
      });

    return () => {
      console.log('[DEBUG] Cleaning up Scanned listener');
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  useEffect(() => {
    if (qrExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [qrExpanded]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAvatar(profile.avatar || '');
      setRole(profile.role || '');
      setBio(profile.bio || '');
      setCompany(profile.company || '');
      setLinkedin(profile.linkedin || '');
      setResumeLink(profile.resume_link || '');
    }
  }, [profile]);

  const saveProfile = async () => {
    if (!name || name.length < 2) return toast.error('Valid Name is required');
    if (!company || company.length < 2) return toast.error('Company is required');
    if (!role || role.length < 2) return toast.error('Role is required');

    setSaving(true);
    const t = toast.loading('Saving profile...');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_link: resumeLink, bio, role, name, avatar, company, linkedin }),
      });
      if (res.ok) {
        toast.success('Profile saved', { id: t });
        updateSession(); 
        if (!isCheckedIn(profile.checked_in)) {
          setShowSuccessQR(true);
        } else {
          router.push('/app');
        }
      } else {
        toast.error('Failed to save', { id: t });
      }
    } catch {
      toast.error('Network error', { id: t });
    }
    setSaving(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('File too large (max 2MB)');
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  if (!profile) return <Loader />;
  if (isCheckinSuccess) return <SuccessAnimation />;

  return (
    <div className="page-enter" style={{ height: '100%', overflowY: 'auto', paddingBottom: 100 }}>
      {isCheckedIn(profile?.checked_in) && (
        <div style={{ padding: '16px 16px 0', maxWidth: 500, margin: '0 auto', width: '100%' }}>
          <button 
            onClick={() => router.push('/app')}
            style={{ 
              background: 'none', border: 'none', display: 'flex', alignItems: 'center', 
              gap: 6, color: 'var(--muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer' 
            }}
          >
            <ChevronLeft size={18} /> Back to Dashboard
          </button>
        </div>
      )}

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--fh)', fontSize: 32, fontWeight: 800, color: 'var(--g)', marginBottom: 8 }}>
            My Digital Identity
          </h1>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', fontWeight: 500 }}>
            Curate your profile and display your check-in code.
          </p>
        </div>

        {/* The Card */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <CardPreview user={{ name, avatar, role, company, bio, linkedin }} />
          <button 
            onClick={() => setIsEditing(!isEditing)}
            style={{
              position: 'absolute', right: 12, bottom: -12,
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--g)', color: '#fff', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'pointer',
              zIndex: 10
            }}
          >
            {isEditing ? <CheckCircle2 size={20} /> : <Edit3 size={20} />}
          </button>
        </div>

        {isEditing ? (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Avatar Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--s1)', padding: 16, borderRadius: 20 }}>
              <div style={{ position: 'relative', width: 64, height: 64 }}>
                <img src={avatar || '/assets/ethos-logo-insignia.png'} alt="" style={{ width: '100%', height: '100%', borderRadius: 16, objectFit: 'cover' }} />
                <label style={{
                   position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', 
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   color: '#fff', borderRadius: 16, cursor: 'pointer'
                }}>
                  <ImageIcon size={20} />
                  <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Profile Picture</p>
                <p style={{ fontSize: 11, color: 'var(--sub)' }}>Best as 1:1 ratio square.</p>
              </div>
            </div>

            <div className="input-group">
              <label className="section-label">Full Name</label>
              <input 
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Jane Cooper"
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, background: 'var(--white)', border: 'none', color: 'var(--text)', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="input-group">
                <label className="section-label">Organization</label>
                <input 
                  type="text" value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="GreenTech Solutions"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 14, background: 'var(--white)', border: 'none', color: 'var(--text)', outline: 'none' }}
                />
              </div>
              <div className="input-group">
                <label className="section-label">Your Role</label>
                <input 
                  type="text" value={role} onChange={e => setRole(e.target.value)}
                  placeholder="Sustainability Lead"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 14, background: 'var(--white)', border: 'none', color: 'var(--text)', outline: 'none' }}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="section-label">Bio (Short & Sweet)</label>
              <textarea 
                value={bio} onChange={e => setBio(e.target.value)}
                placeholder="Passionate about circularity and zero-waste systems..."
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, background: 'var(--white)', border: 'none', color: 'var(--text)', outline: 'none', minHeight: 80, resize: 'none' }}
              />
            </div>

            <div className="input-group">
              <label className="section-label">LinkedIn Profile URL</label>
              <div style={{ position: 'relative' }}>
                <Linkedin size={16} style={{ position: 'absolute', left: 16, top: 16, color: 'var(--muted)' }} />
                <input 
                  type="text" value={linkedin} onChange={e => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/in/username"
                  style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: 14, background: 'var(--white)', border: 'none', color: 'var(--text)', outline: 'none' }}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="section-label">Resume / Portfolio Link</label>
              <div style={{ position: 'relative' }}>
                <FileText size={16} style={{ position: 'absolute', left: 16, top: 16, color: 'var(--muted)' }} />
                <input 
                  type="text" value={resumeLink} onChange={e => setResumeLink(e.target.value)}
                  placeholder="drive.google.com/..."
                  style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: 14, background: 'var(--white)', border: 'none', color: 'var(--text)', outline: 'none' }}
                />
              </div>
            </div>

            <button 
              onClick={saveProfile}
              disabled={saving}
              style={{
                width: '100%', padding: '16px', borderRadius: 18, background: 'var(--g)',
                color: '#fff', border: 'none', fontSize: 16, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', cursor: 'pointer',
                opacity: saving ? 0.7 : 1, transition: 'all 0.2s', marginTop: 12
              }}
            >
              {saving ? <Loader2 className="spin" size={20} /> : <Save size={20} />}
              Save My Profile
            </button>
          </div>
        ) : (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {!isCheckedIn(profile.checked_in) && (
              <div style={{
                background: 'var(--warm-dim)', border: '1px solid var(--warm-border)',
                padding: '16px 20px', borderRadius: 20, display: 'flex', gap: 16,
                alignItems: 'center'
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--warm)', color: 'var(--g)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Info size={24} />
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--g)', fontWeight: 600, lineHeight: 1.4 }}>
                  Ensure your profile is correct before scanning. Your data is used for the networking features.
                </p>
              </div>
            )}

            {/* Check-in QR Section */}
            <div style={{ 
              background: 'var(--white)', border: '1px solid var(--border)', 
              borderRadius: 24, padding: 32, textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
               <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--g)' }}>
                <QrCode size={32} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--fh)', fontSize: 18, fontWeight: 800, color: 'var(--g)', marginBottom: 4 }}>
                   Wallet Sharing
                </h3>
                <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', fontWeight: 500 }}>
                  Share this QR to get yourself added to others' wallet.
                </p>
              </div>
              
              <div 
                onClick={() => setQrExpanded(true)}
                style={{ 
                  background: '#fff', padding: 20, borderRadius: 24, 
                  border: '1px solid var(--border)', cursor: 'pointer',
                  transition: 'all 0.3s var(--liquid)',
                  transform: 'scale(1)',
                }}
              >
                <QRCode value={profile.id} size={160} level="H" />
              </div>
              
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tap to enlarge
              </p>
            </div>


          </div>
        )}
      </div>

      {/* Fullscreen Success Screen (Final Gate) */}
      {(showSuccessQR && !isCheckedIn(profile.checked_in)) && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000, 
          background: 'var(--bg)', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', padding: 'max(24px, env(safe-area-inset-top)) 24px calc(max(24px, env(safe-area-inset-bottom)) + 24px)',
          animation: 'fadeUp 0.6s var(--liquid) both'
        }}>
          <div style={{ maxWidth: 500, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--g)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <QrCode size={40} />
              </div>
              <h2 style={{ fontFamily: 'var(--fh)', fontSize: 32, fontWeight: 800, color: 'var(--g)', marginBottom: 12 }}>
                Waiting for Scan
              </h2>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 16, color: 'var(--sub)', fontWeight: 600, maxWidth: 300, margin: '0 auto' }}>
                Please present this code to our staff member at the check-in desk.
              </p>
            </div>

            <div style={{ 
              background: '#fff', padding: 40, borderRadius: 40, 
              boxShadow: '0 40px 100px rgba(0,0,0,0.15)',
              border: '4px solid var(--g)'
            }}>
              <QRCode value={profile.id} size={240} level="H" />
            </div>

            <div style={{ textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: 32, width: '100%' }}>
               <button 
                onClick={() => setShowSuccessQR(false)}
                className="section-label" 
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', margin: '0 auto',
                  textDecoration: 'underline'
                }}
              >
                Go back & edit profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Zoom Modal */}
      {qrExpanded && (
        <div 
          onClick={() => setQrExpanded(false)}
          className="modal-overlay" 
          style={{ 
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            zIndex: 1001, alignItems: 'center' 
          }}
        >
          <div style={{ textAlign: 'center', width: '100%', padding: 24 }} onClick={e => e.stopPropagation()}>
            <div style={{ 
              background: '#fff', padding: 40, borderRadius: 32, 
              display: 'inline-block', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' 
            }}>
              <QRCode value={profile.id} size={280} level="H" />
            </div>
            <p style={{ color: '#fff', marginTop: 32, fontFamily: 'var(--fh)', fontSize: 20, fontWeight: 700 }}>
               Share your profile
            </p>
            <button 
              onClick={() => setQrExpanded(false)}
              style={{
                marginTop: 40, background: 'rgba(255,255,255,0.15)', color: '#fff',
                border: 'none', borderRadius: '50%', width: 56, height: 56,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                margin: '40px auto 0'
              }}
            >
              <X size={28} />
            </button>
          </div>
        </div>
      )}
      {/* "You got scanned" Celebration Overlay */}
      {isBeingScanned && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          pointerEvents: 'none',
        }}>
          <div style={{
            textAlign: 'center', animation: 'successPop 0.8s var(--liquid) both',
            padding: 24, maxWidth: 400, width: '100%'
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: 50, background: 'var(--g)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', color: '#fff', boxShadow: '0 12px 40px rgba(62, 92, 38, 0.4)',
              position: 'relative'
            }}>
              <QrCode size={50} />
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: 8, height: 8, borderRadius: '50%',
                  background: i % 2 === 0 ? 'var(--accent)' : 'var(--g)',
                  '--tx': `${(Math.cos(i * 30 * Math.PI / 180) * 120)}px`,
                  '--ty': `${(Math.sin(i * 30 * Math.PI / 180) * 120)}px`,
                  animation: 'particleBurst 1s ease-out both',
                }} />
              ))}
            </div>
            <h2 style={{ fontFamily: 'var(--fh)', fontSize: 28, fontWeight: 800, color: 'var(--g)', margin: '0 0 8px' }}>
              You Just Got Scanned!
            </h2>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 17, color: 'var(--sub)', margin: 0, fontWeight: 700 }}>
              Someone just added you to their wallet. 🥳
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Btn({ variant, children, onClick, style }) {
  const isText = variant === 'text';
  return (
    <button 
      onClick={onClick}
      style={{
        background: isText ? 'transparent' : 'var(--g)',
        color: isText ? 'var(--sub)' : '#fff',
        border: 'none', borderRadius: 12, padding: '10px 20px',
        fontSize: 13, fontWeight: 700, cursor: 'pointer',
        textDecoration: isText ? 'underline' : 'none',
        ...style
      }}
    >
      {children}
    </button>
  );
}