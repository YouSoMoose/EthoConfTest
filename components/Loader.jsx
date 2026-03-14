'use client';

export default function Loader({ admin }) {
  const bg = admin ? 'var(--abg)' : 'var(--bg)';
  const ringColor = admin ? 'var(--aborder)' : 'var(--border)';
  const spinColor = admin ? 'var(--accent)' : 'var(--g)';
  const textColor = admin ? 'var(--amuted)' : 'var(--muted)';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      background: bg,
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: `3px solid ${ringColor}`,
        borderTopColor: spinColor,
        animation: 'spin 0.7s linear infinite',
      }} />
      <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: textColor }}>Loading…</p>
    </div>
  );
}
