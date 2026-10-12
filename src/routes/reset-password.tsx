import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/reset-password')({
  head: () => ({ meta: [{ title: 'Nové heslo | La Padella Olomouc' }, { name: 'description', content: 'Nastavení nového hesla do administrace.' }, { name: 'robots', content: 'noindex' }, { property: 'og:title', content: 'Nové heslo | La Padella Olomouc' }, { property: 'og:description', content: 'Nastavení nového hesla.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error('Heslo musí mít alespoň 8 znaků.'); return; }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { toast.error('Odkaz vypršel. Požádejte o nový.'); return; }
    toast.success('Heslo bylo změněno.');
    navigate({ to: '/admin', replace: true });
  }
  return <div className="min-h-screen flex items-center justify-center bg-muted px-4">
    <form onSubmit={submit} className="w-full max-w-sm rounded-lg border bg-card p-8 grid gap-4">
      <h1 className="font-serif text-2xl">Nové heslo</h1>
      <div className="grid gap-1.5"><Label htmlFor="pw">Nové heslo</Label><Input id="pw" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /></div>
      <Button type="submit">Uložit heslo</Button>
    </form>
  </div>;
}
