'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';
import Avatar from '@/components/Avatar';
import RoleChip from '@/components/RoleChip';

export default function AdminCheckinPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [checkedUser, setCheckedUser] = useState(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  const startCamera = async () => {
    setScanning(true);
    setCheckedUser(null);
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
    } catch {
      toast.error('Camera access denied');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const scan = () => {
    if (!videoRef.current || !canvasRef.current) return;
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
        handleCheckin(code.data);
        return;
      }
    }
    animationRef.current = requestAnimationFrame(scan);
  };

  const handleCheckin = async (userId) => {
    stopCamera();
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();

      if (res.ok) {
        setCheckedUser(data);
        toast.success(`Checked in: ${data.name}`);
      } else if (res.status === 409) {
        setCheckedUser(data.profile);
        toast.error('Already checked in');
      } else {
        toast.error(data.error || 'Check-in failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  return (
    <div className="page-enter">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="font-heading text-2xl font-bold text-green-900 mb-6">✅ Check-in Scanner</h2>

        {!scanning && !checkedUser && (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">📷</p>
            <p className="font-body text-gray-500 mb-6">Scan an attendee&apos;s My Card QR to check them in</p>
            <button onClick={startCamera} className="btn-primary btn-glow text-lg py-3 px-8">
              Start Scanner
            </button>
          </div>
        )}

        {scanning && (
          <div className="max-w-md mx-auto animate-fade-up">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-green-400 rounded-2xl">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                </div>
              </div>
            </div>
            <button onClick={stopCamera} className="btn-secondary w-full mt-4">Cancel</button>
          </div>
        )}

        {checkedUser && (
          <div className="max-w-md mx-auto animate-scale-in">
            <div className="glass-card p-8 text-center">
              <div className="text-5xl mb-4">✅</div>
              <Avatar src={checkedUser.avatar} name={checkedUser.name} size={72} />
              <h3 className="font-heading text-xl font-bold text-green-900 mt-4">{checkedUser.name}</h3>
              <p className="font-body text-gray-500 text-sm">{checkedUser.email}</p>
              <RoleChip level={checkedUser.access_level} />
              {checkedUser.checked_in_at && (
                <p className="text-xs text-gray-400 font-body mt-2">
                  Checked in at {new Date(checkedUser.checked_in_at).toLocaleTimeString()}
                </p>
              )}
            </div>
            <button onClick={startCamera} className="btn-primary w-full mt-4 btn-glow">
              Scan Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
