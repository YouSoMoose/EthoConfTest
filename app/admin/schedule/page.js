'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';
import Btn from '@/components/Btn';
import FormInput from '@/components/FormInput';
import Empty from '@/components/Empty';
import { Calendar, MapPin, Pencil, Trash2 } from 'lucide-react';

export default function AdminSchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', location: '', start_time: '', end_time: '' });

  useEffect(() => {
    fetch('/api/schedule').then(r => r.json()).then(d => { setSchedule(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const resetForm = () => { setForm({ title: '', description: '', location: '', start_time: '', end_time: '' }); setEditing(null); setShowForm(false); };

  const handleEdit = (item) => {
    setForm({ title: item.title || '', description: item.description || '', location: item.location || '', start_time: item.start_time || '', end_time: item.end_time || '' });
    setEditing(item); setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title required'); return; }
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { id: editing.id, ...form } : form;
    const res = await fetch('/api/schedule', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      toast.success(editing ? 'Updated!' : 'Added!'); resetForm();
      const d = await fetch('/api/schedule').then(r => r.json()); setSchedule(d || []);
    } else toast.error('Failed');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    await fetch(`/api/schedule?id=${id}`, { method: 'DELETE' });
    setSchedule(p => p.filter(s => s.id !== id)); toast.success('Deleted');
  };

  if (loading) return <Loader admin />;

  return (
    <div className="page-enter" style={{ padding: '24px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 22, color: 'var(--atext)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={24} /> Schedule
          </h2>
          <Btn variant="accent" sm onClick={() => { resetForm(); setShowForm(!showForm); }}>{showForm ? 'Cancel' : '+ Add'}</Btn>
        </div>

        {showForm && (
          <form onSubmit={handleSave} style={{
            background: 'var(--as2)', border: '1px solid var(--aborder)', borderRadius: 'var(--r)',
            padding: 20, marginBottom: 20, animation: 'fadeUp 0.22s ease both',
          }}>
            <FormInput admin label="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            <FormInput admin label="Description" type="textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <FormInput admin label="Location" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              <FormInput admin label="Start" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} placeholder="9:00 AM" />
              <FormInput admin label="End" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} placeholder="10:00 AM" />
            </div>
            <Btn variant="accent" type="submit">{editing ? 'Update' : 'Add Event'}</Btn>
          </form>
        )}

        {schedule.length === 0 ? (
          <Empty icon={<Calendar size={48} />} text="No events yet" admin />
        ) : (
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {schedule.map(item => (
              <div key={item.id} style={{
                background: 'var(--as2)', border: '1px solid var(--aborder)', borderRadius: 'var(--r)',
                padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--fhs)', fontWeight: 700, fontSize: 15, color: 'var(--atext)' }}>{item.title}</h3>
                  {item.description && <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--asub)', marginTop: 4 }}>{item.description}</p>}
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: 'var(--amuted)', fontFamily: 'var(--fb)' }}>
                    {item.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {item.location}</span>}
                    <span>{item.start_time} — {item.end_time}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
                  <button onClick={() => handleEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--asub)', display: 'flex', padding: 4 }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ared)', display: 'flex', padding: 4 }}>
                    <Trash2 size={14} />
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
