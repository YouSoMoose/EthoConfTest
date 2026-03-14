'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Avatar from '@/components/Avatar';
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
      if (res.ok) {
        const data = await res.json();
        setMessages(data || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    // Mark messages as read
    fetch('/api/messages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mark_read: true }),
    }).catch(() => {});

    // Poll every 15s
    const interval = setInterval(() => {
      fetchMessages();
      fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_read: true }),
      }).catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        setNewMessage('');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to send');
      }
    } catch {
      toast.error('Network error');
    }
    setSending(false);
  };

  if (loading) return <Loader />;

  const myId = session?.profile?.id;

  return (
    <div className="page-enter flex flex-col h-[calc(100vh-5rem)]">
      <div className="page-header">
        <div className="max-w-lg mx-auto">
          <h1 className="font-heading text-2xl font-bold">💬 Chat</h1>
          <p className="text-green-200 text-sm font-body mt-1">Message event staff</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-body">No messages yet. Say hello!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMe = msg.sender_id === myId;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                    <Avatar
                      src={isMe ? session?.profile?.avatar : msg.sender?.avatar}
                      name={isMe ? session?.profile?.name : msg.sender?.name}
                      size={28}
                    />
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm font-body ${
                        isMe
                          ? 'bg-gradient-to-br from-green-800 to-green-900 text-white rounded-br-md'
                          : 'glass-card rounded-bl-md'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-green-300' : 'text-gray-400'}`}>
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
      <div className="border-t border-amber-200 bg-white px-4 py-3">
        <form onSubmit={handleSend} className="max-w-lg mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-field flex-1"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="btn-primary px-4 btn-glow"
          >
            {sending ? '...' : '→'}
          </button>
        </form>
      </div>
    </div>
  );
}
