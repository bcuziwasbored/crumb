export function relativeTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (diffDays < 1) return 'today'
  if (diffDays < 7) return `${diffDays}d`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`
  return `${Math.floor(diffDays / 365)}y`
}

export function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return '—'
  return `$${n.toFixed(2)}`
}
