'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import Spinner from '@/components/Spinner';

export default function NoteEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/notes').then(r => r.json())
      .then(notes => {
        const n = (notes || []).find(x => x.id === id);
        if (n) { setTitle(n.title || ''); setContent(n.content || ''); }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [id]);

  const saveNote = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/notes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, title, content }) });
      if (res.ok) toast.success('Saved');
      else toast.error('Failed to save');
    } catch { toast.error('Network error'); }
    setSaving(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Topbar
        title="Edit Note"
        onBack={() => router.back()}
        rightEl={
          <button onClick={saveNote} disabled={saving} style={{
            background: 'none', border: '1.5px solid var(--border)', borderRadius: 8,
            padding: '5px 12px', fontFamily: 'var(--fb)', fontSize: 12, fontWeight: 600,
            color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {saving ? <Spinner size={12} /> : 'Save'}
          </button>
        }
      />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px', flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={saveNote}
          placeholder="Note title..."
          style={{
            fontFamily: 'var(--fh)', fontSize: 22, fontWeight: 700,
            color: 'var(--text)', background: 'transparent', border: 'none',
            outline: 'none', width: '100%', marginBottom: 16,
          }}
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onBlur={saveNote}
          placeholder="Start writing..."
          style={{
            flex: 1, fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--sub)',
            background: 'transparent', border: 'none', outline: 'none',
            width: '100%', resize: 'none', lineHeight: 1.6,
          }}
        />
      </div>
    </div>
  );
}
