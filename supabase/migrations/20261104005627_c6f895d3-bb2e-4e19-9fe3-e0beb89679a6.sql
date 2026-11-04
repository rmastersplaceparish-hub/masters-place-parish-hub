CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration_minutes integer,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  question text NOT NULL,
  option_a text NOT NULL, option_b text NOT NULL, option_c text NOT NULL, option_d text NOT NULL,
  correct_answer text NOT NULL,
  marks numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score numeric NOT NULL DEFAULT 0,
  total_marks numeric NOT NULL DEFAULT 0,
  auto_submitted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.exams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exams TO authenticated;
GRANT ALL ON public.exams TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_questions TO authenticated;
GRANT ALL ON public.exam_questions TO service_role;
GRANT SELECT, DELETE ON public.exam_attempts TO authenticated;
GRANT ALL ON public.exam_attempts TO service_role;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published exams" ON public.exams FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Staff manage exams" ON public.exams FOR ALL TO authenticated
 USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'pastor'))
 WITH CHECK (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'pastor'));
CREATE POLICY "Staff manage questions" ON public.exam_questions FOR ALL TO authenticated
 USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'pastor'))
 WITH CHECK (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'pastor'));
CREATE POLICY "Staff view attempts" ON public.exam_attempts FOR SELECT TO authenticated
 USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'pastor'));
CREATE POLICY "Staff delete attempts" ON public.exam_attempts FOR DELETE TO authenticated
 USING (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'pastor'));

CREATE TRIGGER exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.update_content_updated_at();

CREATE OR REPLACE FUNCTION public.get_exam_for_student(p_exam_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'id', e.id, 'title', e.title, 'description', e.description, 'duration_minutes', e.duration_minutes,
    'questions', COALESCE((SELECT jsonb_agg(jsonb_build_object('id',q.id,'question',q.question,
       'option_a',q.option_a,'option_b',q.option_b,'option_c',q.option_c,'option_d',q.option_d,'marks',q.marks)
       ORDER BY q.position) FROM public.exam_questions q WHERE q.exam_id = e.id), '[]'::jsonb))
  FROM public.exams e WHERE e.id = p_exam_id AND e.is_published;
$$;

CREATE OR REPLACE FUNCTION public.submit_exam(p_exam_id uuid, p_student_name text, p_answers jsonb, p_auto boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_score numeric := 0; v_total numeric := 0; v_name text := btrim(coalesce(p_student_name,''));
BEGIN
  IF v_name = '' OR length(v_name) > 120 THEN RAISE EXCEPTION 'Please enter your name'; END IF;
  IF NOT EXISTS (SELECT 1 FROM exams WHERE id = p_exam_id AND is_published) THEN RAISE EXCEPTION 'Exam not found'; END IF;
  SELECT coalesce(sum(marks),0),
         coalesce(sum(CASE WHEN upper(btrim(coalesce(p_answers->>id::text,''))) = upper(btrim(correct_answer)) THEN marks ELSE 0 END),0)
    INTO v_total, v_score FROM exam_questions WHERE exam_id = p_exam_id;
  INSERT INTO exam_attempts(exam_id, student_name, answers, score, total_marks, auto_submitted)
    VALUES (p_exam_id, v_name, coalesce(p_answers,'{}'::jsonb), v_score, v_total, coalesce(p_auto,false));
  RETURN jsonb_build_object('score', v_score, 'total', v_total);
END $$;
GRANT EXECUTE ON FUNCTION public.get_exam_for_student(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_exam(uuid, text, jsonb, boolean) TO anon, authenticated;