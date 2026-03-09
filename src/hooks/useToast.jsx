import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [msg, setMsg]   = useState('')
  const [show, setShow] = useState(false)
  const [timer, setTimer] = useState(null)

  const showToast = useCallback((message) => {
    if (timer) clearTimeout(timer)
    setMsg(message)
    setShow(true)
    const t = setTimeout(() => setShow(false), 2400)
    setTimer(t)
  }, [timer])

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 'max(90px, calc(env(safe-area-inset-bottom) + 80px))',
          left: '50%',
          transform: `translateX(-50%) translateY(${show ? '0' : '20px'})`,
          background: 'var(--s3)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          padding: '10px 20px',
          borderRadius: 100,
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'var(--fh)',
          zIndex: 9999,
          opacity: show ? 1 : 0,
          transition: 'all 0.22s ease',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          maxWidth: 'calc(100vw - 40px)',
          textAlign: 'center',
        }}
      >
        {msg}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}
