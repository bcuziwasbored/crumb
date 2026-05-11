import { lineCost } from './conversions'

export function ingredientLineCost(ingredients, recipeIngredient) {
  const ing = ingredients.find((i) => i.id === recipeIngredient.ingredient_id)
  if (!ing) return 0
  return lineCost(ing, recipeIngredient.quantity, recipeIngredient.unit) ?? 0
}

export function batchIngredientCost(ingredients, recipeIngredients) {
  return recipeIngredients.reduce(
    (sum, ri) => sum + ingredientLineCost(ingredients, ri),
    0
  )
}

export function batchLaborCost(recipe, settings) {
  if (!recipe?.labor_minutes) return 0
  return (recipe.labor_minutes / 60) * (settings?.labor_rate_per_hour || 0)
}

export function batchTotalCost(recipe, ingredients, recipeIngredients, settings) {
  return (
    batchIngredientCost(ingredients, recipeIngredients) +
    batchLaborCost(recipe, settings)
  )
}

export function costPerItem(recipe, ingredients, recipeIngredients, settings) {
  const y = recipe?.batch_yield || 1
  return batchTotalCost(recipe, ingredients, recipeIngredients, settings) / y
}

export function marginPercent(price, cost) {
  if (price == null || price <= 0) return null
  return ((price - cost) / price) * 100
}

export function priceForMargin(cost, marginPct) {
  if (marginPct >= 100) return Infinity
  return cost / (1 - marginPct / 100)
}
