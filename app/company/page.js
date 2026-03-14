'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';
import Loader from '@/components/Loader';
import Btn from '@/components/Btn';
import FormInput from '@/components/FormInput';
import StarRating from '@/components/StarRating';

const DRAFT_KEY = 'ethos_company_draft';

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { return null; }
}

function saveDraft(form) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch {}
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

const emptyForm = { name: '', description: '', logo_url: '', website: '', deck_link: '', category: '' };

export default function CompanyPortalPage() {
  const { data: session } = useSession();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [scanning, setScanning] = useState(false);
  const [scannedProfile, setScannedProfile] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!session?.profile?.id) return;
    fetch('/api/companies').then(r => r.json()).then(list => {
      const myCompany = (list || []).find(x => x.user_id === session.profile.id);
      if (myCompany) {
        setCompany(myCompany);
        setForm({
          name: myCompany.name || '', description: myCompany.description || '',
          logo_url: myCompany.logo_url || '', website: myCompany.website || '',
          deck_link: myCompany.deck_link || '', category: myCompany.category || '',
        });
        clearDraft();
      } else {
        // No company yet — load draft if available
        const draft = loadDraft();
        if (draft) setForm(draft);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [session?.profile?.id]);

  // Auto-save draft when form changes and no company exists
  useEffect(() => {
    if (!company && form.name.trim()) {
      saveDraft(form);
    }
  }, [form, company]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Company name is required'); return; }
    setSaving(true);
    try {
      if (company) {
        // Update existing
        const res = await fetch('/api/companies', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: company.id, ...form }),
        });
        if (res.ok) {
          const updated = await res.json();
          setCompany(updated);
          toast.success('Company updated!');
        } else toast.error('Failed to update');
      } else {
        // Create new
        const res = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const created = await res.json();
          setCompany(created);
          clearDraft();
          toast.success('Company created!');
        } else {
          const err = await res.json();
          toast.error(err.error || 'Failed to create');
        }
      }
    } catch { toast.error('Network error'); }
    setSaving(false);
  };

  const startScanner = async () => {
    setScanning(true); setScannedProfile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); requestAnimationFrame(scan); }
    } catch { toast.error('Camera denied'); setScanning(false); }
  };

  const stopScanner = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setScanning(false);
  };

  const scan = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    if (v.readyState === v.HAVE_ENOUGH_DATA) {
      c.width = v.videoWidth; c.height = v.videoHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const img = ctx.getImageData(0, 0, c.width, c.height);
      const code = jsQR(img.data, img.width, img.height);
      if (code) { handleScannedUser(code.data); return; }
    }
    animRef.current = requestAnimationFrame(scan);
  };

  const handleScannedUser = async (userId) => {
    stopScanner();
    toast.success('Attendee scanned!');
    setScannedProfile({ id: userId, name: 'Attendee', email: 'attendee@example.com' });
  };

  if (loading) return <Loader />;

  const isNew = !company;

  return (
    <div className="page-enter" style={{ padding: '24px 16px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 24 }}>

        {/* Create / Edit Profile */}
        <section style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 24 }}>
          {isNew && (
            <div style={{
              background: 'var(--gl)', border: '1px solid var(--gb)', borderRadius: 12,
              padding: 14, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <span style={{ fontSize: 24 }}>🆕</span>
              <div>
                <p style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 14, color: 'var(--g)' }}>
                  Set up your company profile
                </p>
                <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>
                  Fill in the details below — your progress is saved as a draft automatically.
                </p>
              </div>
            </div>
          )}
          <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 20 }}>
            {isNew ? '🏢 Create Company Profile' : '🏢 Edit Profile'}
          </h2>
          <form onSubmit={handleSave}>
            <FormInput label="Company Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            <FormInput label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Cleantech" />
            <FormInput label="Description" type="textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            
            {/* Logo: upload or URL */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: 'var(--fb)', fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
                Company Logo
              </label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {/* Preview */}
                <div style={{
                  width: 64, height: 64, borderRadius: 14, background: 'var(--s1)',
                  border: '1.5px dashed var(--border)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
                }}>
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 24, color: 'var(--muted)' }}>🏢</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  {/* File upload button */}
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'var(--gl)', border: '1px solid var(--gb)', borderRadius: 8,
                    padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--fb)',
                    fontSize: 13, fontWeight: 500, color: 'var(--g)', marginBottom: 8,
                  }}>
                    📷 Upload Image
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 500000) { toast.error('Image must be under 500KB'); return; }
                      const reader = new FileReader();
                      reader.onload = (ev) => setForm(p => ({ ...p, logo_url: ev.target.result }));
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                  <span style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--muted)', margin: '0 8px' }}>or</span>
                  {/* URL input */}
                  <input
                    type="text"
                    value={form.logo_url?.startsWith('data:') ? '' : form.logo_url}
                    onChange={e => setForm(p => ({ ...p, logo_url: e.target.value }))}
                    placeholder="Paste image URL..."
                    style={{
                      width: '100%', marginTop: 6, background: 'var(--s1)', border: '1.5px solid var(--border)',
                      borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'var(--fb)',
                      color: 'var(--text)', outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            <FormInput label="Website" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
            <FormInput label="Research Deck Link" value={form.deck_link} onChange={e => setForm(p => ({ ...p, deck_link: e.target.value }))} />
            <Btn type="submit" disabled={saving}>
              {saving ? 'Saving…' : isNew ? '✨ Create Company' : 'Save Changes'}
            </Btn>
          </form>
        </section>

        {/* Stats & Scanner — only show when company exists */}
        {company && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <section style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 24 }}>
              <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 16 }}>
                📊 Company Stats
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 32, fontFamily: 'var(--fh)', fontWeight: 800, color: 'var(--g)' }}>
                  {company.vote_count || 0}
                </div>
                <div style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', lineHeight: 1.3 }}>
                  Total ratings<br />received
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--s1)', padding: 16, borderRadius: 12 }}>
                {[{ l: 'Overall', v: company.avg_overall }, { l: 'Sustainability', v: company.avg_sustainability }, { l: 'Impact', v: company.avg_impact }, { l: 'Feasibility', v: company.avg_feasibility }].map(r => (
                  <div key={r.l}>
                    <span style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--muted)', display: 'block' }}>{r.l}</span>
                    <StarRating value={Math.round(r.v || 0)} readonly size={14} />
                  </div>
                ))}
              </div>
            </section>

            <section style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 24, textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>
                📷 Booth Scanner
              </h2>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', marginBottom: 20 }}>
                Scan attendee QR codes to connect and exchange info
              </p>

              {!scanning && !scannedProfile && (
                <Btn onClick={startScanner} variant="outline">Start Scanner</Btn>
              )}

              {scanning && (
                <div style={{ animation: 'fadeUp 0.22s ease both' }}>
                  <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#000', aspectRatio: '1', maxWidth: 300, margin: '0 auto' }}>
                    <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 180, height: 180, border: '2px solid var(--g)', borderRadius: 16 }} />
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}><Btn variant="danger" sm onClick={stopScanner}>Cancel</Btn></div>
                </div>
              )}

              {scannedProfile && (
                <div style={{ background: 'var(--gl)', border: '1px solid var(--gb)', borderRadius: 12, padding: 16, animation: 'scaleIn 0.3s ease both' }}>
                  <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>🤝</span>
                  <p style={{ fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 14, color: 'var(--g)' }}>Connected with {scannedProfile.name}</p>
                  <div style={{ marginTop: 12 }}><Btn variant="outline" sm onClick={startScanner}>Scan Another</Btn></div>
                </div>
              )}
            </section>

            {/* Booth Check-in QR */}
            <section style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 24, textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 16 }}>
                Booth Check-in QR
              </h2>
              <div style={{ display: 'inline-block', padding: 16, background: '#fff', border: '1px solid var(--border)', borderRadius: 16 }}>
                <QRCodeSVG value={company.id} size={150} level="H" fgColor="#1a1814" />
              </div>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
                Attendees scan this for their passport
              </p>
            </section>
          </div>
        )}

      </div>
    </div>
  );
}
