import { useState } from 'react'
import { CATEGORIES, DEFAULT_CATEGORY } from '../utils/categories'
import {
  ALL_UNITS,
  displayUnit,
  formatCostPerUnit,
} from '../utils/conversions'

const EMPTY = {
  name: '',
  category: DEFAULT_CATEGORY,
  purchase_price: '',
  purchase_quantity: '',
  purchase_unit: 'g',
  notes: '',
}

function fromInitial(initial) {
  if (!initial) return EMPTY
  return {
    ...EMPTY,
    ...initial,
    purchase_price:
      initial.purchase_price != null ? String(initial.purchase_price) : '',
    purchase_quantity:
      initial.purchase_quantity != null
        ? String(initial.purchase_quantity)
        : '',
  }
}

export default function IngredientForm({ initial, onSave, onDelete, onCancel }) {
  const [form, setForm] = useState(() => fromInitial(initial))
  const [confirmDelete, setConfirmDelete] = useState(false)

  const numericPrice = parseFloat(form.purchase_price) || 0
  const numericQty = parseFloat(form.purchase_quantity) || 0
  const previewIngredient = {
    purchase_price: numericPrice,
    purchase_quantity: numericQty,
    purchase_unit: form.purchase_unit,
  }
  const showPreview = numericPrice > 0 && numericQty > 0
  const canSave = form.name.trim() && numericPrice > 0 && numericQty > 0

  const submit = (e) => {
    e.preventDefault()
    if (!canSave) return
    const priceChanged =
      !initial || initial.purchase_price !== numericPrice
    onSave({
      name: form.name.trim(),
      category: form.category,
      purchase_price: numericPrice,
      purchase_quantity: numericQty,
      purchase_unit: form.purchase_unit,
      notes: form.notes.trim(),
      last_purchased_at:
        priceChanged || !initial?.last_purchased_at
          ? new Date().toISOString()
          : initial.last_purchased_at,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Name">
        <input
          autoFocus
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input"
          placeholder="Cream Cheese"
        />
      </Field>

      <Field label="Category">
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="input bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="What you paid">
        <div className="flex gap-2 items-stretch">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={form.purchase_price}
              onChange={(e) =>
                setForm({ ...form, purchase_price: e.target.value })
              }
              className="input pl-7"
              placeholder="3.49"
            />
          </div>
          <span className="self-center text-ink-muted text-sm">for</span>
          <input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={form.purchase_quantity}
            onChange={(e) =>
              setForm({ ...form, purchase_quantity: e.target.value })
            }
            className="input w-20"
            placeholder="226.8"
          />
          <select
            value={form.purchase_unit}
            onChange={(e) =>
              setForm({ ...form, purchase_unit: e.target.value })
            }
            className="input bg-white w-20"
          >
            {ALL_UNITS.map((u) => (
              <option key={u} value={u}>
                {displayUnit(u)}
              </option>
            ))}
          </select>
        </div>
        {showPreview && (
          <p className="mt-2 text-sm text-terracotta font-medium tabular-nums">
            {formatCostPerUnit(previewIngredient)}
          </p>
        )}
      </Field>

      <Field label="Notes (optional)">
        <input
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="input"
          placeholder="Costco brand, 8oz block, etc."
        />
      </Field>

      <div className="flex items-center gap-2 pt-3">
        {onDelete &&
          (confirmDelete ? (
            <>
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2.5 rounded-xl bg-terracotta text-white font-medium"
              >
                Confirm delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-2.5 rounded-xl text-ink-muted"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2.5 rounded-xl text-terracotta bg-terracotta-bg font-medium"
            >
              Delete
            </button>
          ))}
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
        {label}
      </span>
      {children}
    </label>
  )
}
