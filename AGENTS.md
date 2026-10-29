<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Restaurant architecture
- This project has its own Lovable Cloud backend; never connect it to the original La Padella project or its data.
- Public pages read content only through query options in src/content/repository.ts, backed by publishable-key server functions in src/content/public.functions.ts; visibility rules live in src/content/rules.ts and are enforced again by RLS.
- Site texts/contacts/hours/hero images live in the site_settings key/value table; do not hardcode them in components as a second source of truth.
- Photos live in the private `media` bucket (workspace blocks public buckets); public reads get signed URLs, and a photo is deleted only when no row references it (src/components/admin/media.ts).
- Admin lives under src/routes/_authenticated/admin*; content edits use the browser client with RLS (is_staff), user management uses admin-only server functions in src/lib/admin-users.functions.ts.
- Roles are in public.user_roles (admin, editor); the first admin is granted by a trigger only for the configured email after e-mail confirmation.
- src/data/restaurant.ts holds only fixed design media and reference lists (allergen names, gallery).
- Use leaf routes for public restaurant pages and a shared root header/footer (hidden on admin/auth); each leaf owns its metadata.
- Reservations run only in transient React state and never persist guest data.
- Public site URL and per-page SEO/OG head live in src/lib/seo.ts (SITE_URL); static images that must survive Cloudflare Pages hosting go in public/images, since Lovable asset URLs (/__l5e/) are not served there.
