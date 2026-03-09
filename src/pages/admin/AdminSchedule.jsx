import { useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import { formatTime, formatDate } from '../../lib/utils'
import Modal from '../../components/Modal'
import Loader from '../../components/Loader'

const BLANK = { title:'', location:'', speaker:'', type:'keynote', start_time:'', end_time:'', description:'' }

export default function AdminSchedule() {
  const { showToast } = useToast()
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(BLANK)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await sb.from('schedule_items').select('*').order('start_time')
    setItems(data || [])
    setLoading(false)
  }

  function openNew()   { setEditing(null); setForm(BLANK); setModal(true) }
  function openEdit(i) {
    setEditing(i)
    setForm({
      title:       i.title       || '',
      location:    i.location    || '',
      speaker:     i.speaker     || '',
      type:        i.type        || 'keynote',
      start_time:  i.start_time  ? i.start_time.slice(0, 16) : '',
      end_time:    i.end_time    ? i.end_time.slice(0, 16)   : '',
      description: i.description || '',
    })
    setModal(true)
  }

  async function save() {
    if (!form.title.trim()) { showToast('Title required'); return }
    setSaving(true)
    if (editing) {
      await sb.from('schedule_items').update(form).eq('id', editing.id)
    } else {
      await sb.from('schedule_items').insert(form)
    }
    setSaving(false)
    setModal(false)
    load()
    showToast('Saved ✓')
  }

  async function del(id) {
    if (!confirm('Delete this event?')) return
    await sb.from('schedule_items').delete().eq('id', id)
    load()
    showToast('Deleted')
  }

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '16px 16px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 20 }}>Schedule ({items.length})</div>
        <button className="btn btn-sm btn-accent" onClick={openNew}>+ Add Event</button>
      </div>

      {loading && <Loader />}

      {items.map(item => (
        <div key={item.id} className="tile" style={{ cursor: 'default' }}>
          <div className="tile-body">
            <div className="tile-name">{item.title}</div>
            <div className="tile-desc">
              {item.location}{item.start_time ? ` · ${formatTime(item.start_time)}` : ''}
              {item.speaker ? ` · ${item.speaker}` : ''}
            </div>
          </div>
          <div className="tile-right" style={{ gap: 6 }}>
            <span className="badge badge-ghost">{item.type}</span>
            <button style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--fh)', fontWeight: 700 }} onClick={() => openEdit(item)}>Edit</button>
            <button style={{ background: 'none', border: 'none', color: 'var(--red)',  cursor: 'pointer', fontSize: 12, fontFamily: 'var(--fh)', fontWeight: 700 }} onClick={() => del(item.id)}>Del</button>
          </div>
        </div>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Event' : 'Add Event'}>
        <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={f('title')} /></div>
        <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={f('location')} /></div>
        <div className="form-group"><label className="form-label">Speaker</label><input className="form-input" value={form.speaker} onChange={f('speaker')} /></div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-input" value={form.type} onChange={f('type')}>
            {['keynote','workshop','panel','pitch','break','networking'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Start Time</label><input type="datetime-local" className="form-input" value={form.start_time} onChange={f('start_time')} /></div>
        <div className="form-group"><label className="form-label">End Time</label><input type="datetime-local" className="form-input" value={form.end_time} onChange={f('end_time')} /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={form.description} onChange={f('description')} /></div>
        <button className="btn btn-accent btn-full" onClick={save} disabled={saving} style={{ marginBottom: 16 }}>
          {saving ? 'Saving…' : 'Save Event'}
        </button>
      </Modal>
    </div>
  )
}
