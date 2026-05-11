import { LayoutGrid, Star, TrendingUp, MoreHorizontal } from 'lucide-react'

const TABS = [
  { id: 'items', label: 'Items', Icon: LayoutGrid },
  { id: 'pantry', label: 'Pantry', Icon: Star },
  { id: 'sales', label: 'Sales', Icon: TrendingUp },
  { id: 'more', label: 'More', Icon: MoreHorizontal },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-cream-soft/95 backdrop-blur border-t border-divider"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto max-w-md flex">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${
                isActive ? 'text-terracotta' : 'text-ink-muted'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
