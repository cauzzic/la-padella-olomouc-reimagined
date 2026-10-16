// Public content DTOs. Row shapes mirror the database tables (snake_case = columns);
// image_url is the resolved (signed) URL of the stored image_path.
export type ISODate = string; // YYYY-MM-DD

export type MenuCategory = { id: string; name: string; description?: string | null; sort_order: number; is_active: boolean };

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  price_note: string | null;
  image_url: string | null;
  allergens: number[];
  portion: string | null;
  is_vegetarian: boolean;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
};

export type DrinkCategory = { id: string; name: string; sort_order: number; is_active: boolean };
export type Drink = { id: string; category_id: string; name: string; description: string; price: number; volume: string | null; brand: string | null; sort_order: number; is_active: boolean };
export type DrinkCategoryWithItems = DrinkCategory & { items: Drink[] };

export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type WeeklyMenuDish = { id: string; weekday: Weekday; kind: 'soup' | 'main'; name: string; description: string; price: number | null; allergens: number[]; sort_order: number };
export type WeeklyMenu = { id: string; title?: string; valid_from: ISODate; valid_to: ISODate; note: string | null; is_published: boolean; dishes: WeeklyMenuDish[] };

export type Offer = { id: string; title: string; label: string | null; description: string; price: number | null; image_url: string | null; valid_from: ISODate | null; valid_to: ISODate | null; is_active: boolean; sort_order: number };

export type CategoryWithItems = MenuCategory & { items: MenuItem[] };

/** Editable site texts/contacts. Image keys hold resolved URLs on the public side. */
export const SETTING_KEYS = ['topbar_text','announcement','announcement_active','hero_eyebrow','hero_title','hero_title_accent','hero_text','hero_image','lunch_title','lunch_text','lunch_image','address','phone','email','instagram_url','opening_hours','lunch_hours','contact_text'] as const;
export type SiteSettings = { [K in (typeof SETTING_KEYS)[number]]?: string };
