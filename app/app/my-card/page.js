'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import Topbar from '@/components/Topbar';
import Avatar from '@/components/Avatar';
import Btn from '@/components/Btn';
import Modal from '@/components/Modal';

export default function MyCardPage() {
  const { data: session } = useSession();
  const [resumeLink, setResumeLink] = useState(session?.profile?.resume_link || '');
  const [saving, setSaving] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);
  const profile = session?.profile;

  const saveResume = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume_link: resumeLink }) });
      if (res.ok) toast.success('Resume link saved');
      else toast.error('Failed');
    } catch { toast.error('Network error'); }
    setSaving(false);
  };

  return (
    <div className="page-enter">
      <Topbar title="🎫 My Card" />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
        {/* Badge */}
        <div style={{
          background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
          padding: '32px 20px', textAlign: 'center', marginBottom: 16,
          animation: 'scaleIn 0.3s ease both',
        }}>
          <Avatar src={profile?.avatar} name={profile?.name} size={72} />
          <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 20, color: 'var(--text)', marginTop: 12 }}>
            {profile?.name}
          </h2>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            {profile?.email}
          </p>

          <div 
            onClick={() => setQrExpanded(true)}
            style={{
              display: 'inline-block', padding: 16, background: 'var(--white)',
              borderRadius: 16, border: '1px solid var(--s2)', marginTop: 20,
              cursor: 'zoom-in'
            }}
          >
            <QRCodeSVG value={profile?.id || ''} size={170} level="H" fgColor="#2d5016" bgColor="#ffffff" />
          </div>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--muted)', marginTop: 12 }}>
            Show this QR code for check-in
          </p>
        </div>

        {/* Resume link */}
        <div style={{
          background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
          padding: 20, animation: 'fadeUp 0.22s ease 0.1s both',
        }}>
          <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>
            📄 Resume Link
          </h3>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
            Add a link to your resume so companies can view it
          </p>
          <input
            type="url"
            value={resumeLink}
            onChange={e => setResumeLink(e.target.value)}
            placeholder="https://your-resume-link.com"
            style={{
              width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)',
              borderRadius: 10, padding: '11px 14px', fontSize: 14,
              fontFamily: 'var(--fb)', color: 'var(--text)', outline: 'none', marginBottom: 12,
            }}
          />
          <Btn onClick={saveResume} disabled={saving}>{saving ? 'Saving…' : 'Save Resume Link'}</Btn>
        </div>
      </div>

      <Modal center open={qrExpanded} onClose={() => setQrExpanded(false)}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20, background: '#fff', borderRadius: 24 }}>
          <QRCodeSVG value={profile?.id || ''} size={300} level="H" fgColor="#2d5016" bgColor="#ffffff" />
        </div>
      </Modal>
    </div>
  );
}
