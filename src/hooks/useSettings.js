import { useState, useEffect, useCallback } from 'react'
import { KEYS, DEFAULT_SETTINGS, loadObject, saveObject } from '../utils/storage'

export function useSettings() {
  const [settings, setSettings] = useState(() =>
    loadObject(KEYS.settings, DEFAULT_SETTINGS)
  )

  useEffect(() => {
    saveObject(KEYS.settings, settings)
  }, [settings])

  const update = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  return { settings, setSettings, update }
}
