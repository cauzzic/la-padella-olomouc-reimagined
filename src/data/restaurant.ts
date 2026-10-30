// Static design media + fixed reference lists. Editable content lives in src/content.
import pizza from '@/assets/pizza-hero.jpg';
import pasta from '@/assets/pasta.jpg';
import tiramisu from '@/assets/tiramisu.jpg';
import oldInterior from '@/assets/restaurant.jpg';
const interior = '/images/interier-lapadella.webp';
export const images = { pizza, pasta, tiramisu, interior };
export const allergens = ['Obiloviny obsahující lepek (pšenice, žito, ječmen, oves, špalda, kamut nebo jejich hybridní odrůdy) a výrobky z nich','Korýši a výrobky z nich','Vejce a výrobky z nich','Ryby a výrobky z nich','Podzemnice olejná (arašídy) a výrobky z nich','Sójové boby (sója) a výrobky z nich','Mléko a výrobky z něj včetně laktózy','Skořápkové plody (mandle, lískové ořechy, vlašské ořechy, kešu ořechy, pekanové ořechy, para ořechy, pistácie, makadamové ořechy, queenslandské ořechy) a výrobky z nich','Celer a výrobky z něj','Hořčice a výrobky z ní','Sezamová semínka (sezam) a výrobky z nich','Oxid siřičitý a siřičitany v koncentracích vyšších než 10 mg/kg/l','Vlčí bob (lupina) a výrobky z něj','Měkkýši a výrobky z nich'];
export const allergensShort = ['Lepek','Korýši','Vejce','Ryby','Arašídy','Sója','Mléko','Skořápkové plody','Celer','Hořčice','Sezam','Oxid siřičitý','Vlčí bob','Měkkýši'];
export const allergensEn = ['Cereals containing gluten (i.e. wheat, rye, barley, oats, spelt, kamut or their hybridised strains)','Crustaceans and products thereof','Eggs and products thereof','Fish and products thereof','Peanuts and products thereof','Soybeans and products thereof','Milk and products thereof, including lactose','Nuts (almonds, hazelnuts, walnuts, cashews, pecans, Brazil nuts, pistachios, macadamia nuts) and products thereof','Celery and products thereof','Mustard and products thereof','Sesame seeds and products thereof','Sulphur dioxide and sulphites at concentrations above 10 mg/kg or 10 mg/l','Lupin and products thereof','Molluscs and products thereof'];
export const gallery = [{src:pizza,title:'Neapolská pizza',category:'Jídlo'},{src:pasta,title:'Domácí pappardelle',category:'Jídlo'},{src:interior,title:'Interiér La Padella',category:'Restaurace'},{src:oldInterior,title:'Atmosféra La Padella',category:'Restaurace'},{src:tiramisu,title:'Sladká tečka',category:'Jídlo'}];
export { seoHead as pageHead } from '@/lib/seo';
