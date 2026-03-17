'use client';

import { useEffect, useState, useRef, useCallback, memo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Loader from '@/components/Loader';
import Topbar from '@/components/Topbar';
import Avatar from '@/components/Avatar';
import Btn from '@/components/Btn';
import Modal from '@/components/Modal';
import { CardPreview, DEFAULT_STYLE } from '@/components/CardPreview';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';
import { Save, Download, Search, RefreshCcw, Camera, MoreVertical, Check, Smartphone, Building, User as UserIcon, Type, Mail, FileText } from 'lucide-react';


function MyCardContent() {
  const { data: session, update: updateSession } = useSession();
  const profile = session?.user;
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === '1';

  const [isEditing, setIsEditing] = useState(isOnboarding);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);
  
  const cardRef = useRef(null);
  const domRefs = useRef({});

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAvatar(profile.avatar || '');
      setPhone(profile.phone || '');
      setRole(profile.role || '');
      setBio(profile.bio || '');
      setCompany(profile.company || '');
      setLinkedin(profile.linkedin || '');
      setResumeLink(profile.resume_link || '');
    }
  }, [profile]);

  const handlePhone = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 10) val = val.slice(0, 10);
    let formatted = val;
    if (val.length > 6) formatted = `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6)}`;
    else if (val.length > 3) formatted = `(${val.slice(0,3)}) ${val.slice(3)}`;
    else if (val.length > 0) formatted = `(${val}`;
    setPhone(formatted);
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
        body: JSON.stringify({ resume_link: resumeLink, phone, bio, role, name, avatar, company, linkedin }) 
      });
      if (res.ok) {
        await updateSession();
        toast.success('Profile saved', { id: t });
        setIsEditing(false);
        if (isOnboarding) router.push('/app');
      } else toast.error('Failed to save', { id: t });
    } catch (err) { toast.error('Network error', { id: t }); }
    setSaving(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error('File too large (max 2MB)');
      const reader = new FileReader();
      reader.onload = (e) => setAvatar(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  if (!profile) return <Loader />;

  return (
    <div className="page-enter">
      {/* Page Header */}
      <div style={{
        background: 'var(--hero)',
        padding: 'max(16px, env(safe-area-inset-top)) 16px 28px',
        boxShadow: '0 4px 20px rgba(65, 52, 41, 0.15)',
      }}>
        <div style={{ maxWidth: 500, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/app" style={{
            width: 40, height: 40, borderRadius: 12, background: 'rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: 'var(--g)', fontSize: 20, flexShrink: 0,
            border: '1px solid rgba(0,0,0,0.08)',
          }}>←</Link>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 22, margin: 0, color: 'var(--g)' }}>
              My Virtual ID
            </h1>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--sub)', marginTop: 2, fontWeight: 500 }}>
              Your conference identity card
            </p>
          </div>
          <img src="/assets/ethos-logo-insignia.png" alt="" style={{ width: 36, height: 36, objectFit: 'contain', filter: 'brightness(0)', opacity: 0.3 }} />
        </div>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 16px 120px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        
        {/* Card Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', width: '100%' }}>
          <div onClick={() => setQrExpanded(true)} style={{ cursor: 'pointer', transition: 'transform 0.3s var(--liquid)', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div style={{ transform: 'scale(min(1, calc((100vw - 64px) / 300)))', transformOrigin: 'top center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <CardPreview user={{ ...profile, name, avatar, role, company }} style={DEFAULT_STYLE} cardRef={cardRef} domRefs={domRefs} />
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Tap card to enlarge QR</p>
          
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                style={{
                  flex: 1, background: 'var(--g)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px',
                  fontFamily: 'var(--fb)', fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }}
              >
                <Smartphone size={18} /> Edit Profile Info
              </button>
            ) : null}
          </div>
        </div>

        {/* Form / Editor Side */}
        {isEditing && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }} className="page-enter">
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 28, padding: 28, display: 'flex', flexDirection: 'column', gap: 24, boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
               <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 20, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                 <UserIcon size={22} color="var(--g)" /> Edit Your Info
               </h3>
               
               <div style={{ position: 'relative', alignSelf: 'center', marginBottom: 10, width: 'clamp(80px, 25vw, 110px)', height: 'clamp(80px, 25vw, 110px)' }}>
                 <Avatar src={avatar} name={name} size="100%" />
                 <label style={{
                   position: 'absolute', bottom: 0, right: 0,
                   background: 'var(--g)', color: '#fff', width: 'clamp(32px, 8vw, 36px)', height: 'clamp(32px, 8vw, 36px)',
                   borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                   cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', border: '3px solid #fff'
                 }}>
                   <Camera size={18} />
                   <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                 </label>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 <div className="input-group">
                   <label className="section-label">Full Name</label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--s2)', padding: '6px 16px', borderRadius: 16 }}>
                     <Type size={18} color="var(--muted)" />
                     <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" maxLength={40} style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 0', fontSize: 15, outline: 'none', fontWeight: 500 }} />
                   </div>
                 </div>

                 <div className="input-group">
                   <label className="section-label">Position / Role</label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--s2)', padding: '6px 16px', borderRadius: 16 }}>
                     <UserIcon size={18} color="var(--muted)" />
                     <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Lead Developer" maxLength={30} style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 0', fontSize: 15, outline: 'none', fontWeight: 500 }} />
                   </div>
                 </div>

                 <div className="input-group">
                   <label className="section-label">Company</label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--s2)', padding: '6px 16px', borderRadius: 16 }}>
                     <Building size={18} color="var(--muted)" />
                     <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Tech Corp" maxLength={30} style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 0', fontSize: 15, outline: 'none', fontWeight: 500 }} />
                   </div>
                 </div>

                 <div className="input-group">
                   <label className="section-label">Short Bio</label>
                   <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'var(--s2)', padding: '12px 16px', borderRadius: 16 }}>
                     <Type size={18} color="var(--muted)" style={{ marginTop: 2 }} />
                     <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." maxLength={150} style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 15, outline: 'none', fontWeight: 500, resize: 'none', minHeight: '60px' }} />
                   </div>
                 </div>

                 <div className="input-group">
                   <label className="section-label">Email Address</label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--s2)', padding: '6px 16px', borderRadius: 16, opacity: 0.7 }}>
                     <Mail size={18} color="var(--muted)" />
                     <input type="email" value={profile.email} disabled style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 0', fontSize: 15, outline: 'none' }} />
                   </div>
                 </div>

                 <div className="input-group">
                   <label className="section-label">Resume Link</label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--s2)', padding: '6px 16px', borderRadius: 16 }}>
                     <FileText size={18} color="var(--muted)" />
                     <input type="url" value={resumeLink} onChange={e => setResumeLink(e.target.value)} placeholder="https://..." style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 0', fontSize: 15, outline: 'none', fontWeight: 500 }} />
                   </div>
                 </div>

                 <div className="input-group">
                   <label className="section-label">Phone</label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--s2)', padding: '6px 16px', borderRadius: 16 }}>
                     <Smartphone size={18} color="var(--muted)" />
                     <input type="tel" value={phone} onChange={handlePhone} placeholder="(555) 000-0000" style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 0', fontSize: 15, outline: 'none', fontWeight: 500 }} />
                   </div>
                 </div>
               </div>

               <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                 <button 
                  onClick={() => setIsEditing(false)}
                  style={{ flex: 1, background: 'var(--s1)', color: 'var(--text)', border: 'none', borderRadius: 16, padding: '16px', fontFamily: 'var(--fb)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                 >
                   Cancel
                 </button>
                 <button 
                  onClick={saveProfile} 
                  disabled={saving}
                  style={{
                    flex: 2, background: 'var(--g)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px',
                    fontFamily: 'var(--fb)', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    opacity: saving ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Enlarged Modal */}
      <Suspense fallback={null}>
        <Modal center open={qrExpanded} onClose={() => setQrExpanded(false)}>
          <div onClick={() => setQrExpanded(false)} style={{ padding: 'clamp(20px, 5vw, 40px)', background: '#fff', borderRadius: 32, textAlign: 'center', outline: 'none', maxWidth: '90vw', cursor: 'pointer' }} className="page-enter">
            <div style={{ padding: 16, background: '#fff', border: '2px solid var(--border)', borderRadius: 24, display: 'inline-block', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', maxWidth: '100%' }}>
              <div style={{ width: 'clamp(200px, 60vw, 320px)', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QRCodeSVG 
                  value={profile.id} 
                  size={500} 
                  level="H" 
                  fgColor="#413429" 
                  bgColor="#ffffff" 
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            </div>
            <h2 style={{ marginTop: 20, fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 800, color: 'var(--text)' }}>{name}</h2>
            <p style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{role || 'Attendee'}</p>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 12 }}>Tap anywhere to close</p>
          </div>
        </Modal>
      </Suspense>
    </div>
  );
}

export default function MyCardPage() {
  return (
    <Suspense fallback={<Loader />}>
      <MyCardContent />
    </Suspense>
  );
}
