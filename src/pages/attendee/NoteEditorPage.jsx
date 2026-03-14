import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sb } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import Topbar from '../../components/Topbar'
import Loader from '../../components/Loader'

export default function NoteEditorPage() {
  const { id }   = useParams()   // undefined if "new"
  const isNew    = !id || id === 'new'
  const { profile } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [title,   setTitle]   = useState('')
  const [body,    setBody]    = useState('')
  const [noteId,  setNoteId]  = useState(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    if (isNew) return
    sb.from('notes').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (data) { setTitle(data.title); setBody(data.body || ''); setNoteId(data.id) }
        setLoading(false)
      })
  }, [id])

  async function save() {
    if (!title.trim()) { showToast('Add a title first'); return }
    setSaving(true)
    const now = new Date().toISOString()
    if (noteId) {
      await sb.from('notes').update({ title, body, updated_at: now }).eq('id', noteId)
    } else {
      const { data } = await sb.from('notes').insert({
        user_id: profile.id, title, body, created_at: now, updated_at: now,
      }).select().single()
      if (data) setNoteId(data.id)
    }
    setSaving(false)
    showToast('Saved ✓')
  }

  if (loading) return <Loader fullPage />

  return (
    <>
      <Topbar
        title={isNew ? 'New Note' : title || 'Edit Note'}
        onBack={() => navigate('/app/notes')}
        actions={
          <button className="topbar-action accent" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        }
      />
      <div className="content-notab" style={{ padding: 16 }}>
        <input
          className="note-title-input"
          placeholder="Note title…"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="note-editor"
          placeholder="Start writing your notes here…"
          value={body}
          onChange={e => setBody(e.target.value)}
        />
      </div>
    </>
  )
}
