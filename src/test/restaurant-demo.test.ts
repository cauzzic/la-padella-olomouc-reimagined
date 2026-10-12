import { describe, it, expect } from 'vitest';
import { pickActiveOffers, pickCurrentWeeklyMenu, pickFeatured, groupMenu } from '@/content/rules';
import { seedCategories, seedMenuItems } from '@/content/seed';
import type { Offer, WeeklyMenu } from '@/content/types';
const week = (from: string, to: string, pub = true): WeeklyMenu => ({ id: from, valid_from: from, valid_to: to, note: null, is_published: pub, dishes: [] });
const offer = (o: Partial<Offer>): Offer => ({ id: 'x', title: 'x', label: null, description: '', price: null, image_url: null, valid_from: null, valid_to: null, is_active: true, sort_order: 0, ...o });
describe('content rules', () => {
  it('shows at most 4 featured dishes', () => { expect(pickFeatured(Array(6).fill(0).map((_, i) => ({ ...seedMenuItems[0], id: `${i}`, is_featured: true }))).length).toBe(4); });
  it('hides inactive items from the menu', () => { const items = seedMenuItems.map(i => i.id === 'margherita' ? { ...i, is_active: false } : i); expect(groupMenu(seedCategories, items).flatMap(c => c.items).some(i => i.id === 'margherita')).toBe(false); });
  it('does not show an expired weekly menu as current', () => { expect(pickCurrentWeeklyMenu([week('2026-10-05', '2026-10-09')], '2026-10-12')).toBeNull(); });
  it('shows the menu within its validity', () => { expect(pickCurrentWeeklyMenu([week('2026-10-12', '2026-10-16')], '2026-10-16')?.id).toBe('2026-10-12'); });
  it('hides expired and inactive offers', () => { expect(pickActiveOffers([offer({ id: 'old', valid_to: '2026-10-11' }), offer({ id: 'off', is_active: false }), offer({ id: 'ok' })], '2026-10-12').map(o => o.id)).toEqual(['ok']); });
});
