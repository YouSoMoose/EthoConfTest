'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';

export default function NoteEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/notes')
      .then(r => r.json())
      .then(notes => {
        const note = (notes || []).find(n => n.id === id);
        if (note) {
          setTitle(note.title || '');
          setContent(note.content || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const saveNote = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, content }),
      });
      if (res.ok) {
        toast.success('Saved');
      } else {
        toast.error('Failed to save');
      }
    } catch {
      toast.error('Network error');
    }
    setSaving(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="page-enter flex flex-col min-h-screen">
      <div className="page-header">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-white text-xl hover:opacity-80 transition-opacity">
              ←
            </button>
            <h1 className="font-heading text-xl font-bold">Edit Note</h1>
          </div>
          <button
            onClick={saveNote}
            disabled={saving}
            className="bg-white/20 text-white px-3 py-1.5 rounded-xl text-sm font-body hover:bg-white/30 transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex-1 w-full flex flex-col">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveNote}
          placeholder="Note title..."
          className="font-heading text-2xl font-bold text-green-900 bg-transparent border-none outline-none w-full mb-4"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={saveNote}
          placeholder="Start writing..."
          className="flex-1 font-body text-gray-700 bg-transparent border-none outline-none w-full resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}
