'use client';

import { memo } from 'react';
import Avatar from '@/components/Avatar';
import { QRCodeSVG } from 'qrcode.react';

export const DEFAULT_STYLE = {
  nameSize: 22, nameX: 0, nameY: 0, nameVisible: true,
  roleSize: 14, roleX: 0, roleY: 0, roleVisible: true,
  companySize: 13, companyX: 0, companyY: 0, companyVisible: true,
  emailSize: 11, emailX: 0, emailY: 0, emailVisible: true,
  qrSize: 64, qrX: 0, qrY: 0, qrVisible: true,
  logoSize: 28, logoX: 0, logoY: 0, logoVisible: true,
  accentColor: '#D49B7A',
  textColor: '#413429',
  subColor: '#7D6F63',
};

export const CardPreview = memo(function CardPreview({ user = {}, style = DEFAULT_STYLE, cardRef, domRefs = { current: {} }, fullSize = true }) {
  const s = Object.assign({}, DEFAULT_STYLE, style);

  // Unified Landscape Layout (9.5 x 4.5 implementation)
  const containerStyle = {
    background: '#ffffff',
    borderRadius: 16,
    border: '1px solid var(--border)',
    width: 320, // 9.5 equivalent
    height: 152, // 4.5 equivalent
    padding: '16px 20px',
    textAlign: 'left',
    boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxSizing: 'border-box',
    flexShrink: 0,
  };

  return (
    <div ref={cardRef} style={containerStyle}>
      {/* Decorative corner gradient */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 140, height: 140,
        background: `linear-gradient(135deg, ${s.accentColor}20 0%, transparent 100%)`,
        borderRadius: '0 0 0 100%', pointerEvents: 'none', zIndex: 0
      }} />

      {/* Text Info Section */}
      <div style={{ flex: 1, minWidth: 0, zIndex: 1, position: 'relative' }}>
        {s.logoVisible && (
          <div ref={el => domRefs.current.logoWrap = el} style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
            transform: `translate(${s.logoX || 0}px, ${s.logoY || 0}px)`,
          }}>
            <div ref={el => domRefs.current.logoBox = el} style={{
              width: s.logoSize || 28, height: s.logoSize || 28,
              borderRadius: 5, overflow: 'hidden', flexShrink: 0
            }}>
              <img src="/assets/ethos-logo-insignia.png" alt="E" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        )}

        {s.nameVisible && (
          <h2 ref={el => domRefs.current.name = el} style={{
            fontFamily: 'var(--fh)', fontWeight: 800, fontSize: s.nameSize || 20,
            color: s.textColor, margin: 0, lineHeight: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            transform: `translate(${s.nameX || 0}px, ${s.nameY || 0}px)`,
          }}>
            {user?.name || 'Your Name'}
          </h2>
        )}

        {s.roleVisible && (
          <p ref={el => domRefs.current.role = el} style={{
            fontFamily: 'var(--fb)', fontWeight: 700, fontSize: s.roleSize || 13,
            color: s.accentColor, margin: '2px 0 4px',
            textTransform: 'uppercase', letterSpacing: '0.8px',
            transform: `translate(${s.roleX || 0}px, ${s.roleY || 0}px)`,
          }}>
            {user?.role || (user?.access_level === 3 ? 'Super Admin' : user?.access_level === 2 ? 'Event Staff' : 'Attendee')}
          </p>
        )}

        {s.companyVisible && (
          <p ref={el => domRefs.current.company = el} style={{
            fontFamily: 'var(--fb)', fontWeight: 600, fontSize: s.companySize || 12,
            color: s.subColor, margin: 0,
            transform: `translate(${s.companyX || 0}px, ${s.companyY || 0}px)`,
          }}>
            {user?.company || 'Ethos Attendee'}
          </p>
        )}

        {s.emailVisible && (
          <p ref={el => domRefs.current.email = el} style={{
            fontFamily: 'var(--fb)', fontSize: s.emailSize || 10, color: 'var(--muted)',
            marginTop: 4, margin: 0, opacity: 0.8,
            transform: `translate(${s.emailX || 0}px, ${s.emailY || 0}px)`,
          }}>
            {user?.email}
          </p>
        )}
      </div>

      {/* QR Section */}
      {s.qrVisible && (
        <div ref={el => domRefs.current.qrWrap = el} style={{
          background: '#fff', padding: 5, borderRadius: 10, border: '1.2px solid #efefef',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
          transform: `translate(${s.qrX || 0}px, ${s.qrY || 0}px)`, zIndex: 1
        }}>
          <QRCodeSVG value={user?.id || user?.email || ''} size={s.qrSize || 64} level="H" fgColor={s.textColor} bgColor="#ffffff" />
        </div>
      )}

      {/* Footer watermark */}
      <p style={{
        position: 'absolute', bottom: 8, right: 12,
        fontFamily: 'var(--fb)', fontSize: 7, color: 'var(--muted)',
        margin: 0, opacity: 0.4, letterSpacing: '0.1em'
      }}>
        ETHOS 2026 OFFICIAL BADGE
      </p>
    </div>
  );
});

export default CardPreview;
