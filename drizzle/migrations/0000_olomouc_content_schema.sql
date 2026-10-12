-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor'))
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- First administrator: only this exact address, only after its e-mail is confirmed.
CREATE OR REPLACE FUNCTION public.grant_initial_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND lower(NEW.email) = 'thomas.cauzzo@seznam.cz' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_initial_admin
AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_initial_admin();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Food
CREATE TABLE public.menu_categories (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.menu_items (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category_id text NOT NULL REFERENCES public.menu_categories(id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  portion text,
  image_path text,
  allergens smallint[] NOT NULL DEFAULT '{}',
  is_vegetarian boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.menu_items(category_id);

-- Drinks
CREATE TABLE public.drink_categories (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.drinks (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category_id text NOT NULL REFERENCES public.drink_categories(id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  volume text,
  brand text,
  image_path text,
  allergens smallint[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.drinks(category_id);

-- Weekly menu
CREATE TABLE public.weekly_menus (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL DEFAULT '',
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  note text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT weekly_menu_dates CHECK (valid_to >= valid_from)
);
CREATE TABLE public.weekly_menu_dishes (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  menu_id text NOT NULL REFERENCES public.weekly_menus(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  kind text NOT NULL CHECK (kind IN ('soup','main')),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2),
  allergens smallint[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.weekly_menu_dishes(menu_id);

-- Offers
CREATE TABLE public.offers (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  label text,
  description text NOT NULL DEFAULT '',
  price numeric(10,2),
  image_path text,
  valid_from date,
  valid_to date,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Site settings (key/value)
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Grants, RLS, triggers
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['menu_categories','menu_items','drink_categories','drinks','weekly_menus','weekly_menu_dishes','offers','site_settings'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Staff read all" ON public.%I FOR SELECT TO authenticated USING (public.is_staff(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "Staff insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "Staff update" ON public.%I FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "Staff delete" ON public.%I FOR DELETE TO authenticated USING (public.is_staff(auth.uid()))', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['menu_categories','menu_items','drink_categories','drinks','weekly_menus','offers','site_settings'] LOOP
    EXECUTE format('CREATE TRIGGER touch_%s BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t, t);
  END LOOP;
END $$;

CREATE POLICY "Public read active" ON public.menu_categories FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Public read active" ON public.menu_items FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Public read active" ON public.drink_categories FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Public read active" ON public.drinks FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Public read current" ON public.weekly_menus FOR SELECT TO anon, authenticated
  USING (is_published AND (now() AT TIME ZONE 'Europe/Prague')::date BETWEEN valid_from AND valid_to);
CREATE POLICY "Public read current" ON public.weekly_menu_dishes FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.weekly_menus m WHERE m.id = menu_id AND m.is_published
    AND (now() AT TIME ZONE 'Europe/Prague')::date BETWEEN m.valid_from AND m.valid_to));
CREATE POLICY "Public read current" ON public.offers FOR SELECT TO anon, authenticated
  USING (is_active AND (valid_from IS NULL OR valid_from <= (now() AT TIME ZONE 'Europe/Prague')::date)
    AND (valid_to IS NULL OR valid_to >= (now() AT TIME ZONE 'Europe/Prague')::date));
CREATE POLICY "Public read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

-- Photo storage (private bucket 'media'; public site gets signed URLs)
CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
CREATE POLICY "Staff upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_staff(auth.uid()));

-- Migrated content (idempotent: fixed ids + ON CONFLICT DO NOTHING)
INSERT INTO public.menu_categories (id, name, sort_order) VALUES
 ('predkrmy','Předkrmy',0),('pizza','Pizza',1),('testoviny','Těstoviny',2),('hlavni','Hlavní chody',3),('dezerty','Dezerty',4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.menu_items (id, category_id, name, description, price, allergens, portion, is_vegetarian, image_path, is_featured, sort_order) VALUES
 ('burrata','predkrmy','Burrata e pomodorini','Krémová burrata, barevná rajčata, bazalkové pesto a domácí focaccia.',235,'{1,7,8}','150 g',true,NULL,false,0),
 ('bruschetta','predkrmy','Bruschetta al pomodoro','Opečený chléb, rajčata, česnek, bazalka a olivový olej.',145,'{1}','3 ks',true,NULL,false,1),
 ('margherita','pizza','Margherita','Rajčata San Marzano, fior di latte, čerstvá bazalka a olivový olej.',245,'{1,7}','32 cm',true,'seed/pizza-hero.jpg',true,2),
 ('diavola','pizza','Diavola','Rajčata San Marzano, fior di latte, pikantní salám ventricina a chilli.',285,'{1,7}','32 cm',false,NULL,false,3),
 ('prosciutto','pizza','Prosciutto e rucola','Rajčata, mozzarella, parmská šunka, rukola a Parmigiano Reggiano.',315,'{1,7}','32 cm',false,NULL,false,4),
 ('ragu','testoviny','Pappardelle al ragù','Domácí široké těstoviny, pomalu tažené hovězí ragú a Parmigiano Reggiano.',295,'{1,3,7,9}','300 g',false,'seed/pasta.jpg',true,5),
 ('carbonara','testoviny','Spaghetti alla carbonara','Guanciale, žloutky, pecorino romano a čerstvě mletý pepř.',275,'{1,3,7}','300 g',false,NULL,false,6),
 ('risotto','hlavni','Risotto ai funghi','Rýže Carnaroli, lesní houby, bílé víno, máslo a parmazán.',285,'{7,12}','300 g',true,NULL,false,7),
 ('orata','hlavni','Orata al forno','Pečená pražma, rozmarýnové brambory, citron a sezónní zelenina.',425,'{4}','350 g',false,NULL,false,8),
 ('tiramisu','dezerty','Tiramisù della casa','Domácí dezert s mascarpone, espressem a jemným kakaem.',145,'{1,3,7}','150 g',true,'seed/tiramisu.jpg',true,9),
 ('panna','dezerty','Panna cotta','Vanilková panna cotta s rozvarem z lesního ovoce.',125,'{7}','140 g',true,NULL,false,10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.drink_categories (id, name, sort_order) VALUES
 ('aperitivy','Aperitivy',0),('nealko','Nealkoholické nápoje',1),('teple','Teplé nápoje',2),('pivo','Pivo',3),('likery','Likéry',4),
 ('destilaty','Destiláty',5),('cognac','Cognac & Brandy',6),('whiskey','Whiskey',7),('rumy','Rumy',8),('vina','Vína',9),('cocktails','Cocktails',10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.drinks (id, category_id, name, description, price, volume, allergens, sort_order) VALUES
 ('limonada','nealko','Domácí citronová limonáda','Čerstvé citrony, máta a perlivá voda.',85,'400 ml','{}',0),
 ('espresso','teple','Espresso','Výběrová italská káva se sametovou cremou.',55,'30 ml','{}',0),
 ('primitivo','vina','Primitivo di Manduria','Červené víno z Apulie, tóny zralých třešní a koření.',105,'150 ml','{12}',0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.weekly_menus (id, title, valid_from, valid_to, note, is_published) VALUES
 ('demo-week','Týdenní menu 12.–16. 10. 2026','2026-10-12','2026-10-16','Polévka i hlavní chod se objednávají samostatně.',true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.weekly_menu_dishes (id, menu_id, weekday, kind, name, description, price, allergens, sort_order) VALUES
 ('demo-s1','demo-week',1,'soup','Minestrone','Zeleninová polévka s fazolemi',55,'{7,9}',0),
 ('demo-m1','demo-week',1,'main','Penne all’arrabbiata','Rajčata, česnek, chilli, petržel',175,'{1}',1),
 ('demo-s2','demo-week',2,'soup','Rajčatový krém','S bazalkovým olejem',55,'{7}',0),
 ('demo-m2','demo-week',2,'main','Lasagne al ragù','Hovězí ragú, bešamel a mozzarella',195,'{1,3,7,9}',1),
 ('demo-s3','demo-week',3,'soup','Dýňový krém','Dýňová semínka a smetana',55,'{7}',0),
 ('demo-m3','demo-week',3,'main','Gnocchi al pomodoro','Bramborové noky, rajčata a mozzarella',185,'{1,3,7}',1),
 ('demo-s4','demo-week',4,'soup','Zeleninový vývar','S domácími nudlemi',55,'{1,3,9}',0),
 ('demo-m4','demo-week',4,'main','Pollo alla cacciatora','Kuřecí stehno, rajčata, olivy a rýže',195,'{9}',1),
 ('demo-s5','demo-week',5,'soup','Hráškový krém','S mátou a krutony',55,'{1,7}',0),
 ('demo-m5','demo-week',5,'main','Filet z tresky','Bylinkové máslo a pečené brambory',215,'{4,7}',1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.offers (id, title, label, description, price, image_path, sort_order) VALUES
 ('autunno','Pappardelle al ragù d’autunno','Specialita šéfkuchaře','Domácí široké těstoviny, pomalu dušené hovězí, kořenová zelenina a červené víno.',325,'seed/pasta.jpg',0),
 ('tartufo','Pizza s hříbky a lanýžem','Sezónní pizza','Fior di latte, lesní houby, lanýžový krém a parmazán.',345,'seed/pizza-hero.jpg',1),
 ('affogato','Affogato al caffè','Dolce','Vanilková zmrzlina přelitá horkým italským espressem.',115,'seed/tiramisu.jpg',2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
 ('topbar_text','Kousek Itálie v srdci Olomouce'),
 ('announcement',''),
 ('announcement_active','false'),
 ('hero_eyebrow','Cucina italiana · Olomouc'),
 ('hero_title','La Padella.'),
 ('hero_title_accent','Itálie na talíři.'),
 ('hero_text','Neapolská pizza, domácí těstoviny a sklenka dobrého vína. Benvenuti v La Padelle.'),
 ('hero_image','seed/pizza-hero.jpg'),
 ('lunch_title','Malá pauza. Velká chuť.'),
 ('lunch_text','Každý všední den připravujeme týdenní obědové menu s italským přízvukem.'),
 ('lunch_image','seed/restaurant.jpg'),
 ('address','Olomouc, centrum'),
 ('address_note','Přesná adresa bude doplněna.'),
 ('phone',''),
 ('email',''),
 ('instagram_url',''),
 ('opening_hours','Pondělí–čtvrtek | 11:00–22:00
Pátek–sobota | 11:00–23:00
Neděle | 11:00–21:00'),
 ('lunch_hours','Po–Pá 11:00–14:00'),
 ('contact_text','Přesnou adresu, telefon a e-mail nové pobočky doplníme po jejich potvrzení.')
ON CONFLICT (key) DO NOTHING;