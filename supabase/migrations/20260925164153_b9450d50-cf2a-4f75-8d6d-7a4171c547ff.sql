CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TYPE public.pastoral_submission_status AS ENUM ('pending', 'in_review', 'responded', 'resolved');
CREATE TYPE public.pastoral_sender_type AS ENUM ('visitor', 'pastor');
CREATE TYPE public.app_role AS ENUM ('admin', 'pastor', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.pastoral_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code_hash TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  status public.pastoral_submission_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pastoral_submissions TO authenticated;
GRANT ALL ON public.pastoral_submissions TO service_role;
ALTER TABLE public.pastoral_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pastoral staff can view submissions"
  ON public.pastoral_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'));
CREATE POLICY "Pastoral staff can update submissions"
  ON public.pastoral_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'));
CREATE POLICY "Pastoral staff can delete submissions"
  ON public.pastoral_submissions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.pastoral_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.pastoral_submissions(id) ON DELETE CASCADE,
  sender_type public.pastoral_sender_type NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pastoral_messages TO authenticated;
GRANT ALL ON public.pastoral_messages TO service_role;
ALTER TABLE public.pastoral_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pastoral staff can view messages"
  ON public.pastoral_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'));
CREATE POLICY "Pastoral staff can manage messages"
  ON public.pastoral_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'));

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.update_pastoral_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER pastoral_submissions_updated_at
  BEFORE UPDATE ON public.pastoral_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_pastoral_updated_at();

CREATE OR REPLACE FUNCTION public.submit_issue(
  p_category TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_code TEXT;
  v_submission_id UUID;
BEGIN
  IF NULLIF(BTRIM(p_category), '') IS NULL OR length(p_category) > 80 THEN
    RAISE EXCEPTION 'Please choose a valid category';
  END IF;
  IF NULLIF(BTRIM(p_title), '') IS NULL OR length(p_title) > 160 THEN
    RAISE EXCEPTION 'Please enter a shorter title';
  END IF;
  IF NULLIF(BTRIM(p_message), '') IS NULL OR length(p_message) > 10000 THEN
    RAISE EXCEPTION 'Please enter a message under 10,000 characters';
  END IF;

  LOOP
    v_code := upper(encode(gen_random_bytes(5), 'hex'));
    BEGIN
      INSERT INTO public.pastoral_submissions (access_code_hash, category, title)
      VALUES (encode(digest(v_code, 'sha256'), 'hex'), BTRIM(p_category), BTRIM(p_title))
      RETURNING id INTO v_submission_id;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      -- Regenerate the private code if an extremely rare collision occurs.
    END;
  END LOOP;

  INSERT INTO public.pastoral_messages (submission_id, sender_type, message)
  VALUES (v_submission_id, 'visitor', BTRIM(p_message));

  RETURN jsonb_build_object('access_code', v_code, 'submission_id', v_submission_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_thread_by_code(p_access_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_submission public.pastoral_submissions%ROWTYPE;
BEGIN
  SELECT * INTO v_submission
  FROM public.pastoral_submissions
  WHERE access_code_hash = encode(digest(upper(BTRIM(p_access_code)), 'sha256'), 'hex');

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'submission', jsonb_build_object(
      'id', v_submission.id,
      'category', v_submission.category,
      'title', v_submission.title,
      'status', v_submission.status,
      'created_at', v_submission.created_at
    ),
    'messages', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', m.id,
        'sender_type', CASE WHEN m.sender_type = 'visitor' THEN 'youth' ELSE 'admin' END,
        'message', m.message,
        'created_at', m.created_at
      ) ORDER BY m.created_at)
      FROM public.pastoral_messages m
      WHERE m.submission_id = v_submission.id
    ), '[]'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.reply_to_thread(
  p_access_code TEXT,
  p_message TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_submission_id UUID;
  v_status public.pastoral_submission_status;
BEGIN
  IF NULLIF(BTRIM(p_message), '') IS NULL OR length(p_message) > 10000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Please enter a message under 10,000 characters');
  END IF;

  SELECT id, status INTO v_submission_id, v_status
  FROM public.pastoral_submissions
  WHERE access_code_hash = encode(digest(upper(BTRIM(p_access_code)), 'sha256'), 'hex');

  IF v_submission_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No submission found with that access code');
  END IF;
  IF v_status = 'resolved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'This conversation has been closed');
  END IF;

  INSERT INTO public.pastoral_messages (submission_id, sender_type, message)
  VALUES (v_submission_id, 'visitor', BTRIM(p_message));

  UPDATE public.pastoral_submissions
  SET status = CASE WHEN status = 'responded' THEN 'in_review' ELSE status END
  WHERE id = v_submission_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
REVOKE ALL ON FUNCTION public.submit_issue(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_issue(TEXT, TEXT, TEXT) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.get_thread_by_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_thread_by_code(TEXT) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.reply_to_thread(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reply_to_thread(TEXT, TEXT) TO anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.pastoral_messages;