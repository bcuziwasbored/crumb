const PREFIX = 'bkp_'

export const KEYS = {
  ingredients: `${PREFIX}ingredients`,
  items: `${PREFIX}items`,
  recipes: `${PREFIX}recipes`,
  recipeIngredients: `${PREFIX}recipe_ingredients`,
  settings: `${PREFIX}settings`,
}

export const DEFAULT_SETTINGS = {
  labor_rate_per_hour: 15,
  include_labor_in_cost: false,
  currency: 'USD',
}

export function loadList(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list))
}

export function loadObject(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

export function saveObject(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function exportAll() {
  const data = { version: 1, exported_at: new Date().toISOString() }
  for (const [name, key] of Object.entries(KEYS)) {
    data[name] = name === 'settings'
      ? loadObject(key, DEFAULT_SETTINGS)
      : loadList(key)
  }
  return data
}

export function importAll(data) {
  for (const [name, key] of Object.entries(KEYS)) {
    if (data[name] != null) {
      localStorage.setItem(key, JSON.stringify(data[name]))
    }
  }
}

export function clearAll() {
  for (const key of Object.values(KEYS)) {
    localStorage.removeItem(key)
  }
}
