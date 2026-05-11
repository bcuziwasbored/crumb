export const CATEGORIES = [
  { id: 'dairy', label: 'Dairy', dotColor: '#7eb6c7' },
  { id: 'flour-sugar', label: 'Flour & Sugar', dotColor: '#d4a373' },
  { id: 'flavoring', label: 'Flavoring', dotColor: '#d9985f' },
  { id: 'fat', label: 'Fat', dotColor: '#f0d094' },
  { id: 'leavening', label: 'Leavening', dotColor: '#c8b896' },
  { id: 'egg', label: 'Egg', dotColor: '#f4d97c' },
  { id: 'packaging', label: 'Packaging', dotColor: '#b8a89a' },
  { id: 'other', label: 'Other', dotColor: '#9c9c9c' },
]

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
)

export const DEFAULT_CATEGORY = 'flour-sugar'
