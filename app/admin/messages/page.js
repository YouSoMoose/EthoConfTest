'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Avatar from '@/components/Avatar';
import Loader from '@/components/Loader';

export default function AdminMessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchData = async () => {
    try {
      const [mRes, uRes] = await Promise.all([
        fetch('/api/messages'),
        fetch('/api/users')
      ]);
      if (mRes.ok) setMessages((await mRes.json()) || []);
      if (uRes.ok) setAllUsers((await uRes.json()) || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 10000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages or selected chat changes
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUserId]);

  const handleDelete = async (id) => {
    await fetch(`/api/messages?id=${id}`, { method: 'DELETE' });
    setMessages(p => p.filter(m => m.id !== id));
    toast.success('Deleted');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedUserId) return;

    const content = replyContent.trim();
    setSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, recipient_id: selectedUserId })
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(p => [...p, msg]);
        setReplyContent('');
      } else {
        toast.error('Failed to send');
      }
    } catch {
      toast.error('Network error');
    }
    setSending(false);
  };

  if (loading) return <Loader admin />;

  // Process unique conversations
  const convos = {};
  messages.forEach(m => {
    const isMe = m.sender_id === session?.profile?.id;
    const otherId = isMe ? m.recipient_id : m.sender_id;
    const otherUser = isMe ? m.recipient : m.sender;

    if (!otherId || !otherUser) return;
    if (!convos[otherId]) convos[otherId] = { user: otherUser, messages: [], highestTime: 0 };

    convos[otherId].messages.push(m);
    const mTime = new Date(m.created_at).getTime();
    if (mTime > convos[otherId].highestTime) convos[otherId].highestTime = mTime;
  });

  // Merge with allUsers to allow messaging anyone
  allUsers.forEach(u => {
    if (u.id === session?.profile?.id) return;
    if (!convos[u.id]) {
      convos[u.id] = { user: u, messages: [], highestTime: 0 };
    }
  });

  // Filter & Sort
  let convoList = Object.entries(convos)
    .sort((a, b) => b[1].highestTime - a[1].highestTime)
    .map(([uid, c]) => ({ uid, ...c }));

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    convoList = convoList.filter(c =>
      c.user?.name?.toLowerCase().includes(q) ||
      c.user?.email?.toLowerCase().includes(q)
    );
  }

  const activeConvo = selectedUserId ? convos[selectedUserId] : null;
  const myAvatar = session?.profile?.avatar;

  return (
    <div className="page-enter" style={{ padding: '0px 0px', height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>

      {/* 2-Column Desktop App Wrapper */}
      <div style={{
        flex: 1,
        display: 'flex',
        background: 'var(--as2)',
        border: '1px solid var(--aborder)',
        borderRadius: 'var(--r)',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      }}>

        {/* Left Column: Contact List */}
        <div className={`chat-list ${selectedUserId ? 'hidden-mobile' : ''}`}>
          <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--aborder)', background: 'var(--as1)' }}>
            <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 20, color: 'var(--atext)', marginBottom: 16 }}>
              Messages
            </h2>
            <div style={{
              background: 'var(--abg)',
              borderRadius: 12,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--aborder)',
            }}>
              <span style={{ fontSize: 14, marginRight: 8, opacity: 0.5 }}>🔍</span>
              <input
                type="text"
                placeholder="Search attendees..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'none', border: 'none', color: 'var(--atext)',
                  fontFamily: 'var(--fb)', fontSize: 13, outline: 'none', width: '100%'
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--as1)' }}>
            {convoList.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--amuted)', fontSize: 13, fontFamily: 'var(--fb)' }}>
                No conversations found.
              </div>
            ) : (
              convoList.map(c => {
                const isActive = selectedUserId === c.uid;
                const lastMsg = c.messages[c.messages.length - 1];
                return (
                  <button
                    key={c.uid}
                    onClick={() => setSelectedUserId(c.uid)}
                    style={{
                      width: '100%', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '16px', background: isActive ? 'var(--ad)' : 'transparent',
                      border: 'none', borderBottom: '1px solid var(--aborder)',
                      textAlign: 'left', cursor: 'pointer', transition: 'background 0.2s',
                    }}
                  >
                    <Avatar src={c.user?.avatar} name={c.user?.name} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 14, color: isActive ? 'var(--accent)' : 'var(--atext)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.user?.name || 'Unknown User'}
                        </h3>
                        <span style={{ fontSize: 10, color: 'var(--amuted)', flexShrink: 0 }}>
                          {lastMsg && new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: isActive ? 'var(--accent)' : 'var(--asub)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: isActive ? 0.8 : 1 }}>
                        {lastMsg?.sender_id === session?.profile?.id ? 'You: ' : ''}{lastMsg?.content}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Pane */}
        <div className={`chat-pane ${!selectedUserId ? 'hidden-mobile' : ''}`}>
          {selectedUserId && activeConvo ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '16px 20px', background: 'var(--as1)', borderBottom: '1px solid var(--aborder)',
                display: 'flex', alignItems: 'center', gap: 12, zIndex: 10,
              }}>
                <button
                  className="mobile-back"
                  onClick={() => setSelectedUserId(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 24, cursor: 'pointer', padding: 0, marginRight: 4, display: 'none' }}
                >
                  ‹
                </button>
                <Avatar src={activeConvo.user?.avatar} name={activeConvo.user?.name} size={36} />
                <div>
                  <h3 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 15, color: 'var(--atext)', margin: 0 }}>{activeConvo.user?.name}</h3>
                  <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--amuted)', margin: 0 }}>{activeConvo.user?.email}</p>
                </div>
              </div>

              {/* Chat History */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--abg)' }}>
                {activeConvo.messages.map(m => {
                  const isMe = m.sender_id === session?.profile?.id;
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', group: 'chat-bubble' }}>
                      <div style={{ display: 'flex', gap: 8, maxWidth: '75%', flexDirection: isMe ? 'row-reverse' : 'row', position: 'relative' }}>
                        <Avatar src={isMe ? myAvatar : m.sender?.avatar} name={isMe ? session?.profile?.name : m.sender?.name} size={28} />
                        <div style={{
                          borderRadius: 16, padding: '10px 14px', fontSize: 14, fontFamily: 'var(--fb)',
                          ...(isMe
                            ? { background: 'var(--accent)', color: '#000', borderBottomRightRadius: 4 }
                            : { background: 'var(--as2)', border: '1px solid var(--aborder)', borderBottomLeftRadius: 4, color: 'var(--atext)' }
                          ),
                        }}>
                          <p style={{ margin: 0 }}>{m.content}</p>
                          <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'space-between', alignItems: 'center', marginTop: 4, gap: 10 }}>
                            {!isMe && (
                              <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', color: 'var(--amuted)', fontSize: 10, cursor: 'pointer', padding: 0 }}>
                                Delete
                              </button>
                            )}
                            <span style={{ fontSize: 10, color: isMe ? 'rgba(0,0,0,0.5)' : 'var(--amuted)' }}>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.5)', fontSize: 10, cursor: 'pointer', padding: 0 }}>
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input Area */}
              <div style={{ padding: '16px 20px', background: 'var(--as1)', borderTop: '1px solid var(--aborder)' }}>
                <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    style={{
                      flex: 1, background: 'var(--abg)', border: '1px solid var(--aborder)',
                      color: 'var(--atext)', fontSize: 14, fontFamily: 'var(--fb)',
                      padding: '12px 16px', borderRadius: 20, outline: 'none'
                    }}
                  />
                  <button type="submit" disabled={!replyContent.trim() || sending} style={{
                    background: 'var(--accent)', color: '#000', border: 'none',
                    width: 44, height: 44, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: 20, fontWeight: 700, paddingBottom: 2,
                    opacity: (!replyContent.trim() || sending) ? 0.5 : 1, transition: 'opacity 0.2s',
                  }}>
                    ↑
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--abg)', color: 'var(--amuted)' }}>
              <span style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>💬</span>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 15, fontWeight: 500 }}>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .chat-list { width: 340px; border-right: 1px solid var(--aborder); display: flex; flex-direction: column; background: var(--as1); z-index: 10; }
        .chat-pane { flex: 1; display: flex; flex-direction: column; background: var(--as2); position: relative; }
        
        @media (max-width: 768px) {
          .chat-list { width: 100%; border-right: none; }
          .chat-pane { width: 100%; position: absolute; inset: 0; z-index: 20; background: var(--abg); }
          .hidden-mobile { display: none !important; }
          .mobile-back { display: block !important; }
        }
      `}} />
    </div>
  );
}
