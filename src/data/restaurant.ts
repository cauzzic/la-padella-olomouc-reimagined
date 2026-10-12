// Static design media + fixed reference lists. Editable content lives in src/content.
import pizza from '@/assets/pizza-hero.jpg';
import pasta from '@/assets/pasta.jpg';
import tiramisu from '@/assets/tiramisu.jpg';
import interior from '@/assets/restaurant.jpg';
export const images = { pizza, pasta, tiramisu, interior };
export const allergens = ['Obiloviny obsahující lepek','Korýši','Vejce','Ryby','Arašídy','Sója','Mléko','Skořápkové plody','Celer','Hořčice','Sezam','Oxid siřičitý a siřičitany','Vlčí bob','Měkkýši'];
export const gallery = [{src:pizza,title:'Neapolská pizza',category:'Jídlo'},{src:pasta,title:'Domácí pappardelle',category:'Jídlo'},{src:interior,title:'Atmosféra La Padella',category:'Restaurace'},{src:tiramisu,title:'Sladká tečka',category:'Jídlo'}];
export function pageHead(title:string, description:string) {return {meta:[{title:`${title} | La Padella Olomouc`},{name:'description',content:description},{property:'og:title',content:`${title} | La Padella Olomouc`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]};}
