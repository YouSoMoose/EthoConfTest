'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Loader from '@/components/Loader';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import QRScanner from '@/components/QRScanner';
import { LayoutDashboard, Users, CheckCircle, MessageSquare, CreditCard, Printer, Send } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const level = session?.profile?.access_level || 0;
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [sending, setSending] = useState(false);

  const [realtimeTrigger, setRealtimeTrigger] = useState(0);

  useEffect(() => {
    if (level === 2) { setLoading(false); return; }
    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch(`/api/messages?unread=true&_t=${Date.now()}`).then(r => r.json()),
      fetch('/api/raffle').then(r => r.json()).catch(() => []),
      fetch(`/api/announcements?all=true&_t=${Date.now()}`).then(r => r.json()).catch(() => []),
    ]).then(([users, unread, raffle, ann]) => {
      const u = Array.isArray(users) ? users : [];
      setAnnouncements(Array.isArray(ann) ? ann : []);
      setStats({
        totalUsers: u.length,
        checkedIn: u.filter(x => x.checked_in).length,
        unreadMessages: unread?.unreadCount || 0,
        raffleEntries: Array.isArray(raffle) ? raffle.length : 0,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [level, realtimeTrigger]);

  useEffect(() => {
    if (level === 2) return;
    const channel = import('@/lib/supabase').then(({ supabase }) => {
      return supabase
        .channel('admin-dashboard')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
          setRealtimeTrigger(n => n + 1);
        })
        .subscribe();
    });
    return () => {
      channel.then(c => import('@/lib/supabase').then(({ supabase }) => supabase.removeChannel(c)));
    };
  }, [level]);

  const sendAnnouncement = () => {
    if (!annTitle.trim()) { toast.error('Title is required'); return; }
    
    // Optimistic UI update: instantly close modal
    const title = annTitle.trim();
    const content = annContent.trim();
    setAnnTitle(''); 
    setAnnContent('');
    setShowAnnounce(false);
    
    // Background fetch
    const p = fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    }).then(async (res) => {
      if (res.ok) {
        const newAnn = await res.json();
        setAnnouncements(prev => [newAnn, ...prev]);
        return "Sent successfully";
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send');
      }
    });

    toast.promise(p, {
      loading: 'Sending announcement...',
      success: 'Announcement sent to all users!',
      error: err => err.message
    });
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deleted');
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      } else {
        toast.error('Failed to delete');
      }
    } catch { toast.error('Network error'); }
  };

  if (loading) return <Loader admin />;

  if (level === 2) {
    return (
      <div className="page-enter">
        <QRScanner />
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, href: '/admin/users', minLevel: 3 },
    { label: 'Checked In', value: stats?.checkedIn || 0, icon: CheckCircle, href: '/admin/checkin', minLevel: 2 },
    { label: 'Unread Messages', value: stats?.unreadMessages || 0, icon: MessageSquare, href: '/admin/messages', minLevel: 2 },
    { label: 'Print ID Cards', value: <CreditCard size={28} />, icon: Printer, href: '/admin/cards', minLevel: 3 },
  ];

  return (
    <div className="page-enter" style={{ padding: '24px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 22, color: 'var(--atext)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <LayoutDashboard size={24} /> Dashboard
          </h2>
          {level >= 3 && (
            <button onClick={() => setShowAnnounce(true)} style={{
              background: 'linear-gradient(135deg, #f07070 0%, #f5c842 100%)',
              border: 'none', borderRadius: 10, padding: '10px 18px',
              fontFamily: 'var(--fb)', fontSize: 13, fontWeight: 700,
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 12px rgba(240,112,112,0.3)',
            }}>
              Mega Announcement
            </button>
          )}
        </div>

        <div className="stagger admin-stat-grid" style={{
          display: 'grid',
          gap: 12,
        }}>
          {cards.map(card => {
            const canAccess = card.href && (!card.minLevel || level >= card.minLevel);

            const content = (
              <div style={{
                background: 'var(--as2)',
                border: '1px solid var(--aborder)',
                borderRadius: 'var(--r)',
                padding: 20,
                textAlign: 'center',
                cursor: canAccess ? 'pointer' : 'default',
                opacity: (card.minLevel && level < card.minLevel) ? 0.45 : 1,
                height: '100%',
              }}>
                <card.icon size={24} style={{ display: 'block', margin: '0 auto 8px', color: 'var(--amuted)' }} />
                <p style={{ fontFamily: 'var(--fhs)', fontWeight: 800, fontSize: 28, color: 'var(--accent)' }}>
                  {card.value}
                </p>
                <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--asub)', marginTop: 4 }}>
                  {card.label}
                </p>
              </div>
            );

            return canAccess ? (
              <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
                {content}
              </Link>
            ) : (
              <div key={card.label}>{content}</div>
            );
          })}
        </div>
        
        {/* Manage Announcements */}
        {level >= 3 && announcements.length > 0 && (
          <div style={{ marginTop: 40, borderTop: '1px solid var(--aborder)', paddingTop: 24 }}>
            <h3 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 18, color: 'var(--atext)', marginBottom: 16 }}>
              Recent Announcements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {announcements.map(a => (
                <div key={a.id} style={{
                  background: 'var(--as1)', border: '1px solid var(--aborder)',
                  borderRadius: 'var(--r)', padding: 16,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                }}>
                  <div>
                    <h4 style={{ fontFamily: 'var(--fb)', fontWeight: 700, fontSize: 15, color: 'var(--atext)', margin: '0 0 4px' }}>
                      {a.title}
                    </h4>
                    {a.content && (
                      <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--asub)', margin: '0 0 8px' }}>
                        {a.content}
                      </p>
                    )}
                    <p style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--amuted)', margin: 0 }}>
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button onClick={() => deleteAnnouncement(a.id)} style={{
                    background: 'var(--ab)', border: 'none', borderRadius: 8,
                    color: 'var(--ared)', cursor: 'pointer', padding: '6px 10px',
                    fontFamily: 'var(--fb)', fontSize: 12, fontWeight: 600,
                  }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mega Announcement Modal */}
      <Modal open={showAnnounce} onClose={() => setShowAnnounce(false)} title="Mega Announcement" subtitle="This will appear as a banner for ALL users" admin>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontFamily: 'var(--fb)', fontSize: 12, fontWeight: 600, color: 'var(--asub)', display: 'block', marginBottom: 6 }}>
              Title *
            </label>
            <input
              value={annTitle}
              onChange={e => setAnnTitle(e.target.value)}
              placeholder="e.g. Lunch is now being served!"
              style={{
                width: '100%', background: 'var(--as1)', border: '1.5px solid var(--aborder)',
                borderRadius: 10, padding: '12px 14px', fontSize: 14,
                fontFamily: 'var(--fb)', color: 'var(--atext)', outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ fontFamily: 'var(--fb)', fontSize: 12, fontWeight: 600, color: 'var(--asub)', display: 'block', marginBottom: 6 }}>
              Details (optional)
            </label>
            <textarea
              value={annContent}
              onChange={e => setAnnContent(e.target.value)}
              placeholder="Additional info..."
              rows={3}
              style={{
                width: '100%', background: 'var(--as1)', border: '1.5px solid var(--aborder)',
                borderRadius: 10, padding: '12px 14px', fontSize: 14,
                fontFamily: 'var(--fb)', color: 'var(--atext)', outline: 'none',
                resize: 'none',
              }}
            />
          </div>
          <button onClick={sendAnnouncement} disabled={sending} style={{
            background: 'linear-gradient(135deg, #f07070 0%, #f5c842 100%)',
            border: 'none', borderRadius: 12, padding: '14px 24px',
            fontFamily: 'var(--fb)', fontSize: 15, fontWeight: 700,
            color: '#fff', cursor: sending ? 'not-allowed' : 'pointer',
            opacity: sending ? 0.7 : 1,
          }}>
            {sending ? 'Sending...' : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Send size={18} /> Send to Everyone
              </span>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
