CREATE TABLE public.library_books (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('school_of_disciples','workers_in_training','baptismal_class','other')),
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  is_visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_books TO authenticated;
GRANT ALL ON public.library_books TO service_role;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view visible library books" ON public.library_books FOR SELECT TO anon, authenticated USING (is_visible = true);
CREATE POLICY "Staff manage library books" ON public.library_books FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'pastor'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'pastor'));
CREATE TRIGGER library_books_updated_at BEFORE UPDATE ON public.library_books FOR EACH ROW EXECUTE FUNCTION public.update_content_updated_at();

ALTER TABLE public.exam_attempts ADD COLUMN tab_switches integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.submit_exam(p_exam_id uuid, p_student_name text, p_answers jsonb, p_auto boolean DEFAULT false, p_tab_switches integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_score numeric := 0; v_total numeric := 0; v_name text := btrim(coalesce(p_student_name,''));
BEGIN
  IF v_name = '' OR length(v_name) > 120 THEN RAISE EXCEPTION 'Please enter your name'; END IF;
  IF NOT EXISTS (SELECT 1 FROM exams WHERE id = p_exam_id AND is_published) THEN RAISE EXCEPTION 'Exam not found'; END IF;
  SELECT coalesce(sum(marks),0),
         coalesce(sum(CASE WHEN upper(btrim(coalesce(p_answers->>id::text,''))) = upper(btrim(correct_answer)) THEN marks ELSE 0 END),0)
    INTO v_total, v_score FROM exam_questions WHERE exam_id = p_exam_id;
  INSERT INTO exam_attempts(exam_id, student_name, answers, score, total_marks, auto_submitted, tab_switches)
    VALUES (p_exam_id, v_name, coalesce(p_answers,'{}'::jsonb), v_score, v_total, coalesce(p_auto,false), greatest(coalesce(p_tab_switches,0),0));
  RETURN jsonb_build_object('score', v_score, 'total', v_total);
END $function$;

CREATE POLICY "Staff can upload church books" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'church-books' AND (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'pastor')));
CREATE POLICY "Staff can manage church books" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'church-books' AND (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'pastor')));
CREATE POLICY "Staff can delete church books" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'church-books' AND (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'pastor')));
CREATE POLICY "Staff can read church books" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'church-books' AND (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'pastor')));