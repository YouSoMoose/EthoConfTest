'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Avatar from '@/components/Avatar';
import Loader from '@/components/Loader';
import FormInput from '@/components/FormInput';
import Btn from '@/components/Btn';

export default function AdminMessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetch('/api/messages').then(r => r.json()).then(d => { setMessages(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await fetch(`/api/messages?id=${id}`, { method: 'DELETE' });
    setMessages(p => p.filter(m => m.id !== id));
    toast.success('Deleted');
  };

  const handleReply = async (userId) => {
    if (!replyContent.trim()) return;
    const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: replyContent.trim(), recipient_id: userId }) });
    if (res.ok) { const msg = await res.json(); setMessages(p => [...p, msg]); setReplyContent(''); setReplyTo(null); toast.success('Sent'); }
  };

  if (loading) return <Loader admin />;

  const convos = {};
  messages.forEach(m => {
    const oid = m.sender_id === session?.profile?.id ? m.recipient_id : m.sender_id;
    const other = m.sender_id === session?.profile?.id ? m.recipient : m.sender;
    if (!convos[oid]) convos[oid] = { user: other, messages: [] };
    convos[oid].messages.push(m);
  });

  return (
    <div className="page-enter" style={{ padding: '24px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 22, color: 'var(--atext)', marginBottom: 20 }}>
          💬 Messages
        </h2>

        {Object.keys(convos).length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--amuted)' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>💬</span>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 14 }}>No messages yet</p>
          </div>
        ) : (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(convos).map(([uid, conv]) => (
              <div key={uid} style={{
                background: 'var(--as2)', border: '1px solid var(--aborder)', borderRadius: 'var(--r)', padding: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--aborder)' }}>
                  <Avatar src={conv.user?.avatar} name={conv.user?.name} size={32} />
                  <div>
                    <h3 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 14, color: 'var(--atext)' }}>{conv.user?.name || 'Unknown'}</h3>
                    <p style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--amuted)' }}>{conv.user?.email}</p>
                  </div>
                </div>

                <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {conv.messages.map(m => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontFamily: 'var(--fb)', fontWeight: 600, color: 'var(--accent)' }}>{m.sender?.name}: </span>
                        <span style={{ fontFamily: 'var(--fb)', color: 'var(--asub)' }}>{m.content}</span>
                        <span style={{ fontSize: 10, color: 'var(--amuted)', marginLeft: 6 }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button onClick={() => handleDelete(m.id)} style={{
                        background: 'none', border: 'none', color: 'var(--amuted)', cursor: 'pointer', fontSize: 12, flexShrink: 0,
                      }}>🗑️</button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--aborder)' }}>
                  <input
                    type="text"
                    value={replyTo === uid ? replyContent : ''}
                    onChange={e => { setReplyTo(uid); setReplyContent(e.target.value); }}
                    onFocus={() => setReplyTo(uid)}
                    placeholder="Reply..."
                    style={{
                      flex: 1, background: 'var(--as3)', border: '1px solid var(--aborder)',
                      borderRadius: 8, padding: '8px 12px', fontSize: 13,
                      fontFamily: 'var(--fb)', color: 'var(--atext)', outline: 'none',
                    }}
                  />
                  <Btn variant="accent" sm onClick={() => handleReply(uid)}>Send</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
