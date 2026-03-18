import { Search } from 'lucide-react';

export default function Empty({ icon = <Search size={48} />, text = 'Nothing here yet', admin }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
    }}>
      <span style={{ fontSize: 48, marginBottom: 12 }}>{icon}</span>
      <p style={{
        fontFamily: 'var(--fb)',
        fontSize: 14,
        color: admin ? 'var(--amuted)' : 'var(--muted)',
      }}>
        {text}
      </p>
    </div>
  );
}
