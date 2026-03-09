'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { strColor, initials } from '@/lib/utils'
import { ACCESS_LEVELS } from '@/lib/constants'
import Topbar from '@/components/Topbar'
import RoleChip from '@/components/RoleChip'

export default function ProfilePage() {
    const { profile, signOut, setProfile } = useAuth()
    const { showToast } = useToast()
    const supabase = createClient()
    const [resumeUrl, setResumeUrl] = useState(profile?.resume_url || '')
    const [saving, setSaving] = useState(false)

    async function saveResume() {
        setSaving(true)
        await supabase.from('profiles').update({ resume_url: resumeUrl }).eq('id', profile.id)
        setProfile(p => ({ ...p, resume_url: resumeUrl }))
        setSaving(false)
        showToast('Resume link saved ✓')
    }

    const level = profile?.access_level ?? 0

    return (
        <>
            <Topbar title="Profile" onBack={() => window.history.back()} />
            <div className="content">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0 24px', gap: 10 }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: strColor(profile?.full_name || ''), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, fontFamily: 'var(--fh)', color: '#fff', overflow: 'hidden' }}>
                        {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(profile?.full_name)}
                    </div>
                    <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 22 }}>{profile?.full_name}</div>
                    <div style={{ fontSize: 13, color: 'var(--sub)' }}>{profile?.email}</div>
                    <RoleChip level={level} />
                </div>
                <div className="sec">Resume / Portfolio Link</div>
                <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 12, lineHeight: 1.6 }}>Add a public link to your resume or portfolio. It will be included in your profile QR code so others can scan and view your work.</div>
                <div className="form-group"><input className="form-input" placeholder="https://your-resume-link.com" value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} /></div>
                <button className="btn btn-accent btn-full" onClick={saveResume} disabled={saving}>{saving ? 'Saving…' : 'Save Resume Link'}</button>
                {level >= 1 && (
                    <>
                        <div className="divider" style={{ margin: '24px 0 12px' }}><span>Presenter Info</span></div>
                        <div className="card"><div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.5 }}>Access Level {level} — Presenter features unlocked. You can add and manage your own company in the Pitches section. Contact your event coordinator to update company details.</div></div>
                    </>
                )}
                <button className="btn btn-danger btn-full" style={{ marginTop: 24 }} onClick={signOut}>Sign Out</button>
            </div>
        </>
    )
}
