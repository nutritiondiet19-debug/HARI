// ============================================================
// TAMIL NADU FOOD & DRINKS DATABASE — MASTER INDEX
// 600+ items: Ancient → Traditional → Modern
// Auto-merged from 4 part files
// ============================================================
import { PART1 } from './tnFoods_part1';
import { PART2 } from './tnFoods_part2';
import { PART3 } from './tnFoods_part3';
import { PART4 } from './tnFoods_part4';

export const TN_CATEGORIES = [
  'All', 'Breakfast', 'Rice & Gravies', 'Tiffin', 'Sweets & Desserts',
  'Snacks', 'Drinks & Beverages', 'Street Food', 'Seafood', 'Non-Veg',
  'Legumes & Lentils', 'Chutneys & Sides', 'Modern & Fusion',
];

// Map display category → data category key
const CAT_MAP = {
  'All': null,
  'Breakfast': 'breakfast',
  'Rice & Gravies': 'rice-gravies',
  'Tiffin': 'tiffin',
  'Sweets & Desserts': 'sweets-desserts',
  'Snacks': 'snacks',
  'Drinks & Beverages': 'drinks-beverages',
  'Street Food': 'street-food',
  'Seafood': 'seafood',
  'Non-Veg': 'non-veg',
  'Legumes & Lentils': 'legumes-lentils',
  'Chutneys & Sides': 'chutneys-sides',
  'Modern & Fusion': 'modern-fusion',
};

// Normalize all food items to the schema expected by AddMealScreen/FoodCard
const normalize = (item) => ({
  id: item.id,
  name: item.name,
  tamilName: item.tamilName || '',
  calories: item.cal,
  protein: item.pro,
  carbs: item.carbs,
  fat: item.fat,
  fiber: item.fiber || 0,
  servingSize: item.serv,
  category: item.cat,
  era: item.era || 'traditional',
  tags: item.tags || [],
  description: item.description || '',
});

const TN_FOODS = [
  ...PART1,
  ...PART2,
  ...PART3,
  ...PART4,
].map(normalize);

export default TN_FOODS;

/**
 * Search foods by name, Tamil name, tags or description
 */
export const searchFoods = (query) => {
  const q = query.toLowerCase().trim();
  if (!q) return TN_FOODS;
  return TN_FOODS.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.tamilName.includes(q) ||
    (f.description && f.description.toLowerCase().includes(q)) ||
    (f.tags && f.tags.some(t => t.includes(q)))
  );
};

/**
 * Get foods filtered by display category label
 */
export const getFoodsByCategory = (displayCategory) => {
  const key = CAT_MAP[displayCategory];
  if (!key) return TN_FOODS;
  return TN_FOODS.filter(f => f.category === key);
};

/**
 * Get foods by era: 'ancient' | 'traditional' | 'modern'
 */
export const getFoodsByEra = (era) =>
  TN_FOODS.filter(f => f.era === era);

/**
 * Get a food by its ID
 */
export const getFoodById = (id) =>
  TN_FOODS.find(f => f.id === id);
