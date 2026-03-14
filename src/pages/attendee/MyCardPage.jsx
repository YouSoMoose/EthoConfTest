import { useAuth } from '../../hooks/useAuth'
import { strColor } from '../../lib/utils'
import { ACCESS_LEVELS } from '../../lib/constants'
import Topbar from '../../components/Topbar'
import Avatar from '../../components/Avatar'
import RoleChip from '../../components/RoleChip'
import QRCode from '../../components/QRCode'

export default function MyCardPage() {
  const { profile } = useAuth()

  const cardData = JSON.stringify({
    name:   profile?.full_name,
    email:  profile?.email,
    role:   ACCESS_LEVELS[profile?.access_level ?? 0]?.label,
    resume: profile?.resume_url || '',
  })

  return (
    <>
      <Topbar title="My Profile Card" onBack={() => window.history.back()} />
      <div className="content-notab" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, gap: 20 }}>
        {/* Card preview */}
        <div style={{
          background: 'linear-gradient(135deg, var(--s2), var(--s1))',
          border: '1px solid var(--accent-border)', borderRadius: 20,
          padding: 24, width: '100%', maxWidth: 320, textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 100, height: 100, background: 'var(--accent-dim)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />
          <Avatar profile={profile} size={56} onClick={undefined} style={{ margin: '0 auto 12px' }} />
          <div style={{ margin: '0 auto 12px', width: 56, height: 56, borderRadius: '50%', background: strColor(profile?.full_name || ''), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, fontFamily: 'var(--fh)', color: '#fff' }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : (profile?.full_name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
            }
          </div>
          <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{profile?.full_name}</div>
          <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 8 }}>{profile?.email}</div>
          <RoleChip level={profile?.access_level} />
          {profile?.resume_url && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--accent)' }}>📎 Resume attached</div>
          )}
        </div>

        <QRCode value={cardData} size={200} />

        <div style={{ fontSize: 13, color: 'var(--sub)', textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
          Others can scan this QR to save your contact info and resume link. Update your resume in Profile settings.
        </div>
      </div>
    </>
  )
}
