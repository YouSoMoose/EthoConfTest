'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Avatar from '@/components/Avatar';
import Loader from '@/components/Loader';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut, AlertTriangle } from 'lucide-react';

export default function AdminLogoutPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [qrSize, setQrSize] = useState(120);

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(d => { setUsers(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const forceLogout = async (userId) => {
    if (!confirm('Are you sure you want to force logout this user? They will be immediately kicked to the login screen.')) return;
    
    // We update the 'force_logout' boolean in the profiles table to true.
    // The realtime listener in the main app will catch this and trigger signOut().
    const res = await fetch('/api/users', { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ id: userId, force_logout: true }) 
    });
    
    if (res.ok) {
      toast.success('Force logout signal sent!');
    } else {
      toast.error('Failed to send logout signal');
    }
  };

  if (loading) return <Loader admin />;

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter" style={{ padding: '24px 16px', height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 22, color: 'var(--atext)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogOut size={24} /> Force Logout Users
        </h2>

        {/* QR Code Section */}
        <div style={{
          background: 'var(--as2)', border: '1px solid var(--aborder)', borderRadius: 16,
          padding: 24, marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          textAlign: 'center'
        }}>
          <h3 style={{ fontFamily: 'var(--fhs)', margin: 0, color: 'var(--atext)' }}>Soft Logout QR Code</h3>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--asub)', maxWidth: 400, margin: 0, lineHeight: 1.5 }}>
            Standard logout via NextAuth. If a user scans this, it will destroy their active session.
          </p>
          <div 
            onClick={() => setQrSize(qrSize === 120 ? 300 : 120)}
            style={{ 
              background: '#fff', padding: 12, borderRadius: 12, cursor: 'pointer',
              transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            title="Click to enlarge"
          >
            <QRCodeSVG value="https://app.ethossustainability.org/logout" size={qrSize} level="H" />
          </div>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--amuted)', marginTop: -8 }}>Tap QR code to enlarge</p>
        </div>

        {/* Search & List */}
        <div style={{ background: 'var(--as2)', border: '1px solid var(--aborder)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <AlertTriangle size={20} color="#EF4444" />
            <h3 style={{ fontFamily: 'var(--fhs)', margin: 0, color: 'var(--atext)', fontSize: 16 }}>Manual Force Disconnect</h3>
          </div>
          
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', background: 'var(--as3)', border: '1px solid var(--aborder)',
              borderRadius: 10, padding: '12px 14px', fontSize: 14,
              fontFamily: 'var(--fb)', color: 'var(--atext)', outline: 'none', marginBottom: 20,
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.slice(0, 50).map(u => (
              <div key={u.id} style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: 'var(--as3)', borderRadius: 12, border: '1px solid var(--aborder)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar src={u.avatar} name={u.name} size={36} />
                  <div>
                    <div style={{ fontFamily: 'var(--fhs)', fontSize: 14, color: 'var(--atext)', fontWeight: 600 }}>{u.name || 'Anonymous User'}</div>
                    <div style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--asub)' }}>{u.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => forceLogout(u.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444', padding: '8px 14px', borderRadius: 8, fontFamily: 'var(--fb)',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.2s ease', 
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#EF4444'; }}
                >
                  <LogOut size={14} /> Force Logout
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--amuted)', fontFamily: 'var(--fb)' }}>
                No users found.
              </div>
            )}
            {filtered.length > 50 && (
              <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--amuted)', fontFamily: 'var(--fb)', fontSize: 12 }}>
                Showing 50 of {filtered.length} users. Keep typing to filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
