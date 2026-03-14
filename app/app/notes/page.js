'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import Btn from '@/components/Btn';
import Empty from '@/components/Empty';

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
    a.click();
  };

  if (loading) return <Loader />;

  return (
    <div className="page-enter">
      <Topbar
        title="📝 Notes"
        rightEl={
          <button onClick={createNote} style={{
            background: 'none', border: '1.5px solid var(--border)', borderRadius: 8,
            padding: '5px 12px', fontFamily: 'var(--fb)', fontSize: 12, fontWeight: 600,
            color: 'var(--text)', cursor: 'pointer',
          }}>+ New</button>
        }
      />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Empty icon="📝" text="No notes yet" />
            <div style={{ marginTop: 16 }}><Btn onClick={createNote}>Create Your First Note</Btn></div>
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
                  <p style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                    {new Date(n.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 4, marginLeft: 8, flexShrink: 0 }}>
                  <button onClick={(e) => downloadNote(n, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }} title="Download">⬇️</button>
                  <button onClick={(e) => deleteNote(n.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
