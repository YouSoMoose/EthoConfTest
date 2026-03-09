'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/providers/ToastProvider'
import { timeAgo, strColor, initials } from '@/lib/utils'
import Modal from '@/components/Modal'
import Loader from '@/components/Loader'

export default function AdminMessages() {
    const supabase = createClient()
    const { showToast } = useToast()
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [reply, setReply] = useState('')
    const [broadcast, setBroadcast] = useState('')
    const [showBcast, setShowBcast] = useState(false)

    useEffect(() => { load() }, [])

    async function load() {
        const { data } = await supabase.from('messages').select('*').eq('to_user_id', 'admin').order('created_at', { ascending: false })
        setMessages(data || [])
        setLoading(false)
    }

    async function sendReply() {
        if (!reply.trim() || !selected) return
        await supabase.from('messages').update({ admin_reply: reply, replied_at: new Date().toISOString(), read: true }).eq('id', selected.id)
        await supabase.from('messages').insert({ from_user_id: 'admin', from_name: 'Ethos Staff', to_user_id: selected.from_user_id, body: reply, read: false, created_at: new Date().toISOString() })
        showToast('Reply sent ✓')
        setReply('')
        setSelected(null)
        load()
    }

    async function sendBroadcast() {
        if (!broadcast.trim()) return
        await supabase.from('messages').insert({ from_user_id: 'admin', from_name: 'Ethos Staff', to_user_id: 'broadcast', body: broadcast, read: false, created_at: new Date().toISOString() })
        showToast('Broadcast sent ✓')
        setBroadcast('')
        setShowBcast(false)
    }

    async function markRead(msg) {
        await supabase.from('messages').update({ read: true }).eq('id', msg.id)
        setMessages(m => m.map(x => x.id === msg.id ? { ...x, read: true } : x))
    }

    return (
        <div className="anim-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 18 }}>Messages</div>
                <button className="btn btn-accent btn-sm" onClick={() => setShowBcast(true)}>📣 Broadcast</button>
            </div>
            {loading && <Loader />}
            {!loading && messages.length === 0 && (<div className="empty"><div className="empty-ico">💬</div><div className="empty-txt">No messages yet.</div></div>)}
            {messages.map(m => (
                <div key={m.id} className={`msg-card ${!m.read ? 'unread' : ''}`} onClick={() => { markRead(m); setSelected(m); setReply(m.admin_reply || '') }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: strColor(m.from_name || ''), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'var(--fh)', flexShrink: 0 }}>{initials(m.from_name)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                                <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 13 }}>{m.from_name}</div>
                                <div style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{timeAgo(m.created_at)}</div>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.body}</div>
                            {m.admin_reply && <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>✓ Replied</div>}
                        </div>
                    </div>
                </div>
            ))}
            <Modal open={!!selected} onClose={() => setSelected(null)} title="Reply">
                {selected && (
                    <>
                        <div className="card" style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{selected.from_name} · {selected.from_email}</div>
                            <div style={{ fontSize: 14 }}>{selected.body}</div>
                        </div>
                        <div className="form-group"><textarea className="form-input" rows={3} placeholder="Type your reply…" value={reply} onChange={e => setReply(e.target.value)} /></div>
                        <button className="btn btn-accent btn-full" onClick={sendReply} disabled={!reply.trim()}>Send Reply</button>
                    </>
                )}
            </Modal>
            <Modal open={showBcast} onClose={() => setShowBcast(false)} title="📣 Broadcast">
                <div className="form-group"><textarea className="form-input" rows={3} placeholder="Type announcement…" value={broadcast} onChange={e => setBroadcast(e.target.value)} /></div>
                <button className="btn btn-accent btn-full" onClick={sendBroadcast} disabled={!broadcast.trim()}>Send to All</button>
            </Modal>
        </div>
    )
}
