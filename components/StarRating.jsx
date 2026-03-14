'use client';

import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readonly, size = 22, label }) {
  const [hover, setHover] = useState(0);

  return (
    <div>
      {label && (
        <span style={{
          fontFamily: 'var(--fb)',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--sub)',
          display: 'block',
          marginBottom: 4,
        }}>
          {label}
        </span>
      )}
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            style={{
              fontSize: size,
              cursor: readonly ? 'default' : 'pointer',
              transition: 'transform 0.1s',
              transform: hover === star ? 'scale(1.2)' : 'scale(1)',
              filter: (hover || value) >= star ? 'none' : 'grayscale(1) opacity(0.3)',
            }}
          >
            ⭐
          </span>
        ))}
      </div>
    </div>
  );
}
