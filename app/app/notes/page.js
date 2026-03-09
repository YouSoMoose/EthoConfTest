'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { timeAgo } from '@/lib/utils'
import Topbar from '@/components/Topbar'
import Loader from '@/components/Loader'

export default function NotesPage() {
    const { profile } = useAuth()
    const { showToast } = useToast()
    const router = useRouter()
    const supabase = createClient()
    const [notes, setNotes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.from('notes').select('*').eq('user_id', profile?.id).order('updated_at', { ascending: false })
            .then(({ data }) => { setNotes(data || []); setLoading(false) })
    }, [profile?.id])

    async function deleteNote(id, e) {
        e.stopPropagation()
        if (!confirm('Delete this note?')) return
        await supabase.from('notes').delete().eq('id', id)
        setNotes(n => n.filter(x => x.id !== id))
        showToast('Note deleted')
    }

    return (
        <>
            <Topbar title="Notes" backTo="/app/more" actions={<button className="topbar-action accent" onClick={() => router.push('/app/notes/new')}>+ New</button>} />
            <div className="content">
                {loading && <Loader />}
                {!loading && notes.length === 0 && (<div className="empty"><div className="empty-ico">📝</div><div className="empty-txt">No notes yet — tap + New to start!</div></div>)}
                {notes.map(n => (
                    <div key={n.id} style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 14, marginBottom: 8, cursor: 'pointer' }} onClick={() => router.push(`/app/notes/${n.id}`)}>
                        <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--sub)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.body || 'Empty note'}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{timeAgo(n.updated_at)}</div>
                            <button style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 12, padding: 4 }} onClick={e => deleteNote(n.id, e)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
