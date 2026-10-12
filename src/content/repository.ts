// Single read path for public content: query options backed by the Olomouc database.
import { queryOptions } from '@tanstack/react-query';
import { getCurrentWeeklyMenu, getDrinks, getFeatured, getMenu, getOffers, getSettings } from './public.functions';

export const menuQuery = queryOptions({ queryKey: ['menu'], queryFn: () => getMenu() });
export const drinksQuery = queryOptions({ queryKey: ['drinks'], queryFn: () => getDrinks() });
export const featuredQuery = queryOptions({ queryKey: ['menu', 'featured'], queryFn: () => getFeatured() });
export const weeklyMenuQuery = queryOptions({ queryKey: ['weekly-menu', 'current'], queryFn: () => getCurrentWeeklyMenu() });
export const offersQuery = queryOptions({ queryKey: ['offers', 'active'], queryFn: () => getOffers() });
export const settingsQuery = queryOptions({ queryKey: ['settings'], queryFn: () => getSettings(), staleTime: 60_000 });
