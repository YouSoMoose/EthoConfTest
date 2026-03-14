import { useNavigate } from 'react-router-dom'

export default function Topbar({ title, backTo, onBack, actions, children }) {
  const navigate = useNavigate()

  function handleBack() {
    if (onBack) onBack()
    else if (backTo) navigate(backTo)
    else navigate(-1)
  }

  return (
    <div className="topbar">
      {(onBack || backTo) && (
        <button className="topbar-back" onClick={handleBack} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
      )}
      <div className="topbar-title">{title}</div>
      {actions}
      {children}
    </div>
  )
}
