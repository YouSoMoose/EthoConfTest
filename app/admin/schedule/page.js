'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';

export default function AdminSchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', location: '', start_time: '', end_time: '' });

  const fetchSchedule = async () => {
    try {
      const res = await fetch('/api/schedule');
      if (res.ok) setSchedule(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchSchedule(); }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', location: '', start_time: '', end_time: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title || '',
      description: item.description || '',
      location: item.location || '',
      start_time: item.start_time || '',
      end_time: item.end_time || '',
    });
    setEditing(item);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }

    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch('/api/schedule', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editing ? 'Updated!' : 'Added!');
        resetForm();
        fetchSchedule();
      } else {
        toast.error('Failed to save');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await fetch(`/api/schedule?id=${id}`, { method: 'DELETE' });
      setSchedule(prev => prev.filter(s => s.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-enter">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl font-bold text-green-900">📅 Schedule</h2>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary btn-glow">
            {showForm ? 'Cancel' : '+ Add Event'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} className="glass-card p-6 mb-6 animate-fade-up space-y-4">
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Event Title *" className="input-field" required />
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="input-field min-h-[80px]" />
            <div className="grid grid-cols-3 gap-3">
              <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Location" className="input-field" />
              <input type="text" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} placeholder="Start (e.g. 9:00 AM)" className="input-field" />
              <input type="text" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} placeholder="End (e.g. 10:00 AM)" className="input-field" />
            </div>
            <button type="submit" className="btn-primary btn-glow">
              {editing ? 'Update' : 'Add Event'}
            </button>
          </form>
        )}

        <div className="space-y-3 stagger-in">
          {schedule.map(item => (
            <div key={item.id} className="glass-card p-4 flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-heading font-bold text-green-900">{item.title}</h3>
                {item.description && <p className="text-gray-500 text-sm font-body mt-1">{item.description}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-400 font-body">
                  {item.location && <span>📍 {item.location}</span>}
                  <span>{item.start_time} — {item.end_time}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-3 flex-shrink-0">
                <button onClick={() => handleEdit(item)} className="text-gray-400 hover:text-green-700 transition-colors">✏️</button>
                <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
