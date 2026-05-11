import { useState, useCallback } from 'react'
import BottomNav from './components/BottomNav'
import Pantry from './components/Pantry'
import Items from './components/Items'
import ItemDetail from './components/ItemDetail'
import Sales from './components/Sales'
import More from './components/More'
import { useCollection } from './hooks/useCollection'
import { useSettings } from './hooks/useSettings'
import { KEYS, DEFAULT_SETTINGS } from './utils/storage'

export default function App() {
  const [tab, setTab] = useState('items')
  const [viewingItemId, setViewingItemId] = useState(null)

  const ingredients = useCollection(KEYS.ingredients)
  const items = useCollection(KEYS.items)
  const recipes = useCollection(KEYS.recipes)
  const recipeIngredients = useCollection(KEYS.recipeIngredients)
  const settings = useSettings()

  const store = {
    ingredients,
    items,
    recipes,
    recipeIngredients,
    settings: settings.settings,
  }

  const createItem = useCallback(
    (data) => {
      const id = crypto.randomUUID()
      items.setItems((prev) => [...prev, { id, ...data }])
      recipes.setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          item_id: id,
          batch_yield: 24,
          labor_minutes: 0,
          notes: '',
        },
      ])
      return id
    },
    [items, recipes]
  )

  const deleteItem = useCallback(
    (id) => {
      const recipe = recipes.items.find((r) => r.item_id === id)
      if (recipe) {
        recipeIngredients.setItems((prev) =>
          prev.filter((ri) => ri.recipe_id !== recipe.id)
        )
        recipes.setItems((prev) => prev.filter((r) => r.id !== recipe.id))
      }
      items.setItems((prev) => prev.filter((i) => i.id !== id))
    },
    [items, recipes, recipeIngredients]
  )

  const handleExport = () => {
    const data = {
      version: 1,
      exported_at: new Date().toISOString(),
      ingredients: ingredients.items,
      items: items.items,
      recipes: recipes.items,
      recipeIngredients: recipeIngredients.items,
      settings: settings.settings,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crumb-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleImport = (data) => {
    if (Array.isArray(data.ingredients)) ingredients.setItems(data.ingredients)
    if (Array.isArray(data.items)) items.setItems(data.items)
    if (Array.isArray(data.recipes)) recipes.setItems(data.recipes)
    if (Array.isArray(data.recipeIngredients))
      recipeIngredients.setItems(data.recipeIngredients)
    if (data.settings && typeof data.settings === 'object') {
      settings.setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
    }
    setViewingItemId(null)
  }

  const handleClearAll = () => {
    ingredients.setItems([])
    items.setItems([])
    recipes.setItems([])
    recipeIngredients.setItems([])
    settings.setSettings(DEFAULT_SETTINGS)
    setViewingItemId(null)
  }

  const changeTab = (newTab) => {
    setTab(newTab)
    setViewingItemId(null)
  }

  const inDetail = tab === 'items' && viewingItemId != null

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-md">
        {tab === 'items' && !inDetail && (
          <Items store={store} onCreate={createItem} onOpen={setViewingItemId} />
        )}
        {inDetail && (
          <ItemDetail
            itemId={viewingItemId}
            store={store}
            onBack={() => setViewingItemId(null)}
            onDelete={() => {
              const id = viewingItemId
              setViewingItemId(null)
              deleteItem(id)
            }}
          />
        )}
        {tab === 'pantry' && (
          <Pantry
            ingredients={ingredients.items}
            onAdd={ingredients.add}
            onUpdate={ingredients.update}
            onDelete={ingredients.remove}
          />
        )}
        {tab === 'sales' && <Sales store={store} />}
        {tab === 'more' && (
          <More
            settings={settings.settings}
            onUpdateSettings={settings.update}
            onExport={handleExport}
            onImport={handleImport}
            onClearAll={handleClearAll}
          />
        )}
      </div>
      <BottomNav active={tab} onChange={changeTab} />
    </div>
  )
}
