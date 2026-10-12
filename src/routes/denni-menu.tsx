import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PageIntro, WeeklyMenuBlock, ReservationCTA } from '@/components/restaurant/common';
import { pageHead } from '@/data/restaurant';
import { weeklyMenuQuery } from '@/content/repository';
export const Route=createFileRoute('/denni-menu')({head:()=>pageHead('Týdenní menu','Obědové menu La Padella Olomouc na pondělí až pátek.'),loader:({context})=>context.queryClient.ensureQueryData(weeklyMenuQuery),component:WeeklyPage,errorComponent:({error})=><p className="wrap py-20" role="alert">{error.message}</p>,notFoundComponent:()=><p className="wrap py-20">Menu nenalezeno.</p>});
function WeeklyPage(){const {data:menu}=useSuspenseQuery(weeklyMenuQuery);return <><PageIntro eyebrow="Pranzo italiano" title="Týdenní menu" description="Polévky a hlavní jídla od pondělí do pátku."/><section className="section"><div className="wrap"><WeeklyMenuBlock menu={menu}/></div></section><ReservationCTA/></>}
