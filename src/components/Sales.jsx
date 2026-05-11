import { useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import {
  batchIngredientCost,
  batchLaborCost,
  costPerItem,
} from '../utils/calc'
import { formatMoney } from '../utils/format'
import { unitLabelForCategory } from '../utils/items'
import ItemAvatar from './ItemAvatar'
import Sheet from './Sheet'

let lineCounter = 0
const makeLine = (item_id = null) => ({
  id: `line-${++lineCounter}`,
  item_id,
  baked: '',
  sold: '',
  price: '',
})

export default function Sales({ store }) {
  const [lines, setLines] = useState(() => [makeLine()])
  const [pickingFor, setPickingFor] = useState(null)

  const items = store.items.items

  if (items.length === 0) {
    return (
      <div className="pb-28">
        <header className="px-5 pt-6 pb-4">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Bake recap
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            What baked vs. what sold
          </p>
        </header>
        <div className="px-5 mt-8 text-center">
          <p className="text-ink-muted">
            Add some items first, then come back here to log a bake.
          </p>
        </div>
      </div>
    )
  }

  const updateLine = (id, patch) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))

  const removeLine = (id) =>
    setLines((prev) => prev.filter((l) => l.id !== id))

  const addLine = () => setLines((prev) => [...prev, makeLine()])

  const enriched = lines.map((line) => enrichLine(line, store))

  const totals = enriched.reduce(
    (acc, e) => ({
      revenue: acc.revenue + e.revenue,
      ingredientCost: acc.ingredientCost + e.ingredientCost,
      laborCost: acc.laborCost + e.laborCost,
      profit: acc.profit + e.profit,
      wasted: acc.wasted + e.wasted,
      ifAllSoldProfit: acc.ifAllSoldProfit + e.ifAllSoldProfit,
    }),
    {
      revenue: 0,
      ingredientCost: 0,
      laborCost: 0,
      profit: 0,
      wasted: 0,
      ifAllSoldProfit: 0,
    }
  )
  const totalsMargin =
    totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : null

  const isMultiLine = lines.length > 1
  const hasData = enriched.some((e) => e.hasNumbers)

  return (
    <div className="pb-28">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          {isMultiLine ? 'Market day' : 'Bake recap'}
        </h1>
        <p className="text-sm text-ink-muted mt-0.5">
          {isMultiLine ? 'Total across the day' : 'What baked vs. what sold'}
        </p>
      </header>

      <div className="px-5 space-y-3">
        {enriched.map((data) => (
          <SaleLine
            key={data.line.id}
            data={data}
            removable={lines.length > 1}
            onUpdate={(patch) => updateLine(data.line.id, patch)}
            onRemove={() => removeLine(data.line.id)}
            onPickItem={() => setPickingFor(data.line.id)}
          />
        ))}
      </div>

      <div className="px-5 mt-3">
        <button
          onClick={addLine}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-divider text-ink-muted hover:bg-white transition-colors text-sm font-medium"
        >
          + Add another item {!isMultiLine && '(market day)'}
        </button>
      </div>

      {hasData && (
        <div className="px-5 mt-4">
          <TotalsCard
            totals={totals}
            margin={totalsMargin}
            isMultiLine={isMultiLine}
            singleEnriched={enriched[0]}
          />
        </div>
      )}

      <ItemPickerSheet
        open={pickingFor != null}
        items={items}
        store={store}
        onClose={() => setPickingFor(null)}
        onSelect={(itemId) => {
          updateLine(pickingFor, { item_id: itemId })
          setPickingFor(null)
        }}
      />
    </div>
  )
}

function enrichLine(line, store) {
  const item = store.items.items.find((i) => i.id === line.item_id) ?? null
  const recipe = store.recipes.items.find((r) => r.item_id === line.item_id)
  const recipeLines = store.recipeIngredients.items.filter(
    (ri) => ri.recipe_id === recipe?.id
  )
  const yieldN = recipe?.batch_yield || 1
  const ingredientPerItem = item
    ? batchIngredientCost(store.ingredients.items, recipeLines) / yieldN
    : 0
  const laborPerItem = item ? batchLaborCost(recipe, store.settings) / yieldN : 0
  const cost = item
    ? costPerItem(recipe, store.ingredients.items, recipeLines, store.settings)
    : 0

  const baked = parseFloat(line.baked) || 0
  const sold = parseFloat(line.sold) || 0
  const price = parseFloat(line.price) || 0

  const revenue = sold * price
  const ingredientCost = baked * ingredientPerItem
  const laborCost = baked * laborPerItem
  const totalCost = ingredientCost + laborCost
  const profit = revenue - totalCost
  const sellThrough = baked > 0 ? (sold / baked) * 100 : 0
  const unsold = Math.max(0, baked - sold)
  const wasted = unsold * ingredientPerItem
  const ifAllSoldProfit = baked * price - totalCost
  const margin = revenue > 0 ? (profit / revenue) * 100 : null

  const hasNumbers = item != null && baked > 0 && price > 0

  return {
    line,
    item,
    cost,
    ingredientPerItem,
    laborPerItem,
    baked,
    sold,
    price,
    unsold,
    revenue,
    ingredientCost,
    laborCost,
    profit,
    sellThrough,
    wasted,
    ifAllSoldProfit,
    margin,
    hasNumbers,
  }
}

function SaleLine({ data, removable, onUpdate, onRemove, onPickItem }) {
  const { line, item, cost, baked, sold, unsold, sellThrough, wasted } = data

  const unitLabel = item ? unitLabelForCategory(item.category) : 'item'
  const unsoldText = unsold === 1 ? unitLabel : `${unitLabel}s`

  return (
    <div className="bg-white rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onPickItem}
          className="flex-1 flex items-center gap-3 min-w-0 text-left active:bg-cream-soft -mx-1 px-1 py-1 rounded-xl"
        >
          {item ? (
            <>
              <ItemAvatar item={item} size={36} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink truncate">{item.name}</div>
                <div className="text-xs text-ink-muted tabular-nums">
                  {formatMoney(cost)}/ea
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 text-ink-muted">Pick an item…</div>
          )}
          <ChevronRight size={18} className="text-ink-muted shrink-0" />
        </button>
        {removable && (
          <button
            onClick={onRemove}
            aria-label="Remove line"
            className="p-1 text-ink-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <NumField
          label="Baked"
          value={line.baked}
          onChange={(v) => onUpdate({ baked: v })}
          placeholder="100"
        />
        <NumField
          label="Sold"
          value={line.sold}
          onChange={(v) => onUpdate({ sold: v })}
          placeholder="84"
        />
        <NumField
          label="Price"
          value={line.price}
          onChange={(v) => onUpdate({ price: v })}
          placeholder="5.00"
          prefix="$"
        />
      </div>

      {item && baked > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-ink-muted">
              Sell-through
            </span>
            <span className="text-ink font-medium tabular-nums">
              {Math.round(sellThrough)}%
            </span>
          </div>
          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta transition-all"
              style={{ width: `${Math.min(sellThrough, 100)}%` }}
            />
          </div>
          {sold < baked && (
            <div className="text-xs text-ink-muted mt-1.5">
              {unsold} {unsoldText} unsold · {formatMoney(wasted)} of
              ingredients
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NumField({ label, value, onChange, placeholder, prefix }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-1 text-center">
        {label}
      </span>
      <div className="relative rounded-xl bg-cream-soft border border-divider focus-within:border-ink-muted/50 transition-colors">
        {prefix && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-transparent ${
            prefix ? 'pl-6' : 'pl-2'
          } pr-2 py-2 text-ink text-center font-semibold tabular-nums focus:outline-none placeholder:text-ink-muted/40 placeholder:font-normal`}
        />
      </div>
    </label>
  )
}

function TotalsCard({ totals, margin, isMultiLine, singleEnriched }) {
  const breakdownLabel = isMultiLine ? 'Day total' : 'This bake'

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="px-4 pt-3 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {breakdownLabel}
        </h3>
      </div>
      <div className="px-4 pb-3 space-y-2">
        <Row
          label="Revenue"
          detail={
            !isMultiLine && singleEnriched.hasNumbers
              ? `${singleEnriched.sold} × ${formatMoney(singleEnriched.price)}`
              : null
          }
          value={formatMoney(totals.revenue)}
        />
        <Row
          label="Ingredient cost"
          detail={
            !isMultiLine && singleEnriched.hasNumbers
              ? `${singleEnriched.baked} × ${formatMoney(
                  singleEnriched.ingredientPerItem
                )}`
              : null
          }
          value={`−${formatMoney(totals.ingredientCost)}`}
          negative
        />
        {totals.laborCost > 0 && (
          <Row
            label="Labor cost"
            detail={
              !isMultiLine && singleEnriched.hasNumbers
                ? `${singleEnriched.baked} × ${formatMoney(
                    singleEnriched.laborPerItem
                  )}`
                : null
            }
            value={`−${formatMoney(totals.laborCost)}`}
            negative
          />
        )}
      </div>

      <div className="bg-terracotta-bg px-4 py-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-terracotta/80">
            True profit
          </div>
          <div className="text-4xl font-semibold text-terracotta tabular-nums mt-0.5">
            {formatMoney(totals.profit)}
          </div>
        </div>
        {margin != null && (
          <div className="text-right shrink-0">
            <div className="text-[11px] text-ink-muted">Effective margin</div>
            <div className="text-sm font-medium text-ink tabular-nums">
              {margin.toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 space-y-1.5 text-sm">
        <Row
          label="If everything had sold"
          value={formatMoney(totals.ifAllSoldProfit)}
          small
        />
        <Row
          label="Wasted on unsold"
          value={`−${formatMoney(totals.wasted)}`}
          negative
          small
        />
      </div>
    </div>
  )
}

function Row({ label, detail, value, negative, small }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className={`min-w-0 ${small ? 'text-sm' : ''}`}>
        <span className="text-ink-muted">{label}</span>
        {detail && (
          <span className="text-ink-muted text-xs ml-2 tabular-nums">
            {detail}
          </span>
        )}
      </div>
      <span
        className={`tabular-nums font-medium ${
          negative ? 'text-red-600' : 'text-ink'
        } ${small ? 'text-sm' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}

function ItemPickerSheet({ open, items, store, onClose, onSelect }) {
  return (
    <Sheet open={open} onClose={onClose} title="Choose item">
      <div className="space-y-1">
        {items.map((item) => {
          const recipe = store.recipes.items.find((r) => r.item_id === item.id)
          const recipeLines = store.recipeIngredients.items.filter(
            (ri) => ri.recipe_id === recipe?.id
          )
          const cost = costPerItem(
            recipe,
            store.ingredients.items,
            recipeLines,
            store.settings
          )
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="w-full flex items-center gap-3 p-2 rounded-xl active:bg-cream-soft text-left"
            >
              <ItemAvatar item={item} size={40} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink truncate">
                  {item.name}
                </div>
                <div className="text-xs text-ink-muted tabular-nums">
                  {cost > 0 ? `${formatMoney(cost)}/ea` : 'No cost set'}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}
