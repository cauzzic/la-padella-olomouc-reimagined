import { createFileRoute } from '@tanstack/react-router';
import { CrudManager, countIn } from '@/components/admin/CrudManager';

export const Route = createFileRoute('/_authenticated/admin/kategorie-napoju')({ component: () =>
  <CrudManager table="drink_categories" title="Kategorie nápojů" singular="kategorii"
    defaults={{ name: '', is_active: true }}
    summary={() => ''}
    deleteGuard={async r => (await countIn('drinks', r.id)) ? 'Kategorie obsahuje nápoje. Nejprve je přesuňte nebo smažte.' : null}
    fields={[
      { key: 'name', label: 'Název', type: 'text', required: true },
      { key: 'is_active', label: 'Zveřejněno', type: 'switch' },
    ]} /> });
