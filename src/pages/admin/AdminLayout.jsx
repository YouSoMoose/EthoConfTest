import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../../components/Avatar'
import RoleChip from '../../components/RoleChip'

const NAV = [
  { path: '/admin',          exact: true, label: 'Dashboard', ico: '📊' },
  { path: '/admin/checkin',               label: 'Check-in',  ico: '✅' },
  { path: '/admin/messages',              label: 'Messages',  ico: '💬' },
  { path: '/admin/companies', level: 3,   label: 'Companies', ico: '🏢' },
  { path: '/admin/users',     level: 3,   label: 'Users',     ico: '👥' },
  { path: '/admin/schedule',  level: 3,   label: 'Schedule',  ico: '🗓️' },
  { path: '/admin/raffle',    level: 3,   label: 'Raffle',    ico: '🎟️' },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const level     = profile?.access_level ?? 0

  function isActive(item) {
    return item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  }

  const visibleNav = NAV.filter(n => !n.level || level >= n.level)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Top bar */}
      <div className="admin-topbar">
        <div className="admin-brand">Ethos Admin</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <RoleChip level={level} />
          <Avatar profile={profile} onClick={signOut} title="Sign out" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="admin-tab-bar">
        {visibleNav.map(n => (
          <button
            key={n.path}
            className={`admin-tab ${isActive(n) ? 'active' : ''}`}
            onClick={() => navigate(n.path)}
          >
            {n.ico} {n.label}
          </button>
        ))}
      </div>

      {/* Page content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Outlet />
      </div>
    </div>
  )
}
