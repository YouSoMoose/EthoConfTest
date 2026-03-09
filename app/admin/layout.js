'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import Avatar from '@/components/Avatar'

const TABS = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/checkin', label: 'Check-in' },
    { path: '/admin/messages', label: 'Messages' },
    { path: '/admin/companies', label: 'Companies' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/schedule', label: 'Schedule' },
    { path: '/admin/raffle', label: 'Raffle' },
]

export default function AdminLayout({ children }) {
    const { profile, signOut } = useAuth()
    const pathname = usePathname()
    const router = useRouter()
    const isSuper = profile?.access_level >= 3

    const visibleTabs = isSuper ? TABS : TABS.filter(t => !['/admin/users', '/admin/raffle'].includes(t.path))

    return (
        <div className="page-wrap">
            <div className="admin-topbar">
                <div className="admin-brand">⚡ EthoConf Admin</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Avatar profile={profile} size={28} />
                    <button className="topbar-action" style={{ fontSize: 11 }} onClick={signOut}>Logout</button>
                </div>
            </div>
            <div className="admin-tab-bar">
                {visibleTabs.map(tab => (
                    <button key={tab.path} className={`admin-tab ${pathname === tab.path ? 'active' : ''}`} onClick={() => router.push(tab.path)}>
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="content-notab" style={{ padding: 16 }}>
                {children}
            </div>
        </div>
    )
}
