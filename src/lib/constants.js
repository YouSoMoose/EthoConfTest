export const ACCESS_LEVELS = {
  0: { label: 'Attendee',    chip: 'chip-l0', color: 'var(--green)'  },
  1: { label: 'Presenter',   chip: 'chip-l1', color: 'var(--blue)'   },
  2: { label: 'Staff',       chip: 'chip-l2', color: 'var(--accent)' },
  3: { label: 'Super Admin', chip: 'chip-l3', color: 'var(--purple)' },
}

export const RATING_QUESTIONS = [
  { key: 'sustainable', label: 'Sustainability', desc: 'How sustainable is this company long-term?' },
  { key: 'impact',      label: 'Impact',         desc: 'How impactful is this company on society?' },
  { key: 'feasibility', label: 'Feasibility',    desc: 'How viable is this to implement?' },
  { key: 'overall',     label: 'Overall',        desc: 'How did you like this pitch overall?' },
]

export const BAD_WORDS = [
  'fuck','shit','bitch','ass ','damn','crap','wtf','piss','cock','dick','pussy','cunt'
]

export const ROOM_TYPES = {
  poster_room:     { label: 'Poster Room',      color: 'var(--accent)', emoji: '🎨' },
  conference_room: { label: 'Conference Room',  color: 'var(--blue)',   emoji: '🎤' },
}
