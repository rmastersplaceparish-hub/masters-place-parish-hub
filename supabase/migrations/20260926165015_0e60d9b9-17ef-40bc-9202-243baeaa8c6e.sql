CREATE TABLE public.church_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  theme TEXT,
  description TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT NOT NULL DEFAULT 'RCCG The Master''s Place, Ile-Ife',
  flyer_path TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.church_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.church_events TO authenticated;
GRANT ALL ON public.church_events TO service_role;
ALTER TABLE public.church_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published church events"
  ON public.church_events FOR SELECT TO anon, authenticated
  USING (is_published = true);
CREATE POLICY "Pastoral staff can manage church events"
  ON public.church_events FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'pastor'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'pastor'::app_role));

CREATE TABLE public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL UNIQUE,
  caption TEXT,
  category TEXT NOT NULL DEFAULT 'Church life',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated;
GRANT ALL ON public.gallery_photos TO service_role;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view visible gallery photos"
  ON public.gallery_photos FOR SELECT TO anon, authenticated
  USING (is_visible = true);
CREATE POLICY "Pastoral staff can manage gallery photos"
  ON public.gallery_photos FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'pastor'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'pastor'::app_role));

CREATE OR REPLACE FUNCTION public.update_content_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER church_events_updated_at
  BEFORE UPDATE ON public.church_events
  FOR EACH ROW EXECUTE FUNCTION public.update_content_updated_at();
CREATE TRIGGER gallery_photos_updated_at
  BEFORE UPDATE ON public.gallery_photos
  FOR EACH ROW EXECUTE FUNCTION public.update_content_updated_at();

CREATE POLICY "Pastoral staff can upload church media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'church-media'
    AND (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'pastor'::app_role))
  );
CREATE POLICY "Pastoral staff can update church media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'church-media'
    AND (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'pastor'::app_role))
  )
  WITH CHECK (
    bucket_id = 'church-media'
    AND (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'pastor'::app_role))
  );
CREATE POLICY "Pastoral staff can delete church media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'church-media'
    AND (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'pastor'::app_role))
  );