export default function Loader({ fullPage = false }) {
  if (fullPage) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100dvh', flexDirection: 'column', gap: 16,
      }}>
        <div className="loader" />
        <div style={{ fontSize: 13, color: 'var(--sub)' }}>Loading…</div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div className="loader" />
    </div>
  )
}
