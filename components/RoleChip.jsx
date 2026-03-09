'use client'

import { ACCESS_LEVELS } from '@/lib/constants'

export default function RoleChip({ level }) {
    const info = ACCESS_LEVELS[level ?? 0]
    return (
        <span className={`role-chip ${info?.chip}`}>
            {info?.label}
        </span>
    )
}
