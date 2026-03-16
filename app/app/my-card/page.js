'use client';

import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';
import Topbar from '@/components/Topbar';
import Avatar from '@/components/Avatar';
import Btn from '@/components/Btn';
import Modal from '@/components/Modal';
import { Suspense } from 'react';

function MyCardContent() {
  const { data: session, update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOnboarding = searchParams.get('onboarding') === '1';
  
  const profile = session?.profile;
  const [resumeLink, setResumeLink] = useState(profile?.resume_link || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [name, setName] = useState(profile?.name || '');
  const [avatar, setAvatar] = useState(profile?.avatar || '');
  const [company, setCompany] = useState(profile?.company || '');
  const [linkedin, setLinkedin] = useState(profile?.linkedin || '');
  const [saving, setSaving] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);
  const cardRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (profile && !initialized.current) {
      setName(prev => prev || profile.name || '');
      setAvatar(prev => prev || profile.avatar || '');
      setCompany(prev => prev || profile.company || '');
      setBio(prev => prev || profile.bio || '');
      setPhone(prev => prev || profile.phone || '');
      setLinkedin(prev => prev || profile.linkedin || '');
      setResumeLink(prev => prev || profile.resume_link || '');
      initialized.current = true;
    }
  }, [profile]);

  const saveProfile = async () => {
    if (!name || !company) return toast.error('Name and Company are required');
    setSaving(true);
    const t = toast.loading('Saving profile...');
    try {
      const res = await fetch('/api/profile', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ resume_link: resumeLink, phone, bio, name, avatar, company, linkedin }) 
      });
      
      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        console.error('Json parse error:', e);
      }
      
      if (res.ok) {
        await updateSession();
        toast.success('Profile saved successfully', { id: t });
        if (isOnboarding) {
          const level = data.access_level ?? profile?.access_level ?? 0;
          router.push(level >= 2 ? '/admin' : '/app');
        }
      } else {
        toast.error(`Failed to save: ${data.error || res.statusText || 'Server Error'}`, { id: t });
        console.error('Save error details:', data, res.status);
      }
    } catch (err) { 
      toast.error('Network error - check your connection', { id: t }); 
      console.error('Network error:', err);
    }
    setSaving(false);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const t = toast.loading('Generating image...');
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, backgroundColor: '#fff' });
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Swapping width/height for 90-degree rotation
        canvas.width = img.height;
        canvas.height = img.width;
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(90 * Math.PI / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        const rotatedDataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Ethos-ID-${name.replace(/\s+/g, '-')}.png`;
        link.href = rotatedDataUrl;
        link.click();
        toast.success('Downloaded!', { id: t });
      };
    } catch (e) {
      console.error(e);
      toast.error('Failed to download', { id: t });
    }
  };

  return (
    <div className="page-enter" style={{ paddingBottom: isOnboarding ? 40 : 100 }}>
      {!isOnboarding && <Topbar title="🎫 My Card" />}
      
      {isOnboarding && (
        <div style={{ padding: '60px 24px 20px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--fh)', fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>Welcome to Ethos! 🌿</h1>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 16, color: 'var(--sub)', marginTop: 8 }}>
            Let's get your digital ID card ready for the conference.
          </p>
        </div>
      )}

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
        {/* Badge */}
        <div ref={cardRef} style={{
          background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
          padding: '40px 24px', textAlign: 'center', marginBottom: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          animation: 'scaleIn 0.3s ease both',
        }}>
          <Avatar src={avatar || profile?.avatar} name={name || profile?.name} size={90} />
          <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 26, color: 'var(--text)', marginTop: 16, lineHeight: 1.2 }}>
            {name || profile?.name || 'Your Name'}
          </h2>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 16, color: 'var(--g)', fontWeight: 600, marginTop: 4 }}>
            {company || profile?.company || 'Your Company'}
          </p>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            {profile?.email}
          </p>

          {profile?.id ? (
            <div 
              onClick={() => !isOnboarding && setQrExpanded(true)}
              style={{
                display: 'inline-block', padding: 20, background: 'var(--white)',
                borderRadius: 20, border: '1px solid var(--s2)', marginTop: 24,
                cursor: isOnboarding ? 'default' : 'zoom-in'
              }}
            >
              <QRCodeSVG value={profile.id} size={180} level="M" fgColor="#000000" bgColor="#ffffff" />
            </div>
          ) : (
            <div style={{ display: 'inline-block', padding: 16, marginTop: 20 }}>Generating QR...</div>
          )}
          <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--muted)', marginTop: 16, opacity: 0.8 }}>
            ETHOS 2026 OFFICIAL ATTENDEE
          </p>
        </div>

        {!isOnboarding && (
          <button 
            onClick={handleDownload}
            style={{
              width: '100%', padding: '12px', background: 'var(--s1)', border: '1px solid var(--border)',
              borderRadius: 14, marginBottom: 24, fontFamily: 'var(--fb)', fontSize: 14,
              fontWeight: 600, color: 'var(--text)', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            📥 Download ID Card
          </button>
        )}
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '0 16px 20px' }}>
        {/* Edit Form */}
        <div style={{
          background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
          padding: 20, animation: 'fadeUp 0.22s ease 0.1s both',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>
              👤 Name
            </h3>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your Name"
              style={{
                width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)',
                borderRadius: 10, padding: '11px 14px', fontSize: 14,
                fontFamily: 'var(--fb)', color: 'var(--text)', outline: 'none',
              }}
            />
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>
              🖼️ Profile Picture URL
            </h3>
            <input
              type="url"
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              style={{
                width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)',
                borderRadius: 10, padding: '11px 14px', fontSize: 14,
                fontFamily: 'var(--fb)', color: 'var(--text)', outline: 'none',
              }}
            />
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>
              📞 Phone Number
            </h3>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              style={{
                width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)',
                borderRadius: 10, padding: '11px 14px', fontSize: 14,
                fontFamily: 'var(--fb)', color: 'var(--text)', outline: 'none',
              }}
            />
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>
              💼 Job Title (Bio)
            </h3>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell others a bit about yourself..."
              rows={3}
              style={{
                width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)',
                borderRadius: 10, padding: '11px 14px', fontSize: 14,
                fontFamily: 'var(--fb)', color: 'var(--text)', outline: 'none', resize: 'none'
              }}
            />
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>
              🏢 Company
            </h3>
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Where do you work?"
              style={{
                width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)',
                borderRadius: 10, padding: '11px 14px', fontSize: 14,
                fontFamily: 'var(--fb)', color: 'var(--text)', outline: 'none',
              }}
            />
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>
              🔗 LinkedIn URL
            </h3>
            <input
              type="url"
              value={linkedin}
              onChange={e => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              style={{
                width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)',
                borderRadius: 10, padding: '11px 14px', fontSize: 14,
                fontFamily: 'var(--fb)', color: 'var(--text)', outline: 'none',
              }}
            />
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>
              📄 Resume Link
            </h3>
            <input
              type="url"
              value={resumeLink}
              onChange={e => setResumeLink(e.target.value)}
              placeholder="https://your-resume-link.com"
              style={{
                width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)',
                borderRadius: 10, padding: '11px 14px', fontSize: 14,
                fontFamily: 'var(--fb)', color: 'var(--text)', outline: 'none',
              }}
            />
          </div>

          <Btn onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</Btn>
        </div>
      </div>

      <Modal center open={qrExpanded} onClose={() => setQrExpanded(false)}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20, background: '#fff', borderRadius: 24 }}>
          {profile?.id && <QRCodeSVG value={profile.id} size={300} level="M" fgColor="#000000" bgColor="#ffffff" />}
        </div>
      </Modal>
    </div>
  );
}

export default function MyCardPage() {
  return (
    <Suspense fallback={null}>
      <MyCardContent />
    </Suspense>
  );
}
