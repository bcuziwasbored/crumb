export const ITEM_CATEGORIES = [
  { id: 'cookie', label: 'Cookie', plural: 'Cookies' },
  { id: 'cake', label: 'Cake', plural: 'Cakes' },
  { id: 'cupcake', label: 'Cupcake', plural: 'Cupcakes' },
  { id: 'brownie', label: 'Brownie', plural: 'Brownies' },
  { id: 'bar', label: 'Bar', plural: 'Bars' },
  { id: 'bread', label: 'Bread', plural: 'Breads' },
  { id: 'other', label: 'Other', plural: 'Other' },
]

export const ITEM_CATEGORY_BY_ID = Object.fromEntries(
  ITEM_CATEGORIES.map((c) => [c.id, c])
)

export const DEFAULT_ITEM_CATEGORY = 'cookie'

export function unitLabelForCategory(catId) {
  return ITEM_CATEGORY_BY_ID[catId]?.label.toLowerCase() ?? 'item'
}
