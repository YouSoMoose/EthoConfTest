'use client';

export default function Spinner({ white, size = 16 }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      border: `2px solid ${white ? 'rgba(255,255,255,0.3)' : 'var(--border)'}`,
      borderTopColor: white ? '#fff' : 'var(--g)',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      verticalAlign: 'middle',
    }} />
  );
}
