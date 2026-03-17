'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import Btn from '@/components/Btn';
import Empty from '@/components/Empty';
import { Plus, Download, Trash2, FileText, Calendar } from 'lucide-react';

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notes').then(r => r.json()).then(d => { setNotes(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const createNote = async () => {
    try {
      const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Untitled', content: '' }) });
      if (res.ok) { const n = await res.json(); router.push(`/app/notes/${n.id}`); }
    } catch { toast.error('Failed to create note'); }
  };

  const deleteNote = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this note?')) return;
    await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
    setNotes(p => p.filter(n => n.id !== id));
    toast.success('Deleted');
  };

  const downloadNote = (n, e) => {
    e.stopPropagation();
    const blob = new Blob([`${n.title}\n\n${n.content}`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${n.title || 'note'}.txt`;
    document.body.appendChild(a); // Required for Chrome
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  if (loading) return <Loader />;

  return (
    <div className="page-enter">
      <Topbar
        title="Notes"
        rightEl={
          <button onClick={createNote} style={{
            background: 'var(--g)', border: 'none', borderRadius: 12,
            padding: '8px 16px', fontFamily: 'var(--fb)', fontSize: 13, fontWeight: 700,
            color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
          }}>
            <Plus size={16} /> New Note
          </button>
        }
      />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Empty icon={<FileText size={48} />} text="Your notebook is empty." />
            <div style={{ marginTop: 20 }}><Btn onClick={createNote}>Create Your First Note</Btn></div>
          </div>
        ) : (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notes.map(n => (
              <div key={n.id} onClick={() => router.push(`/app/notes/${n.id}`)} style={{
                background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
                padding: 16, cursor: 'pointer', transition: 'background 0.15s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.title || 'Untitled'}
                  </h3>
                  <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--muted)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.content || 'Empty note'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, color: 'var(--muted)' }}>
                    <Calendar size={10} />
                    <p style={{ fontFamily: 'var(--fb)', fontSize: 11, fontWeight: 600 }}>
                      {n.updated_at ? new Date(n.updated_at).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                 <div style={{ display: 'flex', gap: 8, marginLeft: 8, flexShrink: 0 }}>
                  <button onClick={(e) => downloadNote(n, e)} style={{ background: 'var(--s2)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--g)' }} title="Download">
                    <Download size={16} />
                  </button>
                  <button onClick={(e) => deleteNote(n.id, e)} style={{ background: 'var(--s1)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#EF4444' }} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
