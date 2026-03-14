'use client';

import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readonly = false, size = 24 }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          style={{ fontSize: size }}
        >
          <span className={`${(hover || value) >= star ? 'text-amber-400' : 'text-gray-300'}`}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
