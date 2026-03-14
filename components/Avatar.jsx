'use client';

export default function Avatar({ src, name, size = 40 }) {
  const initials = (name || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        width={size}
        height={size}
        className="rounded-full object-cover border-2 border-amber-200"
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className="rounded-full bg-green-800 text-white flex items-center justify-center font-heading font-bold border-2 border-amber-200"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
