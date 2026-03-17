'use client';

import { useEffect, useState, useRef, useCallback, memo, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Loader from '@/components/Loader';
import { CardPreview, DEFAULT_STYLE } from '@/components/CardPreview';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';
import { Search, X, ChevronLeft, Layout, Settings, Printer, Download } from 'lucide-react';


// Direct DOM mutations per attribute — bypasses React entirely during drag
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

function Btn({ children, onClick, variant = 'default', sm = false }) {
  const isAccent = variant === 'accent';
  return (
    <button
      onClick={onClick}
      style={{
        background: isAccent ? 'var(--accent)' : 'var(--as1)',
        color: isAccent ? 'var(--text)' : 'var(--atext)',
        border: '1px solid var(--aborder)', borderRadius: 8,
        padding: sm ? '6px 12px' : '10px 20px',
        fontSize: sm ? 12 : 14, fontFamily: 'var(--fh)', fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
      }}
      onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
      onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}
    >
      {children}
    </button>
  );
}

function CardEditor({ style, onUpdate, onReset, onClose, cardDOMRefs }) {
  const [activeTab, setActiveTab] = useState('size');
  const [localStyle, setLocalStyle] = useState(style);
  const localRef = useRef(style);
  const rafRef = useRef(null);

  // Called on every pixel of movement — mutates DOM directly, no React re-render
  const handleInput = useCallback((attr, rawVal) => {
    const val = parseFloat(rawVal);

    // Update pill number instantly
    const pill = document.getElementById(`pill-${attr}`);
    if (pill) pill.textContent = Math.round(val);

    // Update track gradient instantly
    const input = document.getElementById(`slider-${attr}`);
    if (input) {
      const pct = ((val - parseFloat(input.min)) / (parseFloat(input.max) - parseFloat(input.min))) * 100;
      input.style.background = `linear-gradient(to right, var(--accent) ${pct}%, var(--as3) ${pct}%)`;
    }

    // Mutate card DOM on next animation frame
    localRef.current = { ...localRef.current, [attr]: val };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (LIVE_MAP[attr]) LIVE_MAP[attr](val, cardDOMRefs.current, localRef.current);
    });
  }, [cardDOMRefs]);

  // Called only on mouseup/touchend — commits to React state
  const handleCommit = useCallback((attr, rawVal) => {
    const val = parseFloat(rawVal);
    const next = { ...localRef.current, [attr]: val };
    localRef.current = next;
    setLocalStyle(next);
    onUpdate(next);
  }, [onUpdate]);

  // For non-slider inputs
  const update = useCallback((key, val) => {
    const next = { ...localRef.current, [key]: val };
    localRef.current = next;
    setLocalStyle(next);
    onUpdate(next);
  }, [onUpdate]);

  const ControlGroup = ({ label, children }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--amuted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>{label}</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>
    </div>
  );

  const Slider = ({ label, attr, min, max }) => {
    const val = localStyle[attr] ?? 0;
    const pct = ((val - min) / (max - min)) * 100;
    return (
      <div className="premium-slider-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--asub)', textTransform: 'uppercase', opacity: 0.8 }}>{label}</label>
          <span id={`pill-${attr}`} className="slider-value-pill">{Math.round(val)}</span>
        </div>
        <input
          id={`slider-${attr}`}
          type="range" min={min} max={max} step="1"
          defaultValue={val}
          onInput={e => handleInput(attr, e.target.value)}
          onMouseUp={e => handleCommit(attr, e.target.value)}
          onTouchEnd={e => handleCommit(attr, e.target.value)}
          className="premium-range-input"
          style={{ background: `linear-gradient(to right, var(--accent) ${pct}%, var(--as3) ${pct}%)` }}
        />
      </div>
    );
  };

  const Toggle = ({ label, attr }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 11, color: 'var(--atext)', fontWeight: 500 }}>
      <input type="checkbox" checked={localStyle[attr]} onChange={e => update(attr, e.target.checked)} className="premium-toggle" />
      {label}
    </label>
  );

  return (
    <div style={{
      background: 'var(--as1)', border: '1px solid var(--aborder)', borderRadius: 'var(--r)',
      padding: 20, display: 'flex', flexDirection: 'column', gap: 16,
      animation: 'fadeUp 0.15s ease both', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', zIndex: 100
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h4 style={{ fontFamily: 'var(--fhs)', fontSize: 15, color: 'var(--atext)', margin: 0 }}>📐 Design Suite</h4>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--amuted)', cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ display: 'flex', background: 'var(--as2)', borderRadius: 10, padding: 3, marginBottom: 4 }}>
        {['size', 'pos', 'vis'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            flex: 1, padding: '8px', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700,
            background: activeTab === t ? 'var(--as3)' : 'transparent',
            color: activeTab === t ? 'var(--accent)' : 'var(--amuted)',
            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {t === 'size' ? 'Scale' : t === 'pos' ? 'Layout' : 'Toggle'}
          </button>
        ))}
      </div>

      <div style={{ maxHeight: 350, overflowY: 'auto', paddingRight: 6 }}>
        {activeTab === 'size' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <ControlGroup label="Typography">
              <Slider label="Name" attr="nameSize" min={5} max={80} />
              <Slider label="Role" attr="roleSize" min={4} max={50} />
              <Slider label="Company" attr="companySize" min={4} max={50} />
              <Slider label="Email" attr="emailSize" min={4} max={40} />
            </ControlGroup>
            <ControlGroup label="Visual Components">
              <Slider label="Logo Scale" attr="logoSize" min={5} max={150} />
              <Slider label="QR Resolution" attr="qrSize" min={20} max={250} />
            </ControlGroup>
            <ControlGroup label="Brand Palette">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--as2)', padding: '10px 14px', borderRadius: 12 }}>
                <input type="color" value={localStyle.accentColor} onChange={e => update('accentColor', e.target.value)} style={{ width: 28, height: 28, padding: 0, border: '2px solid var(--as1)', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
                <span style={{ fontSize: 11, color: 'var(--atext)', fontWeight: 600 }}>Accent Color</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--as2)', padding: '10px 14px', borderRadius: 12 }}>
                <input type="color" value={localStyle.textColor} onChange={e => update('textColor', e.target.value)} style={{ width: 28, height: 28, padding: 0, border: '2px solid var(--as1)', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
                <span style={{ fontSize: 11, color: 'var(--atext)', fontWeight: 600 }}>Primary Text</span>
              </div>
            </ControlGroup>
          </div>
        )}

        {activeTab === 'pos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <ControlGroup label="Logo Position">
              <Slider label="Horizontal" attr="logoX" min={-300} max={300} />
              <Slider label="Vertical" attr="logoY" min={-300} max={300} />
            </ControlGroup>
            <ControlGroup label="QR Matrix">
              <Slider label="Horizontal" attr="qrX" min={-300} max={300} />
              <Slider label="Vertical" attr="qrY" min={-300} max={300} />
            </ControlGroup>
            <ControlGroup label="Name Position">
              <Slider label="Horizontal" attr="nameX" min={-300} max={300} />
              <Slider label="Vertical" attr="nameY" min={-300} max={300} />
            </ControlGroup>
            <ControlGroup label="Professional Info">
              <Slider label="Role H/V" attr="roleX" min={-300} max={300} />
              <Slider label="Role Vertical" attr="roleY" min={-300} max={300} />
              <Slider label="Comp H/V" attr="companyX" min={-300} max={300} />
              <Slider label="Comp Vertical" attr="companyY" min={-300} max={300} />
              <Slider label="Email H/V" attr="emailX" min={-300} max={300} />
              <Slider label="Email Vertical" attr="emailY" min={-300} max={300} />
            </ControlGroup>
          </div>
        )}

        {activeTab === 'vis' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'var(--as2)', padding: 16, borderRadius: 12 }}>
            <Toggle label="Name" attr="nameVisible" />
            <Toggle label="Role" attr="roleVisible" />
            <Toggle label="Company" attr="companyVisible" />
            <Toggle label="Email" attr="emailVisible" />
            <Toggle label="Full Logo" attr="logoVisible" />
            <Toggle label="QR Scan" attr="qrVisible" />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 4, borderTop: '1px solid var(--aborder)', paddingTop: 16 }}>
        <button onClick={onReset} style={{
          flex: 1, background: 'var(--as2)', border: '1px solid var(--aborder)', borderRadius: 10,
          padding: '10px', fontSize: 11, fontFamily: 'var(--fh)', fontWeight: 700,
          cursor: 'pointer', color: 'var(--atext)', textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          Reset Composition
        </button>
      </div>
    </div>
  );
}



function CardRow({ user, initialStyle, globalUpdate, isPrinting, setPrintingId }) {
  const [style, setStyle] = useState(initialStyle || DEFAULT_STYLE);
  const [editing, setEditing] = useState(false);
  const cardRef = useRef(null);
  const domRefs = useRef({});
  const saveTimeout = useRef(null);

  const handleUpdate = useCallback((newStyle) => {
    setStyle(newStyle);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => globalUpdate(user.id, newStyle), 500);
  }, [globalUpdate, user.id]);

  const handleReset = useCallback(() => {
    setStyle(DEFAULT_STYLE);
    globalUpdate(user.id, null);
    toast.success('Restored to default');
  }, [globalUpdate, user.id]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const t = toast.loading('Generating image...');
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
        link.download = `Ethos-ID-${(user.name || 'User').replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('Downloaded!', { id: t });
      };
    } catch (e) {
      console.error(e);
      toast.error('Failed to download', { id: t });
    }
  };

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 32, paddingBottom: 32,
      borderBottom: '1px solid var(--aborder)', alignItems: 'flex-start',
      animation: 'fadeIn 0.4s ease-out'
    }}>
      <CardPreview user={user} style={style} cardRef={cardRef} domRefs={domRefs} fullSize={false} />

      <div style={{ flex: 1, minWidth: 340 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--fhs)', fontSize: 20, margin: 0, color: 'var(--atext)', fontWeight: 700 }}>{user.name}</h3>
          <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--as2)', padding: '4px 12px', borderRadius: 20, color: 'var(--accent)', border: '1px solid var(--aborder)', textTransform: 'uppercase' }}>
            ID VERIFIED
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <Btn sm variant="accent" onClick={() => setEditing(!editing)}>
            {editing ? '🛡️ Save Settings' : '✨ Advanced Designer'}
          </Btn>
          <Btn sm onClick={handleDownload}>💾 Export ID</Btn>
          <Btn sm onClick={() => { setPrintingId(user.id); setTimeout(() => { window.print(); setPrintingId(null); }, 150); }}>🖨️ Direct Print</Btn>
        </div>

        {editing && (
          <CardEditor
            style={style}
            onUpdate={handleUpdate}
            onReset={handleReset}
            onClose={() => setEditing(false)}
            cardDOMRefs={domRefs}
          />
        )}
      </div>
    </div>
  );
}

function AdminIDCardsContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printingId, setPrintingId] = useState(null);
  const [customizations, setCustomizations] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ethos_card_customizations');
    if (saved) { try { setCustomizations(JSON.parse(saved)); } catch (e) {} }
    fetch('/api/users')
      .then(res => res.json())
      .then(data => { setUsers(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGlobalUpdate = useCallback((userId, newStyle) => {
    setCustomizations(prev => {
      const updated = { ...prev };
      if (newStyle === null) delete updated[userId];
      else updated[userId] = newStyle;
      localStorage.setItem('ethos_card_customizations', JSON.stringify(updated));
      return updated;
    });
  }, []);

  if (loading) return <Loader admin />;

  return (
    <div className={`page-enter ${printingId ? 'is-printing-single' : ''}`} style={{ padding: '32px 20px', background: 'var(--as2)' }}>
      <style>{`
        @media print {
          .is-printing-single .hide-when-printing-single { display: none !important; }
          .is-printing-single .page-enter { padding: 0 !important; }
        }

        .premium-slider-group { margin-bottom: 20px; }

        .slider-value-pill {
          font-size: 10px; font-weight: 800; background: var(--as3); color: var(--accent);
          padding: 2px 8px; border-radius: 20px; border: 1px solid var(--aborder);
          min-width: 28px; text-align: center; display: inline-block;
        }

        .premium-range-input {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 4px; border-radius: 10px;
          border: none;
          outline: none; cursor: pointer;
        }

        .premium-range-input::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: #fff; border: 2px solid var(--g); cursor: grab;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          transition: transform 0.08s ease, box-shadow 0.08s ease;
          margin-top: -7px; /* Align to the center of 4px track */
        }

        .premium-range-input::-webkit-slider-thumb:hover {
          transform: scale(1.25);
          box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 15%, transparent);
        }

        .premium-range-input::-webkit-slider-thumb:active {
          cursor: grabbing; transform: scale(1.15);
          background: var(--accent); border-color: #fff;
          box-shadow: 0 0 0 8px color-mix(in srgb, var(--accent) 20%, transparent);
        }

        .premium-range-input::-webkit-slider-runnable-track { border-radius: 10px; height: 6px; }

        .premium-range-input::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: #fff; border: 2.5px solid var(--accent);
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }

        .premium-toggle {
          appearance: none; width: 34px; height: 18px; background: var(--s1);
          border-radius: 20px; position: relative; cursor: pointer; transition: background 0.25s;
          border: 1px solid var(--border);
        }
        .premium-toggle:checked { background: var(--g); }
        .premium-toggle::before {
          content: ""; position: absolute; width: 14px; height: 14px; border-radius: 50%;
          top: 1px; left: 1px; background: #fff;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-toggle:checked::before { transform: translateX(16px); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/admin" style={{
              textDecoration: 'none', color: 'var(--asub)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 42, height: 42, borderRadius: 12, background: 'var(--as1)',
              border: '1px solid var(--aborder)', transition: 'all 0.2s'
            }}>
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 800, fontSize: 28, color: 'var(--atext)', margin: 0, letterSpacing: '-0.02em' }}>
                ID Card Designer
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--asub)', fontWeight: 500 }}>Global Conference Asset Management</p>
            </div>
          </div>
          
          <div style={{ width: '100%', position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 640 }}>
              <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', opacity: 0.8, pointerEvents: 'none' }}>
                <Search size={22} />
              </div>
              <input
                type="text"
                placeholder="Find attendees by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--white)',
                  border: '1.5px solid var(--aborder)',
                  borderRadius: 16,
                  padding: '16px 20px 16px 54px',
                  fontSize: 16,
                  fontFamily: 'var(--fh)',
                  color: 'var(--atext)',
                  outline: 'none',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03), inset 0 2px 4px rgba(0,0,0,0.01)',
                  fontWeight: 600
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--accent)';
                  e.target.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--accent) 15%, transparent), 0 4px 12px rgba(0,0,0,0.03)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--aborder)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03), inset 0 2px 4px rgba(0,0,0,0.01)';
                }}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'var(--as2)', border: 'none', borderRadius: 10, padding: 8,
                    cursor: 'pointer', color: 'var(--asub)', display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--asub)'}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, background: 'var(--as1)', padding: 32, borderRadius: 24, border: '1px solid var(--aborder)', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(u => (
              <CardRow
                key={u.id} user={u}
                initialStyle={customizations[u.id]}
                globalUpdate={handleGlobalUpdate}
                isPrinting={printingId === u.id}
                setPrintingId={setPrintingId}
              />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--asub)' }}>
              No users found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminIDCardsPage() {
  return (
    <Suspense fallback={<Loader admin />}>
      <AdminIDCardsContent />
    </Suspense>
  );
}
