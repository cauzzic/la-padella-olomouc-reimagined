ALTER TABLE public.menu_items ALTER COLUMN price DROP NOT NULL;
COMMENT ON COLUMN public.menu_items.price IS 'NULL = u jídla se na webu nezobrazuje žádná cena (např. cena na dotaz).';