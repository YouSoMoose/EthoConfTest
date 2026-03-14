'use client';

import { ACCESS_LABELS, ACCESS_COLORS } from '@/lib/constants';

export default function RoleChip({ level }) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-body mt-2 ${ACCESS_COLORS[level] || 'bg-gray-100 text-gray-600'}`}>
      {ACCESS_LABELS[level] || 'Unknown'}
    </span>
  );
}
