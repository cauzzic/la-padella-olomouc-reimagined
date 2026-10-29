import { describe, it, expect } from 'vitest';
import { pickActiveOffers, pickCurrentWeeklyMenu, pickFeatured, groupMenu, groupDrinks, parseHours, todayPrague } from '@/content/rules';
import type { MenuItem, Offer, WeeklyMenu } from '@/content/types';
const item = (o: Partial<MenuItem>): MenuItem => ({ id: 'x', category_id: 'pizza', name: 'x', description: '', price: 1, price_note: null, image_url: null, allergens: [], portion: null, is_vegetarian: false, is_featured: false, sort_order: 0, is_active: true, ...o });
const week = (from: string, to: string, pub = true): WeeklyMenu => ({ id: from, valid_from: from, valid_to: to, note: null, is_published: pub, dishes: [] });
const offer = (o: Partial<Offer>): Offer => ({ id: 'x', title: 'x', label: null, description: '', price: null, allergens: [], image_url: null, valid_from: null, valid_to: null, is_active: true, sort_order: 0, ...o });
describe('content rules', () => {
  it('shows at most 4 featured dishes', () => { expect(pickFeatured(Array.from({ length: 6 }, (_, i) => item({ id: `${i}`, is_featured: true }))).length).toBe(4); });
  it('hides inactive items from the menu', () => { expect(groupMenu([{ id: 'pizza', name: 'Pizza', sort_order: 0, is_active: true }], [item({ id: 'a' }), item({ id: 'b', is_active: false })]).flatMap(c => c.items).map(i => i.id)).toEqual(['a']); });
  it('hides empty drink categories', () => { expect(groupDrinks([{ id: 'pivo', name: 'Pivo', sort_order: 0, is_active: true }], [])).toEqual([]); });
  it('does not show an expired weekly menu as current', () => { expect(pickCurrentWeeklyMenu([week('2026-10-05', '2026-10-09')], '2026-10-12')).toBeNull(); });
  it('does not show a menu prepared for the future', () => { expect(pickCurrentWeeklyMenu([week('2026-10-19', '2026-10-23')], '2026-10-16')).toBeNull(); });
  it('does not show an unpublished menu', () => { expect(pickCurrentWeeklyMenu([week('2026-10-12', '2026-10-16', false)], '2026-10-14')).toBeNull(); });
  it('shows the menu within its validity', () => { expect(pickCurrentWeeklyMenu([week('2026-10-12', '2026-10-16')], '2026-10-16')?.id).toBe('2026-10-12'); });
  it('hides expired and inactive offers', () => { expect(pickActiveOffers([offer({ id: 'old', valid_to: '2026-10-11' }), offer({ id: 'off', is_active: false }), offer({ id: 'ok' })], '2026-10-12').map(o => o.id)).toEqual(['ok']); });
  it('uses Prague date, not UTC', () => { expect(todayPrague(new Date('2026-10-12T22:30:00Z'))).toBe('2026-10-13'); });
  it('parses opening hours lines', () => { expect(parseHours('Neděle | 11:00–21:00')).toEqual([{ day: 'Neděle', time: '11:00–21:00' }]); });
});
