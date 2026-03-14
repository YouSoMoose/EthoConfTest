'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';
import Avatar from '@/components/Avatar';
import RoleChip from '@/components/RoleChip';
import Btn from '@/components/Btn';

export default function AdminCheckinPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [checkedUser, setCheckedUser] = useState(null);
  const streamRef = useRef(null);
  const animRef = useRef(null);

  const startCamera = async () => {
    setScanning(true); setCheckedUser(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); requestAnimationFrame(scan); }
    } catch { toast.error('Camera denied'); setScanning(false); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setScanning(false);
  };

  useEffect(() => () => stopCamera(), []);

  const scan = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    if (v.readyState === v.HAVE_ENOUGH_DATA) {
      c.width = v.videoWidth; c.height = v.videoHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const img = ctx.getImageData(0, 0, c.width, c.height);
      const code = jsQR(img.data, img.width, img.height);
      if (code) { handleCheckin(code.data); return; }
    }
    animRef.current = requestAnimationFrame(scan);
  };

  const handleCheckin = async (userId) => {
    stopCamera();
    try {
      const res = await fetch('/api/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId }) });
      const data = await res.json();
      if (res.ok) { setCheckedUser(data); toast.success(`Checked in: ${data.name}`); }
      else if (res.status === 409) { setCheckedUser(data.profile); toast.error('Already checked in'); }
      else { toast.error(data.error || 'Failed'); }
    } catch { toast.error('Network error'); }
  };

  return (
    <div className="page-enter" style={{ padding: '24px 16px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 22, color: 'var(--atext)', marginBottom: 20 }}>
          ✅ Check-in Scanner
        </h2>

        {!scanning && !checkedUser && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>📷</span>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--asub)', marginBottom: 24 }}>
              Scan an attendee&apos;s QR to check them in
            </p>
            <Btn variant="accent" onClick={startCamera}>Start Scanner</Btn>
          </div>
        )}

        {scanning && (
          <div style={{ animation: 'fadeUp 0.22s ease both' }}>
            <div style={{
              position: 'relative', borderRadius: 16, overflow: 'hidden',
              background: '#000', aspectRatio: '1', maxWidth: 360, margin: '0 auto',
            }}>
              <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 200, height: 200, border: '2px solid var(--accent)', borderRadius: 16 }} />
              </div>
            </div>
            <div style={{ marginTop: 16 }}><Btn variant="adanger" onClick={stopCamera}>Cancel</Btn></div>
          </div>
        )}

        {checkedUser && (
          <div style={{ animation: 'scaleIn 0.3s ease both', textAlign: 'center' }}>
            <div style={{
              background: 'var(--as2)', border: '1px solid var(--aborder)', borderRadius: 'var(--r)',
              padding: 32,
            }}>
              <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>✅</span>
              <Avatar src={checkedUser.avatar} name={checkedUser.name} size={64} />
              <h3 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 20, color: 'var(--atext)', marginTop: 12 }}>
                {checkedUser.name}
              </h3>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--asub)', marginTop: 4 }}>
                {checkedUser.email}
              </p>
              <div style={{ marginTop: 8 }}><RoleChip level={checkedUser.access_level} admin /></div>
            </div>
            <div style={{ marginTop: 16 }}><Btn variant="accent" onClick={startCamera}>Scan Next</Btn></div>
          </div>
        )}
      </div>
    </div>
  );
}
