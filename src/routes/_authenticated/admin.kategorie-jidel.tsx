import { createFileRoute } from '@tanstack/react-router';
import { CrudManager, countIn } from '@/components/admin/CrudManager';

export const Route = createFileRoute('/_authenticated/admin/kategorie-jidel')({ component: () =>
  <CrudManager table="menu_categories" title="Kategorie jídel" singular="kategorii"
    defaults={{ name: '', description: '', is_active: true }}
    summary={r => (r.description as string) || ''}
    deleteGuard={async r => (await countIn('menu_items', r.id)) ? 'Kategorie obsahuje jídla. Nejprve je přesuňte nebo smažte.' : null}
    fields={[
      { key: 'name', label: 'Název', type: 'text', required: true },
      { key: 'description', label: 'Popis', type: 'textarea', nullable: true },
      { key: 'is_active', label: 'Zveřejněno', type: 'switch' },
    ]} /> });
