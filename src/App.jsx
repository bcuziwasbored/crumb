import { useState, useCallback } from 'react'
import BottomNav from './components/BottomNav'
import Pantry from './components/Pantry'
import Items from './components/Items'
import ItemDetail from './components/ItemDetail'
import { useCollection } from './hooks/useCollection'
import { KEYS, DEFAULT_SETTINGS } from './utils/storage'

export default function App() {
  const [tab, setTab] = useState('items')
  const [viewingItemId, setViewingItemId] = useState(null)

  const ingredients = useCollection(KEYS.ingredients)
  const items = useCollection(KEYS.items)
  const recipes = useCollection(KEYS.recipes)
  const recipeIngredients = useCollection(KEYS.recipeIngredients)
  const settings = DEFAULT_SETTINGS

  const store = {
    ingredients,
    items,
    recipes,
    recipeIngredients,
    settings,
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

  const changeTab = (newTab) => {
    setTab(newTab)
    setViewingItemId(null)
  }

  const inDetail = tab === 'items' && viewingItemId != null

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-md">
        {tab === 'items' && !inDetail && (
          <Items
            store={store}
            onCreate={createItem}
            onOpen={setViewingItemId}
          />
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
        {(tab === 'sales' || tab === 'more') && <Placeholder name={tab} />}
      </div>
      <BottomNav active={tab} onChange={changeTab} />
    </div>
  )
}

function Placeholder({ name }) {
  return (
    <div className="px-5 pt-6 pb-28">
      <h1 className="text-3xl font-semibold capitalize tracking-tight">
        {name}
      </h1>
      <p className="text-ink-muted mt-2">Coming next.</p>
    </div>
  )
}
