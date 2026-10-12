import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Copy, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AllergenField } from '@/components/admin/fields';
import { formatDate, toISODate, todayPrague } from '@/content/rules';
import type { Database } from '@/integrations/supabase/types';

export const Route = createFileRoute('/_authenticated/admin/tydenni-menu')({ component: WeeklyAdmin });

type Menu = Database['public']['Tables']['weekly_menus']['Row'];
type Dish = { id?: string; weekday: number; kind: 'soup' | 'main'; name: string; description: string; price: string; allergens: number[]; sort_order: number };
const DAYS = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek'];

function status(m: Menu, today: string) {
  if (!m.is_published) return { label: 'Koncept', cls: 'bg-muted' };
  if (m.valid_to < today) return { label: 'Prošlé', cls: 'bg-muted' };
  if (m.valid_from > today) return { label: 'Naplánováno', cls: 'bg-secondary/20' };
  return { label: 'Aktuální na webu', cls: 'bg-primary/15 text-primary' };
}
const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + n); return toISODate(d); };
function nextMonday() { const d = new Date(`${todayPrague()}T12:00:00`); d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7)); return toISODate(d); }

function WeeklyAdmin() {
  const [menus, setMenus] = useState<Menu[] | null>(null);
  const [edit, setEdit] = useState<{ menu: Partial<Menu>; dishes: Dish[] } | null>(null);
  const [del, setDel] = useState<Menu | null>(null);
  const [saving, setSaving] = useState(false);
  const today = todayPrague();

  const load = useCallback(async () => {
    const { data } = await supabase.from('weekly_menus').select('*').order('valid_from', { ascending: false });
    setMenus(data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function open(m: Menu, copy = false) {
    const { data } = await supabase.from('weekly_menu_dishes').select('*').eq('menu_id', m.id).order('sort_order');
    const dishes = (data ?? []).map(d => ({ id: copy ? undefined : d.id, weekday: d.weekday, kind: d.kind as Dish['kind'], name: d.name, description: d.description, price: d.price == null ? '' : String(d.price), allergens: d.allergens, sort_order: d.sort_order }));
    if (copy) { const from = addDays(m.valid_from, 7); setEdit({ menu: { title: '', valid_from: from, valid_to: addDays(m.valid_to, 7), note: m.note, is_published: false }, dishes }); }
    else setEdit({ menu: m, dishes });
  }
  function create() { const mon = nextMonday(); setEdit({ menu: { title: '', valid_from: mon, valid_to: addDays(mon, 4), note: '', is_published: false }, dishes: [] }); }

  async function save() {
    if (!edit) return;
    const { menu, dishes } = edit;
    if (!menu.valid_from || !menu.valid_to) return toast.error('Vyplňte platnost menu.');
    if (menu.valid_to < menu.valid_from) return toast.error('Konec platnosti musí být po začátku.');
    if (dishes.some(d => !d.name.trim())) return toast.error('Každé jídlo musí mít název.');
    setSaving(true);
    const payload = { title: menu.title ?? '', valid_from: menu.valid_from, valid_to: menu.valid_to, note: menu.note || null, is_published: !!menu.is_published };
    const res = menu.id ? await supabase.from('weekly_menus').update(payload).eq('id', menu.id).select('id').single() : await supabase.from('weekly_menus').insert(payload).select('id').single();
    if (res.error) { setSaving(false); return toast.error('Uložení menu se nezdařilo.'); }
    const menuId = res.data.id;
    const keep = dishes.filter(d => d.id).map(d => d.id!);
    let q = supabase.from('weekly_menu_dishes').delete().eq('menu_id', menuId);
    if (keep.length) q = q.not('id', 'in', `(${keep.map(k => `"${k}"`).join(',')})`);
    const delRes = await q;
    const rows = dishes.map((d, i) => ({ ...(d.id ? { id: d.id } : {}), menu_id: menuId, weekday: d.weekday, kind: d.kind, name: d.name.trim(), description: d.description, price: d.price === '' ? null : Number(d.price), allergens: d.allergens, sort_order: d.kind === 'soup' ? i : 1000 + i }));
    const existing = rows.filter(r => 'id' in r); const fresh = rows.filter(r => !('id' in r));
    const [u, n] = await Promise.all([existing.length ? supabase.from('weekly_menu_dishes').upsert(existing) : { error: null }, fresh.length ? supabase.from('weekly_menu_dishes').insert(fresh) : { error: null }]);
    setSaving(false);
    if (delRes.error || u.error || n.error) return toast.error('Některá jídla se nepodařilo uložit.');
    toast.success('Menu uloženo.'); setEdit(null); load();
  }

  async function remove(m: Menu) {
    const { error } = await supabase.from('weekly_menus').delete().eq('id', m.id);
    setDel(null);
    if (error) return toast.error('Smazání se nezdařilo.');
    toast.success('Menu smazáno.'); load();
  }

  if (edit) {
    const { menu, dishes } = edit;
    const setMenu = (p: Partial<Menu>) => setEdit({ ...edit, menu: { ...menu, ...p } });
    const setDish = (i: number, p: Partial<Dish>) => setEdit({ ...edit, dishes: dishes.map((d, k) => k === i ? { ...d, ...p } : d) });
    const addDish = (weekday: number, kind: Dish['kind']) => setEdit({ ...edit, dishes: [...dishes, { weekday, kind, name: '', description: '', price: kind === 'soup' ? '' : '', allergens: [], sort_order: 0 }] });
    return <div>
      <Button variant="ghost" className="mb-4" onClick={() => setEdit(null)}><ArrowLeft />Zpět na seznam</Button>
      <h1 className="font-serif text-3xl mb-6">{menu.id ? 'Upravit týdenní menu' : 'Nové týdenní menu'}</h1>
      <div className="rounded-lg border bg-card p-5 grid gap-4 sm:grid-cols-2 mb-6">
        <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="wt">Název (volitelný)</Label><Input id="wt" value={menu.title ?? ''} onChange={e => setMenu({ title: e.target.value })} placeholder="Např. Týdenní menu 19.–23. 10." /></div>
        <div className="grid gap-1.5"><Label htmlFor="wf">Platí od *</Label><Input id="wf" type="date" value={menu.valid_from ?? ''} onChange={e => setMenu({ valid_from: e.target.value })} /></div>
        <div className="grid gap-1.5"><Label htmlFor="wto">Platí do *</Label><Input id="wto" type="date" value={menu.valid_to ?? ''} onChange={e => setMenu({ valid_to: e.target.value })} /></div>
        <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="wn">Poznámka</Label><Textarea id="wn" rows={2} value={menu.note ?? ''} onChange={e => setMenu({ note: e.target.value })} /></div>
        <div className="flex items-center justify-between sm:col-span-2"><Label htmlFor="wp">Zveřejnit (na webu se zobrazí jen v době platnosti)</Label><Switch id="wp" checked={!!menu.is_published} onCheckedChange={v => setMenu({ is_published: v })} /></div>
      </div>
      {DAYS.map((day, di) => <section key={day} className="rounded-lg border bg-card p-5 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3"><h2 className="font-serif text-xl">{day}</h2><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => addDish(di + 1, 'soup')}><Plus />Polévka</Button><Button size="sm" variant="outline" onClick={() => addDish(di + 1, 'main')}><Plus />Hlavní jídlo</Button></div></div>
        {dishes.map((d, i) => d.weekday !== di + 1 ? null : <div key={i} className="border-t py-3 grid gap-2">
          <div className="flex gap-2 items-end">
            <span className="text-xs w-20 shrink-0 pb-2.5 text-muted-foreground">{d.kind === 'soup' ? 'Polévka' : 'Hlavní jídlo'}</span>
            <div className="flex-1 grid gap-1"><Label className="sr-only" htmlFor={`dn${i}`}>Název</Label><Input id={`dn${i}`} placeholder="Název" value={d.name} onChange={e => setDish(i, { name: e.target.value })} /></div>
            <div className="w-24 grid gap-1"><Label className="sr-only" htmlFor={`dp${i}`}>Cena</Label><Input id={`dp${i}`} type="number" min={0} placeholder="Kč" value={d.price} onChange={e => setDish(i, { price: e.target.value })} /></div>
            <Button size="icon" variant="ghost" aria-label="Odebrat jídlo" onClick={() => setEdit({ ...edit, dishes: dishes.filter((_, k) => k !== i) })}><Trash2 /></Button>
          </div>
          <Input placeholder="Popis" value={d.description} onChange={e => setDish(i, { description: e.target.value })} aria-label="Popis" />
          <details><summary className="text-xs cursor-pointer text-muted-foreground">Alergeny: {d.allergens.length ? d.allergens.join(', ') : 'žádné'}</summary><div className="pt-2"><AllergenField value={d.allergens} onChange={v => setDish(i, { allergens: v })} /></div></details>
        </div>)}
      </section>)}
      <div className="flex gap-2 sticky bottom-0 bg-muted/80 py-3"><Button onClick={save} disabled={saving}>{saving && <Loader2 className="animate-spin" />}Uložit menu</Button><Button variant="outline" onClick={() => setEdit(null)}>Zrušit</Button></div>
    </div>;
  }

  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6"><h1 className="font-serif text-3xl">Týdenní menu</h1><Button onClick={create}><Plus />Nové menu</Button></div>
    <p className="text-sm text-muted-foreground mb-4">Na webu se automaticky zobrazí zveřejněné menu, jehož platnost zahrnuje dnešní den. Menu můžete připravit dopředu.</p>
    {!menus ? <Loader2 className="animate-spin" /> : menus.length === 0 ? <p className="text-muted-foreground">Zatím žádné menu.</p> :
      <ul className="divide-y rounded-md border bg-card">{menus.map(m => { const st = status(m, today); return <li key={m.id} className="flex items-center gap-3 p-3">
        <div className="flex-1 min-w-0"><div className="font-medium">{m.title || 'Týdenní menu'} <span className={`ml-2 text-xs rounded px-1.5 py-0.5 ${st.cls}`}>{st.label}</span></div><div className="text-xs text-muted-foreground">{formatDate(m.valid_from)} – {formatDate(m.valid_to)}</div></div>
        <Button size="icon" variant="ghost" aria-label="Kopírovat na další týden" title="Kopírovat na další týden" onClick={() => open(m, true)}><Copy /></Button>
        <Button size="icon" variant="ghost" aria-label="Upravit" onClick={() => open(m)}><Pencil /></Button>
        <Button size="icon" variant="ghost" aria-label="Smazat" onClick={() => setDel(m)}><Trash2 /></Button>
      </li>; })}</ul>}
    <AlertDialog open={!!del} onOpenChange={o => !o && setDel(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Smazat menu?</AlertDialogTitle><AlertDialogDescription>Smaže se menu i všechna jeho jídla. Akci nelze vrátit.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Zrušit</AlertDialogCancel><AlertDialogAction onClick={() => del && remove(del)}>Smazat</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
