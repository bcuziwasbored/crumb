import { useState } from 'react'
import { ITEM_CATEGORIES, DEFAULT_ITEM_CATEGORY } from '../utils/items'

export default function ItemForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(DEFAULT_ITEM_CATEGORY)

  const canSave = name.trim().length > 0

  const submit = (e) => {
    e.preventDefault()
    if (!canSave) return
    onSave({
      name: name.trim(),
      category,
      description: '',
      image: null,
      price: null,
      gluten_free: false,
      active: true,
      notes: '',
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
          Name
        </span>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="White Choc Raspberry Cookie"
        />
      </label>

      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
          Category
        </span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input bg-white"
        >
          {ITEM_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <p className="text-xs text-ink-muted">
        You'll add ingredients, photo, and pricing next.
      </p>

      <div className="flex items-center gap-2 pt-2">
        <div className="flex-1" />
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-ink-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSave}
          className="px-5 py-2.5 rounded-xl bg-terracotta text-white font-medium disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </form>
  )
}
