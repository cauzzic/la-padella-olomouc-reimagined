// Public, read-only content reads. Uses the publishable key, so RLS limits results
// to active/current rows; rules are re-applied here as a second guard.
import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { groupDrinks, groupMenu, pickActiveOffers, pickCurrentWeeklyMenu, pickFeatured, SETTINGS_IMAGE_KEYS, todayPrague } from './rules';
import type { Drink, DrinkCategory, MenuCategory, MenuItem, Offer, SiteSettings, WeeklyMenu, WeeklyMenuDish } from './types';

// Server env (Lovable hosting) first; fall back to build-time public values so
// external hosts (e.g. Netlify) without server env vars still reach the same backend.
function serverUrl() {
  const url = process.env['SUPABASE_URL'] || import.meta.env['VITE_SUPABASE_URL'] || process.env['VITE_SUPABASE_URL'];
  if (!url) throw new Error('Chybí adresa backendu (SUPABASE_URL / VITE_SUPABASE_URL).');
  return url;
}
function publicUrl() {
  return import.meta.env['VITE_SUPABASE_URL'] || process.env['VITE_SUPABASE_URL'] || serverUrl();
}

function db() {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'] || import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] || process.env['VITE_SUPABASE_PUBLISHABLE_KEY'];
  if (!key) throw new Error('Chybí veřejný klíč backendu.');
  return createClient<Database>(serverUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: { fetch: (input, init) => {
      const h = new Headers(init?.headers);
      if (key.startsWith('sb_') && h.get('Authorization') === `Bearer ${key}`) h.delete('Authorization');
      h.set('apikey', key);
      return fetch(input, { ...init, headers: h });
    } },
  });
}
type Db = ReturnType<typeof db>;

/** Private bucket → signed URLs, rewritten to the browser-facing host. */
async function sign(client: Db, paths: (string | null | undefined)[]): Promise<Map<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => !!p))];
  const map = new Map<string, string>();
  if (!unique.length) return map;
  const { data } = await client.storage.from('media').createSignedUrls(unique, 60 * 60 * 24 * 7);
  const internal = serverUrl();
  const external = publicUrl();
  for (const r of data ?? []) if (r.path && r.signedUrl) map.set(r.path, r.signedUrl.replace(internal, external));
  return map;
}

function fail(what: string, error: unknown): never {
  console.error(what, error);
  throw new Error('Obsah se nepodařilo načíst.');
}

async function loadItems(client: Db): Promise<MenuItem[]> {
  const { data, error } = await client.from('menu_items').select('*').eq('is_active', true).order('sort_order');
  if (error) fail('menu_items', error);
  const urls = await sign(client, data.map(r => r.image_path));
  return data.map(r => ({ id: r.id, category_id: r.category_id, name: r.name, description: r.description, price: Number(r.price), price_note: r.price_note ?? null, image_url: r.image_path ? urls.get(r.image_path) ?? null : null, allergens: r.allergens, portion: r.portion, is_vegetarian: r.is_vegetarian, is_featured: r.is_featured, sort_order: r.sort_order, is_active: r.is_active }));
}

export const getMenu = createServerFn({ method: 'GET' }).handler(async () => {
  const client = db();
  const [{ data: cats, error }, items] = await Promise.all([client.from('menu_categories').select('*').eq('is_active', true).order('sort_order'), loadItems(client)]);
  if (error) fail('menu_categories', error);
  return groupMenu(cats as MenuCategory[], items);
});

export const getFeatured = createServerFn({ method: 'GET' }).handler(async () => pickFeatured(await loadItems(db()), 4));

export const getDrinks = createServerFn({ method: 'GET' }).handler(async () => {
  const client = db();
  const [c, d] = await Promise.all([client.from('drink_categories').select('id,name,sort_order,is_active').eq('is_active', true).order('sort_order'), client.from('drinks').select('id,category_id,name,description,price,volume,brand,sort_order,is_active').eq('is_active', true).order('sort_order')]);
  if (c.error) fail('drink_categories', c.error);
  if (d.error) fail('drinks', d.error);
  return groupDrinks(c.data as DrinkCategory[], d.data.map(r => ({ ...r, price: Number(r.price) })) as Drink[]);
});

export const getCurrentWeeklyMenu = createServerFn({ method: 'GET' }).handler(async (): Promise<WeeklyMenu | null> => {
  const client = db();
  const today = todayPrague();
  const { data, error } = await client.from('weekly_menus').select('*, weekly_menu_dishes(*)').eq('is_published', true).lte('valid_from', today).gte('valid_to', today).order('updated_at', { ascending: false });
  if (error) fail('weekly_menus', error);
  const menus: WeeklyMenu[] = data.map(m => ({ id: m.id, title: m.title, valid_from: m.valid_from, valid_to: m.valid_to, note: m.note, is_published: m.is_published,
    dishes: m.weekly_menu_dishes.map(d => ({ id: d.id, weekday: d.weekday, kind: d.kind, name: d.name, description: d.description, price: d.price == null ? null : Number(d.price), allergens: d.allergens, sort_order: d.sort_order }) as WeeklyMenuDish) }));
  return pickCurrentWeeklyMenu(menus, today);
});

export const getOffers = createServerFn({ method: 'GET' }).handler(async () => {
  const client = db();
  const { data, error } = await client.from('offers').select('*').eq('is_active', true).order('sort_order');
  if (error) fail('offers', error);
  const urls = await sign(client, data.map(r => r.image_path));
  const offers: Offer[] = data.map(r => ({ id: r.id, title: r.title, label: r.label, description: r.description, price: r.price == null ? null : Number(r.price), allergens: r.allergens ?? [], image_url: r.image_path ? urls.get(r.image_path) ?? null : null, valid_from: r.valid_from, valid_to: r.valid_to, is_active: r.is_active, sort_order: r.sort_order }));
  return pickActiveOffers(offers, todayPrague());
});

export const getSettings = createServerFn({ method: 'GET' }).handler(async (): Promise<SiteSettings> => {
  const client = db();
  const { data, error } = await client.from('site_settings').select('key,value');
  if (error) fail('site_settings', error);
  const s = Object.fromEntries(data.map(r => [r.key, r.value])) as SiteSettings;
  const urls = await sign(client, SETTINGS_IMAGE_KEYS.map(k => s[k]));
  for (const k of SETTINGS_IMAGE_KEYS) s[k] = s[k] ? urls.get(s[k]!) ?? '' : '';
  return s;
});
