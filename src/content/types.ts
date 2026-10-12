// Content types shaped like future database tables (snake_case = column names).
// Anything here is editable content; design-only text stays in components.
export type ISODate = string; // YYYY-MM-DD

export type MenuCategory = { id: string; name: string; sort_order: number; is_active: boolean };

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  allergens: number[];
  portion: string | null;
  is_vegetarian: boolean;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
};

export type Weekday = 1 | 2 | 3 | 4 | 5;
export type WeeklyMenuDish = { id: string; weekday: Weekday; kind: 'soup' | 'main'; name: string; description: string; price: number; allergens: number[]; sort_order: number };
export type WeeklyMenu = { id: string; valid_from: ISODate; valid_to: ISODate; note: string | null; is_published: boolean; dishes: WeeklyMenuDish[] };

export type Offer = { id: string; title: string; label: string | null; description: string; price: number | null; image_url: string | null; valid_from: ISODate | null; valid_to: ISODate | null; is_active: boolean; sort_order: number };

export type CategoryWithItems = MenuCategory & { items: MenuItem[] };
