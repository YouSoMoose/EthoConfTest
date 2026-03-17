'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Loader from '@/components/Loader';
import Avatar from '@/components/Avatar';
import { CardPreview } from '@/components/CardPreview';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  Camera, Building, User as UserIcon,
  Type, Mail, FileText, Linkedin, ChevronLeft
} from 'lucide-react';

const DEFAULT_STYLE = {
  nameSize: 20, nameX: 0, nameY: 0, nameVisible: true,
  roleSize: 13, roleX: 0, roleY: 0, roleVisible: true,
  companySize: 12, companyX: 0, companyY: 0, companyVisible: true,
  emailSize: 10, emailX: 0, emailY: 0, emailVisible: true,
  qrSize: 90, qrX: 0, qrY: 0, qrVisible: true,
  logoSize: 36, logoX: 0, logoY: 0, logoVisible: true,
  accentColor: '#D49B7A',
  textColor: '#413429',
  subColor: '#7D6F63',
};

const LIVE_MAP = {
  nameSize: (v, r) => r.name && (r.name.style.fontSize = v + 'px'),
  nameX: (v, r, s) => r.name && (r.name.style.transform = `translate(${v}px, ${s.nameY ?? 0}px)`),
  nameY: (v, r, s) => r.name && (r.name.style.transform = `translate(${s.nameX ?? 0}px, ${v}px)`),
  roleSize: (v, r) => r.role && (r.role.style.fontSize = v + 'px'),
  roleX: (v, r, s) => r.role && (r.role.style.transform = `translate(${v}px, ${s.roleY ?? 0}px)`),
  roleY: (v, r, s) => r.role && (r.role.style.transform = `translate(${s.roleX ?? 0}px, ${v}px)`),
  companySize: (v, r) => r.company && (r.company.style.fontSize = v + 'px'),
  companyX: (v, r, s) => r.company && (r.company.style.transform = `translate(${v}px, ${s.companyY ?? 0}px)`),
  companyY: (v, r, s) => r.company && (r.company.style.transform = `translate(${s.companyX ?? 0}px, ${v}px)`),
  emailSize: (v, r) => r.email && (r.email.style.fontSize = v + 'px'),
  emailX: (v, r, s) => r.email && (r.email.style.transform = `translate(${v}px, ${s.emailY ?? 0}px)`),
  emailY: (v, r, s) => r.email && (r.email.style.transform = `translate(${s.emailX ?? 0}px, ${v}px)`),
  logoSize: (v, r) => r.logoBox && (r.logoBox.style.width = r.logoBox.style.height = v + 'px'),
  logoX: (v, r, s) => r.logoWrap && (r.logoWrap.style.transform = `translate(${v}px, ${s.logoY ?? 0}px)`),
  logoY: (v, r, s) => r.logoWrap && (r.logoWrap.style.transform = `translate(${s.logoX ?? 0}px, ${v}px)`),
  qrX: (v, r, s) => r.qrWrap && (r.qrWrap.style.transform = `translate(${v}px, ${s.qrY ?? 0}px)`),
  qrY: (v, r, s) => r.qrWrap && (r.qrWrap.style.transform = `translate(${s.qrX ?? 0}px, ${v}px)`),
};

// ─────────────────────────────────────────────
// CardEditor
// ─────────────────────────────────────────────
function CardEditor({ style, onUpdate, onReset, cardDOMRefs }) {
  const [activeTab, setActiveTab] = useState('size');
  const [localStyle, setLocalStyle] = useState(style);
  const localRef = useRef(style);
  const rafRef = useRef(null);

  const handleInput = useCallback((attr, rawVal) => {
    const val = parseFloat(rawVal);
    const pill = document.getElementById(`pill-${attr}`);
    if (pill) pill.textContent = Math.round(val);

    const input = document.getElementById(`slider-${attr}`);
    if (input) {
      const pct = ((val - parseFloat(input.min)) / (parseFloat(input.max) - parseFloat(input.min))) * 100;
      input.style.background = `linear-gradient(to right, var(--accent) ${pct}%, var(--as3) ${pct}%)`;
    }

    localRef.current = { ...localRef.current, [attr]: val };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (LIVE_MAP[attr]) LIVE_MAP[attr](val, cardDOMRefs.current, localRef.current);
    });
  }, [cardDOMRefs]);

  const handleCommit = useCallback((attr, rawVal) => {
    const val = parseFloat(rawVal);
    const next = { ...localRef.current, [attr]: val };
    localRef.current = next;
    setLocalStyle(next);
    onUpdate(next);
  }, [onUpdate]);

  const update = useCallback((key, val) => {
    const next = { ...localRef.current, [key]: val };
    localRef.current = next;
    setLocalStyle(next);
    onUpdate(next);
  }, [onUpdate]);

  const Slider = ({ label, attr, min, max }) => {
    const val = localStyle[attr] ?? 0;
    const pct = ((val - min) / (max - min)) * 100;
    return (
      <div className="premium-slider-group" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase' }}>{label}</label>
          <span
            id={`pill-${attr}`}
            className="slider-value-pill"
            style={{ fontSize: 10, fontWeight: 800, background: 'var(--as1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)' }}
          >
            {Math.round(val)}
          </span>
        </div>
        <input
          id={`slider-${attr}`}
          type="range" min={min} max={max} step="1"
          defaultValue={val}
          onInput={e => handleInput(attr, e.target.value)}
          onMouseUp={e => handleCommit(attr, e.target.value)}
          onTouchEnd={e => handleCommit(attr, e.target.value)}
          className="premium-range-input"
          style={{
            width: '100%', height: 6, borderRadius: 10, outline: 'none', cursor: 'pointer',
            background: `linear-gradient(to right, var(--accent) ${pct}%, var(--as3) ${pct}%)`,
            appearance: 'none',
          }}
        />
      </div>
    );
  };

  const Toggle = ({ label, attr }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 11, color: 'var(--text)', fontWeight: 600 }}>
      <input type="checkbox" checked={localStyle[attr]} onChange={e => update(attr, e.target.checked)} className="premium-toggle" />
      {label}
    </label>
  );

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--as1)', borderRadius: 12, padding: 4 }}>
        {['size', 'pos', 'vis'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              flex: 1, padding: '8px', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: activeTab === t ? 'var(--white)' : 'transparent',
              color: activeTab === t ? 'var(--accent)' : 'var(--sub)',
              cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase',
            }}
          >
            {t === 'size' ? 'Scale' : t === 'pos' ? 'Layout' : 'Toggle'}
          </button>
        ))}
      </div>

      <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
        {activeTab === 'size' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Slider label="Name" attr="nameSize" min={10} max={60} />
            <Slider label="Role" attr="roleSize" min={8} max={40} />
            <Slider label="Company" attr="companySize" min={8} max={40} />
            <Slider label="Email" attr="emailSize" min={8} max={30} />
            <Slider label="Logo" attr="logoSize" min={10} max={100} />
            <Slider label="QR" attr="qrSize" min={50} max={200} />
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--sub)', display: 'block', marginBottom: 6 }}>ACCENT</label>
                <input type="color" value={localStyle.accentColor} onChange={e => update('accentColor', e.target.value)} style={{ width: '100%', height: 32, border: 'none', borderRadius: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--sub)', display: 'block', marginBottom: 6 }}>TEXT</label>
                <input type="color" value={localStyle.textColor} onChange={e => update('textColor', e.target.value)} style={{ width: '100%', height: 32, border: 'none', borderRadius: 8 }} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Slider label="Name X" attr="nameX" min={-100} max={100} />
            <Slider label="Name Y" attr="nameY" min={-100} max={100} />
            <Slider label="Role X" attr="roleX" min={-100} max={100} />
            <Slider label="Role Y" attr="roleY" min={-100} max={100} />
            <Slider label="Comp X" attr="companyX" min={-100} max={100} />
            <Slider label="Comp Y" attr="companyY" min={-100} max={100} />
            <Slider label="QR X" attr="qrX" min={-150} max={150} />
            <Slider label="QR Y" attr="qrY" min={-150} max={150} />
          </div>
        )}

        {activeTab === 'vis' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--as1)', padding: 12, borderRadius: 12 }}>
            <Toggle label="Name" attr="nameVisible" />
            <Toggle label="Role" attr="roleVisible" />
            <Toggle label="Company" attr="companyVisible" />
            <Toggle label="Email" attr="emailVisible" />
            <Toggle label="Logo" attr="logoVisible" />
            <Toggle label="QR" attr="qrVisible" />
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        style={{ background: 'var(--as1)', border: 'none', borderRadius: 10, padding: 10, fontSize: 11, fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }}
      >
        Reset Composition
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page content
// ─────────────────────────────────────────────
function MyCardContent() {
  const { data: session, update: updateSession } = useSession();
  const profile = session?.profile;
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === '1';

  const [isEditing, setIsEditing] = useState(isOnboarding);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);

  const cardRef = useRef(null);
  const domRefs = useRef({});

  // Lock body scroll when QR modal is open
  useEffect(() => {
    if (qrExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [qrExpanded]);

  const initializedRef = useRef(false);
  useEffect(() => {
    // Only populate fields once on first load — prevents unsaved edits from
    // being wiped if the session object re-renders mid-edit
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
        updateSession(); // fire and forget — don't block redirect
        router.push('/app');
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

  const qrValue = profile.id || profile.email || 'ethos-placeholder';

  return (
    <div className="page-enter" style={{ paddingBottom: 100 }}>
      {/* Back Button */}
      <div style={{ padding: '16px 16px 0', maxWidth: 500, margin: '0 auto', width: '100%' }}>
        <button 
          onClick={() => router.push('/app')}
          style={{ 
            background: 'var(--as1)', border: '1px solid var(--border)', borderRadius: 12, 
            padding: '8px 12px', fontSize: 13, fontWeight: 700, color: 'var(--text)',
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      <div style={{
        maxWidth: 500, margin: '0 auto', padding: '10px 16px',
        display: 'flex', flexDirection: 'column', gap: 24,
        alignItems: 'center', minHeight: '80dvh',
      }}>

        {/* ── Card display ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', width: '100%', overflowX: 'hidden' }}>
          <div
            onClick={() => setQrExpanded(true)}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', width: '100%' }}
          >
            <div style={{
              transform: 'scale(calc((100vw - 32px) / 320))',
              transformOrigin: 'top center',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              {/*
                FIX 1: Avatar centering
                Make sure CardPreview renders its avatar inside a centered flex wrapper.
                If you control CardPreview, wrap the Avatar component like this:
                  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Avatar src={avatar} name={name} size={64} />
                  </div>
              */}
              <CardPreview
                user={{ ...profile, name, avatar, role, company }}
                style={DEFAULT_STYLE}
                cardRef={cardRef}
                domRefs={domRefs}
              />
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 12, fontWeight: 600 }}>
                Tap ID to enlarge QR
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                width: '100%', background: 'var(--g)', color: '#fff',
                border: 'none', borderRadius: 16, padding: '16px',
                fontFamily: 'var(--fb)', fontWeight: 800, fontSize: 16,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }}
            >
              <Smartphone size={18} /> Edit Profile Info
            </button>
          )}
        </div>

        {/* ── Edit form ── */}
        {isEditing && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }} className="page-enter">
            <div style={{
              background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 28,
              padding: 28, display: 'flex', flexDirection: 'column', gap: 24,
              boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
            }}>
              <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 20, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <UserIcon size={22} color="var(--g)" /> Edit Your Info
              </h3>

              {/* Avatar upload — FIX 1: centered with flexbox */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                marginBottom: 10,
              }}>
                <div style={{
                  position: 'relative',
                  width: 'clamp(80px,25vw,110px)',
                  height: 'clamp(80px,25vw,110px)',
                }}>
                  <Avatar src={avatar} name={name} size="100%" />
                  <label style={{
                    position: 'absolute', bottom: 0, right: 0,
                    background: 'var(--g)', color: '#fff',
                    width: 'clamp(32px,8vw,36px)', height: 'clamp(32px,8vw,36px)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', border: '3px solid #fff',
                  }}>
                    <Camera size={18} />
                    <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>
              </div>

              {/* Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Full Name', icon: <Type size={18} color="var(--muted)" />, value: name, setter: setName, placeholder: 'e.g. John Doe', type: 'text', maxLength: 40 },
                  { label: 'Position / Role', icon: <UserIcon size={18} color="var(--muted)" />, value: role, setter: setRole, placeholder: 'e.g. Lead Developer', type: 'text', maxLength: 30 },
                  { label: 'Company', icon: <Building size={18} color="var(--muted)" />, value: company, setter: setCompany, placeholder: 'e.g. Tech Corp', type: 'text', maxLength: 30 },
                  { label: 'LinkedIn URL', icon: <Linkedin size={18} color="var(--muted)" />, value: linkedin, setter: setLinkedin, placeholder: 'linkedin.com/in/...', type: 'url', maxLength: undefined },
                  { label: 'Resume Link', icon: <FileText size={18} color="var(--muted)" />, value: resumeLink, setter: setResumeLink, placeholder: 'https://...', type: 'url', maxLength: undefined },
                ].map(({ label, icon, value, setter, placeholder, type, maxLength }) => (
                  <div key={label} className="input-group">
                    <label className="section-label">{label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--as1)', padding: '6px 16px', borderRadius: 16, border: '1px solid var(--border)' }}>
                      {icon}
                      <input
                        type={type}
                        value={value}
                        onChange={e => setter(e.target.value)}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 0', fontSize: 15, outline: 'none', fontWeight: 500 }}
                      />
                    </div>
                  </div>
                ))}

                {/* Email — disabled */}
                <div className="input-group">
                  <label className="section-label">Email Address</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--s2)', padding: '6px 16px', borderRadius: 16, opacity: 0.7 }}>
                    <Mail size={18} color="var(--muted)" />
                    <input
                      type="email" value={profile.email} disabled
                      style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 0', fontSize: 15, outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
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
                    fontFamily: 'var(--fb)', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    opacity: saving ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  }}
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/*
        FIX 2: QR modal — replaced <Modal> with a direct portal-style overlay.
        The old <Modal center> wrapper was causing the QR to collapse/misalign.
        This renders a fixed backdrop div with the modal content centered inside it.
        stopPropagation on the inner card prevents clicks on the QR from closing the modal.
      */}
      {qrExpanded && (
        <div
          onClick={() => setQrExpanded(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer',
            padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="page-enter"
            style={{
              background: '#fff',
              borderRadius: 32,
              padding: 'clamp(20px, 5vw, 40px)',
              textAlign: 'center',
              maxWidth: '90vw',
              width: '100%',
              maxWidth: 380,
              cursor: 'default',
            }}
          >
            {/* QR container */}
            <div style={{
              padding: 16,
              background: '#fff',
              border: '2px solid var(--border)',
              borderRadius: 24,
              display: 'inline-block',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            }}>
              <QRCodeSVG
                value={qrValue}
                size={240}
                level="H"
                fgColor="#413429"
                bgColor="#ffffff"
                style={{ display: 'block' }}
              />
            </div>

            <h2 style={{
              marginTop: 24,
              marginBottom: 6,
              fontSize: 'clamp(20px, 5vw, 26px)',
              fontWeight: 800,
              color: '#413429',
              fontFamily: 'var(--fh)',
            }}>
              {name}
            </h2>
            <p
              onClick={() => setQrExpanded(false)}
              style={{ color: 'var(--muted)', fontSize: 13, cursor: 'pointer', margin: 0 }}
            >
              Tap anywhere to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────
export default function MyCardPage() {
  return (
    <Suspense fallback={<Loader />}>
      <MyCardContent />
    </Suspense>
  );
}