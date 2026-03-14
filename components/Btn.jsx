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

  return (
    <button
      {...props}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
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
        transition: 'transform .1s, opacity .2s',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
