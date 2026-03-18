'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, title, subtitle, admin, center, children }) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Drag to close state
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
      setCurrentY(0);
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open || !mounted) return null;

  const handleTouchStart = (e) => {
    if (center) return;
    setStartY(e.touches[0].clientY);
    setDragging(true);
  };

  const handleTouchMove = (e) => {
    if (center || !dragging) return;
    const y = e.touches[0].clientY;
    if (y > startY) {
      setCurrentY(y - startY);
    }
  };

  const handleTouchEnd = () => {
    if (center || !dragging) return;
    setDragging(false);
    if (currentY > 100) {
      onClose();
    } else {
      setCurrentY(0);
    }
  };

  const bg = admin ? 'var(--as2)' : 'var(--white)';
  const border = admin ? 'var(--aborder)' : 'var(--border)';
  const textColor = admin ? 'var(--atext)' : 'var(--text)';
  const subColor = admin ? 'var(--asub)' : 'var(--sub)';
  const handleColor = admin ? 'var(--aborder)' : 'var(--border)';

  const modalContent = (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{ 
        opacity: visible ? 1 : 0, 
        transition: 'opacity 0.2s',
        alignItems: center ? 'center' : 'flex-end',
        padding: center ? 16 : 0,
        background: 'rgba(0, 0, 0, 0.75)', // Darker overlay as requested
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="modal-sheet"
        style={{
          background: bg,
          borderTop: center ? 'none' : `1px solid ${border}`,
          border: center ? `1px solid ${border}` : 'none',
          padding: center ? '24px 24px' : '16px 20px 32px',
          borderRadius: center ? 24 : '20px 20px 0 0',
          transform: dragging
            ? `translateY(${currentY}px)`
            : (visible 
                ? (center ? 'scale(1) translateY(0)' : 'translateY(0)') 
                : (center ? 'scale(0.95) translateY(10px)' : 'translateY(100%)')),
          transition: dragging ? 'none' : 'transform 0.5s var(--liquid)',
          paddingBottom: center ? 24 : 'max(32px, env(safe-area-inset-bottom))',
          boxShadow: center ? '0 20px 40px rgba(0,0,0,0.1)' : 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Drag handle (only for bottom sheets) */}
        {!center && <div style={{ width: 36, height: 4, background: handleColor, borderRadius: 4, margin: '0 auto 20px' }} />}

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
          <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: subColor, marginBottom: center ? 24 : 16 }}>
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
