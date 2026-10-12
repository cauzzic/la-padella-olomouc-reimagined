import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const BUCKET = 'media';

export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Vyberte prosím obrázek.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Fotografie je větší než 10 MB.');
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `uploads/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error('Nahrání fotografie se nezdařilo.');
  return path;
}

/** Deletes a stored photo only when no dish, drink, offer or site setting still uses it. */
export async function releaseImage(path: string | null | undefined): Promise<void> {
  if (!path) return;
  const checks = await Promise.all([
    supabase.from('menu_items').select('id', { count: 'exact', head: true }).eq('image_path', path),
    supabase.from('drinks').select('id', { count: 'exact', head: true }).eq('image_path', path),
    supabase.from('offers').select('id', { count: 'exact', head: true }).eq('image_path', path),
    supabase.from('site_settings').select('key', { count: 'exact', head: true }).eq('value', path),
  ]);
  if (checks.some(c => c.error || (c.count ?? 0) > 0)) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

export function useSignedUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    if (!path) { setUrl(null); return; }
    supabase.storage.from(BUCKET).createSignedUrl(path, 3600).then(({ data }) => { if (live) setUrl(data?.signedUrl ?? null); });
    return () => { live = false; };
  }, [path]);
  return url;
}
