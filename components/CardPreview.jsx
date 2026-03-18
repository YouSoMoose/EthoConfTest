'use client';

import { memo, useState, useEffect } from 'react';
import Avatar from '@/components/Avatar';
import { QRCodeSVG } from 'qrcode.react';

export const DEFAULT_STYLE = {
  nameSize: 20,    nameX: 0,    nameY: 0,    nameVisible: true,
  roleSize: 13,    roleX: 0,    roleY: 0,    roleVisible: true,
  companySize: 12, companyX: 0, companyY: 0, companyVisible: true,
  emailSize: 10,   emailX: 0,   emailY: 0,   emailVisible: true,
  qrSize: 90,      qrX: 0,      qrY: 0,      qrVisible: true,
  logoSize: 36,    logoX: 0,    logoY: 0,    logoVisible: true,
  accentColor: '#000000',
  textColor: '#000000',
  subColor: '#333333',
};

/**
 * CardPreview
 *
 * Props:
 *   user  — { id, email, name, avatar, role, company }
 *   style — optional partial style overrides (merged with DEFAULT_STYLE)
 *
 * Optional ref-forwarding props for the editor page:
 *   cardRef  — ref attached to the outer card div
 *   domRefs  — { current: {} } ref bag for individual DOM elements
 *             (name, role, company, email, qrWrap, logoWrap, logoBox)
 */
export const CardPreview = memo(function CardPreview({
  user = {},
  style: styleProp,
  cardRef,
  domRefs,
}) {
  const s = { ...DEFAULT_STYLE, ...styleProp };

  // ref helpers — safe whether domRefs is provided or not
  const setRef = (key) => (el) => {
    if (domRefs?.current) domRefs.current[key] = el;
  };

  const qrValue = user?.id || user?.email || 'ethos-placeholder';

  const [logoSrc, setLogoSrc] = useState('/assets/ethos-logo.png');
  useEffect(() => {
    let mounted = true;
    fetch('/assets/ethos-logo.png')
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => { if (mounted) setLogoSrc(reader.result); };
        reader.readAsDataURL(blob);
      }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <div
      ref={cardRef}
      style={{
        background: '#ffffff',
        borderRadius: 24,
        border: '1px solid var(--border)',
        width: 300,
        height: 430,
        padding: '20px 28px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      {/* Decorative corner removed for B&W */}

      {/* ── Top section: logo + avatar + text ── */}
      <div style={{ zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

        {s.logoVisible && (
          <div
            ref={setRef('logoWrap')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
              transform: `translate(${s.logoX || 0}px, ${s.logoY || 0}px)`,
            }}
          >
            <div
              ref={setRef('logoBox')}
              style={{ width: s.logoSize, height: s.logoSize, borderRadius: 8, overflow: 'hidden' }}
            >
              <img
                src={logoSrc}
                alt="Ethos"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
        )}

        <Avatar src={user.avatar} name={user.name} size={80} />

        <div style={{ marginTop: 12, width: '100%' }}>
          {s.nameVisible && (
            <h2
              ref={setRef('name')}
              style={{
                fontFamily: 'var(--fh)',
                fontWeight: 800,
                fontSize: s.nameSize,
                color: s.textColor,
                margin: 0,
                lineHeight: 1.1,
                transform: `translate(${s.nameX}px, ${s.nameY}px)`,
              }}
            >
              {user.name || 'Your Name'}
            </h2>
          )}

          {s.roleVisible && (
            <p
              ref={setRef('role')}
              style={{
                fontFamily: 'var(--fb)',
                fontWeight: 700,
                fontSize: s.roleSize,
                color: s.accentColor,
                margin: '5px 0 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transform: `translate(${s.roleX}px, ${s.roleY}px)`,
              }}
            >
              {user.role || 'Attendee'}
            </p>
          )}

          {s.companyVisible && (
            <p
              ref={setRef('company')}
              style={{
                fontFamily: 'var(--fb)',
                fontWeight: 600,
                fontSize: s.companySize,
                color: s.subColor,
                margin: '3px 0 0',
                transform: `translate(${s.companyX || 0}px, ${s.companyY || 0}px)`,
              }}
            >
              {user.company || 'Ethos Attendee'}
            </p>
          )}

          {s.emailVisible && (
            <p
              ref={setRef('email')}
              style={{
                fontFamily: 'var(--fb)',
                fontSize: s.emailSize,
                color: 'var(--muted)',
                margin: '3px 0 0',
                transform: `translate(${s.emailX || 0}px, ${s.emailY || 0}px)`,
              }}
            >
              {user.email}
            </p>
          )}
        </div>
      </div>

      {/* ── Bottom section: QR + footer ── */}
      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        {s.qrVisible && (
          <div
            ref={setRef('qrWrap')}
            style={{
              background: '#fff',
              padding: 8,
              borderRadius: 12,
              border: `1.5px solid ${s.accentColor}33`,
              display: 'inline-block',
              transform: `translate(${s.qrX}px, ${s.qrY}px)`,
            }}
          >
            <QRCodeSVG
              value={qrValue}
              size={s.qrSize}
              level="M"
              fgColor={s.textColor}
              bgColor="#ffffff"
            />
          </div>
        )}

        <p style={{
          fontFamily: 'var(--fb)',
          fontSize: 9,
          color: 'var(--muted)',
          margin: 0,
          opacity: 0.9,
          letterSpacing: '0.1em',
        }}>
          THE CIRCULAR ECONOMY CONFERENCE OFFICIAL BADGE
        </p>
      </div>
    </div>
  );
});

export default CardPreview;
