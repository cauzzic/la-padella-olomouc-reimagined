import { createFileRoute } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createUser, listUsers, setUserRole, type AdminUser } from '@/lib/admin-users.functions';

export const Route = createFileRoute('/_authenticated/admin/uzivatele')({ component: UsersAdmin });

function UsersAdmin() {
  const { isAdmin, user } = Route.useRouteContext();
  const list = useServerFn(listUsers); const setRole = useServerFn(setUserRole); const create = useServerFn(createUser);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [form, setForm] = useState({ email: '', password: '', role: 'editor' as 'admin' | 'editor' });
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => list().then(setUsers).catch(e => toast.error((e as Error).message)), [list]);
  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);
  if (!isAdmin) return <p>Tuto sekci může používat jen administrátor.</p>;

  async function change(u: AdminUser, role: string) {
    try { await setRole({ data: { userId: u.id, role: role === 'none' ? null : role as 'admin' | 'editor' } }); toast.success('Role změněna.'); load(); } catch (e) { toast.error((e as Error).message); }
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true);
    try { await create({ data: form }); toast.success('Účet vytvořen. Předejte uživateli e-mail a heslo.'); setForm({ email: '', password: '', role: 'editor' }); load(); } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  }
  return <div>
    <h1 className="font-serif text-3xl mb-2">Uživatelé</h1>
    <p className="text-sm text-muted-foreground mb-6">Administrátor spravuje vše včetně uživatelů. Editor upravuje obsah webu. Účty bez role nemají do administrace přístup.</p>
    {!users ? <Loader2 className="animate-spin" /> : <ul className="divide-y rounded-md border bg-card mb-8">{users.map(u => <li key={u.id} className="flex flex-wrap items-center gap-3 p-3">
      <div className="flex-1 min-w-0"><div className="font-medium truncate">{u.email}{u.id === user.id && ' (vy)'}</div><div className="text-xs text-muted-foreground">{u.confirmed ? 'E-mail potvrzen' : 'Čeká na potvrzení e-mailu'}{u.last_sign_in && ` · naposledy ${new Date(u.last_sign_in).toLocaleString('cs-CZ')}`}</div></div>
      <select aria-label={`Role ${u.email}`} className="h-9 rounded-md border bg-background px-3 text-sm" value={u.roles.includes('admin') ? 'admin' : u.roles.includes('editor') ? 'editor' : 'none'} disabled={u.id === user.id} onChange={e => change(u, e.target.value)}>
        <option value="none">Bez přístupu</option><option value="editor">Editor</option><option value="admin">Administrátor</option>
      </select>
    </li>)}</ul>}
    <form onSubmit={submit} className="rounded-lg border bg-card p-5 grid gap-4 sm:grid-cols-2">
      <h2 className="font-serif text-xl sm:col-span-2">Přidat uživatele</h2>
      <div className="grid gap-1.5"><Label htmlFor="ne">E-mail</Label><Input id="ne" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
      <div className="grid gap-1.5"><Label htmlFor="np">Počáteční heslo</Label><Input id="np" type="text" minLength={8} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
      <div className="grid gap-1.5"><Label htmlFor="nr">Role</Label><select id="nr" className="h-9 rounded-md border bg-background px-3 text-sm" value={form.role} onChange={e => setForm({ ...form, role: e.target.value as 'admin' | 'editor' })}><option value="editor">Editor</option><option value="admin">Administrátor</option></select></div>
      <div className="flex items-end"><Button type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <UserPlus />}Vytvořit účet</Button></div>
    </form>
  </div>;
}
