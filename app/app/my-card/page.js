'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import Avatar from '@/components/Avatar';

export default function MyCardPage() {
  const { data: session } = useSession();
  const [resumeLink, setResumeLink] = useState(session?.profile?.resume_link || '');
  const [saving, setSaving] = useState(false);

  const profile = session?.profile;

  const saveResume = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_link: resumeLink }),
      });
      if (res.ok) toast.success('Resume link saved');
      else toast.error('Failed to save');
    } catch {
      toast.error('Network error');
    }
    setSaving(false);
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div className="max-w-lg mx-auto">
          <h1 className="font-heading text-2xl font-bold">🎫 My Card</h1>
          <p className="text-green-200 text-sm font-body mt-1">Your digital badge</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Badge Card */}
        <div className="glass-card p-8 text-center animate-scale-in">
          <Avatar src={profile?.avatar} name={profile?.name} size={80} />
          <h2 className="font-heading text-xl font-bold text-green-900 mt-4">{profile?.name}</h2>
          <p className="font-body text-gray-500 text-sm">{profile?.email}</p>

          {/* QR Code */}
          <div className="mt-6 inline-block p-4 bg-white rounded-2xl shadow-sm border border-amber-100">
            <QRCodeSVG
              value={profile?.id || ''}
              size={180}
              level="H"
              fgColor="#14532d"
              bgColor="#ffffff"
            />
          </div>
          <p className="text-xs text-gray-400 font-body mt-3">
            Show this QR code for check-in
          </p>
        </div>

        {/* Resume Link */}
        <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-heading text-lg font-bold text-green-900 mb-3">📄 Resume Link</h3>
          <p className="text-gray-500 text-sm font-body mb-4">
            Add a link to your resume so companies can view it
          </p>
          <input
            type="url"
            value={resumeLink}
            onChange={(e) => setResumeLink(e.target.value)}
            placeholder="https://your-resume-link.com"
            className="input-field mb-3"
          />
          <button
            onClick={saveResume}
            disabled={saving}
            className="btn-primary w-full btn-glow"
          >
            {saving ? 'Saving...' : 'Save Resume Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
