import { createFileRoute } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { CrudManager, useCategoryOptions } from '@/components/admin/CrudManager';

export const Route = createFileRoute('/_authenticated/admin/jidla')({ component: Dishes });

function Dishes() {
  const cats = useCategoryOptions('menu_categories');
  if (!cats) return <Loader2 className="animate-spin" />;
  return <CrudManager table="menu_items" title="Jídla" singular="jídlo" categoryKey="category_id" categories={cats} featuredKey="is_featured"
    defaults={{ name: '', description: '', price: '', price_note: null, category_id: '', portion: '', image_path: null, allergens: [], is_vegetarian: false, is_featured: false, is_active: true }}
    summary={r => `${r.price_note || `${r.price} Kč`}${r.portion ? ` · ${r.portion}` : ''}`}
    fields={[
      { key: 'name', label: 'Název', type: 'text', required: true },
      { key: 'category_id', label: 'Kategorie', type: 'select', options: cats, required: true },
      { key: 'description', label: 'Popis', type: 'textarea' },
      { key: 'price', label: 'Cena (Kč)', type: 'number', required: true },
      { key: 'price_note', label: 'Text místo ceny', type: 'text', nullable: true, hint: 'Vyplňte jen pokud se nemá zobrazit číselná cena' },
      { key: 'portion', label: 'Gramáž / velikost', type: 'text', nullable: true },
      { key: 'image_path', label: 'Fotografie', type: 'image' },
      { key: 'allergens', label: 'Alergeny', type: 'allergens' },
      { key: 'is_vegetarian', label: 'Vegetariánské', type: 'switch' },
      { key: 'is_featured', label: 'Doporučit na úvodní stránce (zobrazí se max. 4)', type: 'switch' },
      { key: 'is_active', label: 'Zveřejněno', type: 'switch' },
    ]} />;
}
