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
  const [recentScans, setRecentScans] = useState([]);
  const streamRef = useRef(null);
  const animRef = useRef(null);
  const lastScannedRef = useRef({ id: null, time: 0 });

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
    const now = Date.now();
    // 5 second cooldown per unique user ID
    if (lastScannedRef.current.id === userId && now - lastScannedRef.current.time < 5000) return;
    lastScannedRef.current = { id: userId, time: now };

    try {
      const res = await fetch('/api/checkin', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ user_id: userId }) 
      });
      const data = await res.json();
      
      if (res.ok) { 
        setRecentScans(prev => [data, ...prev].slice(0, 5));
        toast.success(`Checked in: ${data.name}`); 
      }
      else if (res.status === 409) { 
        setRecentScans(prev => [data.profile, ...prev].slice(0, 5));
        toast.error('Already checked in'); 
      }
      else { 
        toast.error(data.error || 'Failed'); 
      }
    } catch { 
      toast.error('Network error'); 
    }
  };

  return (
    <div className="page-enter" style={{ padding: '24px 16px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 22, color: 'var(--atext)', marginBottom: 20 }}>
          ✅ Check-in Scanner
        </h2>

        {!scanning && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>📷</span>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--asub)', marginBottom: 24 }}>
              Scan an attendee&apos;s QR to check them in
            </p>
            <Btn variant="accent" onClick={startCamera}>Start Scanner</Btn>
          </div>
        )}

        {scanning && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ animation: 'fadeUp 0.22s ease both' }}>
              <div style={{
                position: 'relative', borderRadius: 16, overflow: 'hidden',
                background: '#000', aspectRatio: '1', maxWidth: 360, margin: '0 auto',
                border: '4px solid var(--accent)',
              }}>
                <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div style={{ 
                  position: 'absolute', inset: 0, display: 'flex', 
                  alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.05)', pointerEvents: 'none'
                }}>
                  <div style={{ 
                    width: 200, height: 200, border: '2px solid rgba(255,255,255,0.3)', 
                    borderRadius: 24, boxShadow: '0 0 0 1000px rgba(0,0,0,0.5)'
                  }} />
                </div>
              </div>
              <div style={{ marginTop: 16 }}><Btn variant="adanger" onClick={stopCamera}>Stop Scanner</Btn></div>
            </div>

            {recentScans.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp 0.3s ease both' }}>
                <h3 style={{ 
                  fontFamily: 'var(--fhs)', fontSize: 14, fontWeight: 800, 
                  color: 'var(--asub)', textTransform: 'uppercase', letterSpacing: '0.05em' 
                }}>
                  Recent Scans
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentScans.map((user, i) => (
                    <div key={`${user.id}-${i}`} style={{
                      background: 'var(--as2)', border: '1px solid var(--aborder)', 
                      borderRadius: 12, padding: '12px 16px', display: 'flex', 
                      alignItems: 'center', gap: 12, animation: i === 0 ? 'popIn 0.3s ease both' : 'none'
                    }}>
                      <Avatar src={user.avatar} name={user.name} size={40} />
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--atext)' }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--asub)' }}>{user.email}</div>
                      </div>
                      <div style={{ color: 'var(--g)', fontWeight: 800, fontSize: 11, background: 'var(--as1)', padding: '4px 8px', borderRadius: 8 }}>
                        CHECKED IN
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <style>{`
          @keyframes popIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
