import { useState, useEffect, useCallback } from 'react'
import { loadList, saveList } from '../utils/storage'

export function useCollection(key) {
  const [items, setItems] = useState(() => loadList(key))

  useEffect(() => {
    saveList(key, items)
  }, [key, items])

  const add = useCallback((data) => {
    const id = crypto.randomUUID()
    setItems((prev) => [...prev, { id, ...data }])
    return id
  }, [])

  const update = useCallback((id, patch) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }, [])

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  return { items, add, update, remove, setItems }
}
