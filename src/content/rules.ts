import type { CategoryWithItems, DrinkCategory, DrinkCategoryWithItems, Drink, ISODate, MenuCategory, MenuItem, Offer, WeeklyMenu } from './types';

export const toISODate = (d: Date): ISODate => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** Today's date in the restaurant's timezone, independent of server timezone. */
export const todayPrague = (now = new Date()): ISODate =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Prague', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);

/** Inclusive validity window; null bound = open-ended. */
export const isWithin = (today: ISODate, from: ISODate | null, to: ISODate | null) =>
  (!from || from <= today) && (!to || today <= to);

const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;

export function groupMenu(categories: MenuCategory[], items: MenuItem[]): CategoryWithItems[] {
  return categories.filter(c => c.is_active).sort(bySort)
    .map(c => ({ ...c, items: items.filter(i => i.is_active && i.category_id === c.id).sort(bySort) }))
    .filter(c => c.items.length > 0);
}

export function groupDrinks(categories: DrinkCategory[], drinks: Drink[]): DrinkCategoryWithItems[] {
  return categories.filter(c => c.is_active).sort(bySort)
    .map(c => ({ ...c, items: drinks.filter(d => d.is_active && d.category_id === c.id).sort(bySort) }))
    .filter(c => c.items.length > 0);
}

export function pickFeatured(items: MenuItem[], limit = 4): MenuItem[] {
  return items.filter(i => i.is_active && i.is_featured).sort(bySort).slice(0, limit);
}

/** Only a published menu whose window contains today counts as current; expired or future menus are never shown. */
export function pickCurrentWeeklyMenu(menus: WeeklyMenu[], today: ISODate): WeeklyMenu | null {
  return menus.filter(m => m.is_published && isWithin(today, m.valid_from, m.valid_to))
    .sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0] ?? null;
}

export function pickActiveOffers(offers: Offer[], today: ISODate): Offer[] {
  return offers.filter(o => o.is_active && isWithin(today, o.valid_from, o.valid_to)).sort(bySort);
}

export const formatDate = (d: ISODate) =>
  new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date(`${d}T12:00:00`));

/** "Label | value" per line → rows. */
export const parseHours = (s: string) => s.split('\n').map(l => l.split('|').map(x => x.trim())).filter(r => r[0]).map(([day, time]) => ({ day: day!, time: time ?? '' }));

/** Image keys in site_settings that hold storage paths. */
export const SETTINGS_IMAGE_KEYS = ['hero_image', 'lunch_image'] as const;
