import { Wheat, Shrimp, Egg, Fish, Bean, Sprout, Milk, Nut, Carrot, Droplets, FlaskConical, Flower2, Shell, type LucideIcon } from 'lucide-react';
import { allergens, allergensEn } from '@/data/restaurant';

// Icon set matches the reference La Padella menu (number = legal EU allergen code 1–14).
export const allergenIcons: LucideIcon[] = [Wheat, Shrimp, Egg, Fish, Bean, Sprout, Milk, Nut, Carrot, Droplets, Sprout, FlaskConical, Flower2, Shell];

/** Small outlined icon badges shown right after a dish name. Renders nothing when no allergens are set. */
export function AllergenIcons({ numbers }: { numbers: number[] }) {
  const valid = numbers.filter(n => n >= 1 && n <= 14);
  if (!valid.length) return null;
  return <span className="allergen-icons">{valid.map(n => {
    const Icon = allergenIcons[n - 1]!;
    return <span key={n} className="allergen-icon" title={`${n} – ${allergens[n - 1]}`} aria-label={`Alergen ${n}: ${allergens[n - 1]}`} role="img"><Icon strokeWidth={1.8} /></span>;
  })}</span>;
}

/** Text fallback for dishes without verified allergen data. */
export function AllergenNote({ numbers }: { numbers: number[] }) {
  return numbers.length ? <>Alergeny: {numbers.join(', ')}</> : <>Informace o alergenech u obsluhy</>;
}

export function AllergenLegend() {
  return <section aria-labelledby="alergeny" className="allergen-legend">
    <h2 id="alergeny">Seznam a označení alergenů / Allergens</h2>
    <ul>{allergens.map((a, i) => { const Icon = allergenIcons[i]!; return <li key={a}>
      <span className="allergen-legend-icon"><Icon strokeWidth={1.6} aria-hidden="true" /></span>
      <div><p><strong>{i + 1} –</strong> {a}</p><p className="en">/ {allergensEn[i]}</p></div>
    </li>; })}</ul>
  </section>;
}
