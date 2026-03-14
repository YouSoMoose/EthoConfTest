'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Avatar from '@/components/Avatar';
import Loader from '@/components/Loader';

export default function AdminMessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const level = session?.profile?.access_level || 0;

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) setMessages(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/messages?id=${id}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleReply = async (userId) => {
    if (!replyContent.trim()) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent.trim(), recipient_id: userId }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        setReplyContent('');
        setReplyTo(null);
        toast.success('Reply sent');
      }
    } catch {
      toast.error('Failed to send');
    }
  };

  if (loading) return <Loader />;

  // Group messages by conversation (attendee)
  const conversations = {};
  messages.forEach(msg => {
    const otherId = msg.sender_id === session?.profile?.id ? msg.recipient_id : msg.sender_id;
    const other = msg.sender_id === session?.profile?.id ? msg.recipient : msg.sender;
    if (!conversations[otherId]) {
      conversations[otherId] = { user: other, messages: [] };
    }
    conversations[otherId].messages.push(msg);
  });

  return (
    <div className="page-enter">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="font-heading text-2xl font-bold text-green-900 mb-6">💬 Messages</h2>

        {Object.keys(conversations).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-body">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(conversations).map(([userId, conv]) => (
              <div key={userId} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-amber-100">
                  <Avatar src={conv.user?.avatar} name={conv.user?.name} size={36} />
                  <div>
                    <h3 className="font-heading font-bold text-green-900">{conv.user?.name || 'Unknown'}</h3>
                    <p className="text-xs text-gray-400 font-body">{conv.user?.email}</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
                  {conv.messages.map(msg => (
                    <div key={msg.id} className="flex justify-between items-start gap-2 text-sm">
                      <div className="flex-1">
                        <span className="font-bold text-green-800 font-body">{msg.sender?.name}: </span>
                        <span className="text-gray-600 font-body">{msg.content}</span>
                        <span className="text-[10px] text-gray-300 ml-2">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors text-xs flex-shrink-0"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                {/* Reply (superadmin only) */}
                {level >= 3 && (
                  <div className="flex gap-2 pt-3 border-t border-amber-100">
                    <input
                      type="text"
                      value={replyTo === userId ? replyContent : ''}
                      onChange={(e) => { setReplyTo(userId); setReplyContent(e.target.value); }}
                      onFocus={() => setReplyTo(userId)}
                      placeholder="Reply..."
                      className="input-field flex-1 text-sm"
                    />
                    <button
                      onClick={() => handleReply(userId)}
                      className="btn-primary px-3 text-sm"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
