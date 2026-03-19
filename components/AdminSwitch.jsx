'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Shield, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSwitch({ admin }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  
  const isAdminPath = pathname.startsWith('/admin');
  const isAdminMode = isAdminPath;

  const handleToggle = async (e) => {
    // Prevent double triggers if clicking container AND button
    e?.stopPropagation();
    
    setLoading(true);
    const newMode = !isAdminMode;

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ in_admin: newMode }),
      });

      if (!res.ok) throw new Error('Failed to update mode');

      const updatedProfile = await res.json();
      
      // Update NextAuth session
      await update({
        ...session,
        profile: updatedProfile
      });

      toast.success(newMode ? 'Staff Mode Activated' : 'Attendee Mode Activated');
      
      // Redirect based on mode
      if (newMode) {
        if (session.profile.access_level === 2) {
          router.push('/admin/checkin');
        } else {
          router.push('/admin');
        }
      } else {
        router.push('/app');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not switch modes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session?.profile || session.profile.access_level < 2) return null;

  const level = session.profile.access_level;
  const adminLabel = level >= 3 ? 'Admin Mode' : 'Scanner Mode';

  const containerBg = admin ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.4)';
  const borderColor = admin ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)';
  const sliderBg = admin ? 'var(--accent)' : 'var(--white)';
  const sliderShadow = admin ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)';
  const activeTextColor = admin ? '#000' : 'var(--g)';
  const inactiveTextColor = admin ? 'rgba(255, 255, 255, 0.5)' : 'var(--sub)';

  return (
    <div 
      onClick={handleToggle}
      className="bubble-click"
      style={{
        width: '100%',
        background: containerBg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${borderColor}`,
        borderRadius: 20,
        padding: '6px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 0,
        boxShadow: admin ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        height: 52,
      }}
    >
      {/* Sliding Background */}
      <div style={{
        position: 'absolute',
        top: 6,
        bottom: 6,
        left: 6,
        width: 'calc(50% - 6px)',
        background: sliderBg,
        borderRadius: 16,
        boxShadow: sliderShadow,
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isAdminMode ? 'translateX(100.5%)' : 'translateX(0)',
        zIndex: 1,
      }} />

      <div style={{
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: isAdminMode ? inactiveTextColor : activeTextColor,
        fontSize: 14,
        fontWeight: 700,
        transition: 'color 0.4s ease',
        fontFamily: 'var(--fb)',
      }}>
        <User size={18} strokeWidth={isAdminMode ? 2 : 2.5} />
        Attendee
      </div>

      <div style={{
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: isAdminMode ? activeTextColor : inactiveTextColor,
        fontSize: 14,
        fontWeight: 700,
        transition: 'color 0.4s ease',
        fontFamily: 'var(--fb)',
      }}>
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} strokeWidth={isAdminMode ? 2.5 : 2} />}
        {adminLabel.split(' ')[0]}
      </div>

      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.1)',
          zIndex: 10,
          cursor: 'not-allowed',
        }} />
      )}
    </div>
  );
}
