'use client';

import { useEffect, useState, useRef, memo } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import Empty from '@/components/Empty';
import Modal from '@/components/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { X, User, Mail, Phone, Briefcase, Link as LinkIcon, FileText, Smartphone } from 'lucide-react';

const CardPreview = memo(function CardPreview({ user }) {
  const style = {
    nameSize: 18, nameX: 0, nameY: 0, nameVisible: true,
    roleSize: 12, roleX: 0, roleY: 0, roleVisible: true,
    companySize: 11, companyX: 0, companyY: 0, companyVisible: true,
    emailSize: 9, emailX: 0, emailY: 0, emailVisible: true,
    qrSize: 80, qrX: 0, qrY: 0, qrVisible: true,
    logoSize: 32, logoX: 0, logoY: 0, logoVisible: true,
    accentColor: '#2563EB',
    textColor: '#1F2937',
    subColor: '#6B7280',
  };

  return (
    <div style={{
      background: '#ffffff', borderRadius: 16, border: '1px solid #E5E7EB',
      width: '100%', height: 180, padding: 16, boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', gap: 16,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 100, height: 100,
        background: `linear-gradient(135deg, ${style.accentColor}15 0%, transparent 100%)`,
        borderRadius: '0 0 0 100%', pointerEvents: 'none'
      }} />

      <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <img src="/assets/ethos-logo.png" alt="E" style={{ width: style.logoSize, height: style.logoSize, objectFit: 'contain' }} />
        </div>

        <h3 style={{
          fontFamily: 'var(--fh)', fontWeight: 800, fontSize: style.nameSize,
          color: style.textColor, margin: 0, lineHeight: 1.1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {user.name || 'Anonymous User'}
        </h3>

        <p style={{
          fontFamily: 'var(--fb)', fontWeight: 700, fontSize: style.roleSize,
          color: style.accentColor, margin: '4px 0',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          {user.role || (user.access_level === 3 ? 'Super Admin' : user.access_level === 2 ? 'Event Staff' : 'Attendee')}
        </p>

        <p style={{
          fontFamily: 'var(--fb)', fontWeight: 600, fontSize: style.companySize,
          color: style.subColor, margin: '2px 0',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {user.company || 'Ethos Attendee'}
        </p>

        <p style={{
          fontFamily: 'var(--fb)', fontSize: style.emailSize, color: '#9CA3AF', margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {user.email}
        </p>
      </div>

      <div style={{
        background: '#fff', padding: 6, borderRadius: 8, border: '1px solid #F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)', zIndex: 2
      }}>
        <QRCodeSVG value={user.id || ''} size={style.qrSize} level="M" fgColor={style.textColor} bgColor="#ffffff" />
      </div>
    </div>
  );
});

export default function WalletPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState(null);

  useEffect(() => {
    fetch('/api/connections').then(r => r.json())
      .then(d => { setItems(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    if (!confirm('Remove this connection?')) return;
    await fetch(`/api/connections?id=${id}`, { method: 'DELETE' });
    setItems(p => p.filter(w => w.id !== id));
    toast.success('Removed');
  };

  if (loading) return <Loader />;

  return (
    <div className="page-enter">
      <Topbar title="Wallet" />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px', paddingBottom: 100 }}>
        {items.length === 0 ? (
          <Empty icon={<Smartphone size={48} />} text="No connections yet. Scan someone's QR code!" />
        ) : (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {items.map(item => {
              const p = item.profile;
              if (!p) return null;
              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  <div onClick={() => setActiveProfile(p)} style={{ cursor: 'pointer', transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                    <CardPreview user={p} />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); remove(item.id); }} style={{
                    position: 'absolute', top: -8, right: -8,
                    background: '#fff', border: '1px solid var(--border)', borderRadius: '50%',
                    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: 14, color: '#EF4444',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10
                  }}>
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={!!activeProfile} onClose={() => setActiveProfile(null)} center>
        {activeProfile && (
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
             <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--s1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '0 auto 16px', border: '2px solid var(--white)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              {activeProfile.avatar ? (
                <img src={activeProfile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : <User size={40} color="var(--muted)" />}
            </div>
            
            <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 24, color: 'var(--text)', margin: '0 0 4px' }}>
              {activeProfile.name || 'Anonymous User'}
            </h2>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 13, fontWeight: 700, color: 'var(--g)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
              {activeProfile.role || 'Attendee'} @ {activeProfile.company || 'Ethos'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--s2)', padding: 16, borderRadius: 16, textAlign: 'left', marginBottom: 20 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                 <Mail size={14} color="var(--muted)" />
                 <span style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)' }}>{activeProfile.email}</span>
               </div>
               {activeProfile.linkedin && (
                 <a href={activeProfile.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                   <LinkIcon size={14} color="var(--g)" />
                   <span style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--g)', fontWeight: 600 }}>LinkedIn Profile</span>
                 </a>
               )}
            </div>
            
            {activeProfile.bio && (
              <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--text)', margin: '0 0 24px', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{activeProfile.bio}"
              </p>
            )}

            {activeProfile.resume_link && (
              <a href={activeProfile.resume_link} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'var(--g)', color: '#fff', textDecoration: 'none', padding: '14px 24px', borderRadius: 12, fontFamily: 'var(--fb)', fontWeight: 700, fontSize: 15, width: '100%', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
              }}>
                <FileText size={18} />
                View Full Portfolio
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
