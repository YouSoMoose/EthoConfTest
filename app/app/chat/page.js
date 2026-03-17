'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Avatar from '@/components/Avatar';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import { Send, MessageSquare, ShieldAlert, BadgeCheck, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const level = session?.profile?.access_level || 0;
  const myId = session?.profile?.id;

  // 1. Super Admin Redirection
  useEffect(() => {
    if (session?.profile && level >= 3) {
      router.replace('/admin/messages');
    }
  }, [session, level, router]);

  const fetchMessages = useCallback(async () => {
    if (!myId || level >= 3) return;
    try {
      // Fetch direct messages with admin
      const res = await fetch(`/api/messages?as=attendee&direct=admin&_t=${Date.now()}`);
      if (res.ok) setMessages(await res.json());
    } catch { }
    setLoading(false);
  }, [myId, level]);

  // Initial fetch + Supabase Realtime subscription
  useEffect(() => {
    if (level >= 3) return;
    fetchMessages();

    const channel = supabase
      .channel('chat-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [myId, level, fetchMessages]);

  useEffect(() => { 
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
      
      // Mark as read if any messages are unread and addressed to me
      const hasUnread = messages.some(m => !m.read && m.recipient_id === myId);
      if (hasUnread) {
        fetch('/api/messages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mark_read: true })
        }).catch(() => {});
      }
    }
  }, [messages, myId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages?as=attendee&direct=admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (res.ok) { 
        const msg = await res.json(); 
        setMessages(p => [...p, msg]); 
        setNewMessage(''); 
      }
      else { 
        const err = await res.json(); 
        toast.error(err.error || 'Failed to send'); 
      }
    } catch { toast.error('Network error'); }
    setSending(false);
  };

  if (!session?.profile || level >= 3) return <Loader />;
  if (loading) return <Loader />;

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', paddingBottom: 100 }}>
      <Topbar title="Ask Admins & Speakers" onBack={() => router.back()} />

      <div style={{ 
        background: 'var(--s1)', 
        padding: '12px 16px', 
        borderBottom: '1px solid var(--border)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12 
      }}>
        <div style={{ 
          width: 36, height: 36, borderRadius: 12, 
          background: 'var(--g)', color: '#fff', 
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <BadgeCheck size={20} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>Audience Q&A</h4>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--sub)', fontWeight: 600 }}>Use this to ask questions to admins or speakers during sessions.</p>
        </div>
      </div>

      {level === 2 && (
        <div style={{ background: '#FEF3C7', padding: '8px 16px', borderBottom: '1px solid #FCD34D', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldAlert size={14} color="#D97706" />
          <p style={{ fontFamily: 'var(--fb)', fontSize: 10, fontWeight: 700, color: '#92400E', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Staff Mode: Direct line to Super Admin
          </p>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', maxWidth: 500, margin: '0 auto', width: '100%' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--g)' }}>
              <MessageSquare size={32} />
            </div>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Start a conversation</p>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--sub)', marginTop: 4 }}>Ask a question for admins or speakers during talks.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(msg => {
              const isMe = msg.sender_id === myId;
              const isAdmin = msg.sender?.access_level >= 3;
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 10, maxWidth: '85%', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                    {!isMe && <Avatar src={isAdmin ? '/assets/ethos-logo-insignia.png' : msg.sender?.avatar} name={isAdmin ? 'Ethos Admin' : msg.sender?.name} size={30} />}
                    <div style={{
                      borderRadius: 20,
                      padding: '12px 16px',
                      fontSize: 14,
                      fontFamily: 'var(--fb)',
                      lineHeight: 1.5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      ...(isMe
                        ? { background: 'var(--g)', color: '#fff', borderBottomRightRadius: 4 }
                        : { background: 'var(--white)', border: '1px solid var(--border)', borderBottomLeftRadius: 4, color: 'var(--text)' }
                      ),
                    }}>
                      {isAdmin && !isMe && <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, opacity: 0.8 }}>Admin</p>}
                      <p style={{ margin: 0, fontWeight: 500 }}>{msg.content}</p>
                      <p style={{ fontSize: 10, marginTop: 6, opacity: 0.6, margin: 0, textAlign: 'right' }}>
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
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        background: 'transparent',
      }}>
        <form onSubmit={handleSend} style={{
          display: 'flex', gap: 8, maxWidth: 500, margin: '0 auto',
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 28,
          padding: '8px 8px 8px 20px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.08)'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type your message..."
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
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: (sending || !newMessage.trim()) ? 0.5 : 1,
            transition: 'all 0.2s',
            flexShrink: 0,
          }}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
