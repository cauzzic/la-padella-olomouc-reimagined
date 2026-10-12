import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageIntro, ReservationCTA } from '@/components/restaurant/common';
import { allergens, pageHead } from '@/data/restaurant';
import { drinksQuery, menuQuery } from '@/content/repository';
export const Route=createFileRoute('/menu')({head:()=>pageHead('Jídelní lístek','Neapolská pizza, předkrmy, domácí těstoviny, dezerty a nápoje s cenami a alergeny.'),loader:({context})=>Promise.all([context.queryClient.ensureQueryData(menuQuery),context.queryClient.ensureQueryData(drinksQuery)]),component:MenuPage,errorComponent:({error})=><p className="wrap py-20" role="alert">{String(error)}</p>,notFoundComponent:()=><p className="wrap py-20">Menu nenalezeno.</p>});
function MenuPage(){
  const {data:menu}=useSuspenseQuery(menuQuery);const {data:drinks}=useSuspenseQuery(drinksQuery);
  const [cat,setCat]=useState('all');
  const showDrinks=cat==='all'||cat==='drinks';
  const shown=cat==='drinks'?[]:menu.filter(c=>cat==='all'||c.id===cat);
  return <><PageIntro eyebrow="Il nostro menu" title="Jídelní lístek" description="Jednoduché recepty, výjimečné suroviny a chuť Itálie."/><section className="section"><div className="wrap">
    <div className="filter-bar"><Button variant={cat==='all'?'restaurant':'outline'} aria-pressed={cat==='all'} onClick={()=>setCat('all')}>Vše</Button>{menu.map(c=><Button key={c.id} variant={cat===c.id?'restaurant':'outline'} aria-pressed={cat===c.id} onClick={()=>setCat(c.id)}>{c.name}</Button>)}{drinks.length>0&&<Button variant={cat==='drinks'?'restaurant':'outline'} aria-pressed={cat==='drinks'} onClick={()=>setCat('drinks')}>Nápoje</Button>}</div>
    {shown.map(c=><div key={c.id} className="mb-12"><h2 className="display text-3xl mb-4">{c.name}</h2>{c.description&&<p className="body-copy mb-4">{c.description}</p>}<div className="menu-list">{c.items.map(d=><article className="menu-item" key={d.id}><div><h3>{d.name}{d.is_vegetarian&&<Leaf size={15} className="inline ml-2 text-primary" aria-label="Vegetariánské"/>}</h3><p>{d.description}</p><small>{d.portion?`${d.portion} · `:''}Alergeny: {d.allergens.length?d.allergens.join(', '):'žádné'}</small></div><strong>{d.price} Kč</strong></article>)}</div></div>)}
    {showDrinks&&drinks.length>0&&<div className="mb-12"><div className="eyebrow text-primary mb-2">Da bere</div><h2 className="display text-4xl mb-8">Nápojový lístek</h2>{drinks.map(c=><div key={c.id} className="mb-10"><h3 className="display text-2xl mb-3">{c.name}</h3><div className="menu-list">{c.items.map(d=><article className="menu-item" key={d.id}><div><h3>{d.name}{d.brand&&<span className="text-muted-foreground font-normal"> · {d.brand}</span>}</h3>{d.description&&<p>{d.description}</p>}{d.volume&&<small>{d.volume}</small>}</div><strong>{d.price} Kč</strong></article>)}</div></div>)}</div>}
    <p className="notice">Ceny jsou včetně DPH. Na alergeny se vždy informujte u obsluhy.</p><details className="mt-8 border-t pt-6"><summary className="cursor-pointer text-sm font-medium">Přehled alergenů</summary><div className="allergen-list">{allergens.map((a,i)=><span key={a}><strong>{i+1}.</strong> {a}</span>)}</div></details></div></section><ReservationCTA/></>}
