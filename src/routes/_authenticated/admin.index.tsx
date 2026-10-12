import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, todayPrague } from '@/content/rules';

export const Route = createFileRoute('/_authenticated/admin/')({ component: Dashboard });

type Stats = { dishes: number; hiddenDishes: number; featured: number; drinks: number; offers: number; current: { title: string; valid_from: string; valid_to: string } | null; upcoming: number; missingPhotos: string[] };

function Dashboard() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => { (async () => {
    const today = todayPrague();
    const [items, drinks, offers, menus] = await Promise.all([
      supabase.from('menu_items').select('name,is_active,is_featured,image_path'),
      supabase.from('drinks').select('id', { count: 'exact', head: true }),
      supabase.from('offers').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('weekly_menus').select('title,valid_from,valid_to,is_published').eq('is_published', true).gte('valid_to', today).order('valid_from'),
    ]);
    const it = items.data ?? []; const ms = menus.data ?? [];
    setS({ dishes: it.length, hiddenDishes: it.filter(i => !i.is_active).length, featured: it.filter(i => i.is_featured && i.is_active).length, drinks: drinks.count ?? 0, offers: offers.count ?? 0,
      current: ms.find(m => m.valid_from <= today) ?? null, upcoming: ms.filter(m => m.valid_from > today).length, missingPhotos: it.filter(i => i.is_featured && !i.image_path).map(i => i.name) });
  })(); }, []);
  const card = (label: string, value: string | number, to: string) => <Link to={to} className="rounded-lg border bg-card p-5 hover:border-primary"><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className="font-serif text-3xl mt-1">{value}</div></Link>;
  return <div>
    <h1 className="font-serif text-3xl mb-6">Přehled</h1>
    {!s ? <p className="text-muted-foreground">Načítám…</p> : <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {card('Jídla', `${s.dishes}${s.hiddenDishes ? ` (${s.hiddenDishes} skryto)` : ''}`, '/admin/jidla')}
        {card('Doporučená na úvodní stránce', `${s.featured} / 4`, '/admin/jidla')}
        {card('Nápoje', s.drinks, '/admin/napoje')}
        {card('Aktivní nabídky', s.offers, '/admin/nabidky')}
        {card('Připravená týdenní menu', s.upcoming, '/admin/tydenni-menu')}
      </div>
      <div className="rounded-lg border bg-card p-5 mb-4"><h2 className="font-medium mb-1">Aktuální týdenní menu</h2>{s.current ? <p className="text-sm">{s.current.title || 'Bez názvu'} · {formatDate(s.current.valid_from)} – {formatDate(s.current.valid_to)}</p> : <p className="text-sm text-destructive">Na dnešek není zveřejněno žádné menu. <Link to="/admin/tydenni-menu" className="underline">Vytvořit menu</Link></p>}</div>
      {s.featured > 4 && <p className="text-sm rounded-md border p-4 mb-4">Doporučených jídel je {s.featured}; na úvodní stránce se zobrazí první 4 podle pořadí.</p>}
      {s.missingPhotos.length > 0 && <p className="text-sm rounded-md border p-4">Doporučená jídla bez fotografie: {s.missingPhotos.join(', ')}.</p>}
    </>}
  </div>;
}
