'use client';

import { useEffect, useState } from 'react';

export default function Modal({ open, onClose, title, subtitle, admin, children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open) return null;

  const bg = admin ? 'var(--as2)' : 'var(--white)';
  const border = admin ? 'var(--aborder)' : 'var(--border)';
  const textColor = admin ? 'var(--atext)' : 'var(--text)';
  const subColor = admin ? 'var(--asub)' : 'var(--sub)';
  const handleColor = admin ? 'var(--aborder)' : 'var(--border)';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.2s' }}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-sheet"
        style={{
          background: bg,
          borderTop: `1px solid ${border}`,
          padding: '16px 20px 32px',
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
          paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, background: handleColor, borderRadius: 4, margin: '0 auto 20px' }} />

        {title && (
          <h2 style={{
            fontFamily: admin ? 'var(--fhs)' : 'var(--fh)',
            fontWeight: 700,
            fontSize: 20,
            color: textColor,
            marginBottom: subtitle ? 4 : 16,
          }}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: subColor, marginBottom: 16 }}>
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
