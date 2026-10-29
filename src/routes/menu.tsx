import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageIntro, ReservationCTA } from '@/components/restaurant/common';
import { pageHead } from '@/data/restaurant';
import { AllergenIcons, AllergenNote, AllergenLegend } from '@/components/restaurant/allergens';
import { menuQuery } from '@/content/repository';
export const Route=createFileRoute('/menu')({head:()=>pageHead('Jídelní lístek | La Padella Olomouc','Jídelní lístek La Padella Olomouc: pravá neapolská pizza, předkrmy, těstoviny a rizota, maso, ryby a dezerty s cenami a alergeny.','/menu'),loader:({context})=>context.queryClient.ensureQueryData(menuQuery),component:MenuPage,errorComponent:({error})=><p className="wrap py-20" role="alert">{String(error)}</p>,notFoundComponent:()=><p className="wrap py-20">Menu nenalezeno.</p>});
function MenuPage(){
  const {data:menu}=useSuspenseQuery(menuQuery);
  const [cat,setCat]=useState('all');
  const shown=menu.filter(c=>cat==='all'||c.id===cat);
  return <><PageIntro eyebrow="Il nostro menu" title="Jídelní lístek" description="Jednoduché recepty, výjimečné suroviny a chuť Itálie."/><section className="section"><div className="wrap">
    <div className="filter-bar"><Button variant={cat==='all'?'restaurant':'outline'} aria-pressed={cat==='all'} onClick={()=>setCat('all')}>Vše</Button>{menu.map(c=><Button key={c.id} variant={cat===c.id?'restaurant':'outline'} aria-pressed={cat===c.id} onClick={()=>setCat(c.id)}>{c.name}</Button>)}</div>
    {shown.map(c=><div key={c.id} className="mb-12"><h2 className="display text-3xl mb-4">{c.name}</h2>{c.description&&<p className="body-copy mb-4">{c.description}</p>}<div className="menu-list">{c.items.map(d=><article className="menu-item" key={d.id}><div><h3>{d.name}{d.is_vegetarian&&<Leaf size={15} className="inline ml-2 text-primary" aria-label="Vegetariánské"/>}<AllergenIcons numbers={d.allergens}/></h3><p>{d.description}</p><small>{d.portion?`${d.portion} · `:''}<AllergenNote numbers={d.allergens}/></small></div><strong>{d.price_note||`${d.price} Kč`}</strong></article>)}</div></div>)}
    <p className="notice">Ceny jsou včetně DPH. Na alergeny se vždy informujte u obsluhy.</p></div></section><AllergenLegend/><ReservationCTA/></>}
