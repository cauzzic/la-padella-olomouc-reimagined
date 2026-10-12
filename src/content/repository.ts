// Single swap point: replace these bodies with Lovable Cloud queries later; pages stay unchanged.
import { queryOptions } from '@tanstack/react-query';
import { groupMenu, pickActiveOffers, pickCurrentWeeklyMenu, pickFeatured, toISODate } from './rules';
import { seedCategories, seedMenuItems, seedOffers, seedWeeklyMenus } from './seed';

const today = () => toISODate(new Date());

export const menuQuery = queryOptions({ queryKey: ['menu'], queryFn: async () => groupMenu(seedCategories, seedMenuItems) });
export const featuredQuery = queryOptions({ queryKey: ['menu', 'featured'], queryFn: async () => pickFeatured(seedMenuItems, 4) });
export const weeklyMenuQuery = queryOptions({ queryKey: ['weekly-menu', 'current'], queryFn: async () => pickCurrentWeeklyMenu(seedWeeklyMenus(), today()) });
export const offersQuery = queryOptions({ queryKey: ['offers', 'active'], queryFn: async () => pickActiveOffers(seedOffers, today()) });
