import { createFileRoute } from '@tanstack/react-router';
import { CrudManager } from '@/components/admin/CrudManager';

const categories = [{ value: 'restaurant', label: 'Restaurace' }, { value: 'food', label: 'Jídla' }];

export const Route = createFileRoute('/_authenticated/admin/galerie')({ component: () =>
  <CrudManager table="gallery_photos" title="Galerie" singular="fotografii"
    categoryKey="category" categories={categories}
    defaults={{ title: '', category: 'food', image_path: null, is_active: true }}
    summary={() => 'Fotografie v galerii'}
    deleteGuard={async () => null}
    fields={[
      { key: 'title', label: 'Popisek', type: 'text', required: true },
      { key: 'category', label: 'Kategorie', type: 'select', required: true, options: categories },
      { key: 'image_path', label: 'Fotografie', type: 'image', required: true },
      { key: 'is_active', label: 'Zobrazovat na webu', type: 'switch' },
    ]} /> });
