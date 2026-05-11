import { useState } from 'react'
import BottomNav from './components/BottomNav'
import Pantry from './components/Pantry'
import { useCollection } from './hooks/useCollection'
import { KEYS } from './utils/storage'

export default function App() {
  const [tab, setTab] = useState('pantry')
  const ingredients = useCollection(KEYS.ingredients)

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-md">
        {tab === 'pantry' && (
          <Pantry
            ingredients={ingredients.items}
            onAdd={ingredients.add}
            onUpdate={ingredients.update}
            onDelete={ingredients.remove}
          />
        )}
        {tab !== 'pantry' && <Placeholder name={tab} />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
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
