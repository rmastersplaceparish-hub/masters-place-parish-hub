import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ManagedExam {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  is_published: boolean;
  created_at: string;
  question_count: number;
}
export interface ExamAttempt {
  id: string;
  exam_id: string;
  student_name: string;
  score: number;
  total_marks: number;
  auto_submitted: boolean;
  created_at: string;
}

const questionSchema = z.object({
  question: z.string().min(1).max(2000),
  option_a: z.string().min(1).max(500),
  option_b: z.string().min(1).max(500),
  option_c: z.string().min(1).max(500),
  option_d: z.string().min(1).max(500),
  correct_answer: z.enum(["A", "B", "C", "D"]),
  marks: z.number().min(0).max(1000),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untyped = (c: unknown) => c as any;

export const listManagedExams = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = untyped(context.supabase);
    const { data: exams, error } = await db
      .from("exams")
      .select("id,title,description,duration_minutes,is_published,created_at,exam_questions(count)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: attempts, error: aErr } = await db
      .from("exam_attempts")
      .select("id,exam_id,student_name,score,total_marks,auto_submitted,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (aErr) throw new Error(aErr.message);
    return {
      exams: (exams ?? []).map((e: Record<string, unknown>) => ({
        ...e,
        question_count: (e["exam_questions"] as { count: number }[] | undefined)?.[0]?.count ?? 0,
        exam_questions: undefined,
      })) as ManagedExam[],
      attempts: (attempts ?? []) as ExamAttempt[],
    };
  });

export const createExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        title: z.string().trim().min(2).max(160),
        description: z.string().trim().max(2000).nullable(),
        durationMinutes: z.number().int().positive().max(1440).nullable(),
        questions: z.array(questionSchema).min(1).max(500),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = untyped(context.supabase);
    const { data: exam, error } = await db
      .from("exams")
      .insert({ title: data.title, description: data.description || null, duration_minutes: data.durationMinutes })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const rows = data.questions.map((q, i) => ({ ...q, exam_id: exam.id, position: i }));
    const { error: qErr } = await db.from("exam_questions").insert(rows);
    if (qErr) {
      await db.from("exams").delete().eq("id", exam.id);
      throw new Error(qErr.message);
    }
    return { id: exam.id as string };
  });

export const updateExamSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        durationMinutes: z.number().int().positive().max(1440).nullable().optional(),
        isPublished: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = {};
    if (data.durationMinutes !== undefined) patch["duration_minutes"] = data.durationMinutes;
    if (data.isPublished !== undefined) patch["is_published"] = data.isPublished;
    const { error } = await untyped(context.supabase).from("exams").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await untyped(context.supabase).from("exams").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
