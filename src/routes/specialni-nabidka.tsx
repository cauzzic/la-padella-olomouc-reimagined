import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PageIntro, OfferCard, ReservationCTA } from '@/components/restaurant/common';
import { pageHead } from '@/data/restaurant';
import { offersQuery } from '@/content/repository';
export const Route=createFileRoute('/specialni-nabidka')({head:()=>pageHead('Speciální nabídka','Sezónní speciality La Padella Olomouc.'),loader:({context})=>context.queryClient.ensureQueryData(offersQuery),component:Specials,errorComponent:({error})=><p className="wrap py-20" role="alert">{String(error)}</p>,notFoundComponent:()=><p className="wrap py-20">Nabídka nenalezena.</p>});
function Specials(){const {data:offers}=useSuspenseQuery(offersQuery);return <><PageIntro eyebrow="Qualcosa di speciale" title="Sezóna na talíři." description="To nejlepší právě teď."/><section className="section"><div className="wrap flex flex-col gap-20">{offers.length?offers.map(o=><OfferCard offer={o} key={o.id}/>):<p className="body-copy">Momentálně nemáme žádnou speciální nabídku.</p>}</div></section><ReservationCTA/></>}
