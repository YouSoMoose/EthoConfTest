'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Avatar from '@/components/Avatar';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) setMessages(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    fetch('/api/messages', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mark_read: true }) }).catch(() => {});
    const iv = setInterval(() => {
      fetchMessages();
      fetch('/api/messages', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mark_read: true }) }).catch(() => {});
    }, 15000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (res.ok) { const msg = await res.json(); setMessages(p => [...p, msg]); setNewMessage(''); }
      else { const e = await res.json(); toast.error(e.error || 'Failed to send'); }
    } catch { toast.error('Network error'); }
    setSending(false);
  };

  if (loading) return <Loader />;
  const myId = session?.profile?.id;

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 72px)' }}>
      <Topbar title="💬 Chat" />

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px', maxWidth: 500, margin: '0 auto', width: '100%' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>💬</span>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 14 }}>No messages yet. Say hello!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map(msg => {
              const isMe = msg.sender_id === myId;
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 8, maxWidth: '80%', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                    <Avatar src={isMe ? session?.profile?.avatar : msg.sender?.avatar} name={isMe ? session?.profile?.name : msg.sender?.name} size={28} />
                    <div style={{
                      borderRadius: 16,
                      padding: '10px 14px',
                      fontSize: 14,
                      fontFamily: 'var(--fb)',
                      ...(isMe
                        ? { background: 'var(--g)', color: '#fff', borderBottomRightRadius: 4 }
                        : { background: 'var(--white)', border: '1px solid var(--border)', borderBottomLeftRadius: 4, color: 'var(--text)' }
                      ),
                    }}>
                      <p style={{ margin: 0 }}>{msg.content}</p>
                      <p style={{ fontSize: 10, marginTop: 4, opacity: 0.6, margin: 0 }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--white)',
        padding: '12px 16px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, maxWidth: 500, margin: '0 auto' }}>
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            style={{
              flex: 1,
              background: 'var(--s1)',
              border: '1.5px solid var(--border)',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 14,
              fontFamily: 'var(--fb)',
              color: 'var(--text)',
              outline: 'none',
            }}
          />
          <button type="submit" disabled={sending || !newMessage.trim()} style={{
            background: 'var(--g)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 16px',
            cursor: 'pointer',
            fontFamily: 'var(--fb)',
            fontWeight: 600,
            fontSize: 16,
            opacity: (sending || !newMessage.trim()) ? 0.5 : 1,
          }}>
            →
          </button>
        </form>
      </div>
    </div>
  );
}
