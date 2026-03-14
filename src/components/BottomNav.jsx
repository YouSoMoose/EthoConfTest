import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  {
    path: '/app',
    exact: true,
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    path: '/app/schedule',
    label: 'Schedule',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    path: '/app/pitches',
    label: 'Pitches',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ),
  },
  {
    path: '/app/passport',
    label: 'Passport',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    path: '/app/more',
    label: 'More',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    ),
  },
]

export default function BottomNav({ hasUnread }) {
  const navigate  = useNavigate()
  const location  = useLocation()

  function isActive(item) {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.path}
          className={`nav-btn ${isActive(item) ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            {item.icon}
            {item.label === 'More' && hasUnread && <span className="nav-pip" />}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
