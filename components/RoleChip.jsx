'use client';

import { ACCESS_LABELS, ACCESS_COLORS, ACCESS_COLORS_DARK } from '@/lib/constants';

export default function RoleChip({ level, admin }) {
  const colors = admin ? ACCESS_COLORS_DARK : ACCESS_COLORS;
  const s = colors[level] || { background: '#eee', color: '#666' };

  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      fontFamily: 'var(--fb)',
      background: s.background,
      color: s.color,
    }}>
      {ACCESS_LABELS[level] || 'Unknown'}
    </span>
  );
}
