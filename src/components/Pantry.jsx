import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { CATEGORIES } from '../utils/categories'
import { displayUnit, formatCostPerUnit } from '../utils/conversions'
import { relativeTime } from '../utils/format'
import Sheet from './Sheet'
import IngredientForm from './IngredientForm'

export default function Pantry({ ingredients, onAdd, onUpdate, onDelete }) {
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)

  const q = query.trim().toLowerCase()
  const filtered = q
    ? ingredients.filter((i) => i.name.toLowerCase().includes(q))
    : ingredients

  const grouped = CATEGORIES.map((category) => ({
    category,
    items: filtered
      .filter((i) => i.category === category.id)
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.items.length > 0)

  const editingItem =
    editing && editing !== 'new'
      ? ingredients.find((i) => i.id === editing)
      : null

  const sheetOpen = editing != null

  return (
    <div className="pb-28">
      <header className="px-5 pt-6 pb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Pantry
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {ingredients.length}{' '}
            {ingredients.length === 1 ? 'ingredient' : 'ingredients'} · updated
            as you shop
          </p>
        </div>
        <button
          onClick={() => setEditing('new')}
          aria-label="Add ingredient"
          className="shrink-0 w-11 h-11 rounded-full bg-terracotta text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <Plus size={22} />
        </button>
      </header>

      <div className="px-5 pb-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pantry"
            className="w-full rounded-xl bg-white border border-divider pl-9 pr-3 py-2.5 text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink-muted/50"
          />
        </div>
      </div>

      {ingredients.length === 0 ? (
        <EmptyState onAdd={() => setEditing('new')} />
      ) : grouped.length === 0 ? (
        <p className="px-5 text-sm text-ink-muted">
          No ingredients match "{query}".
        </p>
      ) : (
        <div className="space-y-6 px-5">
          {grouped.map(({ category, items }) => (
            <section key={category.id}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.dotColor }}
                />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {category.label}
                </h2>
                <span className="text-xs text-ink-muted">{items.length}</span>
              </div>
              <div className="bg-white rounded-2xl divide-y divide-divider overflow-hidden">
                {items.map((ing) => (
                  <IngredientRow
                    key={ing.id}
                    ingredient={ing}
                    onClick={() => setEditing(ing.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Sheet
        open={sheetOpen}
        onClose={() => setEditing(null)}
        title={editingItem ? 'Edit ingredient' : 'New ingredient'}
      >
        {sheetOpen && (
          <IngredientForm
            initial={editingItem}
            onSave={(data) => {
              if (editingItem) onUpdate(editingItem.id, data)
              else onAdd(data)
              setEditing(null)
            }}
            onDelete={
              editingItem
                ? () => {
                    onDelete(editingItem.id)
                    setEditing(null)
                  }
                : null
            }
            onCancel={() => setEditing(null)}
          />
        )}
      </Sheet>
    </div>
  )
}

function IngredientRow({ ingredient, onClick }) {
  const meta = [
    `${ingredient.purchase_quantity} ${displayUnit(ingredient.purchase_unit)}`,
    `$${ingredient.purchase_price?.toFixed(2)}`,
    relativeTime(ingredient.last_purchased_at),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 active:bg-cream/60 transition-colors"
    >
      <div className="min-w-0">
        <div className="font-medium text-ink truncate">{ingredient.name}</div>
        <div className="text-xs text-ink-muted mt-0.5 truncate">{meta}</div>
      </div>
      <div className="text-terracotta font-medium tabular-nums shrink-0">
        {formatCostPerUnit(ingredient)}
      </div>
    </button>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="text-ink-muted mb-4">Your pantry is empty.</p>
      <button
        onClick={onAdd}
        className="px-4 py-2.5 rounded-xl bg-terracotta text-white font-medium"
      >
        Add your first ingredient
      </button>
    </div>
  )
}
