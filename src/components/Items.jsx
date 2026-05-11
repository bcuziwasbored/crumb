import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { ITEM_CATEGORIES } from '../utils/items'
import { costPerItem, marginPercent } from '../utils/calc'
import { formatMoney } from '../utils/format'
import ItemAvatar from './ItemAvatar'
import Sheet from './Sheet'
import ItemForm from './ItemForm'

export default function Items({ store, onCreate, onOpen }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [creating, setCreating] = useState(false)

  const { items, recipes, ingredients, recipeIngredients, settings } = store

  const q = query.trim().toLowerCase()

  const enriched = items.items
    .filter((i) => filter === 'all' || i.category === filter)
    .filter((i) => !q || i.name.toLowerCase().includes(q))
    .map((item) => {
      const recipe = recipes.items.find((r) => r.item_id === item.id)
      const lines = recipeIngredients.items.filter(
        (ri) => ri.recipe_id === recipe?.id
      )
      const cost = costPerItem(recipe, ingredients.items, lines, settings)
      const margin = marginPercent(item.price, cost)
      return { item, cost, margin }
    })
    .sort((a, b) => b.cost - a.cost)

  const activeCount = items.items.filter((i) => i.active !== false).length

  const categoryCounts = {}
  items.items.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1
  })
  const usedCategories = ITEM_CATEGORIES.filter((c) => categoryCounts[c.id])

  return (
    <div className="pb-28">
      <header className="px-5 pt-6 pb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Items
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {items.items.length}{' '}
            {items.items.length === 1 ? 'item' : 'items'}
            {items.items.length > 0 && ` · ${activeCount} active`}
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          aria-label="Add item"
          className="shrink-0 w-11 h-11 rounded-full bg-terracotta text-white flex items-center justify-center shadow-sm active:scale-95"
        >
          <Plus size={22} />
        </button>
      </header>

      <div className="px-5 pb-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items"
            className="w-full rounded-xl bg-white border border-divider pl-9 pr-3 py-2.5 text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink-muted/50"
          />
        </div>
      </div>

      {usedCategories.length > 0 && (
        <div className="px-5 pb-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            <FilterChip
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              All · {items.items.length}
            </FilterChip>
            {usedCategories.map((c) => (
              <FilterChip
                key={c.id}
                active={filter === c.id}
                onClick={() => setFilter(c.id)}
              >
                {c.plural} · {categoryCounts[c.id]}
              </FilterChip>
            ))}
          </div>
        </div>
      )}

      {items.items.length === 0 ? (
        <EmptyState onAdd={() => setCreating(true)} />
      ) : enriched.length === 0 ? (
        <p className="px-5 text-sm text-ink-muted">No items match.</p>
      ) : (
        <div className="px-5 space-y-2.5">
          {enriched.map(({ item, cost, margin }) => (
            <ItemCard
              key={item.id}
              item={item}
              cost={cost}
              margin={margin}
              onClick={() => onOpen(item.id)}
            />
          ))}
        </div>
      )}

      <Sheet
        open={creating}
        onClose={() => setCreating(false)}
        title="New item"
      >
        {creating && (
          <ItemForm
            onSave={(data) => {
              const id = onCreate(data)
              setCreating(false)
              onOpen(id)
            }}
            onCancel={() => setCreating(false)}
          />
        )}
      </Sheet>
    </div>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? 'bg-terracotta-bg text-terracotta'
          : 'bg-white text-ink-muted'
      }`}
    >
      {children}
    </button>
  )
}

function ItemCard({ item, cost, margin, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-3 flex items-center gap-3 active:bg-cream-soft transition-colors text-left"
    >
      <ItemAvatar item={item} size={52} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-ink truncate">{item.name}</div>
        <div className="text-sm mt-0.5">
          {item.price != null ? (
            <span className="text-ink-muted">
              ${item.price.toFixed(2)}
              {margin != null && (
                <>
                  {' · '}
                  <span className="text-terracotta font-medium">
                    {Math.round(margin)}%
                  </span>
                  <span className="ml-1">margin</span>
                </>
              )}
            </span>
          ) : (
            <span className="text-ink-muted italic">No price set</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-terracotta text-xl font-semibold tabular-nums">
          {cost > 0 ? formatMoney(cost) : '—'}
        </div>
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            item.active !== false ? 'bg-sage' : 'bg-stone-300'
          }`}
        />
      </div>
    </button>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="text-ink-muted mb-4">No items yet. Build your first one.</p>
      <button
        onClick={onAdd}
        className="px-4 py-2.5 rounded-xl bg-terracotta text-white font-medium"
      >
        Add your first item
      </button>
    </div>
  )
}
