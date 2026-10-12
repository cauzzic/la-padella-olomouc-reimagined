// Demo rows standing in for the future Olomouc database. Replace via repository.ts.
import pizza from '@/assets/pizza-hero.jpg';
import pasta from '@/assets/pasta.jpg';
import tiramisu from '@/assets/tiramisu.jpg';
import { toISODate } from './rules';
import type { MenuCategory, MenuItem, Offer, WeeklyMenu, WeeklyMenuDish, Weekday } from './types';

export const seedCategories: MenuCategory[] = [
  ['predkrmy', 'Předkrmy'], ['pizza', 'Pizza'], ['testoviny', 'Těstoviny'], ['hlavni', 'Hlavní chody'], ['dezerty', 'Dezerty'], ['napoje', 'Nápoje'],
].map(([id, name], i) => ({ id, name, sort_order: i, is_active: true }));

type Row = [id: string, cat: string, name: string, desc: string, price: number, allergens: number[], portion: string, veg?: boolean, image?: string, featured?: boolean];
const rows: Row[] = [
  ['burrata', 'predkrmy', 'Burrata e pomodorini', 'Krémová burrata, barevná rajčata, bazalkové pesto a domácí focaccia.', 235, [1, 7, 8], '150 g', true],
  ['bruschetta', 'predkrmy', 'Bruschetta al pomodoro', 'Opečený chléb, rajčata, česnek, bazalka a olivový olej.', 145, [1], '3 ks', true],
  ['margherita', 'pizza', 'Margherita', 'Rajčata San Marzano, fior di latte, čerstvá bazalka a olivový olej.', 245, [1, 7], '32 cm', true, pizza, true],
  ['diavola', 'pizza', 'Diavola', 'Rajčata San Marzano, fior di latte, pikantní salám ventricina a chilli.', 285, [1, 7], '32 cm'],
  ['prosciutto', 'pizza', 'Prosciutto e rucola', 'Rajčata, mozzarella, parmská šunka, rukola a Parmigiano Reggiano.', 315, [1, 7], '32 cm'],
  ['ragu', 'testoviny', 'Pappardelle al ragù', 'Domácí široké těstoviny, pomalu tažené hovězí ragú a Parmigiano Reggiano.', 295, [1, 3, 7, 9], '300 g', false, pasta, true],
  ['carbonara', 'testoviny', 'Spaghetti alla carbonara', 'Guanciale, žloutky, pecorino romano a čerstvě mletý pepř.', 275, [1, 3, 7], '300 g'],
  ['risotto', 'hlavni', 'Risotto ai funghi', 'Rýže Carnaroli, lesní houby, bílé víno, máslo a parmazán.', 285, [7, 12], '300 g', true],
  ['orata', 'hlavni', 'Orata al forno', 'Pečená pražma, rozmarýnové brambory, citron a sezónní zelenina.', 425, [4], '350 g'],
  ['tiramisu', 'dezerty', 'Tiramisù della casa', 'Domácí dezert s mascarpone, espressem a jemným kakaem.', 145, [1, 3, 7], '150 g', true, tiramisu, true],
  ['panna', 'dezerty', 'Panna cotta', 'Vanilková panna cotta s rozvarem z lesního ovoce.', 125, [7], '140 g', true],
  ['espresso', 'napoje', 'Espresso', 'Výběrová italská káva se sametovou cremou.', 55, [], '30 ml'],
  ['limonada', 'napoje', 'Domácí citronová limonáda', 'Čerstvé citrony, máta a perlivá voda.', 85, [], '400 ml'],
  ['primitivo', 'napoje', 'Primitivo di Manduria', 'Červené víno z Apulie, tóny zralých třešní a koření.', 105, [12], '150 ml'],
];
export const seedMenuItems: MenuItem[] = rows.map(([id, category_id, name, description, price, allergens, portion, veg, image, featured], i) => ({
  id, category_id, name, description, price, allergens, portion, image_url: image ?? null, is_vegetarian: !!veg, is_featured: !!featured, sort_order: i, is_active: true,
}));

const days: [string, string, number, number[], string, string, number, number[]][] = [
  ['Minestrone', 'Zeleninová polévka s fazolemi', 55, [7, 9], 'Penne all’arrabbiata', 'Rajčata, česnek, chilli, petržel', 175, [1]],
  ['Rajčatový krém', 'S bazalkovým olejem', 55, [7], 'Lasagne al ragù', 'Hovězí ragú, bešamel a mozzarella', 195, [1, 3, 7, 9]],
  ['Dýňový krém', 'Dýňová semínka a smetana', 55, [7], 'Gnocchi al pomodoro', 'Bramborové noky, rajčata a mozzarella', 185, [1, 3, 7]],
  ['Zeleninový vývar', 'S domácími nudlemi', 55, [1, 3, 9], 'Pollo alla cacciatora', 'Kuřecí stehno, rajčata, olivy a rýže', 195, [9]],
  ['Hráškový krém', 'S mátou a krutony', 55, [1, 7], 'Filet z tresky', 'Bylinkové máslo a pečené brambory', 215, [4, 7]],
];
const weekDishes: WeeklyMenuDish[] = days.flatMap(([sn, sd, sp, sa, mn, md, mp, ma], i) => {
  const weekday = (i + 1) as Weekday;
  return [
    { id: `s${weekday}`, weekday, kind: 'soup' as const, name: sn, description: sd, price: sp, allergens: sa, sort_order: 0 },
    { id: `m${weekday}`, weekday, kind: 'main' as const, name: mn, description: md, price: mp, allergens: ma, sort_order: 1 },
  ];
});

/** Demo only: validity spans the current week so the preview has something to show. Real rows carry fixed dates. */
function currentWeek(now = new Date()) {
  const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const friday = new Date(monday); friday.setDate(monday.getDate() + 4);
  return { valid_from: toISODate(monday), valid_to: toISODate(friday) };
}
export const seedWeeklyMenus = (): WeeklyMenu[] => [{ id: 'demo-week', ...currentWeek(), note: 'Polévka i hlavní chod se objednávají samostatně.', is_published: true, dishes: weekDishes }];

export const seedOffers: Offer[] = [
  { id: 'autunno', title: 'Pappardelle al ragù d’autunno', label: 'Specialita šéfkuchaře', description: 'Domácí široké těstoviny, pomalu dušené hovězí, kořenová zelenina a červené víno.', price: 325, image_url: pasta, valid_from: null, valid_to: null, is_active: true, sort_order: 0 },
  { id: 'tartufo', title: 'Pizza s hříbky a lanýžem', label: 'Sezónní pizza', description: 'Fior di latte, lesní houby, lanýžový krém a parmazán.', price: 345, image_url: pizza, valid_from: null, valid_to: null, is_active: true, sort_order: 1 },
  { id: 'affogato', title: 'Affogato al caffè', label: 'Dolce', description: 'Vanilková zmrzlina přelitá horkým italským espressem.', price: 115, image_url: tiramisu, valid_from: null, valid_to: null, is_active: true, sort_order: 2 },
];
