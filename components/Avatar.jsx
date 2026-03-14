'use client';

export default function Avatar({ src, name, size = 40 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || ''}
        referrerPolicy="no-referrer"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'var(--gl)',
      color: 'var(--g)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--fh)',
      fontWeight: 700,
      fontSize: size * 0.4,
      flexShrink: 0,
    }}>
      {initial}
    </div>
  );
}
