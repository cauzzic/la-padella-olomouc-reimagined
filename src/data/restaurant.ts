import pizza from '@/assets/pizza-hero.jpg';
import pasta from '@/assets/pasta.jpg';
import tiramisu from '@/assets/tiramisu.jpg';
import interior from '@/assets/restaurant.jpg';
export const images = { pizza, pasta, tiramisu, interior };
export const categories = ['Vše', 'Předkrmy', 'Pizza', 'Těstoviny', 'Hlavní chody', 'Dezerty', 'Nápoje'] as const;
export type Category = typeof categories[number];
export type Dish = { id: string; name: string; description: string; price: number; category: Category; allergens: number[]; portion: string; vegetarian?: boolean; image?: string };
export const dishes: Dish[] = [
 {id:'burrata',name:'Burrata e pomodorini',description:'Krémová burrata, barevná rajčata, bazalkové pesto a domácí focaccia.',price:235,category:'Předkrmy',allergens:[1,7,8],portion:'150 g',vegetarian:true},
 {id:'bruschetta',name:'Bruschetta al pomodoro',description:'Opečený chléb, čerstvá rajčata, česnek, bazalka a extra panenský olivový olej.',price:145,category:'Předkrmy',allergens:[1],portion:'3 ks',vegetarian:true},
 {id:'margherita',name:'Margherita',description:'Rajčata San Marzano, fior di latte, čerstvá bazalka a extra panenský olivový olej.',price:245,category:'Pizza',allergens:[1,7],portion:'32 cm',vegetarian:true,image:pizza},
 {id:'diavola',name:'Diavola',description:'Rajčata San Marzano, fior di latte, pikantní salám ventricina a chilli.',price:285,category:'Pizza',allergens:[1,7],portion:'32 cm'},
 {id:'prosciutto',name:'Prosciutto e rucola',description:'Rajčata, mozzarella, parmská šunka, rukola a hoblinky Parmigiano Reggiano.',price:315,category:'Pizza',allergens:[1,7],portion:'32 cm'},
 {id:'quattro',name:'Quattro formaggi',description:'Fior di latte, gorgonzola, provolone a Parmigiano Reggiano.',price:295,category:'Pizza',allergens:[1,7],portion:'32 cm',vegetarian:true},
 {id:'ragu',name:'Pappardelle al ragù',description:'Domácí široké těstoviny, pomalu tažené hovězí ragú a Parmigiano Reggiano.',price:295,category:'Těstoviny',allergens:[1,3,7,9],portion:'300 g',image:pasta},
 {id:'carbonara',name:'Spaghetti alla carbonara',description:'Guanciale, žloutky, pecorino romano a čerstvě mletý pepř. Bez smetany.',price:275,category:'Těstoviny',allergens:[1,3,7],portion:'300 g'},
 {id:'risotto',name:'Risotto ai funghi',description:'Rýže Carnaroli, lesní houby, bílé víno, máslo a parmazán.',price:285,category:'Hlavní chody',allergens:[7,12],portion:'300 g',vegetarian:true},
 {id:'fish',name:'Orata al forno',description:'Pečená pražma, rozmarýnové brambory, citron a sezónní zelenina.',price:425,category:'Hlavní chody',allergens:[4],portion:'350 g'},
 {id:'tiramisu',name:'Tiramisù della casa',description:'Náš domácí italský dezert s mascarpone, espressem a jemným kakaem.',price:145,category:'Dezerty',allergens:[1,3,7],portion:'150 g',vegetarian:true,image:tiramisu},
 {id:'panna',name:'Panna cotta',description:'Vanilková panna cotta s rozvarem z lesního ovoce.',price:125,category:'Dezerty',allergens:[7],portion:'140 g'},
 {id:'espresso',name:'Espresso',description:'Výběrová italská káva, výrazná chuť a sametová crema.',price:55,category:'Nápoje',allergens:[],portion:'30 ml'},
 {id:'lemonade',name:'Domácí citronová limonáda',description:'Čerstvé citrony, máta a perlivá voda.',price:85,category:'Nápoje',allergens:[],portion:'400 ml'},
 {id:'wine',name:'Primitivo di Manduria',description:'Červené víno z Apulie, tóny zralých třešní a koření.',price:105,category:'Nápoje',allergens:[12],portion:'150 ml'},
];
export const featured = dishes.filter(d => d.image);
export const allergens = ['Obiloviny obsahující lepek','Korýši','Vejce','Ryby','Arašídy','Sója','Mléko','Skořápkové plody','Celer','Hořčice','Sezam','Oxid siřičitý a siřičitany','Vlčí bob','Měkkýši'];
export type LunchItem = {name:string;description:string;price:number;allergens:number[]};
export const weeklyMenu: {day:string;date:string;items:LunchItem[]}[] = [
 {day:'Pondělí',date:'12. 10.',items:[{name:'Minestrone',description:'Zeleninová polévka s fazolemi a parmazánem',price:55,allergens:[7,9]},{name:'Penne all’arrabbiata',description:'Rajčatová omáčka, česnek, chilli, petržel',price:175,allergens:[1]},{name:'Kuřecí piccata',description:'Citronová omáčka, pečené brambory',price:195,allergens:[1,7]}]},
 {day:'Úterý',date:'13. 10.',items:[{name:'Rajčatový krém',description:'S bazalkovým olejem a focacciou',price:55,allergens:[1,7]},{name:'Risotto ai funghi',description:'Houbové risotto s parmazánem',price:185,allergens:[7,12]},{name:'Lasagne al ragù',description:'Hovězí ragú, bešamel a mozzarella',price:195,allergens:[1,3,7,9]}]},
 {day:'Středa',date:'14. 10.',items:[{name:'Dýňový krém',description:'Dýňová semínka a smetana',price:55,allergens:[7]},{name:'Gnocchi al pomodoro',description:'Bramborové noky, rajčata a mozzarella',price:185,allergens:[1,3,7]},{name:'Vepřová saltimbocca',description:'Šalvěj, prosciutto a bramborová kaše',price:205,allergens:[7]}]},
 {day:'Čtvrtek',date:'15. 10.',items:[{name:'Zeleninový vývar',description:'S domácími nudlemi',price:55,allergens:[1,3,9]},{name:'Spaghetti aglio e olio',description:'Česnek, chilli a extra panenský olivový olej',price:175,allergens:[1]},{name:'Pollo alla cacciatora',description:'Kuřecí stehno, rajčata, olivy a rýže',price:195,allergens:[9]}]},
 {day:'Pátek',date:'16. 10.',items:[{name:'Hráškový krém',description:'S mátou a krutony',price:55,allergens:[1,7]},{name:'Pizza Margherita',description:'San Marzano, fior di latte a bazalka',price:185,allergens:[1,7]},{name:'Filet z tresky',description:'Bylinkové máslo a pečené brambory',price:215,allergens:[4,7]}]},
];
export const gallery = [{src:pizza,title:'Neapolská pizza',category:'Jídlo'},{src:pasta,title:'Domácí pappardelle',category:'Jídlo'},{src:interior,title:'Atmosféra La Padella',category:'Restaurace'},{src:tiramisu,title:'Sladká tečka',category:'Jídlo'}];
export function pageHead(title:string, description:string) {return {meta:[{title:`${title} | La Padella Olomouc`},{name:'description',content:description},{property:'og:title',content:`${title} | La Padella Olomouc`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]};}
