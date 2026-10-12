import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { allergens } from '@/data/restaurant';
import { uploadImage, useSignedUrl } from './media';

export function ImageField({ value, onChange }: { value: string | null; onChange: (path: string | null) => void }) {
  const url = useSignedUrl(value);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    try { onChange(await uploadImage(file)); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); if (input.current) input.current.value = ''; }
  }
  return <div className="flex items-center gap-4">
    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
      {value && url ? <img src={url} alt="Náhled fotografie" className="h-full w-full object-cover" /> : <ImagePlus className="text-muted-foreground" />}
    </div>
    <div className="flex flex-col gap-2">
      <input ref={input} type="file" accept="image/*" className="hidden" aria-label="Nahrát fotografii" onChange={e => pick(e.target.files?.[0])} />
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => input.current?.click()}>{busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}{value ? 'Změnit fotografii' : 'Nahrát fotografii'}</Button>
      {value && <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}><Trash2 />Odebrat fotografii</Button>}
    </div>
  </div>;
}

export function AllergenField({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  const toggle = (n: number) => onChange(value.includes(n) ? value.filter(x => x !== n) : [...value, n].sort((a, b) => a - b));
  return <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
    {allergens.map((a, i) => <label key={a} className="flex items-center gap-2 text-xs cursor-pointer" title={a}>
      <input type="checkbox" checked={value.includes(i + 1)} onChange={() => toggle(i + 1)} />
      <span><strong>{i + 1}</strong> {a}</span>
    </label>)}
  </div>;
}
