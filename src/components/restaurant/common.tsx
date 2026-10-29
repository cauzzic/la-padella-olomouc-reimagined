import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MenuItem, Offer, WeeklyMenu, WeeklyMenuDish } from '@/content/types';
import { formatDate } from '@/content/rules';
import { AllergenIcons, AllergenNote } from './allergens';

export function PageIntro({eyebrow,title,description,backgroundImage}:{eyebrow:string;title:string;description:string;backgroundImage?:string}) {return <div className={`page-intro${backgroundImage?' page-intro-image':''}`} style={backgroundImage?{backgroundImage:`url(${backgroundImage})`,backgroundSize:'cover',backgroundPosition:'center'}:undefined}>{backgroundImage&&<div className="page-intro-veil" aria-hidden="true"/>}<div className="wrap"><div className="eyebrow text-primary">{eyebrow}</div><h1 className="display">{title}</h1><p className="body-copy">{description}</p></div></div>}

export function FoodCard({item}:{item:MenuItem}) {return <article className="food-card"><Link to="/menu" className="block">{item.image_url&&<div className="image-wrap"><img className="food-image" src={item.image_url} alt={item.name} loading="lazy" width={1024} height={1024}/></div>}<h3>{item.name}<AllergenIcons numbers={item.allergens}/></h3></Link><p>{item.description}</p>{item.price_note&&<small className="price-note">{item.price_note}</small>}<small className="allergen-note"><AllergenNote numbers={item.allergens}/></small><div className="food-meta">{!item.price_note&&<strong>{item.price} Kč</strong>}<Link to="/menu" aria-label={`Zobrazit ${item.name} v menu`}><ArrowUpRight size={18}/></Link></div></article>}

const WEEKDAYS = ['Pondělí','Úterý','Středa','Čtvrtek','Pátek'];
function DishRow({d}:{d:WeeklyMenuDish}) {return <div className="lunch-row"><div className="min-w-0"><h3>{d.name}<AllergenIcons numbers={d.allergens}/></h3>{d.description&&<p>{d.description}</p>}<small className="allergen-note"><AllergenNote numbers={d.allergens}/></small></div>{d.price!=null&&<strong>{d.price} Kč</strong>}</div>}

export function WeeklyMenuBlock({menu}:{menu:WeeklyMenu|null}) {
  if(!menu) return <div className="day-menu"><h2 className="display">Menu připravujeme</h2><p className="body-copy mt-3">Aktuální týdenní menu zatím není zveřejněno. Zastavte se brzy znovu.</p></div>;
  return <div><div className="section-title"><span className="demo-label">Platí {formatDate(menu.valid_from)} – {formatDate(menu.valid_to)}</span>{menu.note&&<p className="body-copy">{menu.note}</p>}</div><div className="week-grid">{WEEKDAYS.map((day,i)=>{const items=menu.dishes.filter(d=>d.weekday===i+1).sort((a,b)=>(a.kind===b.kind?0:a.kind==='soup'?-1:1)||a.sort_order-b.sort_order);return items.length>0&&<article className="day-menu" key={day}><h2 className="display">{day}</h2>{items.map(d=><DishRow d={d} key={d.id}/>)}</article>})}</div></div>;
}

export function OfferCard({offer}:{offer:Offer}) {return <article className="story-grid">{offer.image_url&&<img src={offer.image_url} alt={offer.title} width={1024} height={1024} loading="lazy"/>}<div>{offer.label&&<div className="eyebrow text-primary">{offer.label}</div>}<h2 className="display">{offer.title}</h2><p className="body-copy">{offer.description}</p>{(offer.price!=null||offer.valid_to)&&<div className="flex justify-between mt-6 mb-7 border-b pb-6"><span className="text-sm text-muted-foreground">{offer.valid_to?`Do ${formatDate(offer.valid_to)}`:''}</span>{offer.price!=null&&<strong>{offer.price} Kč</strong>}</div>}<Button asChild><Link to="/rezervace">Rezervovat stůl <ArrowUpRight/></Link></Button></div></article>}

export function ReservationCTA() {return <section className="cta-band"><div className="wrap"><div><div className="eyebrow text-primary mb-3">U jednoho stolu</div><h2 className="display">Na dobré chvíle je vždy místo.</h2></div><Button asChild size="lg"><Link to="/rezervace">Rezervovat stůl <ArrowRight/></Link></Button></div></section>}
