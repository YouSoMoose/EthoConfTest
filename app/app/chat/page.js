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
      const res = await fetch('/api/messages?as=attendee');
      if (res.ok) setMessages(await res.json());
    } catch { }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    fetch('/api/messages?as=attendee', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mark_read: true }) }).catch(() => { });
    const iv = setInterval(() => {
      fetchMessages();
      fetch('/api/messages?as=attendee', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mark_read: true }) }).catch(() => { });
    }, 15000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages?as=attendee', {
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
  const level = session?.profile?.access_level || 0;

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 72px)' }}>
      <Topbar title="💬 Chat" />

      {level >= 2 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <span style={{ fontSize: 48, marginBottom: 16 }}>🛠️</span>
          <h2 style={{ fontFamily: 'var(--fhs)', fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>Admin Mode Active</h2>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)', marginBottom: 24, maxWidth: 300, lineHeight: 1.5 }}>
            Staff members use the Admin Dashboard to read and respond to attendee messages.
          </p>
          <a href="/admin/messages" style={{
            background: 'var(--g)', color: '#fff', textDecoration: 'none',
            fontFamily: 'var(--fb)', fontSize: 14, fontWeight: 600,
            padding: '12px 24px', borderRadius: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            Go to Admin Messages →
          </a>
        </div>
      ) : (
        <>
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
            padding: '12px 16px',
            paddingBottom: 16,
            background: 'transparent',
          }}>
            <form onSubmit={handleSend} style={{
              display: 'flex', gap: 8, maxWidth: 500, margin: '0 auto',
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 24,
              padding: '6px 6px 6px 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Message..."
                disabled={sending}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  fontSize: 15,
                  fontFamily: 'var(--fb)',
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
              <button type="submit" disabled={sending || !newMessage.trim()} style={{
                background: 'var(--g)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontFamily: 'var(--fb)',
                fontWeight: 700,
                fontSize: 18,
                paddingBottom: 2,
                opacity: (sending || !newMessage.trim()) ? 0.5 : 1,
                flexShrink: 0,
              }}>
                ↑
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
