import { createFileRoute } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { CrudManager, useCategoryOptions } from '@/components/admin/CrudManager';

export const Route = createFileRoute('/_authenticated/admin/napoje')({ component: Drinks });

function Drinks() {
  const cats = useCategoryOptions('drink_categories');
  if (!cats) return <Loader2 className="animate-spin" />;
  return <CrudManager table="drinks" title="Nápoje" singular="nápoj" categoryKey="category_id" categories={cats}
    defaults={{ name: '', description: '', price: '', category_id: '', volume: '', brand: '', image_path: null, allergens: [], is_active: true }}
    summary={r => `${r.price} Kč${r.volume ? ` · ${r.volume}` : ''}${r.brand ? ` · ${r.brand}` : ''}`}
    fields={[
      { key: 'name', label: 'Název', type: 'text', required: true },
      { key: 'category_id', label: 'Kategorie', type: 'select', options: cats, required: true },
      { key: 'description', label: 'Popis', type: 'textarea' },
      { key: 'price', label: 'Cena (Kč)', type: 'number', required: true },
      { key: 'volume', label: 'Objem', type: 'text', nullable: true, hint: 'Např. 0,3 l nebo 40 ml' },
      { key: 'brand', label: 'Značka', type: 'text', nullable: true },
      { key: 'image_path', label: 'Fotografie', type: 'image' },
      { key: 'allergens', label: 'Alergeny', type: 'allergens' },
      { key: 'is_active', label: 'Zveřejněno', type: 'switch' },
    ]} />;
}
