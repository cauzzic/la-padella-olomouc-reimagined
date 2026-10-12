import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CalendarDays, ExternalLink, FileText, FolderTree, LayoutDashboard, LogOut, Menu as MenuIcon, Sparkles, UtensilsCrossed, Users, Wine, GlassWater } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/admin')({
  head: () => ({ meta: [{ title: 'Administrace | La Padella Olomouc' }, { name: 'description', content: 'Správa obsahu webu La Padella Olomouc.' }, { name: 'robots', content: 'noindex' }, { property: 'og:title', content: 'Administrace | La Padella Olomouc' }, { property: 'og:description', content: 'Správa obsahu webu.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', context.user.id);
    const roles = (data ?? []).map(r => r.role);
    return { roles, isAdmin: roles.includes('admin'), isStaff: roles.length > 0 };
  },
  component: AdminLayout,
});

const nav = [
  { to: '/admin', label: 'Přehled', icon: LayoutDashboard },
  { to: '/admin/jidla', label: 'Jídla', icon: UtensilsCrossed },
  { to: '/admin/kategorie-jidel', label: 'Kategorie jídel', icon: FolderTree },
  { to: '/admin/napoje', label: 'Nápoje', icon: Wine },
  { to: '/admin/kategorie-napoju', label: 'Kategorie nápojů', icon: GlassWater },
  { to: '/admin/tydenni-menu', label: 'Týdenní menu', icon: CalendarDays },
  { to: '/admin/nabidky', label: 'Speciální nabídky', icon: Sparkles },
  { to: '/admin/obsah', label: 'Obsah webu', icon: FileText },
] as const;

function AdminLayout() {
  const { user, isAdmin, isStaff } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: '/auth', replace: true });
  }
  if (!isStaff) return <div className="min-h-screen flex items-center justify-center bg-muted p-6"><div className="max-w-md rounded-lg border bg-card p-8 text-center grid gap-4">
    <h1 className="font-display text-2xl">Nemáte oprávnění</h1>
    <p className="text-sm text-muted-foreground">Účet {user.email} zatím nemá přístup do administrace. Požádejte administrátora o přidělení role.</p>
    <Button variant="outline" onClick={signOut}><LogOut />Odhlásit se</Button>
  </div></div>;

  const links = [...nav, ...(isAdmin ? [{ to: '/admin/uzivatele', label: 'Uživatelé', icon: Users } as const] : [])];
  return <div className="min-h-screen bg-muted/40 md:flex">
    <aside className={`${open ? 'block' : 'hidden'} md:block md:w-64 md:shrink-0 border-r bg-card md:min-h-screen`}>
      <div className="p-5 border-b"><Link to="/" className="font-display text-xl">La Padella<span className="text-primary">.</span></Link><p className="text-xs text-muted-foreground">Administrace · Olomouc</p></div>
      <nav className="p-3 grid gap-0.5" aria-label="Administrace">
        {links.map(l => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} activeOptions={{ exact: l.to === '/admin' }} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted" activeProps={{ className: 'bg-muted font-medium text-primary' }}><l.icon size={16} />{l.label}</Link>)}
      </nav>
      <div className="p-3 border-t grid gap-1 text-sm">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"><ExternalLink size={16} />Zobrazit web</a>
        <button onClick={signOut} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted text-left"><LogOut size={16} />Odhlásit ({user.email})</button>
      </div>
    </aside>
    <div className="flex-1 min-w-0">
      <div className="md:hidden flex items-center justify-between border-b bg-card p-3"><span className="font-display">Administrace</span><Button size="icon" variant="ghost" aria-label="Menu administrace" onClick={() => setOpen(!open)}><MenuIcon /></Button></div>
      <main className="p-4 md:p-8 max-w-5xl"><Outlet /></main>
    </div>
  </div>;
}
