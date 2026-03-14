'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';

export default function ScanPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(scan);
      }
    } catch (err) {
      toast.error('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const scan = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        handleQRResult(code.data);
        return;
      }
    }

    animationRef.current = requestAnimationFrame(scan);
  };

  const handleQRResult = async (data) => {
    setScanning(false);
    stopCamera();

    // The QR data should be a booth UUID
    try {
      const res = await fetch('/api/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booth_id: data }),
      });

      const result = await res.json();

      if (res.ok) {
        // Store stamp locally for passport page
        const stampKey = `stamps_${session?.profile?.id}`;
        const stored = JSON.parse(localStorage.getItem(stampKey) || '[]');
        if (!stored.includes(data)) {
          stored.push(data);
          localStorage.setItem(stampKey, JSON.stringify(stored));
        }
        setResult({ success: true, message: `Stamped: ${result.booth_name || 'Booth'}` });
        toast.success(`Stamped: ${result.booth_name || 'Booth'}!`);
      } else {
        setResult({ success: false, message: result.error || 'Failed to stamp' });
        if (result.error === 'Already stamped') {
          toast.error(`Already stamped: ${result.booth_name || 'this booth'}`);
        } else {
          toast.error(result.error || 'Failed to stamp');
        }
      }
    } catch {
      setResult({ success: false, message: 'Network error' });
      toast.error('Network error');
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white text-xl hover:opacity-80 transition-opacity">
            ←
          </button>
          <h1 className="font-heading text-xl font-bold">📷 Scan QR</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {scanning ? (
          <div className="animate-fade-up">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-green-400 rounded-2xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                  {/* Scanning line */}
                  <div className="absolute left-2 right-2 h-0.5 bg-green-400 opacity-60" style={{ animation: 'scanLine 2s ease-in-out infinite', top: '50%' }}></div>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-500 font-body text-sm mt-4">
              Point your camera at a booth QR code
            </p>
          </div>
        ) : (
          <div className="animate-scale-in text-center py-12">
            <div className="text-6xl mb-4">{result?.success ? '✅' : '❌'}</div>
            <h2 className="font-heading text-xl font-bold text-green-900 mb-2">
              {result?.success ? 'Success!' : 'Oops!'}
            </h2>
            <p className="font-body text-gray-500 mb-8">{result?.message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setScanning(true); setResult(null); startCamera(); }}
                className="btn-primary btn-glow"
              >
                Scan Another
              </button>
              <button onClick={() => router.push('/app/passport')} className="btn-secondary">
                View Passport
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
