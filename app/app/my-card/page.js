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
  const profile = session?.profile;
  const [resumeLink, setResumeLink] = useState(profile?.resume_link || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ resume_link: resumeLink, phone, bio }) 
      });
      if (res.ok) toast.success('Profile saved successfully');
      else toast.error('Failed to save');
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

        {/* Edit Form */}
        <div style={{
          background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
          padding: 20, animation: 'fadeUp 0.22s ease 0.1s both',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
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
              📝 Bio / Description
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
          <QRCodeSVG value={profile?.id || ''} size={300} level="H" fgColor="#2d5016" bgColor="#ffffff" />
        </div>
      </Modal>
    </div>
  );
}
