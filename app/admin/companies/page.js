'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/providers/ToastProvider'
import { strColor } from '@/lib/utils'
import Modal from '@/components/Modal'
import Loader from '@/components/Loader'
import QRCode from '@/components/QRCode'

export default function AdminCompanies() {
    const supabase = createClient()
    const { showToast } = useToast()
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(null)
    const [qrCompany, setQrCompany] = useState(null)
    const [form, setForm] = useState({})

    useEffect(() => { load() }, [])

    async function load() {
        const { data } = await supabase.from('companies').select('*').order('name')
        setCompanies(data || [])
        setLoading(false)
    }

    function openNew() { setForm({ name: '', industry: '', type: 'pitch', room_type: 'poster_room', description: '', presenter_name: '', logo_url: '', resume_url: '', emoji: '🏢' }); setEditing('new') }

    function openEdit(c) { setForm({ ...c }); setEditing(c.id) }

    async function save() {
        if (!form.name?.trim()) { showToast('Name is required'); return }
        if (editing === 'new') {
            await supabase.from('companies').insert({ ...form, created_at: new Date().toISOString() })
        } else {
            await supabase.from('companies').update(form).eq('id', editing)
        }
        showToast(editing === 'new' ? 'Company added ✓' : 'Company updated ✓')
        setEditing(null)
        load()
    }

    async function remove(id) {
        if (!confirm('Delete this company? This cannot be undone.')) return
        await supabase.from('companies').delete().eq('id', id)
        showToast('Company deleted')
        load()
    }

    return (
        <div className="anim-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 18 }}>Companies</div>
                <button className="btn btn-accent btn-sm" onClick={openNew}>+ Add</button>
            </div>
            {loading && <Loader />}
            {companies.map(c => (
                <div key={c.id} className="tile">
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: strColor(c.name || ''), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontFamily: 'var(--fh)', fontSize: 14, flexShrink: 0 }}>{(c.name || '?')[0]}</div>
                    <div className="tile-body" onClick={() => openEdit(c)}>
                        <div className="tile-name">{c.name}</div>
                        <div className="tile-desc">{c.type} · {c.industry || 'No industry'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', fontSize: 16, padding: 4 }} onClick={() => setQrCompany(c)}>⊞</button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 14, padding: 4 }} onClick={() => remove(c.id)}>✕</button>
                    </div>
                </div>
            ))}

            <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add Company' : 'Edit Company'}>
                <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Industry</label><input className="form-input" value={form.industry || ''} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Type</label><select className="form-input" value={form.type || 'pitch'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="pitch">Pitch</option><option value="booth">Booth</option></select></div>
                <div className="form-group"><label className="form-label">Room</label><select className="form-input" value={form.room_type || 'poster_room'} onChange={e => setForm(f => ({ ...f, room_type: e.target.value }))}><option value="poster_room">Poster Room</option><option value="conference_room">Conference Room</option></select></div>
                <div className="form-group"><label className="form-label">Presenter</label><input className="form-input" value={form.presenter_name || ''} onChange={e => setForm(f => ({ ...f, presenter_name: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Logo URL</label><input className="form-input" value={form.logo_url || ''} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Deck / Resume URL</label><input className="form-input" value={form.resume_url || ''} onChange={e => setForm(f => ({ ...f, resume_url: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Emoji</label><input className="form-input" value={form.emoji || ''} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} /></div>
                <button className="btn btn-accent btn-full" onClick={save}>Save</button>
            </Modal>

            <Modal open={!!qrCompany} onClose={() => setQrCompany(null)} title={qrCompany?.name}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingBottom: 20 }}>
                    {qrCompany && <QRCode value={`BOOTH-${qrCompany.id}`} size={200} />}
                    <div style={{ fontSize: 12, color: 'var(--sub)' }}>Booth QR Code</div>
                </div>
            </Modal>
        </div>
    )
}
