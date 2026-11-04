CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;

ALTER FUNCTION public.has_role(UUID, public.app_role) SET SCHEMA private;
ALTER FUNCTION public.submit_issue(TEXT, TEXT, TEXT) SET SCHEMA private;
ALTER FUNCTION public.get_thread_by_code(TEXT) SET SCHEMA private;
ALTER FUNCTION public.reply_to_thread(TEXT, TEXT) SET SCHEMA private;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SET search_path = public
AS $$
  SELECT private.has_role(_user_id, _role)
$$;

CREATE OR REPLACE FUNCTION public.submit_issue(
  p_category TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS JSONB
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT private.submit_issue(p_category, p_title, p_message)
$$;

CREATE OR REPLACE FUNCTION public.get_thread_by_code(p_access_code TEXT)
RETURNS JSONB
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT private.get_thread_by_code(p_access_code)
$$;

CREATE OR REPLACE FUNCTION public.reply_to_thread(
  p_access_code TEXT,
  p_message TEXT
)
RETURNS JSONB
LANGUAGE SQL
SET search_path = public
AS $$
  SELECT private.reply_to_thread(p_access_code, p_message)
$$;

REVOKE ALL ON FUNCTION private.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.submit_issue(TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.get_thread_by_code(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.reply_to_thread(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_issue(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_thread_by_code(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reply_to_thread(TEXT, TEXT) TO anon, authenticated;