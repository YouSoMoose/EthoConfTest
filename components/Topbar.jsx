import { ChevronLeft } from 'lucide-react';

export default function Topbar({ title, onBack, rightEl, admin }) {
  const bg = admin ? 'var(--as1)' : 'var(--white)';
  const borderColor = admin ? 'var(--aborder)' : 'var(--border)';
  const textColor = admin ? 'var(--atext)' : 'var(--text)';
  const font = admin ? 'var(--fhs)' : 'var(--fh)';

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 30,
      background: bg,
      borderBottom: `1px solid ${borderColor}`,
      minHeight: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      paddingTop: 'max(0px, env(safe-area-inset-top))',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onBack && (
          <button
            onClick={onBack}
            className="bubble-click"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: textColor,
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.4s var(--liquid)',
              transform: 'scale(1)',
            }}
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <h1 style={{
          fontFamily: font,
          fontWeight: 700,
          fontSize: 17,
          color: textColor,
        }}>
          {title}
        </h1>
      </div>
      {rightEl && <div>{rightEl}</div>}
    </div>
  );
}
