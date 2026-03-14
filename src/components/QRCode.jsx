import { useEffect, useRef } from 'react'
import QRCodeLib from 'qrcode'

export default function QRCode({ value, size = 180 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return
    QRCodeLib.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })
  }, [value, size])

  return (
    <div className="qr-wrap">
      <canvas ref={canvasRef} />
    </div>
  )
}
