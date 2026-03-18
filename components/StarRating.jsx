'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

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
            <Star
              size={size}
              fill={(hover || value) >= star ? 'var(--accent)' : 'none'}
              color={(hover || value) >= star ? 'var(--accent)' : 'var(--amuted)'}
              style={{
                cursor: readonly ? 'default' : 'pointer',
                transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover === star ? 'scale(1.2)' : 'scale(1)',
                opacity: (hover || value) >= star ? 1 : 0.4,
              }}
            />
        ))}
      </div>
    </div>
  );
}
