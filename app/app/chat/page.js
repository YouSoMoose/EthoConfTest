'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { timeAgo, hasBadWords } from '@/lib/utils'
import Topbar from '@/components/Topbar'

export default function ChatPage() {
    const { profile } = useAuth()
    const { showToast } = useToast()
    const supabase = createClient()
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const bottomRef = useRef(null)
    const lastSentAt = useRef(0)
    const textareaRef = useRef(null)

    useEffect(() => {
        load()
        const ch = supabase.channel('chat-updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, load)
            .subscribe()
        return () => supabase.removeChannel(ch)
    }, [])

    async function load() {
        const { data } = await supabase.from('messages').select('*')
            .or(`to_user_id.eq.${profile.id},from_user_id.eq.${profile.id},to_user_id.eq.broadcast`)
            .order('created_at')
        setMessages(data || [])
        await supabase.from('messages').update({ read: true }).eq('to_user_id', profile.id).eq('read', false)
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
    }

    async function send() {
        const body = input.trim()
        if (!body || sending) return
        if (hasBadWords(body)) { showToast('Please keep messages respectful 🙏'); return }
        const now = Date.now()
        if (now - lastSentAt.current < 2500) { showToast('Slow down a bit!'); return }
        const recentMine = messages.filter(m => m.from_user_id === profile.id && Date.now() - new Date(m.created_at).getTime() < 3600000)
        if (recentMine.length >= 10) { showToast('Message limit reached — please wait a bit'); return }
        setSending(true)
        lastSentAt.current = now
        await supabase.from('messages').insert({ from_user_id: profile.id, from_name: profile.full_name, from_email: profile.email, to_user_id: 'admin', body, read: false, created_at: new Date().toISOString() })
        setInput('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
        setSending(false)
        load()
    }

    const chatItems = messages.filter(m => m.to_user_id === profile.id || m.from_user_id === profile.id || m.to_user_id === 'broadcast')

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
            <Topbar title="Chat with Staff" onBack={() => window.history.back()} />
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {chatItems.length === 0 && (<div className="empty"><div className="empty-ico">💬</div><div className="empty-txt">Ask us anything! We&apos;re here to help.</div></div>)}
                {chatItems.map(m => {
                    const isMe = m.from_user_id === profile.id
                    const isBroadcast = m.to_user_id === 'broadcast'
                    return (
                        <div key={m.id}>
                            <div className={`bubble-wrap ${isMe ? 'me' : 'them'}`}>
                                {(isBroadcast || !isMe) && <div className="bubble-name">{isBroadcast ? '📣 Ethos Staff' : m.from_name || 'Staff'}</div>}
                                <div className={`bubble ${isMe ? 'me' : 'them'}`}>{m.body}</div>
                                <div className="bubble-time">{timeAgo(m.created_at)}</div>
                            </div>
                            {m.admin_reply && (
                                <div className="bubble-wrap them" style={{ marginTop: 2 }}>
                                    <div className="bubble-name">Staff Reply</div>
                                    <div className="bubble them">{m.admin_reply}</div>
                                    <div className="bubble-time">{timeAgo(m.replied_at)}</div>
                                </div>
                            )}
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>
            <div style={{ padding: '10px 16px max(16px, env(safe-area-inset-bottom))', background: 'var(--s1)', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea ref={textareaRef} className="form-input" style={{ flex: 1, resize: 'none', minHeight: 44, maxHeight: 120, padding: '10px 12px', fontSize: 14 }} placeholder="Message…" value={input} onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
                <button className="btn btn-accent btn-sm" onClick={send} disabled={sending || !input.trim()}>Send</button>
            </div>
        </div>
    )
}
