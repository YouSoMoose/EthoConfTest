'use client';

import { useState } from 'react';

export default function FormInput({ label, admin, style, ...props }) {
  const [focused, setFocused] = useState(false);

  const bg = admin ? 'var(--as2)' : 'var(--white)';
  const border = admin ? 'var(--aborder)' : 'var(--border)';
  const focusBorder = admin ? 'var(--accent)' : 'var(--g)';
  const textColor = admin ? 'var(--atext)' : 'var(--text)';
  const labelColor = admin ? 'var(--asub)' : 'var(--sub)';

  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && (
        <label style={{
          display: 'block',
          fontFamily: 'var(--fb)',
          fontSize: 13,
          fontWeight: 500,
          color: labelColor,
          marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      {props.type === 'textarea' ? (
        <textarea
          {...props}
          type={undefined}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          style={{
            width: '100%',
            background: bg,
            border: `1.5px solid ${focused ? focusBorder : border}`,
            borderRadius: 10,
            padding: '11px 14px',
            fontSize: 14,
            fontFamily: 'var(--fb)',
            color: textColor,
            outline: 'none',
            transition: 'border-color 0.2s',
            resize: 'vertical',
            minHeight: 90,
          }}
        />
      ) : (
        <input
          {...props}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          style={{
            width: '100%',
            background: bg,
            border: `1.5px solid ${focused ? focusBorder : border}`,
            borderRadius: 10,
            padding: '11px 14px',
            fontSize: 14,
            fontFamily: 'var(--fb)',
            color: textColor,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
      )}
    </div>
  );
}
