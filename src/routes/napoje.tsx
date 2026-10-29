import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageIntro, ReservationCTA } from '@/components/restaurant/common';
import { pageHead } from '@/data/restaurant';
import { drinksQuery } from '@/content/repository';
export const Route=createFileRoute('/napoje')({head:()=>pageHead('Nápojový lístek | La Padella Olomouc','Nápojový lístek La Padella Olomouc: aperitivy, spritz, víno, pivo, káva, destiláty a koktejly.','/napoje'),loader:({context})=>context.queryClient.ensureQueryData(drinksQuery),component:DrinksPage,errorComponent:({error})=><p className="wrap py-20" role="alert">{String(error)}</p>,notFoundComponent:()=><p className="wrap py-20">Nápoje nenalezeny.</p>});
function DrinksPage(){
  const {data:drinks}=useSuspenseQuery(drinksQuery);
  const [cat,setCat]=useState<string|null>(null);
  const activeId=cat??drinks[0]?.id;
  const shown=drinks.filter(c=>c.id===activeId);
  return <><PageIntro eyebrow="Da bere" title="Nápojový lístek" description="Aperitivy, káva, víno i něco na závěr."/><section className="section"><div className="wrap">
    {drinks.length===0?<p className="body-copy">Nápojový lístek připravujeme.</p>:<>
    <div className="filter-bar">{drinks.map(c=><Button key={c.id} variant={activeId===c.id?'restaurant':'outline'} aria-pressed={activeId===c.id} onClick={()=>setCat(c.id)}>{c.name}</Button>)}</div>
    {shown.map(c=><div key={c.id} className="mb-12"><h2 className="display text-3xl mb-4">{c.name}</h2><div className="menu-list">{c.items.map(d=><article className="menu-item" key={d.id}><div><h3>{d.name}{d.brand&&<span className="text-muted-foreground font-normal"> · {d.brand}</span>}</h3>{d.description&&<p>{d.description}</p>}{d.volume&&<small>{d.volume}</small>}</div><strong>{d.price} Kč</strong></article>)}</div></div>)}</>}
    <p className="notice">Ceny jsou včetně DPH.</p></div></section><ReservationCTA/></>}
