const TO_BASE = {
  g: 1,
  oz: 28.3495,
  lb: 453.592,
  ml: 1,
  fl_oz: 29.5735,
  tsp: 5,
  tbsp: 15,
  cup: 240,
  each: 1,
}

const FAMILY = {
  g: 'weight', oz: 'weight', lb: 'weight',
  ml: 'volume', fl_oz: 'volume', tsp: 'volume', tbsp: 'volume', cup: 'volume',
  each: 'count',
}

const UNIT_DISPLAY = {
  g: 'g', oz: 'oz', lb: 'lb',
  ml: 'ml', fl_oz: 'fl oz', tsp: 'tsp', tbsp: 'tbsp', cup: 'cup',
  each: 'each',
}

export const ALL_UNITS = Object.keys(TO_BASE)
export const WEIGHT_UNITS = ['g', 'oz', 'lb']
export const VOLUME_UNITS = ['ml', 'fl_oz', 'tsp', 'tbsp', 'cup']
export const COUNT_UNITS = ['each']

export function unitFamily(unit) {
  return FAMILY[unit] ?? null
}

export function unitsCompatible(a, b) {
  return FAMILY[a] != null && FAMILY[a] === FAMILY[b]
}

export function displayUnit(unit) {
  return UNIT_DISPLAY[unit] ?? unit
}

export function convert(quantity, from, to) {
  if (!unitsCompatible(from, to)) return null
  return (quantity * TO_BASE[from]) / TO_BASE[to]
}

export function costPerUnit(ingredient) {
  if (!ingredient) return 0
  const { purchase_price, purchase_quantity } = ingredient
  if (!purchase_price || !purchase_quantity) return 0
  return purchase_price / purchase_quantity
}

export function formatCostPerUnit(ingredient) {
  const cpu = costPerUnit(ingredient)
  if (!cpu) return '—'
  const decimals = cpu < 0.1 ? 3 : 2
  return `$${cpu.toFixed(decimals)}/${displayUnit(ingredient.purchase_unit)}`
}

export function lineCost(ingredient, quantity, unit) {
  if (!ingredient) return null
  const converted = convert(quantity, unit, ingredient.purchase_unit)
  if (converted == null) return null
  return converted * costPerUnit(ingredient)
}
