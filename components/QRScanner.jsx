'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';
import Btn from '@/components/Btn';

export default function QRScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const streamRef = useRef(null);
  const animRef = useRef(null);

  const startCamera = async () => {
    setScanning(true);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(scan);
      }
    } catch {
      toast.error('Camera access denied');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setScanning(false);
  };

  useEffect(() => () => stopCamera(), []);

  const scan = () => {
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
      if (code) { handleScan(code.data); return; }
    }
    animRef.current = requestAnimationFrame(scan);
  };

  const handleScan = async (scannedId) => {
    stopCamera();
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanned_id: scannedId }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: data.message || 'Added to Wallet! 💼', profile: data.profile });
        toast.success(data.message || 'Added to Wallet! 💼');
      } else {
        setResult({ success: false, error: data.error });
        toast.error(data.error || 'Failed');
      }
    } catch { toast.error('Network error'); }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px', textAlign: 'center' }}>
      {!scanning && !result && (
        <div style={{ padding: '60px 0' }}>
          <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>📷</span>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', marginBottom: 24 }}>
            Point your camera at a person's QR code
          </p>
          <Btn onClick={startCamera}>Start Scanner</Btn>
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
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 200, height: 200, border: '2px solid var(--warm)', borderRadius: 16 }} />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Btn variant="outline" onClick={stopCamera}>Cancel</Btn>
          </div>
        </div>
      )}

      {result && (
        <div style={{ animation: 'scaleIn 0.3s ease both', padding: '40px 16px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)', marginTop: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
          {result.success && result.profile ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--s1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 16 }}>
                {result.profile.avatar ? (
                  <img src={result.profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <span style={{ fontSize: 40 }}>👤</span>}
              </div>
              <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 24, color: 'var(--text)', margin: '0 0 4px', textAlign: 'center' }}>
                {result.profile.name || 'Anonymous User'}
              </h2>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', margin: '0 0 16px', textAlign: 'center' }}>
                {result.profile.email}
              </p>
              
              {result.profile.phone && (
                <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', margin: '0 0 16px', textAlign: 'center' }}>
                  📞 {result.profile.phone}
                </p>
              )}
              
              {result.profile.bio && (
                <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--text)', margin: '0 0 20px', textAlign: 'center', background: 'var(--s1)', padding: '12px 16px', borderRadius: 12, lineHeight: 1.5, width: '100%' }}>
                  "{result.profile.bio}"
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52, 199, 89, 0.15)', color: '#28a745', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, fontFamily: 'var(--fb)', marginBottom: 24 }}>
                <span>✓</span> {result.message}
              </div>

              {result.profile.resume_link && (
                <a href={result.profile.resume_link} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--ad)', color: 'var(--accent)', textDecoration: 'none', padding: '12px 20px', borderRadius: 12, fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 14, width: '100%', marginBottom: 12
                }}>
                  📄 View Resume
                </a>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>❌</span>
              <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>Oops</h2>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', marginBottom: 24 }}>{result.error}</p>
            </div>
          )}
          <Btn onClick={startCamera} variant={result.success ? "outline" : "primary"}>Scan Another</Btn>
          <div style={{ marginTop: 12 }}>
            <a href="/app/wallet" style={{ 
              fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', 
              textDecoration: 'underline', cursor: 'pointer', display: 'inline-block',
              padding: '8px'
            }}>
              Go to Wallet →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
