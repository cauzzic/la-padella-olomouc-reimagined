import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [{ title: 'Přihlášení do administrace | La Padella Olomouc' }, { name: 'description', content: 'Přihlášení pro správce webu La Padella Olomouc.' }, { name: 'robots', content: 'noindex' }, { property: 'og:title', content: 'Administrace | La Padella Olomouc' }, { property: 'og:description', content: 'Přihlášení pro správce webu.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: AuthPage,
});

type Mode = 'signin' | 'signup' | 'forgot';

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setInfo(null);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message.includes('confirm') ? 'Nejprve potvrďte e-mail odkazem, který jsme vám poslali.' : 'Nesprávný e-mail nebo heslo.');
        navigate({ to: '/admin', replace: true });
      } else if (mode === 'signup') {
        if (password.length < 8) throw new Error('Heslo musí mít alespoň 8 znaků.');
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
        if (error) throw new Error(error.message);
        setInfo('Na váš e-mail jsme poslali potvrzovací odkaz. Po potvrzení se přihlaste. Přístup do administrace vám musí přidělit administrátor.');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw new Error(error.message);
        setInfo('Pokud účet existuje, poslali jsme na e-mail odkaz pro nastavení nového hesla.');
      }
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  }

  return <div className="min-h-screen flex items-center justify-center bg-muted px-4">
    <form onSubmit={submit} className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm grid gap-4">
      <div><Link to="/" className="font-display text-2xl">La Padella<span className="text-primary">.</span></Link><p className="text-sm text-muted-foreground mt-1">{mode === 'signin' ? 'Přihlášení do administrace' : mode === 'signup' ? 'Vytvoření účtu' : 'Obnovení hesla'}</p></div>
      <div className="grid gap-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
      {mode !== 'forgot' && <div className="grid gap-1.5"><Label htmlFor="password">Heslo</Label><Input id="password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required value={password} onChange={e => setPassword(e.target.value)} /></div>}
      {info && <p className="text-sm rounded-md bg-primary/10 p-3">{info}</p>}
      <Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{mode === 'signin' ? 'Přihlásit se' : mode === 'signup' ? 'Vytvořit účet' : 'Poslat odkaz'}</Button>
      <div className="flex justify-between text-xs text-muted-foreground">
        {mode !== 'signin' ? <button type="button" onClick={() => setMode('signin')}>Zpět na přihlášení</button> : <button type="button" onClick={() => setMode('forgot')}>Zapomenuté heslo</button>}
        {mode === 'signin' && <button type="button" onClick={() => setMode('signup')}>Nemám účet</button>}
      </div>
    </form>
  </div>;
}
