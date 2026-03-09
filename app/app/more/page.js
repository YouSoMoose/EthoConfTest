'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import Topbar from '@/components/Topbar'
import Avatar from '@/components/Avatar'
import RoleChip from '@/components/RoleChip'

export default function MorePage() {
    const { profile, signOut } = useAuth()
    const router = useRouter()

    const ITEMS = [
        { ico: '📝', label: 'Notes', desc: 'Keynote & session notes', color: 'ico-y', to: '/app/notes' },
        { ico: '💬', label: 'Chat with Staff', desc: 'Ask questions, get help', color: 'ico-b', to: '/app/chat' },
        { ico: '💼', label: 'Booth Wallet', desc: 'Saved company cards', color: 'ico-g', to: '/app/wallet' },
        { ico: '🪪', label: 'My Profile Card', desc: 'Share your info via QR', color: 'ico-o', to: '/app/my-card' },
        { ico: '📷', label: 'Scan QR Code', desc: 'Scan booth or card QRs', color: 'ico-p', to: '/app/scan' },
        { ico: '👤', label: 'Profile & Settings', desc: 'Account info', color: 'ico-r', to: '/app/profile' },
    ]

    return (
        <>
            <Topbar title="More" actions={<Avatar profile={profile} onClick={() => router.push('/app/profile')} />} />
            <div className="content">
                <div className="card accent" style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Avatar profile={profile} size={48} onClick={() => router.push('/app/profile')} />
                    <div>
                        <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 16 }}>{profile?.full_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--sub)' }}>{profile?.email}</div>
                        <div style={{ marginTop: 4 }}><RoleChip level={profile?.access_level} /></div>
                    </div>
                </div>
                {ITEMS.map(item => (
                    <div key={item.label} className="tile" onClick={() => router.push(item.to)}>
                        <div className={`tile-ico ${item.color}`}>{item.ico}</div>
                        <div className="tile-body">
                            <div className="tile-name">{item.label}</div>
                            <div className="tile-desc">{item.desc}</div>
                        </div>
                        <div className="tile-right"><span style={{ color: 'var(--muted)', fontSize: 18 }}>›</span></div>
                    </div>
                ))}
                <button className="btn btn-danger btn-full" style={{ marginTop: 20 }} onClick={signOut}>Sign Out</button>
            </div>
        </>
    )
}
