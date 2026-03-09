'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/providers/ToastProvider'
import { formatTime } from '@/lib/utils'
import Modal from '@/components/Modal'
import Loader from '@/components/Loader'

export default function AdminSchedule() {
    const supabase = createClient()
    const { showToast } = useToast()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({})

    useEffect(() => { load() }, [])

    async function load() {
        const { data } = await supabase.from('schedule_items').select('*').order('start_time')
        setItems(data || [])
        setLoading(false)
    }

    function openNew() { setForm({ title: '', location: '', speaker: '', description: '', type: '', start_time: '', end_time: '' }); setEditing('new') }
    function openEdit(item) { setForm({ ...item, start_time: item.start_time ? new Date(item.start_time).toISOString().slice(0, 16) : '', end_time: item.end_time ? new Date(item.end_time).toISOString().slice(0, 16) : '' }); setEditing(item.id) }

    async function save() {
        if (!form.title?.trim()) { showToast('Title is required'); return }
        const payload = { ...form, start_time: form.start_time || null, end_time: form.end_time || null }
        delete payload.id; delete payload.created_at
        if (editing === 'new') {
            await supabase.from('schedule_items').insert({ ...payload, created_at: new Date().toISOString() })
        } else {
            await supabase.from('schedule_items').update(payload).eq('id', editing)
        }
        showToast(editing === 'new' ? 'Event added ✓' : 'Event updated ✓')
        setEditing(null)
        load()
    }

    async function remove(id) {
        if (!confirm('Delete this event?')) return
        await supabase.from('schedule_items').delete().eq('id', id)
        showToast('Event deleted')
        load()
    }

    return (
        <div className="anim-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 18 }}>Schedule</div>
                <button className="btn btn-accent btn-sm" onClick={openNew}>+ Add Event</button>
            </div>
            {loading && <Loader />}
            {items.map(item => (
                <div key={item.id} className="sched-item" style={{ cursor: 'pointer' }}>
                    <div className="sched-time">{formatTime(item.start_time)}</div>
                    <div className="sched-body" onClick={() => openEdit(item)}>
                        <div className="sched-name">{item.title}</div>
                        <div className="sched-loc">{item.location}{item.speaker ? ` · ${item.speaker}` : ''}</div>
                    </div>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 14, flexShrink: 0, padding: 4 }} onClick={() => remove(item.id)}>✕</button>
                </div>
            ))}

            <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add Event' : 'Edit Event'}>
                <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Location / Room</label><input className="form-input" value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Speaker</label><input className="form-input" value={form.speaker || ''} onChange={e => setForm(f => ({ ...f, speaker: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Type</label><input className="form-input" value={form.type || ''} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="e.g. keynote, panel, workshop" /></div>
                <div className="form-group"><label className="form-label">Start Time</label><input className="form-input" type="datetime-local" value={form.start_time || ''} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">End Time</label><input className="form-input" type="datetime-local" value={form.end_time || ''} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <button className="btn btn-accent btn-full" onClick={save}>Save</button>
            </Modal>
        </div>
    )
}
