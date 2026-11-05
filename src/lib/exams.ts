import { supabase } from "@/integrations/supabase/client";

export interface StudentQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  marks: number;
}
export interface StudentExam {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  questions: StudentQuestion[];
}
export interface PublicExam {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export async function listPublishedExams(): Promise<PublicExam[]> {
  const { data, error } = await db
    .from("exams")
    .select("id,title,description,duration_minutes")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getStudentExam(id: string): Promise<StudentExam | null> {
  const { data, error } = await db.rpc("get_exam_for_student", { p_exam_id: id });
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function submitExam(args: { examId: string; name: string; answers: Record<string, string>; auto: boolean; tabSwitches: number }) {
  const { data, error } = await db.rpc("submit_exam", {
    p_exam_id: args.examId,
    p_student_name: args.name,
    p_answers: args.answers,
    p_auto: args.auto,
    p_tab_switches: args.tabSwitches,
  });
  if (error) throw new Error(error.message);
  return data as { score: number; total: number };
}
