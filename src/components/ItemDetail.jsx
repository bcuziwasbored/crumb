import { useState, useRef } from 'react'
import { ChevronLeft } from 'lucide-react'
import {
  ITEM_CATEGORY_BY_ID,
  unitLabelForCategory,
} from '../utils/items'
import {
  ALL_UNITS,
  displayUnit,
  unitsCompatible,
  lineCost,
} from '../utils/conversions'
import {
  batchIngredientCost,
  batchTotalCost,
  costPerItem,
  ingredientLineCost,
  marginPercent,
  priceForMargin,
} from '../utils/calc'
import { formatMoney } from '../utils/format'
import { cropAndResizeSquare } from '../utils/image'
import ItemAvatar from './ItemAvatar'
import Sheet from './Sheet'

export default function ItemDetail({ itemId, store, onBack, onDelete }) {
  const [tab, setTab] = useState('ingredients')

  const item = store.items.items.find((i) => i.id === itemId)
  const recipe = store.recipes.items.find((r) => r.item_id === itemId)
  const recipeLines = store.recipeIngredients.items.filter(
    (ri) => ri.recipe_id === recipe?.id
  )

  if (!item) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="text-ink-muted">
          ← Back
        </button>
        <p className="mt-4 text-ink-muted">Item not found.</p>
      </div>
    )
  }

  const cost = costPerItem(
    recipe,
    store.ingredients.items,
    recipeLines,
    store.settings
  )
  const batchTotal = batchTotalCost(
    recipe,
    store.ingredients.items,
    recipeLines,
    store.settings
  )
  const margin = marginPercent(item.price, cost)
  const unitLabel = unitLabelForCategory(item.category)

  const updateItem = (patch) => store.items.update(item.id, patch)
  const updateRecipe = (patch) => {
    if (recipe) store.recipes.update(recipe.id, patch)
  }

  return (
    <div className="pb-28">
      <DetailHeader
        item={item}
        recipe={recipe}
        onBack={onBack}
        onUpdateItem={updateItem}
      />

      <HeroCard cost={cost} unitLabel={unitLabel} item={item} margin={margin} />

      <TabBar tab={tab} onChange={setTab} />

      <div className="px-5 pt-4">
        {tab === 'ingredients' && (
          <IngredientsTab
            recipe={recipe}
            recipeLines={recipeLines}
            pantry={store.ingredients.items}
            batchTotal={batchTotal}
            onUpdateRecipe={updateRecipe}
            onAddLine={(data) =>
              store.recipeIngredients.add({ ...data, recipe_id: recipe.id })
            }
            onUpdateLine={(id, patch) =>
              store.recipeIngredients.update(id, patch)
            }
            onDeleteLine={(id) => store.recipeIngredients.remove(id)}
          />
        )}
        {tab === 'pricing' && (
          <PricingTab item={item} cost={cost} onUpdateItem={updateItem} />
        )}
        {tab === 'notes' && (
          <NotesTab
            item={item}
            recipe={recipe}
            onUpdateItem={updateItem}
            onUpdateRecipe={updateRecipe}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  )
}

function DetailHeader({ item, recipe, onBack, onUpdateItem }) {
  const fileRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const dataURL = await cropAndResizeSquare(file)
      onUpdateItem({ image: dataURL })
    } catch (err) {
      console.error('Image processing failed', err)
    }
    e.target.value = ''
  }

  const categoryLabel = ITEM_CATEGORY_BY_ID[item.category]?.label ?? 'Item'
  const yieldText = recipe?.batch_yield
    ? `makes ${recipe.batch_yield}`
    : 'no batch yet'

  return (
    <header className="px-3 pt-4 pb-3 flex items-center gap-2">
      <button
        onClick={onBack}
        className="p-2 text-ink hover:bg-white rounded-full"
        aria-label="Back"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        aria-label="Change photo"
        className="active:scale-95 transition-transform"
      >
        <ItemAvatar item={item} size={44} />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
      />
      <div className="flex-1 min-w-0">
        <input
          value={item.name}
          onChange={(e) => onUpdateItem({ name: e.target.value })}
          className="w-full text-lg font-semibold tracking-tight text-ink bg-transparent border-none focus:outline-none focus:bg-white rounded px-1 -mx-1"
        />
        <p className="text-xs text-ink-muted mt-0.5 px-1">
          {categoryLabel} · {yieldText}
        </p>
      </div>
    </header>
  )
}

function HeroCard({ cost, unitLabel, item, margin }) {
  return (
    <div className="mx-5 mt-2 bg-terracotta-bg rounded-2xl p-5 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-terracotta/80">
          Cost per {unitLabel}
        </div>
        <div className="text-4xl font-semibold text-terracotta tabular-nums mt-1">
          {cost > 0 ? formatMoney(cost) : '—'}
        </div>
      </div>
      {item.price != null && (
        <div className="text-right shrink-0">
          <div className="text-[11px] text-ink-muted">Your price</div>
          <div className="text-lg text-ink font-medium tabular-nums">
            {formatMoney(item.price)}
          </div>
          {margin != null && (
            <div
              className={`text-xs font-medium ${
                margin >= 0 ? 'text-sage' : 'text-red-600'
              }`}
            >
              {margin.toFixed(1)}% margin
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TabBar({ tab, onChange }) {
  const tabs = [
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'notes', label: 'Notes' },
  ]
  return (
    <div className="mx-5 mt-5 bg-white rounded-full p-1 flex gap-1">
      {tabs.map((t) => {
        const active = tab === t.id
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
              active
                ? 'bg-cream-soft text-ink shadow-sm'
                : 'text-ink-muted'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

function IngredientsTab({
  recipe,
  recipeLines,
  pantry,
  batchTotal,
  onUpdateRecipe,
  onAddLine,
  onUpdateLine,
  onDeleteLine,
}) {
  const [adding, setAdding] = useState(false)
  const [editingLineId, setEditingLineId] = useState(null)

  const editingLine = editingLineId
    ? recipeLines.find((l) => l.id === editingLineId)
    : null

  const totalIngredientCost = batchIngredientCost(pantry, recipeLines)

  const enriched = recipeLines.map((ri) => {
    const ing = pantry.find((i) => i.id === ri.ingredient_id)
    const cost = ingredientLineCost(pantry, ri)
    const pct = totalIngredientCost > 0 ? (cost / totalIngredientCost) * 100 : 0
    return { ri, ing, cost, pct }
  })

  return (
    <div>
      <YieldRow recipe={recipe} onUpdateRecipe={onUpdateRecipe} />

      <div className="flex items-baseline justify-between mt-4 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {recipeLines.length}{' '}
          {recipeLines.length === 1 ? 'ingredient' : 'ingredients'}
        </span>
        <span className="text-sm text-ink-muted">
          Batch{' '}
          <span className="text-ink font-medium tabular-nums">
            {formatMoney(batchTotal)}
          </span>
        </span>
      </div>

      {recipeLines.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 mt-2 text-center text-ink-muted text-sm">
          No ingredients yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl mt-2 divide-y divide-divider overflow-hidden">
          {enriched.map(({ ri, ing, cost, pct }) => (
            <button
              key={ri.id}
              onClick={() => setEditingLineId(ri.id)}
              className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 active:bg-cream-soft"
            >
              <div className="min-w-0">
                <div className="font-medium text-ink truncate">
                  {ing?.name ?? (
                    <span className="text-ink-muted italic">
                      Unknown ingredient
                    </span>
                  )}
                </div>
                <div className="text-xs text-ink-muted mt-0.5">
                  {ri.quantity} {displayUnit(ri.unit)} · {Math.round(pct)}% of
                  cost
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="font-medium text-ink tabular-nums">
                  {formatMoney(cost)}
                </div>
                <div className="h-1 w-16 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-terracotta-soft"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setAdding(true)}
        className="mt-3 w-full py-3 rounded-2xl border-2 border-dashed border-divider text-ink-muted hover:bg-white transition-colors text-sm font-medium"
      >
        + Add ingredient
      </button>

      <Sheet
        open={adding}
        onClose={() => setAdding(false)}
        title="Add ingredient"
      >
        {adding && (
          <RecipeIngredientForm
            pantry={pantry}
            onSave={(data) => {
              onAddLine(data)
              setAdding(false)
            }}
            onCancel={() => setAdding(false)}
          />
        )}
      </Sheet>

      <Sheet
        open={editingLine != null}
        onClose={() => setEditingLineId(null)}
        title="Edit ingredient"
      >
        {editingLine && (
          <RecipeIngredientForm
            pantry={pantry}
            initial={editingLine}
            onSave={(data) => {
              onUpdateLine(editingLine.id, data)
              setEditingLineId(null)
            }}
            onDelete={() => {
              onDeleteLine(editingLine.id)
              setEditingLineId(null)
            }}
            onCancel={() => setEditingLineId(null)}
          />
        )}
      </Sheet>
    </div>
  )
}

function YieldRow({ recipe, onUpdateRecipe }) {
  const [value, setValue] = useState(String(recipe?.batch_yield ?? 1))

  const commit = () => {
    const v = Math.max(1, parseInt(value, 10) || 1)
    setValue(String(v))
    onUpdateRecipe({ batch_yield: v })
  }

  return (
    <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between">
      <span className="text-sm text-ink-muted">Makes</span>
      <input
        type="number"
        min="1"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        className="w-20 text-right text-lg font-semibold text-ink bg-transparent border-none focus:outline-none tabular-nums"
      />
    </div>
  )
}

function RecipeIngredientForm({ pantry, initial, onSave, onDelete, onCancel }) {
  const [ingredientId, setIngredientId] = useState(
    initial?.ingredient_id ?? pantry[0]?.id ?? ''
  )
  const ingredient = pantry.find((i) => i.id === ingredientId)
  const [quantity, setQuantity] = useState(
    initial?.quantity != null ? String(initial.quantity) : ''
  )
  const [unit, setUnit] = useState(
    initial?.unit ?? ingredient?.purchase_unit ?? 'g'
  )
  const [confirmDelete, setConfirmDelete] = useState(false)

  const onIngredientChange = (newId) => {
    setIngredientId(newId)
    const ing = pantry.find((p) => p.id === newId)
    if (ing && !unitsCompatible(unit, ing.purchase_unit)) {
      setUnit(ing.purchase_unit)
    }
  }

  if (pantry.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-ink-muted mb-4">
          Your pantry is empty. Add ingredients there first.
        </p>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl bg-terracotta text-white font-medium"
        >
          Got it
        </button>
      </div>
    )
  }

  const compatibleUnits = ingredient
    ? ALL_UNITS.filter((u) => unitsCompatible(u, ingredient.purchase_unit))
    : ALL_UNITS

  const numericQty = parseFloat(quantity) || 0
  const previewCost =
    ingredient && numericQty > 0 ? lineCost(ingredient, numericQty, unit) : null

  const canSave = ingredient && numericQty > 0

  const submit = (e) => {
    e.preventDefault()
    if (!canSave) return
    onSave({
      ingredient_id: ingredientId,
      quantity: numericQty,
      unit,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
          Ingredient
        </span>
        <select
          value={ingredientId}
          onChange={(e) => onIngredientChange(e.target.value)}
          className="input bg-white"
        >
          {pantry
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
      </label>

      <div className="flex gap-2">
        <label className="flex-1">
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Quantity
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input"
            placeholder="113"
          />
        </label>
        <label className="w-28">
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Unit
          </span>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="input bg-white"
          >
            {compatibleUnits.map((u) => (
              <option key={u} value={u}>
                {displayUnit(u)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {previewCost != null && (
        <div className="bg-cream-soft rounded-xl px-4 py-2.5 text-sm flex items-center justify-between">
          <span className="text-ink-muted">Line cost</span>
          <span className="text-terracotta font-medium tabular-nums">
            {formatMoney(previewCost)}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
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
              Remove
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

function PricingTab({ item, cost, onUpdateItem }) {
  const [priceInput, setPriceInput] = useState(
    item.price != null ? item.price.toFixed(2) : ''
  )

  const numericPrice = parseFloat(priceInput) || 0
  const currentMargin =
    numericPrice > 0 ? marginPercent(numericPrice, cost) : null

  const tiers = [50, 60, 70, 80].map((pct) => ({
    margin: pct,
    price: priceForMargin(cost, pct),
  }))

  const commit = () => {
    const v = parseFloat(priceInput)
    const rounded =
      Number.isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : null
    setPriceInput(rounded != null ? rounded.toFixed(2) : '')
    onUpdateItem({ price: rounded })
  }

  const setExact = (p) => {
    const rounded = Math.round(p * 100) / 100
    setPriceInput(String(rounded.toFixed(2)))
    onUpdateItem({ price: rounded })
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
          Your price
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              onBlur={commit}
              className="input pl-7"
              placeholder="0.00"
            />
          </div>
          {currentMargin != null && (
            <div className="text-sm shrink-0">
              <span
                className={`font-medium ${
                  currentMargin < 0 ? 'text-red-600' : 'text-terracotta'
                }`}
              >
                {currentMargin.toFixed(1)}%
              </span>
              <span className="text-ink-muted ml-1">margin</span>
            </div>
          )}
        </div>
      </div>

      {cost > 0 ? (
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 pt-3 pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Pricing ladder
            </h3>
            <p className="text-xs text-ink-muted/80 mt-0.5">
              Tap a row to set that price.
            </p>
          </div>
          <div className="divide-y divide-divider">
            {tiers.map(({ margin, price }) => (
              <button
                key={margin}
                onClick={() => setExact(price)}
                className="w-full flex items-center justify-between px-4 py-3 active:bg-cream-soft"
              >
                <span className="text-ink">
                  <span className="text-terracotta font-medium tabular-nums">
                    {margin}%
                  </span>{' '}
                  margin
                </span>
                <span className="text-ink font-medium tabular-nums">
                  {formatMoney(price)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 text-center text-sm text-ink-muted">
          Add ingredients to see pricing suggestions.
        </div>
      )}
    </div>
  )
}

function NotesTab({ item, recipe, onUpdateItem, onUpdateRecipe, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 space-y-3">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Description
          </span>
          <textarea
            value={item.description || ''}
            onChange={(e) => onUpdateItem({ description: e.target.value })}
            rows="2"
            className="input resize-none"
            placeholder="What makes this one special"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Recipe notes
          </span>
          <textarea
            value={recipe?.notes || ''}
            onChange={(e) => onUpdateRecipe({ notes: e.target.value })}
            rows="3"
            className="input resize-none"
            placeholder="Chill dough 30 min, oven 375°F, etc."
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Labor time (minutes)
          </span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={recipe?.labor_minutes || ''}
            onChange={(e) =>
              onUpdateRecipe({
                labor_minutes: parseFloat(e.target.value) || 0,
              })
            }
            className="input"
            placeholder="45"
          />
          <p className="text-xs text-ink-muted mt-1">
            Only used in cost calc if enabled in Settings.
          </p>
        </label>
      </div>

      <div className="bg-white rounded-2xl divide-y divide-divider">
        <ToggleRow
          label="Gluten-free"
          checked={item.gluten_free === true}
          onChange={(v) => onUpdateItem({ gluten_free: v })}
        />
        <ToggleRow
          label="Active"
          checked={item.active !== false}
          onChange={(v) => onUpdateItem({ active: v })}
        />
      </div>

      <div className="pt-2">
        {confirmDelete ? (
          <div className="bg-terracotta-bg rounded-2xl p-4 space-y-3">
            <p className="text-sm text-ink">
              Delete <span className="font-medium">{item.name}</span> and its
              recipe? This can't be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-2 rounded-xl text-ink-muted"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 rounded-xl bg-terracotta text-white font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3 rounded-2xl text-terracotta font-medium"
          >
            Delete item
          </button>
        )}
      </div>
    </div>
  )
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
      <span className="text-ink">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 accent-terracotta"
      />
    </label>
  )
}
