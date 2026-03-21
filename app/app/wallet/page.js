'use client';

import { useEffect, useState, useRef, memo } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import Empty from '@/components/Empty';
import Modal from '@/components/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { X, User, Mail, Phone, Briefcase, Link as LinkIcon, FileText, Smartphone, Linkedin } from 'lucide-react';

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
          <img src="/assets/ethos-logo.png" alt="E" style={{ width: style.logoSize, height: style.logoSize, objectFit: 'contain' }} />
          <div style={{ display: 'flex', gap: 8 }}>
             {user.linkedin && <Linkedin size={14} color="#0077b5" />}
             {user.resume_link && <FileText size={14} color="var(--g)" />}
          </div>
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
          {user.company || 'Conference Attendee'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
           <p style={{
             fontFamily: 'var(--fb)', fontSize: style.emailSize, color: '#9CA3AF', margin: 0,
             overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1
           }}>
             {user.email}
           </p>
           {user.game_score ? (
             <div style={{ 
               background: 'var(--g)', color: '#fff', fontSize: 10, fontWeight: 800, 
               padding: '2px 8px', borderRadius: 20, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
             }}>
               {user.game_score.points} pts
             </div>
           ) : (
             <div style={{ 
               background: 'var(--s1)', color: 'var(--muted)', fontSize: 10, fontWeight: 700, 
               padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)' 
             }}>
               No score
             </div>
           )}
        </div>
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
      .then(d => { 
        if (Array.isArray(d)) {
          setItems(d);
        } else {
          setItems([]);
          if (d.error) toast.error(d.error);
        }
        setLoading(false); 
      })
      .catch((err) => {
        console.error('[Wallet] Fetch error:', err);
        setLoading(false);
      });
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
        {(!items || items.length === 0) ? (
          <Empty icon={<Smartphone size={48} />} text="No connections yet. Scan someone's QR code!" />
        ) : (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Array.isArray(items) && items.map(item => {
              const p = item.profile;
              if (!p) return null;
              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  <div onClick={() => setActiveProfile(p)} style={{ cursor: 'pointer', transition: 'transform 0.2s var(--liquid)' }}>
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
              {activeProfile.role || 'Attendee'} @ {activeProfile.company || 'Conference'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--s2)', padding: 16, borderRadius: 16, textAlign: 'left', marginBottom: 20 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                 <Mail size={14} color="var(--muted)" />
                 <span style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)' }}>{activeProfile.email}</span>
               </div>
               {activeProfile.phone && (
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <Phone size={14} color="var(--muted)" />
                   <span style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)' }}>{activeProfile.phone}</span>
                 </div>
               )}
               {activeProfile.linkedin && (
                 <a href={activeProfile.linkedin.startsWith('http') ? activeProfile.linkedin : `https://${activeProfile.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                   <Linkedin size={14} color="#0077b5" />
                   <span style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--g)', fontWeight: 600 }}>LinkedIn Profile</span>
                 </a>
               )}
            </div>
            
            {activeProfile.game_score ? (
              <div style={{ 
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20,
                background: 'var(--s1)', border: '1px solid var(--border)',
                padding: '16px', borderRadius: 20, color: 'var(--text)', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.03)'
              }}>
                <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>Carbon Score</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--g)', margin: '4px 0' }}>{activeProfile.game_score.per_person_kg?.toFixed(1) || 0}</p>
                  <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--sub)', margin: 0 }}>kg CO₂ / year</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>Game Points</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--g)', margin: '4px 0' }}>{activeProfile.game_score.points || 0}</p>
                  <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--sub)', margin: 0 }}>Points earned</p>
                </div>
              </div>
            ) : (
              <div style={{ 
                marginBottom: 20, background: 'var(--s1)', padding: '16px', borderRadius: 20, 
                textAlign: 'center', border: '1px dashed var(--border)'
              }}>
                <p style={{ margin: 0, fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>
                  No game score yet
                </p>
              </div>
            )}

            {activeProfile.bio && (
              <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--text)', margin: '0 0 24px', lineHeight: 1.6, fontStyle: 'italic', background: 'var(--s1)', padding: '12px', borderRadius: '12px', borderLeft: '4px solid var(--g)' }}>
                "{activeProfile.bio}"
              </p>
            )}

            {activeProfile.resume_link && (
              <a href={activeProfile.resume_link.startsWith('http') ? activeProfile.resume_link : `https://${activeProfile.resume_link}`} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'var(--g)', color: '#fff', textDecoration: 'none', padding: '14px 24px', borderRadius: 12, fontFamily: 'var(--fb)', fontWeight: 700, fontSize: 15, width: '100%', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
              }}>
                <FileText size={18} />
                View Full Portfolio / Resume
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
