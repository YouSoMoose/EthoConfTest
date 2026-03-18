'use client';

import { useState } from 'react';

const variants = {
  green: {
    background: 'var(--g)',
    color: '#ffffff',
    border: 'none',
    fontFamily: 'var(--fh)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--text)',
    border: '1.5px solid var(--border)',
    fontFamily: 'var(--fb)',
  },
  danger: {
    background: 'transparent',
    color: '#c33',
    border: '1.5px solid #e44',
    fontFamily: 'var(--fb)',
  },
  accent: {
    background: 'var(--accent)',
    color: 'var(--abg)',
    border: 'none',
    fontFamily: 'var(--fhs)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--sub)',
    border: 'none',
    fontFamily: 'var(--fb)',
  },
  adanger: {
    background: 'transparent',
    color: 'var(--ared)',
    border: '1.5px solid var(--ared)',
    fontFamily: 'var(--fb)',
  },
};

export default function Btn({ variant = 'green', sm, children, style, disabled, ...props }) {
  const [pressed, setPressed] = useState(false);
  const v = variants[variant] || variants.green;
  const isAccent = variant === 'accent';

  return (
    <button
      {...props}
      disabled={disabled}
      onMouseDown={e => {
        setPressed(true);
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(0.92)';
        }
      }}
      onMouseUp={e => {
        setPressed(false);
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.03) translateY(-2px)';
        }
      }}
      onMouseLeave={e => {
        setPressed(false);
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = isAccent ? '0 8px 20px rgba(252, 189, 157, 0.2)' : '0 4px 12px rgba(0,0,0,0.1)';
        }
      }}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onMouseOver={e => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.03) translateY(-2px)';
          e.currentTarget.style.boxShadow = isAccent ? '0 12px 28px rgba(252, 189, 157, 0.3)' : '0 8px 20px rgba(0,0,0,0.15)';
        }
      }}
      onMouseOut={e => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = isAccent ? '0 8px 20px rgba(252, 189, 157, 0.2)' : '0 4px 12px rgba(0,0,0,0.1)';
        }
      }}
      style={{
        ...v,
        borderRadius: 11,
        padding: sm ? '8px 14px' : '11px 20px',
        fontSize: sm ? 13 : 14,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: sm ? 'auto' : '100%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'all 0.4s var(--liquid)',
        transform: pressed ? 'scale(0.92)' : 'scale(1)',
        boxShadow: isAccent ? '0 8px 20px rgba(252, 189, 157, 0.2)' : '0 4px 12px rgba(0,0,0,0.1)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
