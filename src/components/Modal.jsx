export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <span className="modal-handle" />
        {title && <div className="modal-title">{title}</div>}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
