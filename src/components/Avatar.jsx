import { strColor, initials } from '../lib/utils'

export default function Avatar({ profile, size = 32, onClick }) {
  const style = {
    width: size,
    height: size,
    fontSize: size * 0.38,
    background: strColor(profile?.full_name || ''),
    ...(onClick ? {} : { cursor: 'default' }),
  }

  return (
    <div className="avatar" style={style} onClick={onClick}>
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt={profile?.full_name || ''} />
        : initials(profile?.full_name)
      }
    </div>
  )
}
