'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AlertTriangle } from 'lucide-react';

export default function AdminResetPage() {
  const [qrSize, setQrSize] = useState(160);

  return (
    <div className="page-enter" style={{ padding: '24px 16px', height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: 600, width: '100%', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 22, color: '#EF4444', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={24} /> Hard Reset Tool
        </h2>

        {/* Hard Reset QR */}
        <div style={{
          background: 'var(--as2)', border: '2px solid rgba(239, 68, 68, 0.4)', borderRadius: 16,
          padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
          textAlign: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: '#EF4444' }} />
          
          <h3 style={{ fontFamily: 'var(--fhs)', margin: 0, color: 'var(--atext)', fontSize: 24 }}>
            Failsafe Protocol
          </h3>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 15, color: 'var(--asub)', margin: 0, lineHeight: 1.6, maxWidth: 450 }}>
            If an attendee's device is completely frozen, experiencing a blank screen, or receiving the HTTP 431 Request Header Too Large error due to corrupted cookies.
          </p>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px 16px', borderRadius: 12, color: '#EF4444', fontFamily: 'var(--fb)', fontSize: 13, fontWeight: 600 }}>
            Have them scan this code to securely wipe all local data and cookies.
          </div>
          
          <div 
            onClick={() => setQrSize(qrSize === 160 ? 320 : 160)}
            style={{ 
              background: '#fff', padding: 16, borderRadius: 16, cursor: 'pointer',
              transition: 'all 0.3s ease', boxShadow: '0 8px 32px rgba(239,68,68,0.2)'
            }}
            title="Click to enlarge"
          >
            <QRCodeSVG value="https://app.ethossustainability.org/reset" size={qrSize} level="H" />
          </div>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--amuted)', marginTop: -8 }}>Tap QR code to dramatically enlarge</p>
        </div>
      </div>
    </div>
  );
}
