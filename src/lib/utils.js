import { BAD_WORDS } from './constants'

export function timeAgo(ts) {
  if (!ts) return ''
  const d = Date.now() - new Date(ts).getTime()
  if (d < 60000)   return 'just now'
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}

export function strColor(s) {
  let h = 0
  for (const c of (s || '')) h = ((h << 5) - h) + c.charCodeAt(0)
  return `hsl(${Math.abs(h) % 360},55%,45%)`
}

export function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export function hasBadWords(text) {
  const lower = (text || '').toLowerCase()
  return BAD_WORDS.some(w => lower.includes(w))
}

export function formatTime(ts, opts = {}) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', ...opts })
}

export function formatDate(ts, opts = {}) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', ...opts
  })
}
