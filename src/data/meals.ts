export type Diet = 'veg' | 'non-veg';

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  diet: Diet;
}

export const MEALS: Meal[] = [
  {
    id: 'snack-box',
    name: 'Snack box',
    description: 'Roasted nuts, cookies and juice',
    price: 0,
    diet: 'veg',
  },
  {
    id: 'masala-tea',
    name: 'Masala chai & biscuits',
    description: 'Hot spiced tea with butter biscuits',
    price: 0,
    diet: 'veg',
  },
  {
    id: 'paneer-sandwich',
    name: 'Paneer tikka sandwich',
    description: 'Grilled sandwich with mint chutney',
    price: 250,
    diet: 'veg',
  },
  {
    id: 'veg-biryani',
    name: 'Veg biryani',
    description: 'Basmati rice, seasonal vegetables, raita',
    price: 300,
    diet: 'veg',
  },
  {
    id: 'chicken-wrap',
    name: 'Chicken tikka wrap',
    description: 'Tandoori chicken, onions, green chutney',
    price: 350,
    diet: 'non-veg',
  },
  {
    id: 'egg-breakfast',
    name: 'Masala omelette breakfast',
    description: 'Omelette, toast, hash brown and coffee',
    price: 320,
    diet: 'non-veg',
  },
];

export const MEALS_BY_ID: Record<string, Meal> = Object.fromEntries(
  MEALS.map((meal) => [meal.id, meal]),
);
