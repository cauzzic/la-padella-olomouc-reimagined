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
- Editable content (menu items, weekly menus, offers) uses DB-shaped types in src/content/types.ts, visibility rules in src/content/rules.ts, and is read only through query options in src/content/repository.ts, so a future Olomouc database/admin replaces just the repository.
- src/data/restaurant.ts holds only fixed design media and reference lists, not editable content.
- Use leaf routes for public restaurant pages and a shared root header/footer; each leaf owns its metadata.
- Reservations currently run only in transient React state and never submit or persist guest data, because this version is a frontend-only demo.
