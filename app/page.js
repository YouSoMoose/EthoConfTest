'use client'

import { useRouter } from 'next/navigation'

const FEATURES = [
    { ico: '🗓️', name: 'Schedule', desc: 'Full event agenda' },
    { ico: '🏆', name: 'Pitches', desc: 'Vote on startups' },
    { ico: '🗺️', name: 'Passport', desc: 'Track your journey' },
    { ico: '📝', name: 'Notes', desc: 'Keynote notes' },
    { ico: '💬', name: 'Chat', desc: 'Message staff' },
    { ico: '💼', name: 'Wallet', desc: 'Collect company cards' },
]

export default function DemoLanding() {
    const router = useRouter()

    return (
        <div style={{
            minHeight: '100dvh',
            background: 'radial-gradient(ellipse at 50% -20%, #1a0a00 0%, var(--bg) 55%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '40px 24px 48px', overflowY: 'auto',
        }}>
            <div style={{ maxWidth: 420, width: '100%' }}>
                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 64, height: 64, background: 'var(--accent)', borderRadius: 18,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 28, color: '#111',
                        marginBottom: 20, boxShadow: '0 0 80px rgba(252,189,157,.45)',
                    }}>E</div>
                    <div style={{
                        fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 42,
                        lineHeight: 1.05, color: '#fff', marginBottom: 8,
                    }}>
                        Ethos{' '}
                        <span style={{ color: 'var(--accent)', fontWeight: 300 }}>2025</span>
                    </div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>
                        The student entrepreneurship conference app.<br />
                        Everything you need, all in one place.
                    </div>
                </div>

                {/* Feature grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 36 }}>
                    {FEATURES.map(f => (
                        <div key={f.name} style={{
                            background: 'var(--s1)', border: '1px solid var(--border)',
                            borderRadius: 14, padding: 16,
                        }}>
                            <div style={{ fontSize: 24, marginBottom: 6 }}>{f.ico}</div>
                            <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{f.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--sub)' }}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                <button
                    className="btn btn-accent btn-full"
                    onClick={() => router.push('/login')}
                    style={{ fontSize: 16, padding: 16, marginBottom: 12 }}
                >
                    Get Started →
                </button>
                <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
                    Sign in with your Google account to continue
                </div>
            </div>
        </div>
    )
}
