'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import Topbar from '@/components/Topbar'

export default function ScanPage() {
    const { profile } = useAuth()
    const { showToast } = useToast()
    const supabase = createClient()
    const [code, setCode] = useState('')
    const [result, setResult] = useState(null)
    const [scanning, setScanning] = useState(false)

    async function process() {
        const raw = code.trim()
        if (!raw) return
        setScanning(true)
        setResult(null)
        try {
            if (raw.startsWith('BOOTH-')) { await handleBooth(raw.replace('BOOTH-', '')) }
            else if (raw.startsWith('PITCH-')) { setResult({ info: '🏆 Navigate to the Pitch Room and find this company to vote!' }) }
            else { await handleBusinessCard(JSON.parse(raw)) }
        } catch { setResult({ error: '❌ Invalid QR code — try again.' }) }
        setScanning(false)
        setCode('')
    }

    async function handleBooth(companyId) {
        const { data: company } = await supabase.from('companies').select('*').eq('id', companyId).single()
        if (!company) { setResult({ error: '❌ Unknown booth QR code.' }); return }
        const { data: existing } = await supabase.from('passport_stamps').select('id').eq('user_id', profile.id).eq('company_id', companyId).maybeSingle()
        if (existing) { setResult({ info: `Already stamped: ${company.name} ✓` }); return }
        await supabase.from('passport_stamps').insert({ user_id: profile.id, company_id: companyId, room_type: company.room_type, scanned_at: new Date().toISOString() })
        setResult({ success: `🗺️ Stamped: ${company.name}!` })
        showToast('Stamp collected! ✓')
        await checkRaffle()
    }

    async function handleBusinessCard(data) {
        if (!data?.name || !data?.email) throw new Error('invalid')
        const { data: existing } = await supabase.from('collected_cards').select('id').eq('collected_by', profile.id).eq('email', data.email).maybeSingle()
        if (existing) { setResult({ info: `Card already saved: ${data.name}` }); return }
        await supabase.from('collected_cards').insert({ collected_by: profile.id, name: data.name, email: data.email, role: data.role || '', resume: data.resume || '', created_at: new Date().toISOString() })
        setResult({ success: `✅ Card saved: ${data.name}` })
        showToast('Card saved ✓')
    }

    async function checkRaffle() {
        const [{ data: stamps }, { data: votes }, { data: rooms }] = await Promise.all([
            supabase.from('passport_stamps').select('company_id,room_type').eq('user_id', profile.id),
            supabase.from('votes').select('id').eq('voter_id', profile.id).limit(1),
            supabase.from('companies').select('id,room_type').in('room_type', ['poster_room', 'conference_room']),
        ])
        const posterTotal = (rooms || []).filter(r => r.room_type === 'poster_room').length
        const confTotal = (rooms || []).filter(r => r.room_type === 'conference_room').length
        const posterDone = (stamps || []).filter(s => s.room_type === 'poster_room').length
        const confDone = (stamps || []).filter(s => s.room_type === 'conference_room').length
        const voted = (votes || []).length > 0
        if (posterTotal > 0 && posterDone >= posterTotal && confDone >= confTotal && voted) {
            await supabase.from('raffle_entries').upsert({ user_id: profile.id, email: profile.email, name: profile.full_name, entered_at: new Date().toISOString() }, { onConflict: 'user_id' })
        }
    }

    const resultColor = result?.error ? 'var(--red)' : result?.success ? 'var(--green)' : 'var(--text)'
    const resultBorder = result?.error ? 'var(--red)' : result?.success ? 'var(--green)' : 'var(--border)'

    return (
        <>
            <Topbar title="Scan QR Code" onBack={() => window.history.back()} />
            <div className="content">
                <div className="card accent" style={{ marginBottom: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                    <div style={{ fontSize: 14, fontFamily: 'var(--fh)', fontWeight: 700, marginBottom: 4 }}>Camera Scan</div>
                    <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.5 }}>Camera scanning requires HTTPS deployment.<br />Use manual paste below during development.</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Paste QR Code Data</label>
                    <textarea className="form-input" rows={4} placeholder={'BOOTH-{id}  or  PITCH-{id}  or  {"name":"Jane","email":"…"}'} value={code} onChange={e => setCode(e.target.value)} />
                </div>
                <button className="btn btn-accent btn-full" onClick={process} disabled={scanning || !code.trim()}>
                    {scanning ? 'Processing…' : 'Process QR Code'}
                </button>
                {result && (
                    <div className="card" style={{ marginTop: 16, borderColor: resultBorder }}>
                        <div style={{ fontSize: 14, color: resultColor }}>{result.error || result.success || result.info}</div>
                    </div>
                )}
            </div>
        </>
    )
}
