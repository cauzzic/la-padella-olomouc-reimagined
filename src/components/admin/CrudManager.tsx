import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AllergenField, ImageField } from './fields';
import { releaseImage, useSignedUrl } from './media';

export type Row = Record<string, unknown> & { id: string; sort_order: number; name?: string; title?: string; description?: string | null; brand?: string | null; is_active?: boolean; price?: number | null; portion?: string | null; volume?: string | null; valid_from?: string | null; valid_to?: string | null };
export type Field = {
  key: string; label: string;
  type: 'text' | 'textarea' | 'number' | 'switch' | 'select' | 'allergens' | 'image' | 'date';
  required?: boolean; nullable?: boolean; hint?: string;
  options?: { value: string; label: string }[];
};
type Props = {
  table: 'menu_items' | 'drinks' | 'menu_categories' | 'drink_categories' | 'offers';
  title: string; singular: string; fields: Field[];
  categoryKey?: string; categories?: { value: string; label: string }[];
  defaults: Record<string, unknown>;
  summary: (r: Row) => ReactNode;
  featuredKey?: string;
  deleteGuard?: (r: Row) => Promise<string | null>;
};

// Table name is chosen from a fixed union above; the client is untyped here so one manager serves every table.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const from = (t: string) => (supabase as any).from(t);

function Thumb({ path }: { path: unknown }) {
  const url = useSignedUrl(typeof path === 'string' ? path : null);
  return <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">{url && <img src={url} alt="" className="h-full w-full object-cover" />}</div>;
}

export function CrudManager({ table, title, singular, fields, categoryKey, categories, defaults, summary, featuredKey, deleteGuard }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [original, setOriginal] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const hasImage = fields.some(f => f.type === 'image');

  const load = useCallback(async () => {
    const { data, error } = await from(table).select('*').order('sort_order');
    if (error) toast.error('Načtení se nezdařilo.'); else setRows(data as Row[]);
    setLoading(false);
  }, [table]);
  useEffect(() => { load(); }, [load]);

  const catOrder = useMemo(() => new Map((categories ?? []).map((c, i) => [c.value, i])), [categories]);
  const shown = useMemo(() => rows
    .filter(r => cat === 'all' || r[categoryKey ?? ''] === cat)
    .filter(r => !q || `${r.name ?? r.title ?? ''} ${r.description ?? ''} ${r.brand ?? ''}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => categoryKey ? ((catOrder.get(a[categoryKey] as string) ?? 99) - (catOrder.get(b[categoryKey] as string) ?? 99)) || a.sort_order - b.sort_order : a.sort_order - b.sort_order),
  [rows, cat, q, categoryKey, catOrder]);

  async function update(id: string, patch: Record<string, unknown>) {
    const { error } = await from(table).update(patch).eq('id', id);
    if (error) { toast.error('Uložení se nezdařilo.'); return false; }
    return true;
  }

  async function move(r: Row, dir: -1 | 1) {
    const siblings = rows.filter(x => !categoryKey || x[categoryKey] === r[categoryKey]).sort((a, b) => a.sort_order - b.sort_order);
    const i = siblings.findIndex(x => x.id === r.id); const j = i + dir;
    if (j < 0 || j >= siblings.length) return;
    [siblings[i], siblings[j]] = [siblings[j]!, siblings[i]!];
    const changed = siblings.map((x, k) => ({ x, k: k * 10 })).filter(({ x, k }) => x.sort_order !== k);
    const ok = (await Promise.all(changed.map(({ x, k }) => update(x.id, { sort_order: k })))).every(Boolean);
    if (ok) load();
  }

  function openNew() {
    const siblings = rows.filter(x => !categoryKey || cat === 'all' || x[categoryKey] === cat);
    const next = siblings.length ? Math.max(...siblings.map(s => s.sort_order)) + 10 : 0;
    setOriginal(null);
    setEditing({ ...defaults, ...(categoryKey && cat !== 'all' ? { [categoryKey]: cat } : {}), sort_order: next });
  }

  async function save() {
    if (!editing) return;
    for (const f of fields) if (f.required && (editing[f.key] === '' || editing[f.key] == null)) { toast.error(`Vyplňte pole „${f.label}“.`); return; }
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      let v = editing[f.key];
      if (f.type === 'number') v = v === '' || v == null ? (f.nullable ? null : 0) : Number(v);
      if ((f.type === 'text' || f.type === 'date' || f.type === 'textarea') && f.nullable && v === '') v = null;
      payload[f.key] = v ?? (f.type === 'switch' ? false : f.type === 'allergens' ? [] : f.nullable || f.type === 'image' ? null : '');
    }
    payload.sort_order = editing.sort_order ?? 0;
    setSaving(true);
    const res = original ? await from(table).update(payload).eq('id', original.id) : await from(table).insert(payload);
    setSaving(false);
    if (res.error) { toast.error('Uložení se nezdařilo.'); return; }
    if (hasImage && original) { const f = fields.find(x => x.type === 'image')!; if (original[f.key] !== payload[f.key]) await releaseImage(original[f.key] as string); }
    toast.success('Uloženo.');
    setEditing(null); load();
  }

  async function remove(r: Row) {
    if (deleteGuard) { const msg = await deleteGuard(r); if (msg) { toast.error(msg); setToDelete(null); return; } }
    const { error } = await from(table).delete().eq('id', r.id);
    setToDelete(null);
    if (error) { toast.error('Smazání se nezdařilo.'); return; }
    if (hasImage) await releaseImage(r[fields.find(x => x.type === 'image')!.key] as string);
    toast.success('Smazáno.'); load();
  }

  const catLabel = (v: unknown) => categories?.find(c => c.value === v)?.label ?? '—';
  const set = (k: string, v: unknown) => setEditing(e => ({ ...e!, [k]: v }));

  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 className="font-serif text-3xl">{title}</h1>
      <Button onClick={openNew}><Plus />Přidat {singular}</Button>
    </div>
    <div className="flex flex-wrap gap-3 mb-4">
      <div className="relative flex-1 min-w-48"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Hledat…" value={q} onChange={e => setQ(e.target.value)} aria-label="Hledat" /></div>
      {categories && <select className="h-9 rounded-md border bg-background px-3 text-sm" value={cat} onChange={e => setCat(e.target.value)} aria-label="Filtrovat podle kategorie">
        <option value="all">Všechny kategorie</option>{categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>}
    </div>
    {loading ? <Loader2 className="animate-spin" /> : shown.length === 0 ? <p className="text-muted-foreground py-10 text-center">Zatím zde nic není.</p> :
      <ul className="divide-y rounded-md border bg-card">
        {shown.map(r => <li key={r.id} className={`flex items-center gap-3 p-3 ${r.is_active === false ? 'opacity-55' : ''}`}>
          {hasImage && <Thumb path={r[fields.find(x => x.type === 'image')!.key]} />}
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{String(r.name ?? r.title)}{r.is_active === false && <span className="ml-2 text-xs rounded bg-muted px-1.5 py-0.5">Skryto</span>}{featuredKey && r[featuredKey] === true && <span className="ml-2 text-xs rounded bg-primary/15 text-primary px-1.5 py-0.5">Doporučeno</span>}</div>
            <div className="text-xs text-muted-foreground truncate">{categoryKey && `${catLabel(r[categoryKey])} · `}{summary(r)}</div>
          </div>
          <div className="flex items-center gap-0.5">
            <Button size="icon" variant="ghost" aria-label="Posunout nahoru" onClick={() => move(r, -1)}><ArrowUp /></Button>
            <Button size="icon" variant="ghost" aria-label="Posunout dolů" onClick={() => move(r, 1)}><ArrowDown /></Button>
            {featuredKey && <Button size="icon" variant="ghost" aria-label={r[featuredKey] ? 'Zrušit doporučení' : 'Doporučit na úvodní stránku'} onClick={async () => { if (await update(r.id, { [featuredKey]: !r[featuredKey] })) load(); }}><Star className={r[featuredKey] ? 'fill-current text-primary' : ''} /></Button>}
            <Button size="icon" variant="ghost" aria-label={r.is_active ? 'Skrýt' : 'Zveřejnit'} onClick={async () => { if (await update(r.id, { is_active: !r.is_active })) load(); }}>{r.is_active ? <Eye /> : <EyeOff />}</Button>
            <Button size="icon" variant="ghost" aria-label="Upravit" onClick={() => { setOriginal(r); setEditing({ ...r }); }}><Pencil /></Button>
            <Button size="icon" variant="ghost" aria-label="Smazat" onClick={() => setToDelete(r)}><Trash2 /></Button>
          </div>
        </li>)}
      </ul>}

    <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{original ? 'Upravit' : 'Přidat'} {singular}</DialogTitle></DialogHeader>
        {editing && <div className="grid gap-4">
          {fields.map(f => <div key={f.key} className={f.type === 'switch' ? 'flex items-center justify-between gap-4' : 'grid gap-1.5'}>
            <Label htmlFor={`f-${f.key}`}>{f.label}{f.required && ' *'}</Label>
            {f.type === 'text' && <Input id={`f-${f.key}`} value={(editing[f.key] as string) ?? ''} onChange={e => set(f.key, e.target.value)} />}
            {f.type === 'date' && <Input id={`f-${f.key}`} type="date" value={(editing[f.key] as string) ?? ''} onChange={e => set(f.key, e.target.value)} />}
            {f.type === 'number' && <Input id={`f-${f.key}`} type="number" min={0} step="1" value={(editing[f.key] as number | string) ?? ''} onChange={e => set(f.key, e.target.value)} />}
            {f.type === 'textarea' && <Textarea id={`f-${f.key}`} rows={3} value={(editing[f.key] as string) ?? ''} onChange={e => set(f.key, e.target.value)} />}
            {f.type === 'switch' && <Switch id={`f-${f.key}`} checked={!!editing[f.key]} onCheckedChange={v => set(f.key, v)} />}
            {f.type === 'select' && <select id={`f-${f.key}`} className="h-9 rounded-md border bg-background px-3 text-sm" value={(editing[f.key] as string) ?? ''} onChange={e => set(f.key, e.target.value)}>
              <option value="">— vyberte —</option>{f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>}
            {f.type === 'allergens' && <AllergenField value={(editing[f.key] as number[]) ?? []} onChange={v => set(f.key, v)} />}
            {f.type === 'image' && <ImageField value={(editing[f.key] as string) ?? null} onChange={v => set(f.key, v)} />}
            {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
          </div>)}
        </div>}
        <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Zrušit</Button><Button onClick={save} disabled={saving}>{saving && <Loader2 className="animate-spin" />}Uložit</Button></DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Opravdu smazat „{String(toDelete?.name ?? toDelete?.title ?? '')}“?</AlertDialogTitle><AlertDialogDescription>Tuto akci nelze vrátit. Pokud chcete položku jen dočasně skrýt, použijte ikonu oka.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Zrušit</AlertDialogCancel><AlertDialogAction onClick={() => toDelete && remove(toDelete)}>Smazat</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>;
}

/** Loads category options for a manager. */
export function useCategoryOptions(table: 'menu_categories' | 'drink_categories') {
  const [opts, setOpts] = useState<{ value: string; label: string }[] | null>(null);
  useEffect(() => { from(table).select('id,name').order('sort_order').then(({ data }: { data: { id: string; name: string }[] | null }) => setOpts((data ?? []).map(c => ({ value: c.id, label: c.name })))); }, [table]);
  return opts;
}

export async function countIn(table: 'menu_items' | 'drinks', categoryId: string) {
  const { count } = await from(table).select('id', { count: 'exact', head: true }).eq('category_id', categoryId);
  return count ?? 0;
}
