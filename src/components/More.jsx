import { useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import Sheet from './Sheet'

export default function More({
  settings,
  onUpdateSettings,
  onExport,
  onImport,
  onClearAll,
}) {
  const importRef = useRef(null)
  const [pendingImport, setPendingImport] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [importError, setImportError] = useState(null)

  const handleImportFile = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (typeof data !== 'object' || data == null) throw new Error('bad shape')
      setPendingImport(data)
      setImportError(null)
    } catch {
      setImportError("Couldn't read that file. Is it a valid Crumb export?")
    }
  }

  const counts = pendingImport && {
    items: Array.isArray(pendingImport.items) ? pendingImport.items.length : 0,
    ingredients: Array.isArray(pendingImport.ingredients)
      ? pendingImport.ingredients.length
      : 0,
    recipes: Array.isArray(pendingImport.recipes)
      ? pendingImport.recipes.length
      : 0,
  }

  return (
    <div className="pb-28">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">More</h1>
      </header>

      <div className="px-5 space-y-5">
        <Section title="Labor">
          <div className="bg-white rounded-2xl divide-y divide-divider overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-ink">Hourly rate</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  inputMode="decimal"
                  value={settings.labor_rate_per_hour}
                  onChange={(e) =>
                    onUpdateSettings({
                      labor_rate_per_hour: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-24 pl-6 pr-2 py-1.5 rounded-lg border border-divider text-right tabular-nums focus:outline-none focus:border-ink-muted/50"
                />
              </div>
            </div>
            <ToggleRow
              label="Include labor in cost"
              subtitle="Adds labor cost to batch totals."
              checked={settings.include_labor_in_cost}
              onChange={(v) =>
                onUpdateSettings({ include_labor_in_cost: v })
              }
            />
          </div>
        </Section>

        <Section title="Data">
          <div className="bg-white rounded-2xl divide-y divide-divider overflow-hidden">
            <ActionRow label="Export all data" onClick={onExport} />
            <ActionRow
              label="Import from backup"
              onClick={() => importRef.current?.click()}
            />
          </div>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={handleImportFile}
          />
          {importError && (
            <p className="text-xs text-red-600 mt-2 px-1">{importError}</p>
          )}
        </Section>

        <Section title="Danger zone">
          <button
            onClick={() => setConfirmClear(true)}
            className="w-full py-3 rounded-2xl bg-white text-terracotta font-medium"
          >
            Clear all data
          </button>
        </Section>

        <p className="text-xs text-ink-muted/70 text-center pt-2">
          Crumb stores everything locally in your browser.
        </p>
      </div>

      <Sheet
        open={pendingImport != null}
        onClose={() => setPendingImport(null)}
        title="Replace data?"
      >
        {pendingImport && (
          <div className="space-y-4">
            <p className="text-sm text-ink">
              This will replace your current pantry, items, and recipes with
              the file's contents. There's no undo.
            </p>
            <div className="bg-cream-soft rounded-xl px-4 py-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-ink-muted">Items</span>
                <span className="text-ink tabular-nums">{counts.items}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Ingredients</span>
                <span className="text-ink tabular-nums">
                  {counts.ingredients}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Recipes</span>
                <span className="text-ink tabular-nums">{counts.recipes}</span>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPendingImport(null)}
                className="px-4 py-2.5 rounded-xl text-ink-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onImport(pendingImport)
                  setPendingImport(null)
                }}
                className="px-4 py-2.5 rounded-xl bg-terracotta text-white font-medium"
              >
                Replace data
              </button>
            </div>
          </div>
        )}
      </Sheet>

      <Sheet
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear all data?"
      >
        <div className="space-y-4">
          <p className="text-sm text-ink">
            This will delete every item, ingredient, recipe, and setting.
          </p>
          <p className="text-sm text-ink-muted">There's no undo.</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setConfirmClear(false)}
              className="px-4 py-2.5 rounded-xl text-ink-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClearAll()
                setConfirmClear(false)
              }}
              className="px-4 py-2.5 rounded-xl bg-terracotta text-white font-medium"
            >
              Delete everything
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2 px-1">
        {title}
      </h2>
      {children}
    </section>
  )
}

function ToggleRow({ label, subtitle, checked, onChange }) {
  return (
    <label className="flex items-center justify-between px-4 py-3 cursor-pointer gap-3">
      <div className="min-w-0">
        <div className="text-ink">{label}</div>
        {subtitle && (
          <div className="text-xs text-ink-muted mt-0.5">{subtitle}</div>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 accent-terracotta shrink-0"
      />
    </label>
  )
}

function ActionRow({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 active:bg-cream-soft text-left"
    >
      <span className="text-ink">{label}</span>
      <ChevronRight size={18} className="text-ink-muted" />
    </button>
  )
}
