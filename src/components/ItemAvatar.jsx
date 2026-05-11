function initials(name) {
  if (!name) return '·'
  const parts = name.trim().split(/\s+/)
  const letters = parts.slice(0, 2).map((w) => w[0]).join('')
  return letters.toUpperCase() || '·'
}

export default function ItemAvatar({ item, size = 48, className = '' }) {
  const style = { width: size, height: size }
  if (item?.image) {
    return (
      <img
        src={item.image}
        alt=""
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={style}
      />
    )
  }
  return (
    <div
      className={`rounded-full bg-stone-200 text-ink-muted flex items-center justify-center font-semibold shrink-0 ${className}`}
      style={{ ...style, fontSize: size / 3 }}
    >
      {initials(item?.name)}
    </div>
  )
}
