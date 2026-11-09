CREATE TABLE public.gallery_photos (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'food' CHECK (category IN ('food','restaurant')),
  image_path text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated;
GRANT ALL ON public.gallery_photos TO service_role;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active" ON public.gallery_photos FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Staff read all" ON public.gallery_photos FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff insert" ON public.gallery_photos FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update" ON public.gallery_photos FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete" ON public.gallery_photos FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER gallery_photos_touch BEFORE UPDATE ON public.gallery_photos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
INSERT INTO public.gallery_photos (title, category, image_path, sort_order) VALUES
 ('Neapolská pizza','food','static:pizza',0),
 ('Domácí pappardelle','food','static:pasta',10),
 ('Interiér La Padella','restaurant','static:interior',20),
 ('Atmosféra La Padella','restaurant','static:oldInterior',30),
 ('Sladká tečka','food','static:tiramisu',40);