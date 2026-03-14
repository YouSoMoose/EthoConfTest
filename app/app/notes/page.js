'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) setNotes(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchNotes(); }, []);

  const createNote = async () => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled', content: '' }),
      });
      if (res.ok) {
        const note = await res.json();
        router.push(`/app/notes/${note.id}`);
      }
    } catch {
      toast.error('Failed to create note');
    }
  };

  const deleteNote = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this note?')) return;
    try {
      await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const downloadNote = (note, e) => {
    e.stopPropagation();
    const blob = new Blob([`${note.title}\n\n${note.content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || 'note'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Loader />;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">📝 Notes</h1>
            <p className="text-green-200 text-sm font-body mt-1">Your personal notes</p>
          </div>
          <button onClick={createNote} className="bg-white/20 text-white px-3 py-1.5 rounded-xl text-sm font-body hover:bg-white/30 transition-colors">
            + New
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {notes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📝</p>
            <p className="font-body">No notes yet</p>
            <button onClick={createNote} className="btn-primary mt-4 btn-glow">Create Your First Note</button>
          </div>
        ) : (
          <div className="space-y-3 stagger-in">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => router.push(`/app/notes/${note.id}`)}
                className="glass-card p-4 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-green-900 truncate">
                      {note.title || 'Untitled'}
                    </h3>
                    <p className="text-gray-400 text-sm font-body mt-1 truncate">
                      {note.content || 'Empty note'}
                    </p>
                    <p className="text-xs text-gray-300 font-body mt-2">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2 flex-shrink-0">
                    <button
                      onClick={(e) => downloadNote(note, e)}
                      className="text-gray-400 hover:text-green-700 p-1 transition-colors"
                      title="Download"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={(e) => deleteNote(note.id, e)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
