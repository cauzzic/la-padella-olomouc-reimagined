import { createFileRoute } from '@tanstack/react-router';
import { CrudManager } from '@/components/admin/CrudManager';
import { formatDate } from '@/content/rules';

export const Route = createFileRoute('/_authenticated/admin/nabidky')({ component: () =>
  <CrudManager table="offers" title="Speciální nabídky" singular="nabídku"
    defaults={{ title: '', label: '', description: '', price: '', image_path: null, valid_from: '', valid_to: '', is_active: true }}
    summary={r => [r.price != null ? `${r.price} Kč` : null, r.valid_from || r.valid_to ? `${r.valid_from ? formatDate(r.valid_from as string) : '…'} – ${r.valid_to ? formatDate(r.valid_to as string) : '…'}` : 'bez omezení platnosti'].filter(Boolean).join(' · ')}
    fields={[
      { key: 'title', label: 'Název', type: 'text', required: true },
      { key: 'label', label: 'Štítek', type: 'text', nullable: true, hint: 'Např. Sezónní pizza' },
      { key: 'description', label: 'Popis', type: 'textarea' },
      { key: 'price', label: 'Cena (Kč)', type: 'number', nullable: true, hint: 'Nechte prázdné, pokud se cena nezobrazuje.' },
      { key: 'image_path', label: 'Fotografie', type: 'image' },
      { key: 'valid_from', label: 'Platí od', type: 'date', nullable: true },
      { key: 'valid_to', label: 'Platí do', type: 'date', nullable: true, hint: 'Po tomto dni se nabídka sama skryje.' },
      { key: 'is_active', label: 'Zobrazovat na webu', type: 'switch' },
    ]} /> });
