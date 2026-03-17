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
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';
import { Save, Download, Search, RefreshCcw, Camera, MoreVertical, Check, Smartphone, Building, User as UserIcon, Type } from 'lucide-react';

const DEFAULT_STYLE = {
  nameSize: 22, nameX: 0, nameY: 0, nameVisible: true,
  roleSize: 14, roleX: 0, roleY: 0, roleVisible: true,
  companySize: 13, companyX: 0, companyY: 0, companyVisible: true,
  emailSize: 11, emailX: 0, emailY: 0, emailVisible: true,
  qrSize: 130, qrX: 0, qrY: 0, qrVisible: true,
  logoSize: 44, logoX: 0, logoY: 0, logoVisible: true,
  accentColor: '#D49B7A',
  textColor: '#413429',
  subColor: '#7D6F63',
};

const LIVE_MAP = {
  nameSize:    (v, r, s) => r.name    && (r.name.style.fontSize    = v + 'px'),
  nameX:       (v, r, s) => r.name    && (r.name.style.transform   = `translate(${v}px, ${s.nameY ?? 0}px)`),
  nameY:       (v, r, s) => r.name    && (r.name.style.transform   = `translate(${s.nameX ?? 0}px, ${v}px)`),
  roleSize:    (v, r, s) => r.role    && (r.role.style.fontSize    = v + 'px'),
  roleX:       (v, r, s) => r.role    && (r.role.style.transform   = `translate(${v}px, ${s.roleY ?? 0}px)`),
  roleY:       (v, r, s) => r.role    && (r.role.style.transform   = `translate(${s.roleX ?? 0}px, ${v}px)`),
  companySize: (v, r, s) => r.company && (r.company.style.fontSize = v + 'px'),
  companyX:    (v, r, s) => r.company && (r.company.style.transform = `translate(${v}px, ${s.companyY ?? 0}px)`),
  companyY:    (v, r, s) => r.company && (r.company.style.transform = `translate(${s.companyX ?? 0}px, ${v}px)`),
  emailSize:   (v, r, s) => r.email   && (r.email.style.fontSize   = v + 'px'),
  emailX:      (v, r, s) => r.email   && (r.email.style.transform  = `translate(${v}px, ${s.emailY ?? 0}px)`),
  emailY:      (v, r, s) => r.email   && (r.email.style.transform  = `translate(${s.emailX ?? 0}px, ${v}px)`),
  logoSize:    (v, r, s) => r.logoBox  && (r.logoBox.style.width = r.logoBox.style.height = v + 'px'),
  logoX:       (v, r, s) => r.logoWrap && (r.logoWrap.style.transform = `translate(${v}px, ${s.logoY ?? 0}px)`),
  logoY:       (v, r, s) => r.logoWrap && (r.logoWrap.style.transform = `translate(${s.logoX ?? 0}px, ${v}px)`),
  qrX:         (v, r, s) => r.qrWrap  && (r.qrWrap.style.transform  = `translate(${v}px, ${s.qrY ?? 0}px)`),
  qrY:         (v, r, s) => r.qrWrap  && (r.qrWrap.style.transform  = `translate(${s.qrX ?? 0}px, ${v}px)`),
};

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
          <span id={`pill-${attr}`} className="slider-value-pill" style={{ fontSize: 10, fontWeight: 800, background: 'var(--as1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)' }}>{Math.round(val)}</span>
        </div>
        <input
          id={`slider-${attr}`}
          type="range" min={min} max={max} step="1"
          defaultValue={val}
          onInput={e => handleInput(attr, e.target.value)}
          onMouseUp={e => handleCommit(attr, e.target.value)}
          onTouchEnd={e => handleCommit(attr, e.target.value)}
          className="premium-range-input"
          style={{ width: '100%', height: 6, borderRadius: 10, outline: 'none', cursor: 'pointer', background: `linear-gradient(to right, var(--accent) ${pct}%, var(--as3) ${pct}%)`, appearance: 'none' }}
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
      <div style={{ display: 'flex', background: 'var(--as1)', borderRadius: 12, padding: 4 }}>
        {['size', 'pos', 'vis'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            flex: 1, padding: '8px', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700,
            background: activeTab === t ? 'var(--white)' : 'transparent',
            color: activeTab === t ? 'var(--accent)' : 'var(--sub)',
            cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase'
          }}>
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

      <button onClick={onReset} style={{ background: 'var(--as1)', border: 'none', borderRadius: 10, padding: 10, fontSize: 11, fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }}>Reset Composition</button>
    </div>
  );
}

const CardPreview = memo(function CardPreview({ user, style, cardRef, domRefs }) {
  return (
    <div ref={cardRef} style={{
      background: '#ffffff', borderRadius: 24, border: '1px solid var(--border)',
      width: 340, height: 500, padding: 32, textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
      position: 'relative', overflow: 'hidden', flexShrink: 0,
      animation: 'scaleIn 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67) both',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 220, height: 220,
        background: `linear-gradient(135deg, ${style.accentColor}25 0%, transparent 100%)`,
        borderRadius: '0 0 0 100%', pointerEvents: 'none'
      }} />

      <div style={{ zIndex: 1, position: 'relative' }}>
        {style.logoVisible && (
          <div ref={el => domRefs.current.logoWrap = el} style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
            transform: `translate(${style.logoX || 0}px, ${style.logoY || 0}px)`,
          }}>
            <div ref={el => domRefs.current.logoBox = el} style={{ width: style.logoSize, height: style.logoSize, margin: '0 auto', borderRadius: 8, overflow: 'hidden' }}>
              <img src="/assets/ethos-logo.png" alt="E" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        )}

        <Avatar src={user.avatar} name={user.name} size={110} />

        <div style={{ marginTop: 24 }}>
          {style.nameVisible && (
            <h2 ref={el => domRefs.current.name = el} style={{
              fontFamily: 'var(--fh)', fontWeight: 800, fontSize: style.nameSize,
              color: style.textColor, margin: 0, lineHeight: 1.1,
              transform: `translate(${style.nameX}px, ${style.nameY}px)`,
            }}>
              {user.name || 'Your Name'}
            </h2>
          )}

          {style.roleVisible && (
            <p ref={el => domRefs.current.role = el} style={{
              fontFamily: 'var(--fb)', fontWeight: 700, fontSize: style.roleSize,
              color: style.accentColor, margin: '8px 0', textTransform: 'uppercase', letterSpacing: '1px',
              transform: `translate(${style.roleX}px, ${style.roleY}px)`,
            }}>
              {user.role || 'Attendee'}
            </p>
          )}

          {style.companyVisible && (
            <p ref={el => domRefs.current.company = el} style={{
              fontFamily: 'var(--fb)', fontWeight: 600, fontSize: style.companySize,
              color: style.subColor, margin: '4px 0',
              transform: `translate(${style.companyX || 0}px, ${style.companyY || 0}px)`,
            }}>
              {user.company || 'Ethos Attendee'}
            </p>
          )}

          {style.emailVisible && (
            <p ref={el => domRefs.current.email = el} style={{
              fontFamily: 'var(--fb)', fontSize: style.emailSize, color: 'var(--muted)', margin: 0,
              transform: `translate(${style.emailX || 0}px, ${style.emailY || 0}px)`,
            }}>
              {user.email}
            </p>
          )}
        </div>

        {style.qrVisible && (
          <div style={{
            background: '#fff', padding: 12, borderRadius: 16, border: `1.5px solid ${style.accentColor}33`,
            display: 'inline-block', marginTop: 32,
            transform: `translate(${style.qrX}px, ${style.qrY}px)`,
          }} ref={el => domRefs.current.qrWrap = el}>
            <QRCodeSVG value={user.id || ''} size={style.qrSize} level="M" fgColor={style.textColor} bgColor="#ffffff" />
          </div>
        )}
      </div>
      
      <p style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--muted)', marginTop: 32, opacity: 0.6, letterSpacing: '0.1em' }}>
        ETHOS 2026 OFFICIAL BADGE
      </p>
    </div>
  );
});

function MyCardContent() {
  const { data: session, update: updateSession } = useSession();
  const profile = session?.user;
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === '1';

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
  const [style, setStyle] = useState(DEFAULT_STYLE);
  
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
      
      const saved = localStorage.getItem(`ethos_design_${profile.id}`);
      if (saved) { try { setStyle(JSON.parse(saved)); } catch (e) {} }
    }
  }, [profile]);

  const handleUpdate = useCallback((newStyle) => {
    setStyle(newStyle);
    if (profile?.id) localStorage.setItem(`ethos_design_${profile.id}`, JSON.stringify(newStyle));
  }, [profile?.id]);

  const handleReset = () => {
    setStyle(DEFAULT_STYLE);
    if (profile?.id) localStorage.removeItem(`ethos_design_${profile.id}`);
    toast.success('Restored to default');
  };

  const exportID = async () => {
    if (!cardRef.current) return;
    const t = toast.loading('Exporting High-Res ID...');
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, backgroundColor: '#fff' });
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.height; canvas.height = img.width;
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(90 * Math.PI / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        const link = document.createElement('a');
        link.download = `Ethos-ID-${(name || profile?.name || 'User').replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('Exported!', { id: t });
      };
    } catch (e) {
      toast.error('Export failed', { id: t });
    }
  };

  const saveProfile = async () => {
    if (!name || !company) return toast.error('Name and Company are required');
    if (phone && !/^\d+$/.test(phone)) return toast.error('Phone must be numeric');
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
    <div className="page-enter" style={{ paddingBottom: 100 }}>
       <style>{`
        .premium-slider-group input { -webkit-appearance: none; appearance: none; height: 4px; background: var(--s2); border-radius: 2px; }
        .premium-range-input::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%;
          background: #fff; border: 2px solid var(--g); cursor: grab; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          margin-top: -1px; /* Center thumb on 4px track */
        }
        .premium-toggle {
          appearance: none; width: 34px; height: 18px; background: var(--s1); border-radius: 20px;
          position: relative; cursor: pointer; border: 1px solid var(--border);
        }
        .premium-toggle:checked { background: var(--g); }
        .premium-toggle::before { content: ""; position: absolute; width: 14px; height: 14px; border-radius: 50%; top: 1px; left: 1px; background: #fff; transition: transform 0.2s; }
        .premium-toggle:checked::before { transform: translateX(16px); }
      `}</style>

      {!isOnboarding && <Topbar title="Badge Designer" />}
      
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px', display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          <CardPreview user={{ ...profile, name, avatar, role, company }} style={style} cardRef={cardRef} domRefs={domRefs} />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={exportID} style={{
              background: 'var(--g)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px',
              fontFamily: 'var(--fb)', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
            }}>
              <Download size={18} /> Export High-Res ID
            </button>
            <button onClick={() => setQrExpanded(true)} style={{
              background: 'var(--white)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 24px',
              fontFamily: 'var(--fb)', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}>
              <Search size={18} /> View QR
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <CardEditor style={style} onUpdate={handleUpdate} onReset={handleReset} cardDOMRefs={domRefs} />
          
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
             <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 18, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
               <UserIcon size={20} color="var(--g)" /> Profile Details
             </h3>
             <div style={{ position: 'relative', alignSelf: 'center', marginBottom: 10 }}>
               <Avatar src={avatar} name={name} size={100} />
               <label style={{
                 position: 'absolute', bottom: 0, right: 0,
                 background: 'var(--g)', color: '#fff', width: 32, height: 32,
                 borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                 cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.15)', border: '2px solid #fff'
               }}>
                 <Camera size={16} />
                 <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
               </label>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--s2)', padding: '4px 12px', borderRadius: 12 }}>
                 <UserIcon size={16} color="var(--muted)" />
                 <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" maxLength={40} style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px 0', fontSize: 14, outline: 'none' }} />
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--s2)', padding: '4px 12px', borderRadius: 12 }}>
                 <Type size={16} color="var(--muted)" />
                 <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="Role / Position" maxLength={30} style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px 0', fontSize: 14, outline: 'none' }} />
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--s2)', padding: '4px 12px', borderRadius: 12 }}>
                 <Building size={16} color="var(--muted)" />
                 <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" maxLength={30} style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px 0', fontSize: 14, outline: 'none' }} />
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--s2)', padding: '4px 12px', borderRadius: 12 }}>
                 <Smartphone size={16} color="var(--muted)" />
                 <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="Phone Number" maxLength={15} style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px 0', fontSize: 14, outline: 'none' }} />
               </div>
               <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Short Bio" rows={3} maxLength={160} style={{ width: '100%', background: 'var(--s2)', border: 'none', borderRadius: 12, padding: 12, resize: 'none', fontSize: 14, outline: 'none' }} />
             </div>
             <button 
              onClick={saveProfile} 
              disabled={saving}
              style={{
                background: 'var(--g)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px',
                fontFamily: 'var(--fb)', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: saving ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
              }}
            >
              {saving ? 'Saving...' : <><Save size={18} /> Update Profile</>}
            </button>
          </div>
        </div>

      </div>

      <Suspense fallback={null}>
        <Modal center open={qrExpanded} onClose={() => setQrExpanded(false)}>
          <div style={{ padding: 32, background: '#fff', borderRadius: 24, textAlign: 'center' }}>
            <QRCodeSVG value={profile.id} size={280} level="H" fgColor={style.textColor} bgColor="#ffffff" />
            <p style={{ marginTop: 24, fontFamily: 'var(--fh)', fontWeight: 700 }}>Your Attendee ID</p>
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
