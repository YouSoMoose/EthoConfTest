import { useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { timeAgo, hasBadWords } from '../../lib/utils'
import Modal from '../../components/Modal'
import Loader from '../../components/Loader'

export default function AdminMessages() {
  const { profile } = useAuth()
  const { showToast } = useToast()
  const [messages,     setMessages]     = useState([])
  const [selected,     setSelected]     = useState(null)
  const [reply,        setReply]        = useState('')
  const [sending,      setSending]      = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [broadModal,   setBroadModal]   = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState('')

  useEffect(() => {
    load()
    const ch = sb.channel('admin-msgs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, load)
      .subscribe()
    return () => sb.removeChannel(ch)
  }, [])

  async function load() {
    const { data } = await sb.from('messages').select('*')
      .neq('to_user_id', 'broadcast').order('created_at', { ascending: false })
    setMessages(data || [])
    setLoading(false)
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return
    if (hasBadWords(reply)) { showToast('Keep messages professional'); return }
    setSending(true)
    await sb.from('messages').update({ admin_reply: reply, replied_at: new Date().toISOString(), read: true }).eq('id', selected.id)
    await sb.from('messages').insert({
      from_user_id: profile.id,
      from_name:    profile.full_name + ' (Staff)',
      from_email:   profile.email,
      to_user_id:   selected.from_user_id,
      body:         reply,
      read:         false,
      created_at:   new Date().toISOString(),
    })
    setReply('')
    setSending(false)
    setSelected(null)
    showToast('Reply sent ✓')
    load()
  }

  async function sendBroadcast() {
    if (!broadcastMsg.trim()) return
    if (hasBadWords(broadcastMsg)) { showToast('Keep messages professional'); return }
    await sb.from('messages').insert({
      from_user_id: profile.id,
      from_name:    profile.full_name + ' (Staff)',
      from_email:   profile.email,
      to_user_id:   'broadcast',
      body:         broadcastMsg,
      read:         true,
      created_at:   new Date().toISOString(),
    })
    setBroadcastMsg('')
    setBroadModal(false)
    showToast('Broadcast sent ✓')
  }

  const unreadCount = messages.filter(m => !m.read).length

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '16px 16px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          Messages
          {unreadCount > 0 && <span className="badge badge-red">{unreadCount}</span>}
        </div>
        <button className="btn btn-sm btn-accent" onClick={() => setBroadModal(true)}>📣 Broadcast</button>
      </div>

      {loading && <Loader />}

      {messages.map(m => (
        <div key={m.id} className={`msg-card ${!m.read ? 'unread' : ''}`} onClick={() => setSelected(m)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 14 }}>
              {m.from_name || m.from_email}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{timeAgo(m.created_at)}</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {m.body}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {!m.read     && <span className="badge badge-accent">New</span>}
            {m.admin_reply && <span className="badge badge-green">Replied</span>}
          </div>
        </div>
      ))}

      {!loading && messages.length === 0 && (
        <div className="empty"><div className="empty-ico">💬</div><div className="empty-txt">No messages yet</div></div>
      )}

      {/* Reply modal */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setReply('') }} title="Reply to Message">
        {selected && (
          <>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, marginBottom: 4 }}>{selected.from_name}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 8 }}>
                {selected.from_email} · {timeAgo(selected.created_at)}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>{selected.body}</div>
            </div>
            {selected.admin_reply && (
              <div className="card accent" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 4 }}>Your previous reply:</div>
                <div style={{ fontSize: 13 }}>{selected.admin_reply}</div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Reply</label>
              <textarea className="form-input" rows={3} placeholder="Type your reply…" value={reply} onChange={e => setReply(e.target.value)} />
            </div>
            <button className="btn btn-accent btn-full" onClick={sendReply} disabled={sending}>
              {sending ? 'Sending…' : 'Send Reply'}
            </button>
            <div style={{ height: 16 }} />
          </>
        )}
      </Modal>

      {/* Broadcast modal */}
      <Modal open={broadModal} onClose={() => setBroadModal(false)} title="Broadcast to All Attendees">
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea className="form-input" rows={4} placeholder="Announcement message…" value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} />
        </div>
        <button className="btn btn-accent btn-full" onClick={sendBroadcast}>Send Broadcast</button>
        <div style={{ height: 16 }} />
      </Modal>
    </div>
  )
}
