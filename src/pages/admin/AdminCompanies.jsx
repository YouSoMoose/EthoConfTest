import { useEffect, useState } from 'react'
import { sb } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { strColor } from '../../lib/utils'
import Modal from '../../components/Modal'
import QRCode from '../../components/QRCode'
import Loader from '../../components/Loader'

const BLANK = { name:'', industry:'', description:'', type:'pitch', room_type:'', presenter_name:'', resume_url:'', emoji:'🏢' }

export default function AdminCompanies() {
  const { profile } = useAuth()
  const { showToast } = useToast()
  const [companies, setCompanies] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [form,      setForm]      = useState(BLANK)
  const [qrCompany, setQrCompany] = useState(null)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await sb.from('companies').select('*').order('name')
    setCompanies(data || [])
    setLoading(false)
  }

  function openNew()    { setEditing(null); setForm(BLANK); setModal(true) }
  function openEdit(c)  { setEditing(c); setForm({ name: c.name||'', industry: c.industry||'', description: c.description||'', type: c.type||'pitch', room_type: c.room_type||'', presenter_name: c.presenter_name||'', resume_url: c.resume_url||'', emoji: c.emoji||'🏢' }); setModal(true) }

  async function save() {
    if (!form.name.trim()) { showToast('Company name required'); return }
    setSaving(true)
    if (editing) {
      await sb.from('companies').update(form).eq('id', editing.id)
    } else {
      await sb.from('companies').insert({ ...form, created_by: profile.id })
    }
    setSaving(false)
    setModal(false)
    load()
    showToast('Saved ✓')
  }

  async function del(id) {
    if (!confirm('Delete this company? This will also remove related votes and stamps.')) return
    await sb.from('companies').delete().eq('id', id)
    load()
    showToast('Deleted')
  }

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '16px 16px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 20 }}>Companies ({companies.length})</div>
        <button className="btn btn-sm btn-accent" onClick={openNew}>+ Add</button>
      </div>

      {loading && <Loader />}

      {companies.map(c => (
        <div key={c.id} className="tile" style={{ cursor: 'default' }}>
          <div className="tile-ico" style={{ background: strColor(c.name || ''), fontSize: 18, color: '#fff', fontFamily: 'var(--fh)', fontWeight: 800 }}>
            {c.emoji || (c.name || '?')[0]}
          </div>
          <div className="tile-body">
            <div className="tile-name">{c.name}</div>
            <div className="tile-desc">{c.type} · {c.industry || 'No industry'}{c.room_type ? ` · ${c.room_type.replace('_',' ')}` : ''}</div>
          </div>
          <div className="tile-right" style={{ gap: 6 }}>
            <button style={{ background: 'none', border: 'none', color: 'var(--sub)', cursor: 'pointer', padding: 4, fontSize: 18 }} onClick={() => setQrCompany(c)} title="Show QR">⊞</button>
            <button style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--fh)', fontWeight: 700, padding: '4px 8px' }} onClick={() => openEdit(c)}>Edit</button>
            <button style={{ background: 'none', border: 'none', color: 'var(--red)',  cursor: 'pointer', fontSize: 12, fontFamily: 'var(--fh)', fontWeight: 700, padding: '4px 8px' }} onClick={() => del(c.id)}>Del</button>
          </div>
        </div>
      ))}

      {/* Edit/Add modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Company' : 'Add Company'}>
        <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={f('name')} /></div>
        <div className="form-group"><label className="form-label">Industry</label><input className="form-input" value={form.industry} onChange={f('industry')} /></div>
        <div className="form-group"><label className="form-label">Presenter Name</label><input className="form-input" placeholder="Student's name" value={form.presenter_name} onChange={f('presenter_name')} /></div>
        <div className="form-group"><label className="form-label">Deck / Resume URL</label><input className="form-input" placeholder="https://…" value={form.resume_url} onChange={f('resume_url')} /></div>
        <div className="form-group"><label className="form-label">Emoji</label><input className="form-input" style={{ maxWidth: 80 }} value={form.emoji} onChange={f('emoji')} /></div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-input" value={form.type} onChange={f('type')}>
            <option value="pitch">Pitch</option>
            <option value="booth">Booth</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Room (booths only)</label>
          <select className="form-input" value={form.room_type} onChange={f('room_type')}>
            <option value="">— none —</option>
            <option value="poster_room">Poster Room</option>
            <option value="conference_room">Conference Room</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={form.description} onChange={f('description')} /></div>
        <button className="btn btn-accent btn-full" onClick={save} disabled={saving} style={{ marginBottom: 16 }}>
          {saving ? 'Saving…' : 'Save Company'}
        </button>
      </Modal>

      {/* QR modal */}
      <Modal open={!!qrCompany} onClose={() => setQrCompany(null)} title={qrCompany?.name}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingBottom: 20 }}>
          {qrCompany && <QRCode value={`BOOTH-${qrCompany.id}`} size={200} />}
          <div style={{ fontSize: 12, color: 'var(--sub)', textAlign: 'center' }}>
            Print and place on booth table.<br />Code: <code style={{ color: 'var(--accent)', fontSize: 11 }}>BOOTH-{qrCompany?.id}</code>
          </div>
        </div>
      </Modal>
    </div>
  )
}
