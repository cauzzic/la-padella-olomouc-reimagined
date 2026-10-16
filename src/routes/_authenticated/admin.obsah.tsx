import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ImageField } from '@/components/admin/fields';
import { releaseImage } from '@/components/admin/media';

export const Route = createFileRoute('/_authenticated/admin/obsah')({ component: ContentAdmin });

type F = { key: string; label: string; type?: 'textarea' | 'image' | 'switch'; hint?: string };
const groups: { title: string; fields: F[] }[] = [
  { title: 'Oznámení a horní lišta', fields: [
    { key: 'announcement_active', label: 'Zobrazit oznámení nad hlavičkou', type: 'switch' },
    { key: 'announcement', label: 'Text oznámení', hint: 'Např. 24. 12. máme zavřeno.' },
    { key: 'topbar_text', label: 'Text v horní liště' },
  ] },
  { title: 'Úvodní stránka', fields: [
    { key: 'hero_image', label: 'Hlavní fotografie', type: 'image' },
    { key: 'hero_eyebrow', label: 'Nadpis nad titulkem' },
    { key: 'hero_title', label: 'Hlavní titulek' },
    { key: 'hero_title_accent', label: 'Druhý řádek titulku (kurzíva)' },
    { key: 'hero_text', label: 'Úvodní text', type: 'textarea' },
    { key: 'lunch_image', label: 'Fotografie u týdenního menu', type: 'image' },
    { key: 'lunch_title', label: 'Nadpis sekce týdenního menu' },
    { key: 'lunch_text', label: 'Text sekce týdenního menu', type: 'textarea' },
  ] },
  { title: 'Kontakt a otevírací doba', fields: [
    { key: 'address', label: 'Adresa' },
    { key: 'phone', label: 'Telefon' },
    { key: 'email', label: 'E-mail' },
    { key: 'instagram_url', label: 'Odkaz na Instagram' },
    { key: 'opening_hours', label: 'Otevírací doba', type: 'textarea', hint: 'Každý řádek: Dny | Čas, např. „Pondělí–pátek | 11:00–22:00“' },
    { key: 'lunch_hours', label: 'Čas denního menu' },
    { key: 'contact_text', label: 'Text na stránce Kontakt', type: 'textarea' },
  ] },
];

function ContentAdmin() {
  const [orig, setOrig] = useState<Record<string, string> | null>(null);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { supabase.from('site_settings').select('key,value').then(({ data }) => { const o = Object.fromEntries((data ?? []).map(r => [r.key, r.value])); setOrig(o); setVals(o); }); }, []);
  async function save() {
    if (!orig) return;
    const changed = Object.entries(vals).filter(([k, v]) => orig[k] !== v).map(([key, value]) => ({ key, value }));
    if (!changed.length) { toast.info('Žádné změny.'); return; }
    setSaving(true);
    const { error } = await supabase.from('site_settings').upsert(changed);
    setSaving(false);
    if (error) { toast.error('Uložení se nezdařilo.'); return; }
    for (const f of groups.flatMap(g => g.fields)) if (f.type === 'image' && orig[f.key] !== vals[f.key]) await releaseImage(orig[f.key]);
    setOrig({ ...vals }); toast.success('Obsah webu uložen.');
  }
  if (!orig) return <Loader2 className="animate-spin" />;
  const set = (k: string, v: string) => setVals(s => ({ ...s, [k]: v }));
  return <div>
    <h1 className="font-display text-3xl mb-6">Obsah webu</h1>
    {groups.map(g => <section key={g.title} className="rounded-lg border bg-card p-5 mb-5 grid gap-4">
      <h2 className="font-display text-xl">{g.title}</h2>
      {g.fields.map(f => <div key={f.key} className={f.type === 'switch' ? 'flex items-center justify-between' : 'grid gap-1.5'}>
        <Label htmlFor={`s-${f.key}`}>{f.label}</Label>
        {f.type === 'switch' ? <Switch id={`s-${f.key}`} checked={vals[f.key] === 'true'} onCheckedChange={v => set(f.key, v ? 'true' : 'false')} />
          : f.type === 'image' ? <ImageField value={vals[f.key] || null} onChange={p => set(f.key, p ?? '')} />
          : f.type === 'textarea' ? <Textarea id={`s-${f.key}`} rows={3} value={vals[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} />
          : <Input id={`s-${f.key}`} value={vals[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} />}
        {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
      </div>)}
    </section>)}
    <div className="sticky bottom-0 bg-muted/80 py-3"><Button onClick={save} disabled={saving}>{saving && <Loader2 className="animate-spin" />}Uložit změny</Button></div>
  </div>;
}
