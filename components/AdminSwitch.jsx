'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Settings, Shield, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSwitch({ initialMode, admin }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const isAdminMode = initialMode === 'admin' || session?.profile?.in_admin;

  const handleToggle = async () => {
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

      toast.success(newMode ? 'Admin Mode Activated' : 'Attendee Mode Activated');
      
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

  const bg = admin ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)';
  const borderColor = admin ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)';
  const inactiveTextColor = admin ? 'rgba(255, 255, 255, 0.5)' : 'var(--sub)';

  return (
    <div style={{
      background: bg,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: `1px solid ${borderColor}`,
      borderRadius: 18,
      padding: '4px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      boxShadow: admin ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.05)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <button
        onClick={isAdminMode ? undefined : handleToggle}
        disabled={loading}
        style={{
          padding: '8px 16px',
          borderRadius: 14,
          border: 'none',
          background: isAdminMode ? 'transparent' : (admin ? 'rgba(255, 255, 255, 0.2)' : 'var(--white)'),
          color: isAdminMode ? inactiveTextColor : (admin ? '#fff' : 'var(--g)'),
          fontSize: 13,
          fontWeight: 700,
          cursor: isAdminMode ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: isAdminMode ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
          opacity: loading && !isAdminMode ? 0.7 : 1,
        }}
      >
        <User size={16} />
        {admin ? 'Attendee' : 'Attendee View'}
      </button>

      <button
        onClick={isAdminMode ? handleToggle : undefined}
        disabled={loading}
        style={{
          padding: '8px 16px',
          borderRadius: 14,
          border: 'none',
          background: isAdminMode ? (admin ? 'var(--accent)' : 'var(--text)') : 'transparent',
          color: isAdminMode ? (admin ? '#000' : '#fff') : inactiveTextColor,
          fontSize: 13,
          fontWeight: 700,
          cursor: isAdminMode ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: isAdminMode ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
          opacity: loading && isAdminMode ? 0.7 : 1,
        }}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
        {adminLabel}
      </button>

      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.2)',
          zIndex: 10,
        }} />
      )}
    </div>
  );
}
