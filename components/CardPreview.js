'use client';

import { memo } from 'react';
import Avatar from '@/components/Avatar';
import { QRCodeSVG } from 'qrcode.react';

export const DEFAULT_STYLE = {
  nameSize: 22, nameX: 0, nameY: 0, nameVisible: true,
  roleSize: 14, roleX: 0, roleY: 0, roleVisible: true,
  companySize: 13, companyX: 0, companyY: 0, companyVisible: true,
  emailSize: 11, emailX: 0, emailY: 0, emailVisible: true,
  qrSize: 130, qrX: 0, qrY: 0, qrVisible: true,
  logoSize: 44, logoX: 0, logoY: 0, logoVisible: true,
  accentColor: '#D49B7A',
  textColor: '#413429',
  subColor: '#7D6F63',
};

export const CardPreview = memo(function CardPreview({ user, style = DEFAULT_STYLE, cardRef, domRefs = { current: {} }, fullSize = true }) {
  const s = Object.assign({}, DEFAULT_STYLE, style);
  
  // Conditionally handle the size logic (Admin printing vs App page viewer)
  const containerStyle = fullSize 
    ? {
        background: '#ffffff', borderRadius: 24, border: '1px solid var(--border)',
        width: 300, height: 430, padding: 28, textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        position: 'relative', overflow: 'hidden', flexShrink: 0,
        animation: 'scaleIn 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67) both'
      }
    : {
        background: '#ffffff', borderRadius: 14, border: '1px solid #ddd',
        width: '87mm', height: '57mm', padding: 20, boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', gap: 20,
        boxShadow: '0 15px 45px rgba(0,0,0,0.06)',
        position: 'relative', overflow: 'hidden', flexShrink: 0,
      };

  return (
    <div ref={cardRef} style={containerStyle}>
      <div style={{
        position: 'absolute', top: 0, right: 0, 
        width: fullSize ? 220 : 160, height: fullSize ? 220 : 160,
        background: `linear-gradient(135deg, ${s.accentColor}25 0%, ${fullSize ? 'transparent' : 'rgba(168,158,148,0.05)'} 100%)`,
        borderRadius: '0 0 0 100%', pointerEvents: 'none'
      }} />

      <div style={fullSize ? { zIndex: 1, position: 'relative' } : { flex: 1, minWidth: 0, zIndex: 1, position: 'relative' }}>
        {s.logoVisible && (
          <div ref={el => domRefs.current.logoWrap = el} style={{
            display: 'flex', alignItems: 'center', justifyContent: fullSize ? 'center' : 'flex-start',
            gap: 10, marginBottom: fullSize ? 20 : 12,
            transform: `translate(${s.logoX || 0}px, ${s.logoY || 0}px)`,
          }}>
            <div ref={el => domRefs.current.logoBox = el} style={{ 
              width: s.logoSize, height: s.logoSize, 
              margin: fullSize ? '0 auto' : '0', 
              borderRadius: 8, overflow: 'hidden', flexShrink: 0 
            }}>
              <img src={fullSize ? "/assets/ethos-logo.png" : "/assets/ethos-logo-insignia.png"} alt="E" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        )}

        {fullSize && <Avatar src={user.avatar} name={user.name} size={90} />}

        <div style={fullSize ? { marginTop: 16 } : {}}>
          {s.nameVisible && (
            fullSize ? (
              <h2 ref={el => domRefs.current.name = el} style={{
                fontFamily: 'var(--fh)', fontWeight: 800, fontSize: s.nameSize,
                color: s.textColor, margin: 0, lineHeight: 1.1,
                transform: `translate(${s.nameX}px, ${s.nameY}px)`,
              }}>
                {user.name || 'Your Name'}
              </h2>
            ) : (
              <h3 ref={el => domRefs.current.name = el} style={{
                fontFamily: 'var(--fh)', fontWeight: 800, fontSize: s.nameSize,
                color: s.textColor, margin: 0, lineHeight: 1.05,
                overflowWrap: 'break-word', wordBreak: 'break-word',
                transform: `translate(${s.nameX}px, ${s.nameY}px)`,
              }}>
                {user.name || 'Anonymous User'}
              </h3>
            )
          )}

          {s.roleVisible && (
            <p ref={el => domRefs.current.role = el} style={{
              fontFamily: 'var(--fb)', fontWeight: 700, fontSize: s.roleSize,
              color: s.accentColor, margin: fullSize ? '8px 0' : '6px 0', 
              textTransform: 'uppercase', letterSpacing: '1px',
              transform: `translate(${s.roleX}px, ${s.roleY}px)`,
            }}>
              {user.role || (fullSize ? 'Attendee' : (user.access_level === 3 ? 'Super Admin' : user.access_level === 2 ? 'Event Staff' : 'Attendee'))}
            </p>
          )}

          {s.companyVisible && (
            <p ref={el => domRefs.current.company = el} style={{
              fontFamily: 'var(--fb)', fontWeight: 600, fontSize: s.companySize,
              color: s.subColor, margin: fullSize ? '4px 0' : '0 0 6px',
              transform: `translate(${s.companyX || 0}px, ${s.companyY || 0}px)`,
            }}>
              {user.company || 'Ethos Attendee'}
            </p>
          )}

          {s.emailVisible && (
            <p ref={el => domRefs.current.email = el} style={{
              fontFamily: 'var(--fb)', fontSize: s.emailSize, color: fullSize ? 'var(--muted)' : '#948B80', 
              margin: 0, opacity: fullSize ? 1 : 0.8,
              transform: `translate(${s.emailX || 0}px, ${s.emailY || 0}px)`,
            }}>
              {user.email}
            </p>
          )}
        </div>

        {fullSize && s.qrVisible && (
          <div style={{
            background: '#fff', padding: 12, borderRadius: 16, border: `1.5px solid ${s.accentColor}33`,
            display: 'inline-block', marginTop: 20,
            transform: `translate(${s.qrX}px, ${s.qrY}px)`,
          }} ref={el => domRefs.current.qrWrap = el}>
            <QRCodeSVG value={user.id || ''} size={s.qrSize} level="M" fgColor={s.textColor} bgColor="#ffffff" />
          </div>
        )}
      </div>

      {!fullSize && s.qrVisible && (
        <div ref={el => domRefs.current.qrWrap = el} style={{
          background: '#fff', padding: 8, borderRadius: 12, border: '1px solid #efefef',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          transform: `translate(${s.qrX}px, ${s.qrY}px)`, zIndex: 2
        }}>
          <QRCodeSVG value={user.id || ''} size={s.qrSize || 80} level="H" fgColor={s.textColor} bgColor="#ffffff" />
        </div>
      )}
      
      {fullSize && (
        <p style={{ fontFamily: 'var(--fb)', fontSize: 10, color: 'var(--muted)', marginTop: 16, marginBottom: 8, opacity: 0.6, letterSpacing: '0.1em' }}>
          ETHOS 2026 OFFICIAL BADGE
        </p>
      )}
    </div>
  );
});
