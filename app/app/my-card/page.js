'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, User, CheckCircle2, ChevronLeft, ChevronRight, QrCode, Save, Briefcase, Globe, Linkedin, FileText, Info, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CardPreview } from '@/components/CardPreview';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import LiabilityWaiver from '@/components/LiabilityWaiver';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';

export default function MyCardPage() {
  return (
    <Suspense fallback={<Loader />}>
      <MyCardContent />
    </Suspense>
  );
}
function MyCardContent() {
  const { data: session, update: updateSession } = useSession();
  const profile = session?.profile;
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === '1';
  const importToken = searchParams.get('import_token');

  // Explicit staging: 1 = Liability (Gate), 2 = Card, 3 = Check-in
  const [navStage, setNavStage] = useState(2); // Default to Card

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);
  const [isBeingScanned, setIsBeingScanned] = useState(false);

  const hasAutoSet = useRef(false);
  const hasInitialized = useRef(false);
  // Auto-set stage based on profile status on first load
  useEffect(() => {
    // If an import token is present, attempt to claim it (secure flow)
    if (importToken) {
      (async () => {
        try {
          const res = await fetch('/api/carbon-game/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: importToken }) });
          if (res.ok) {
            toast.success('Imported score to your card');
            // refresh session/profile
            updateSession();
          } else {
            const err = await res.json().catch(() => ({}));
            console.error('Import failed', err);
            toast.error('Failed to import score');
          }
        } catch (e) {
          console.error('Import error', e);
          toast.error('Failed to import score');
        }
      })();
    }
    if (profile && !hasAutoSet.current) {
      if (profile.card_made === false) {
        setNavStage(2);
        hasAutoSet.current = true;
      } else if (!isCheckedIn(profile.checked_in)) {
        setNavStage(3);
        hasAutoSet.current = true;
      }
    }
  }, [profile?.card_made, profile?.checked_in]);

  const cardRef = useRef(null);
  const domRefs = useRef({});

  // Helper to handle both boolean and string "TRUE"
  const isCheckedIn = (val) => val === true || val === 'TRUE';

  // Combined listener and polling
  useEffect(() => {
    if (!profile?.id || isCheckedIn(profile.checked_in)) return;

    const handleSuccess = () => {
      console.log('[DEBUG] Check-in success detected!');
      updateSession();
      router.push('/app?checkin=success'); 
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
    if (!isCheckedIn(profile?.checked_in)) {
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
  }, [profile?.id, profile?.checked_in, router, updateSession]);

  // 3. New Connection Realtime Listener + Polling Fallback (for "You got scanned")
  useEffect(() => {
    if (!profile?.id) return;
    
    // Fallback: 1s polling to detect new connections where I am the "scanned_id"
    let lastCount = -1;
    const poll = async () => {
      try {
        const res = await fetch('/api/connections?type=received');
        if (res.ok) {
          const data = await res.json();
          const currentCount = data.length;
          if (lastCount !== -1 && currentCount > lastCount) {
             console.log('[DEBUG] Poll detected new scan!');
             setIsBeingScanned(true);
             setTimeout(() => setIsBeingScanned(false), 4500);
          }
          lastCount = currentCount;
        }
      } catch (e) {}
    };

    // Initial poll
    poll();
    const pollInterval = setInterval(poll, 1000);

    // Primary: Realtime listener
    const channel = supabase
      .channel(`scanned-realtime-${profile.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'connections'
      }, (payload) => {
        if (payload.new && payload.new.scanned_id === profile.id) {
          console.log('[DEBUG] Realtime detected scan!');
          setIsBeingScanned(true);
          setTimeout(() => setIsBeingScanned(false), 4500);
        }
      })
      .subscribe();

    return () => {
      clearInterval(pollInterval);
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
    if (profile && !hasInitialized.current) {
      // First try to set from session (basic fields)
      setName(profile.name || '');
      setRole(profile.role || '');
      setCompany(profile.company || '');
      hasInitialized.current = true;

      // Then fetch the full profile for the detailed fields that were stripped from JWT
      fetch('/api/profile')
        .then(r => r.json())
        .then(data => {
          if (data && !data.error) {
            setName(data.name || '');
            setAvatar(data.avatar || '');
            setRole(data.role || '');
            setBio(data.bio || '');
            setCompany(data.company || '');
            setLinkedin(data.linkedin || '');
            setResumeLink(data.resume_link || '');
          }
        })
        .catch(err => console.error('Error fetching full profile:', err));
    }
  }, [profile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
        body: JSON.stringify({ resume_link: resumeLink, bio, role, name, company, linkedin, avatar }),
      });
      if (res.ok) {
        toast.success('Profile saved', { id: t });
        updateSession(); 
        if (!isCheckedIn(profile.checked_in)) {
          setNavStage(3); // Go to QR code check-in thing
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


  if (!profile) return <Loader />;

  const checkedIn = isCheckedIn(profile?.checked_in);

  return (
    <div className="page-enter" style={{ height: '100%', overflowY: 'auto', paddingBottom: 100 }}>
      {/* STEP NAVIGATOR - Only show if already checked in */}
      {checkedIn && (
        <div style={{ 
          padding: '24px 16px 0', maxWidth: 500, margin: '0 auto', width: '100%',
          display: 'flex', flexDirection: 'column', gap: 20,
          animation: 'slideDown 0.8s var(--liquid) both',
        }}>
          <button 
            onClick={() => router.push('/app')}
            style={{ 
              background: 'none', border: 'none', display: 'flex', alignItems: 'center', 
              gap: 6, color: 'var(--muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: 'fit-content'
            }}
          >
            <ChevronLeft size={18} /> Back to Dashboard
          </button>

          <div style={{ 
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, 
            background: 'var(--s1)', padding: 6, borderRadius: 16 
          }}>
            <button 
              onClick={() => setNavStage(2)}
              style={{
                padding: '10px', borderRadius: 12, border: 'none',
                background: navStage === 2 ? 'var(--white)' : 'transparent',
                color: navStage === 2 ? 'var(--g)' : 'var(--sub)',
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                boxShadow: navStage === 2 ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.3s var(--liquid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <User size={16} /> 1. Edit Card
              {profile?.card_made && <CheckCircle2 size={14} color="var(--g)" />}
            </button>
            <button 
              onClick={() => setNavStage(3)}
              style={{
                padding: '10px', borderRadius: 12, border: 'none',
                background: navStage === 3 ? 'var(--white)' : 'transparent',
                color: navStage === 3 ? 'var(--g)' : 'var(--sub)',
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                boxShadow: navStage === 3 ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.3s var(--liquid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <QrCode size={16} /> 2. Share ID
              {checkedIn && <CheckCircle2 size={14} color="var(--g)" />}
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 16px' }}>
        {navStage === 2 ? (
          <>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'var(--fh)', fontSize: 32, fontWeight: 800, color: 'var(--g)', marginBottom: 8 }}>
                My Digital Identity
              </h1>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', fontWeight: 500 }}>
                {profile?.card_made ? "Update your networking profile below." : "Create your digital card for the conference."}
              </p>
            </div>

            {/* The Card */}
            <div style={{ position: 'relative', marginBottom: 32 }}>
              <CardPreview user={{ name, avatar, role, company, bio, linkedin }} />
            </div>

            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Avatar Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--s1)', padding: 16, borderRadius: 20 }}>
                  <label htmlFor="avatar-upload" style={{ position: 'relative', width: 64, height: 64, cursor: 'pointer', display: 'block', borderRadius: 16, overflow: 'hidden' }}>
                    <img src={avatar || '/assets/ethos-logo-insignia.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.2s', ':hover': { opacity: 1 }
                    }}>
                      <ImageIcon size={20} color="#fff" />
                    </div>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Profile Picture</p>
                    <p style={{ fontSize: 11, color: 'var(--sub)' }}>Tap image to change. Best as 1:1 ratio square.</p>
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
                  {profile?.card_made ? "Save Changes" : "Create My Card"}
                </button>
              </div>
          </>
        ) : (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
             <div style={{ marginBottom: 8 }}>
              <h1 style={{ fontFamily: 'var(--fh)', fontSize: 32, fontWeight: 800, color: 'var(--g)', marginBottom: 8 }}>
                {isCheckedIn(profile?.checked_in) ? "Share Your ID" : "Check-in Process"}
              </h1>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', fontWeight: 500 }}>
                {isCheckedIn(profile?.checked_in) 
                  ? "Here's your card to share with others." 
                  : "Present the QR code below to a staff member at the registration desk."}
              </p>
            </div>

            {/* Check-in QR Section */}
            <div style={{ 
              background: 'var(--white)', border: '1px solid var(--border)', 
              borderRadius: 24, padding: 32, textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
               <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--g)' }}>
                {isCheckedIn(profile?.checked_in) ? <QrCode size={32} /> : <QrCode size={32} />}
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--fh)', fontSize: 18, fontWeight: 800, color: 'var(--g)', marginBottom: 4 }}>
                   {isCheckedIn(profile?.checked_in) ? "Your Networking QR" : "Your Conference Code"}
                </h3>
                <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', fontWeight: 500 }}>
                  {isCheckedIn(profile?.checked_in) 
                    ? "Other attendees can scan this to add you to their wallet." 
                    : "Tap the code below to enlarge for easier scanning."}
                </p>
              </div>
              
              <div 
                onClick={() => setQrExpanded(true)}
                style={{ 
                  background: '#fff', padding: 20, borderRadius: 24, 
                  border: '1px solid var(--border)', cursor: 'pointer',
                  transition: 'all 0.3s var(--liquid)',
                  transform: 'scale(1)',
                  opacity: 1
                }}
              >
                <QRCode value={profile.id} size={160} level="H" />
              </div>
              
              {!isCheckedIn(profile?.checked_in) && (
                <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tap to enlarge
                </p>
              )}
            </div>
          </div>
        )}
      </div>

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