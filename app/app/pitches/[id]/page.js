'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { RATING_QUESTIONS } from '@/lib/constants'
import Topbar from '@/components/Topbar'
import Loader from '@/components/Loader'

export default function PitchVotePage() {
    const params = useParams()
    const id = params.id
    const { profile } = useAuth()
    const { showToast } = useToast()
    const supabase = createClient()

    const [company, setCompany] = useState(null)
    const [existingVote, setExistingVote] = useState(null)
    const [ratings, setRatings] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        Promise.all([
            supabase.from('companies').select('*').eq('id', id).single(),
            supabase.from('votes').select('*').eq('company_id', id).eq('voter_id', profile.id).maybeSingle(),
        ]).then(([{ data: c }, { data: v }]) => {
            setCompany(c)
            if (v) { setExistingVote(v); setRatings(v.ratings || {}) }
            setLoading(false)
        })
    }, [id, profile.id])

    async function submit() {
        if (RATING_QUESTIONS.some(q => !ratings[q.key])) {
            showToast('Please rate all 4 categories')
            return
        }
        setSaving(true)
        const payload = { company_id: id, voter_id: profile.id, ratings }
        if (existingVote) {
            await supabase.from('votes').update({ ratings }).eq('id', existingVote.id)
        } else {
            await supabase.from('votes').insert({ ...payload, created_at: new Date().toISOString() })
        }
        setSaving(false)
        showToast('Vote saved ✓')
        window.history.back()
    }

    if (loading || !company) return <Loader fullPage />

    return (
        <>
            <Topbar title={company.name} backTo="/app/pitches" />
            <div className="content">
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-title">{company.name}</div>
                    <div className="card-sub">{company.industry}{company.presenter_name ? ` · by ${company.presenter_name}` : ''}</div>
                    {company.description && (<div style={{ marginTop: 8, fontSize: 13, color: 'var(--sub)', lineHeight: 1.6 }}>{company.description}</div>)}
                    {company.resume_url && (<a href={company.resume_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: 'var(--accent)' }}>📎 View Deck / Resume</a>)}
                </div>
                {existingVote && (
                    <div className="card accent" style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, color: 'var(--accent)' }}>✓ You&apos;ve already voted — update your ratings below.</div>
                    </div>
                )}
                {RATING_QUESTIONS.map(q => (
                    <div key={q.key} style={{ marginBottom: 28 }}>
                        <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{q.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 10 }}>{q.desc}</div>
                        <div className="rating-row">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <div key={n} className={`rdot ${ratings[q.key] === n ? 'sel' : ''}`} onClick={() => setRatings(r => ({ ...r, [q.key]: n }))}>{n}</div>
                            ))}
                            {ratings[q.key] && (<div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 22, color: 'var(--accent)', marginLeft: 8 }}>{ratings[q.key]}/10</div>)}
                        </div>
                    </div>
                ))}
                <button className="btn btn-accent btn-full" onClick={submit} disabled={saving}>
                    {saving ? 'Saving…' : existingVote ? 'Update Vote' : 'Submit Ratings'}
                </button>
            </div>
        </>
    )
}
