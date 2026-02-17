// Mock data for Fridge-to-Table — no backend

export const recipes = [
  {
    id: '1',
    title: 'Creamy Tomato & Basil Pasta',
    image: null,
    tags: ['Quick', 'Meatless'],
    cookTime: 20,
    useUpSoon: ['tomatoes', 'basil', 'cream'],
  },
  {
    id: '2',
    title: 'Roasted Veggie Bowl',
    image: null,
    tags: ['Meatless', 'High Protein'],
    cookTime: 35,
    useUpSoon: ['bell pepper', 'zucchini', 'chickpeas'],
  },
  {
    id: '3',
    title: 'Honey Garlic Salmon',
    image: null,
    tags: ['Quick', 'High Protein'],
    cookTime: 25,
    useUpSoon: ['salmon', 'garlic'],
  },
  {
    id: '4',
    title: 'Lentil Soup',
    image: null,
    tags: ['Meatless', 'Quick'],
    cookTime: 40,
    useUpSoon: ['lentils', 'carrots', 'celery'],
  },
  {
    id: '5',
    title: 'Stir-Fry with Tofu',
    image: null,
    tags: ['Meatless', 'High Protein', 'Quick'],
    cookTime: 25,
    useUpSoon: ['tofu', 'broccoli', 'soy sauce'],
  },
  {
    id: '6',
    title: 'Caprese Salad',
    image: null,
    tags: ['Quick', 'Meatless'],
    cookTime: 10,
    useUpSoon: ['tomatoes', 'mozzarella', 'basil'],
  },
  {
    id: '7',
    title: 'Chicken & Veggie Skillet',
    image: null,
    tags: ['High Protein', 'Quick'],
    cookTime: 30,
    useUpSoon: ['chicken', 'bell pepper', 'onion'],
  },
  {
    id: '8',
    title: 'Oatmeal with Berries',
    image: null,
    tags: ['Quick', 'Meatless'],
    cookTime: 10,
    useUpSoon: ['oats', 'berries', 'milk'],
  },
]

export const fridgeItems = [
  { id: 'f1', name: 'Tomatoes', quantity: '4', daysLeft: 2 },
  { id: 'f2', name: 'Milk', quantity: '1 L', daysLeft: 1 },
  { id: 'f3', name: 'Chicken breast', quantity: '2', daysLeft: 4 },
  { id: 'f4', name: 'Bell pepper', quantity: '3', daysLeft: 5 },
  { id: 'f5', name: 'Yogurt', quantity: '2 cups', daysLeft: 6 },
  { id: 'f6', name: 'Basil', quantity: '1 bunch', daysLeft: 1 },
  { id: 'f7', name: 'Zucchini', quantity: '2', daysLeft: 7 },
  { id: 'f8', name: 'Eggs', quantity: '6', daysLeft: 10 },
  { id: 'f9', name: 'Carrots', quantity: '5', daysLeft: 8 },
  { id: 'f10', name: 'Cheddar', quantity: '1 block', daysLeft: 3 },
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
