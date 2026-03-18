'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';
import Avatar from '@/components/Avatar';
import Btn from '@/components/Btn';
import { Camera, Users, User, X, RefreshCcw } from 'lucide-react';

export default function AdminCheckinPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [multiMode, setMultiMode] = useState(true);
  const [recentScans, setRecentScans] = useState([]);
  const streamRef = useRef(null);
  const animRef = useRef(null);
  const lastScannedRef = useRef({ id: null, time: 0 });

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleCheckin = async (userId) => {
    const now = Date.now();
    // 5 second cooldown per unique user ID to prevent accidental double-scans
    if (lastScannedRef.current.id === userId && now - lastScannedRef.current.time < 5000) return;
    lastScannedRef.current = { id: userId, time: now };

    if (!multiMode) {
      stopCamera();
    }

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
        toast.error(data.error || 'Check-in failed'); 
      }
    } catch (err) { 
      console.error(err);
      toast.error('Network error'); 
    }
  };

  const scan = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    
    if (v.readyState === v.HAVE_ENOUGH_DATA) {
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const img = ctx.getImageData(0, 0, c.width, c.height);
      const code = jsQR(img.data, img.width, img.height);
      if (code) {
        handleCheckin(code.data);
        if (!multiMode) return; 
      }
    }
    animRef.current = requestAnimationFrame(scan);
  }, [multiMode]);

  const startCamera = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        animRef.current = requestAnimationFrame(scan);
      }
    } catch (err) {
      console.error(err);
      toast.error('Camera access denied');
      setScanning(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="page-enter" style={{ padding: '24px 16px', height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 800, fontSize: 24, color: 'var(--atext)', margin: 0 }}>
            Scanner
          </h2>
          {scanning && (
            <button 
              onClick={stopCamera}
              style={{ background: 'var(--as1)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--asub)' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Mode Selector */}
        <div style={{ 
          background: 'var(--as2)', padding: 6, borderRadius: 16, display: 'flex', gap: 6, marginBottom: 24,
          border: '1px solid var(--aborder)'
        }}>
          <button 
            onClick={() => setMultiMode(false)}
            style={{
              flex: 1, padding: '10px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 700,
              background: !multiMode ? 'var(--as1)' : 'transparent',
              color: !multiMode ? 'var(--atext)' : 'var(--asub)',
              boxShadow: !multiMode ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            <User size={16} /> Single Scan
          </button>
          <button 
            onClick={() => setMultiMode(true)}
            style={{
              flex: 1, padding: '10px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 700,
              background: multiMode ? 'var(--as1)' : 'transparent',
              color: multiMode ? 'var(--atext)' : 'var(--asub)',
              boxShadow: multiMode ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            <Users size={16} /> Multi Person
          </button>
        </div>

        {!scanning && (recentScans.length === 0 || multiMode) && (
          <div style={{ 
            background: 'var(--as2)', border: '1px solid var(--aborder)', borderRadius: 24, padding: 48,
            textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)', marginBottom: 24
          }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--as1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <Camera size={40} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--fhs)', fontWeight: 800, color: 'var(--atext)' }}>Ready to scan</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--asub)', fontWeight: 500 }}>
                {multiMode ? "Keep the camera open for multiple attendees" : "Stop after each successful scan"}
              </p>
            </div>
            <Btn variant="accent" onClick={startCamera} style={{ padding: '14px 40px', borderRadius: 16 }}>
              Open Scanner
            </Btn>
          </div>
        )}

        {scanning && (
          <div style={{ animation: 'fadeUp 0.3s ease both', marginBottom: 32 }}>
            <div style={{
              position: 'relative', borderRadius: 24, overflow: 'hidden',
              background: '#000', aspectRatio: '1', maxWidth: 400, margin: '0 auto',
              border: '6px solid var(--accent)', boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
            }}>
              <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {/* Scan Reticle */}
              <div style={{ 
                position: 'absolute', inset: 0, display: 'flex', 
                alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                <div style={{ 
                  width: '60%', height: '60%', border: '2px solid rgba(255,255,255,0.4)', 
                  borderRadius: 32, boxShadow: '0 0 0 1000px rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div className="scanner-line" style={{ width: '90%', height: 2, background: 'var(--accent)', boxShadow: '0 0 15px var(--accent)', opacity: 0.6 }} />
                </div>
              </div>

              <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center' }}>
                <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
                  {multiMode ? "Multi-Person Active" : "Single Scan Active"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Scans List */}
        {recentScans.length > 0 && (
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--fhs)', fontSize: 14, fontWeight: 800, color: 'var(--asub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recent Scans
              </h3>
              {!scanning && <Btn variant="text" onClick={() => setRecentScans([])} style={{ fontSize: 12 }}>Clear</Btn>}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentScans.map((user, i) => (
                <div key={`${user.id}-${i}`} style={{
                  background: 'var(--as2)', border: '1px solid var(--aborder)', 
                  borderRadius: 20, padding: '14px 16px', display: 'flex', 
                  alignItems: 'center', gap: 14, animation: i === 0 ? 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both' : 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <Avatar src={user.avatar} name={user.name} size={44} />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--atext)' }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--asub)', fontWeight: 500 }}>{user.email}</div>
                  </div>
                  <div style={{ 
                    color: 'var(--accent)', fontWeight: 800, fontSize: 10, 
                    background: 'var(--as1)', padding: '6px 12px', borderRadius: 10,
                    textTransform: 'uppercase', letterSpacing: '0.03em'
                  }}>
                    Scanned
                  </div>
                </div>
              ))}
            </div>
            
            {!scanning && multiMode && (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Btn variant="accent" onClick={startCamera}>Resume Scanning</Btn>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes scanLine {
          0% { transform: translateY(-80px); }
          100% { transform: translateY(80px); }
        }
        .scanner-line { animation: scanLine 2s linear infinite alternate; }
      `}</style>
    </div>
  );
}
