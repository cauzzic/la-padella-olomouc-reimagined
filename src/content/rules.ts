import type { CategoryWithItems, ISODate, MenuCategory, MenuItem, Offer, WeeklyMenu } from './types';

export const toISODate = (d: Date): ISODate => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** Inclusive validity window; null bound = open-ended. */
export const isWithin = (today: ISODate, from: ISODate | null, to: ISODate | null) =>
  (!from || from <= today) && (!to || today <= to);

const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;

export function groupMenu(categories: MenuCategory[], items: MenuItem[]): CategoryWithItems[] {
  return categories.filter(c => c.is_active).sort(bySort)
    .map(c => ({ ...c, items: items.filter(i => i.is_active && i.category_id === c.id).sort(bySort) }))
    .filter(c => c.items.length > 0);
}

export function pickFeatured(items: MenuItem[], limit = 4): MenuItem[] {
  return items.filter(i => i.is_active && i.is_featured).sort(bySort).slice(0, limit);
}

/** Only a published menu whose window contains today counts as current; expired menus are never shown. */
export function pickCurrentWeeklyMenu(menus: WeeklyMenu[], today: ISODate): WeeklyMenu | null {
  return menus.filter(m => m.is_published && isWithin(today, m.valid_from, m.valid_to))
    .sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0] ?? null;
}

export function pickActiveOffers(offers: Offer[], today: ISODate): Offer[] {
  return offers.filter(o => o.is_active && isWithin(today, o.valid_from, o.valid_to)).sort(bySort);
}

export const formatDate = (d: ISODate) =>
  new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date(`${d}T12:00:00`));
