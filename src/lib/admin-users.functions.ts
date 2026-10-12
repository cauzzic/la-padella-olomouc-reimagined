// User management: admin-only. Caller's role is verified through their own RLS session first.
import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

type Role = 'admin' | 'editor';
export type AdminUser = { id: string; email: string; confirmed: boolean; last_sign_in: string | null; roles: Role[] };

async function assertAdmin(context: { supabase: { rpc: (fn: 'has_role', args: { _user_id: string; _role: Role }) => PromiseLike<{ data: boolean | null }> }; userId: string }) {
  const { data } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (!data) throw new Error('Nemáte oprávnění spravovat uživatele.');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  return supabaseAdmin;
}

export const listUsers = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }): Promise<AdminUser[]> => {
  const admin = await assertAdmin(context);
  const [{ data: list, error }, { data: roles }] = await Promise.all([admin.auth.admin.listUsers({ perPage: 200 }), admin.from('user_roles').select('user_id,role')]);
  if (error) throw new Error('Seznam uživatelů se nepodařilo načíst.');
  return list.users.map(u => ({ id: u.id, email: u.email ?? '', confirmed: !!u.email_confirmed_at, last_sign_in: u.last_sign_in_at ?? null, roles: (roles ?? []).filter(r => r.user_id === u.id).map(r => r.role as Role) }));
});

export const setUserRole = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: Role | null }) => {
    if (typeof d.userId !== 'string' || !(d.role === null || d.role === 'admin' || d.role === 'editor')) throw new Error('Neplatný požadavek.');
    return d;
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context);
    if (data.userId === context.userId && data.role !== 'admin') throw new Error('Nemůžete odebrat administrátorská práva sami sobě.');
    const { error: delErr } = await admin.from('user_roles').delete().eq('user_id', data.userId);
    if (delErr) throw new Error('Změna role se nezdařila.');
    if (data.role) { const { error } = await admin.from('user_roles').insert({ user_id: data.userId, role: data.role }); if (error) throw new Error('Změna role se nezdařila.'); }
    return { ok: true };
  });

export const createUser = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; password: string; role: Role }) => {
    if (!/^\S+@\S+\.\S+$/.test(d.email ?? '')) throw new Error('Neplatný e-mail.');
    if ((d.password ?? '').length < 8) throw new Error('Heslo musí mít alespoň 8 znaků.');
    if (d.role !== 'admin' && d.role !== 'editor') throw new Error('Neplatná role.');
    return d;
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context);
    const { data: created, error } = await admin.auth.admin.createUser({ email: data.email.trim().toLowerCase(), password: data.password, email_confirm: true });
    if (error || !created.user) throw new Error(error?.message.includes('already') ? 'Uživatel s tímto e-mailem už existuje.' : 'Účet se nepodařilo vytvořit.');
    await admin.from('user_roles').insert({ user_id: created.user.id, role: data.role });
    return { ok: true };
  });
