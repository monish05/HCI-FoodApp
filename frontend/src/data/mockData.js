// Mock data for Fridge to Feast — no backend
// Recipe images: Unsplash (https://unsplash.com) — free to use

const U = (id, w = 600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&fit=crop`

export const recipes = [
  {
    id: '1',
    title: 'Creamy Tomato & Basil Pasta',
    image: U('1551183053-bf91a1d81141'),
    tags: ['Quick', 'Meatless'],
    cookTime: 20,
    useUpSoon: ['tomatoes', 'basil', 'cream'],
  },
  {
    id: '2',
    title: 'Roasted Veggie Bowl',
    image: U('1546069901-ba9599a7e63c'),
    tags: ['Meatless', 'High Protein'],
    cookTime: 35,
    useUpSoon: ['bell pepper', 'zucchini', 'chickpeas'],
  },
  {
    id: '3',
    title: 'Honey Garlic Salmon',
    image: U('1467003909585-2f8a72700288'),
    tags: ['Quick', 'High Protein'],
    cookTime: 25,
    useUpSoon: ['salmon', 'garlic'],
  },
  {
    id: '4',
    title: 'Lentil Soup',
    image: U('1547592166-23ac45744acd'),
    tags: ['Meatless', 'Quick'],
    cookTime: 40,
    useUpSoon: ['lentils', 'carrots', 'celery'],
  },
  {
    id: '5',
    title: 'Stir-Fry with Tofu',
    image: U('1603133872878-684f208fb84b'),
    tags: ['Meatless', 'High Protein', 'Quick'],
    cookTime: 25,
    useUpSoon: ['tofu', 'broccoli', 'soy sauce'],
  },
  {
    id: '6',
    title: 'Caprese Salad',
    image: U('1608897013039-887f21d8c804'),
    tags: ['Quick', 'Meatless'],
    cookTime: 10,
    useUpSoon: ['tomatoes', 'mozzarella', 'basil'],
  },
  {
    id: '7',
    title: 'Chicken & Veggie Skillet',
    image: U('1598103442097-8b74394b95c6'),
    tags: ['High Protein', 'Quick'],
    cookTime: 30,
    useUpSoon: ['chicken', 'bell pepper', 'onion'],
  },
  {
    id: '8',
    title: 'Oatmeal with Berries',
    image: U('1512621776951-a57141f2eefd'),
    tags: ['Quick', 'Meatless'],
    cookTime: 10,
    useUpSoon: ['oats', 'berries', 'milk'],
  },
  {
    id: '9',
    title: 'Garlic Butter Pasta',
    image: U('1551183053-bf91a1d81141'),
    tags: ['Quick', 'Meatless'],
    cookTime: 15,
    useUpSoon: ['pasta', 'garlic', 'cream'],
  },
  {
    id: '10',
    title: 'Eggs & Veggie Scramble',
    image: U('1546069901-ba9599a7e63c'),
    tags: ['Quick', 'High Protein'],
    cookTime: 12,
    useUpSoon: ['eggs', 'bell pepper', 'onion', 'cheddar'],
  },
  {
    id: '11',
    title: 'Greek Salad',
    image: U('1608897013039-887f21d8c804'),
    tags: ['Quick', 'Meatless'],
    cookTime: 10,
    useUpSoon: ['lettuce', 'tomatoes', 'onion', 'mozzarella'],
  },
  {
    id: '12',
    title: 'Creamy Broccoli Soup',
    image: U('1547592166-23ac45744acd'),
    tags: ['Meatless', 'Quick'],
    cookTime: 25,
    useUpSoon: ['broccoli', 'cream', 'onion', 'garlic'],
  },
  {
    id: '13',
    title: 'Chickpea & Veggie Curry',
    image: U('1603133872878-684f208fb84b'),
    tags: ['Meatless', 'High Protein'],
    cookTime: 35,
    useUpSoon: ['chickpeas', 'tomatoes', 'onion', 'garlic'],
  },
  {
    id: '14',
    title: 'Salmon with Garlic & Herbs',
    image: U('1467003909585-2f8a72700288'),
    tags: ['Quick', 'High Protein'],
    cookTime: 20,
    useUpSoon: ['salmon', 'garlic', 'lemon'],
  },
  {
    id: '15',
    title: 'Caprese Pasta',
    image: U('1551183053-bf91a1d81141'),
    tags: ['Quick', 'Meatless'],
    cookTime: 18,
    useUpSoon: ['pasta', 'tomatoes', 'mozzarella', 'basil'],
  },
  {
    id: '16',
    title: 'Yogurt Parfait',
    image: U('1512621776951-a57141f2eefd'),
    tags: ['Quick', 'Meatless'],
    cookTime: 5,
    useUpSoon: ['yogurt', 'berries', 'oats'],
  },
  {
    id: '17',
    title: 'Lentil & Carrot Soup',
    image: U('1547592166-23ac45744acd'),
    tags: ['Meatless', 'Quick'],
    cookTime: 40,
    useUpSoon: ['lentils', 'carrots', 'celery', 'onion'],
  },
  {
    id: '18',
    title: 'Cheesy Veggie Omelette',
    image: U('1546069901-ba9599a7e63c'),
    tags: ['Quick', 'High Protein'],
    cookTime: 10,
    useUpSoon: ['eggs', 'bell pepper', 'onion', 'cheddar', 'tomatoes'],
  },
]

// Common units for fridge items (amount + unit)
export const FRIDGE_UNITS = [
  { value: 'count', label: 'count' },
  { value: 'dozen', label: 'dozen' },
  { value: 'lb', label: 'lb' },
  { value: 'oz', label: 'oz' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'L', label: 'L' },
  { value: 'ml', label: 'ml' },
  { value: 'cups', label: 'cups' },
  { value: 'bunch', label: 'bunch' },
  { value: 'clove', label: 'clove(s)' },
  { value: 'head', label: 'head' },
  { value: 'block', label: 'block' },
  { value: 'slice', label: 'slice(s)' },
  { value: 'container', label: 'container' },
  { value: 'pack', label: 'pack' },
]

export const fridgeItems = [
  { id: 'f1', name: 'Tomatoes', amount: 4, unit: 'count', daysLeft: 2 },
  { id: 'f2', name: 'Milk', amount: 1, unit: 'L', daysLeft: 1 },
  { id: 'f3', name: 'Chicken breast', amount: 2, unit: 'lb', daysLeft: 4 },
  { id: 'f4', name: 'Bell pepper', amount: 3, unit: 'count', daysLeft: 5 },
  { id: 'f5', name: 'Yogurt', amount: 2, unit: 'cups', daysLeft: 6 },
  { id: 'f6', name: 'Basil', amount: 1, unit: 'bunch', daysLeft: 1 },
  { id: 'f7', name: 'Zucchini', amount: 2, unit: 'count', daysLeft: 7 },
  { id: 'f8', name: 'Eggs', amount: 1, unit: 'dozen', daysLeft: 10 },
  { id: 'f9', name: 'Carrots', amount: 1, unit: 'lb', daysLeft: 8 },
  { id: 'f10', name: 'Cheddar', amount: 1, unit: 'block', daysLeft: 3 },
  { id: 'f11', name: 'Garlic', amount: 1, unit: 'head', daysLeft: 5 },
  { id: 'f12', name: 'Onion', amount: 2, unit: 'count', daysLeft: 9 },
  { id: 'f13', name: 'Broccoli', amount: 1, unit: 'head', daysLeft: 4 },
  { id: 'f14', name: 'Lentils', amount: 1, unit: 'lb', daysLeft: 30 },
  { id: 'f15', name: 'Celery', amount: 1, unit: 'bunch', daysLeft: 6 },
  { id: 'f16', name: 'Oats', amount: 1, unit: 'container', daysLeft: 45 },
  { id: 'f17', name: 'Salmon', amount: 1, unit: 'lb', daysLeft: 2 },
  { id: 'f18', name: 'Tofu', amount: 1, unit: 'block', daysLeft: 5 },
  { id: 'f19', name: 'Mozzarella', amount: 1, unit: 'block', daysLeft: 4 },
  { id: 'f20', name: 'Heavy cream', amount: 1, unit: 'cups', daysLeft: 3 },
  { id: 'f21', name: 'Soy sauce', amount: 1, unit: 'container', daysLeft: 90 },
  { id: 'f22', name: 'Berries', amount: 1, unit: 'pack', daysLeft: 3 },
  { id: 'f23', name: 'Chickpeas', amount: 2, unit: 'cups', daysLeft: 7 },
  { id: 'f24', name: 'Lettuce', amount: 1, unit: 'head', daysLeft: 4 },
  { id: 'f25', name: 'Pasta', amount: 1, unit: 'pack', daysLeft: 180 },
]

export const mealPlanSlots = [
  { day: 'Mon', date: '17', meals: { breakfast: null, lunch: null, dinner: null } },
  { day: 'Tue', date: '18', meals: { breakfast: null, lunch: null, dinner: null } },
  { day: 'Wed', date: '19', meals: { breakfast: null, lunch: null, dinner: null } },
  { day: 'Thu', date: '20', meals: { breakfast: null, lunch: null, dinner: null } },
  { day: 'Fri', date: '21', meals: { breakfast: null, lunch: null, dinner: null } },
  { day: 'Sat', date: '22', meals: { breakfast: null, lunch: null, dinner: null } },
  { day: 'Sun', date: '23', meals: { breakfast: null, lunch: null, dinner: null } },
]

export const recipeSteps = [
  'Bring a large pot of salted water to a boil. Add pasta and cook according to package until al dente.',
  'While pasta cooks, heat olive oil in a pan over medium heat. Add minced garlic and cook until fragrant, about 1 minute.',
  'Add diced tomatoes and a pinch of salt. Simmer for 5 minutes until slightly reduced.',
  'Stir in cream and torn basil leaves. Cook for 2 more minutes.',
  'Drain pasta, reserving ¼ cup pasta water. Toss pasta with the sauce, adding pasta water if needed.',
  'Serve with extra basil and a drizzle of olive oil. Enjoy!',
]

export const shoppingCategories = {
  Produce: [
    { id: 's1', name: 'Tomatoes', checked: false },
    { id: 's2', name: 'Fresh basil', checked: true },
    { id: 's3', name: 'Garlic', checked: false },
  ],
  Dairy: [
    { id: 's4', name: 'Heavy cream', checked: false },
    { id: 's5', name: 'Parmesan', checked: true },
  ],
  Protein: [
    { id: 's6', name: 'Chicken breast', checked: false },
  ],
  Pantry: [
    { id: 's7', name: 'Pasta', checked: false },
    { id: 's8', name: 'Olive oil', checked: true },
  ],
}

export const analytics = {
  moneySaved: 47,
  foodSavedKg: 12,
  wasteReductionPercent: 34,
}
