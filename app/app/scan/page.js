'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';
import Topbar from '@/components/Topbar';
import Btn from '@/components/Btn';

export default function ScanPage() {
  const router = useRouter();
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
      if (code) { handleStamp(code.data); return; }
    }
    animRef.current = requestAnimationFrame(scan);
  };

  const handleStamp = async (boothId) => {
    stopCamera();
    try {
      const res = await fetch('/api/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booth_id: boothId }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, ...data });
        toast.success('Booth stamped! ✅');
      } else {
        setResult({ success: false, error: data.error });
        toast.error(data.error || 'Failed');
      }
    } catch { toast.error('Network error'); }
  };

  return (
    <div className="page-enter">
      <Topbar title="📷 Scan QR" onBack={() => router.back()} />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px', textAlign: 'center' }}>
        {!scanning && !result && (
          <div style={{ padding: '60px 0' }}>
            <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>📷</span>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', marginBottom: 24 }}>
              Point your camera at a booth QR code
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
          <div style={{ animation: 'scaleIn 0.3s ease both', padding: '40px 0' }}>
            <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>
              {result.success ? '✅' : '❌'}
            </span>
            <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>
              {result.success ? 'Stamped!' : 'Oops'}
            </h2>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', marginBottom: 24 }}>
              {result.success
                ? (result.raffle_eligible ? '🎉 You are now raffle eligible!' : 'Keep collecting stamps!')
                : result.error}
            </p>
            <Btn onClick={startCamera}>Scan Another</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
