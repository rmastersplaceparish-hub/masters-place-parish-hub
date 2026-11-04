CREATE OR REPLACE FUNCTION public.get_thread_by_code(p_access_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE v_submission public.pastoral_submissions%ROWTYPE;
BEGIN
  SELECT * INTO v_submission FROM public.pastoral_submissions
  WHERE access_code_hash = encode(digest(upper(BTRIM(p_access_code)), 'sha256'), 'hex');
  IF NOT FOUND THEN RETURN jsonb_build_object('found', false); END IF;
  RETURN jsonb_build_object(
    'found', true,
    'submission', jsonb_build_object('id', v_submission.id, 'category', v_submission.category,
      'title', v_submission.title, 'status', v_submission.status, 'created_at', v_submission.created_at),
    'messages', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', m.id, 'sender_type', m.sender_type::text,
        'message', m.message, 'created_at', m.created_at) ORDER BY m.created_at)
      FROM public.pastoral_messages m WHERE m.submission_id = v_submission.id), '[]'::jsonb));
END; $$;

DROP POLICY IF EXISTS "Pastoral staff can delete submissions" ON public.pastoral_submissions;
CREATE POLICY "Pastoral staff can delete submissions" ON public.pastoral_submissions
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'pastor'::app_role));
GRANT DELETE ON public.pastoral_submissions TO authenticated;
GRANT DELETE ON public.pastoral_messages TO authenticated;