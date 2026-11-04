import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import readXlsxFile from "read-excel-file";
import writeXlsxFile from "write-excel-file";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { StaffNav } from "@/components/site/staff-nav";
import { CONTACT_EMAIL } from "@/lib/site-data";
import { EXAM_TEMPLATE_HEADERS, parseDuration, parseExamRows, type ParsedQuestion } from "@/lib/exam-parse";
import {
  createExam,
  deleteExam,
  listManagedExams,
  updateExamSettings,
  type ExamAttempt,
  type ManagedExam,
} from "@/lib/exams.functions";

export const Route = createFileRoute("/_authenticated/exams-admin")({
  head: () => ({
    meta: [
      { title: "Exam Manager — RCCG The Master's Place" },
      { name: "description", content: "Upload exam questions from Excel, set time limits and view student results." },
      { property: "og:title", content: "Exam Manager — RCCG The Master's Place" },
      { property: "og:description", content: "Upload exam questions from Excel, set time limits and view student results." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExamsAdminPage,
});

async function downloadTemplate() {
  const header = EXAM_TEMPLATE_HEADERS.map((h) => ({ value: h, fontWeight: "bold" as const }));
  const sample = [
    ["Who built the ark?", "Moses", "Noah", "Abraham", "David", "B", 2],
    ["How many books are in the Bible?", "66", "39", "27", "72", "A", 1],
  ].map((r) => r.map((v) => ({ value: v })));
  await writeXlsxFile([header, ...sample] as never, { fileName: "exam-questions-template.xlsx" });
}

function ExamsAdminPage() {
  const [exams, setExams] = useState<ManagedExam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [questions, setQuestions] = useState<ParsedQuestion[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const r = await listManagedExams();
      setExams(r.exams);
      setAttempts(r.attempts);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to load exams.");
    }
  };
  useEffect(() => {
    void load();
  }, []);

  const onFile = async (file: File | undefined) => {
    setQuestions(null);
    if (!file) return;
    setFileName(file.name);
    try {
      const rows = await readXlsxFile(file);
      const parsed = parseExamRows(rows as unknown[][]);
      setQuestions(parsed);
      toast.success(`${parsed.length} questions read from the file.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read that Excel file.");
    }
  };

  const onCreate = async () => {
    if (!questions) return toast.error("Upload an Excel file of questions first.");
    let mins: number | null;
    try {
      mins = parseDuration(duration);
    } catch (e) {
      return toast.error((e as Error).message);
    }
    setSaving(true);
    try {
      await createExam({ data: { title, description: description || null, durationMinutes: mins, questions } });
      toast.success("Exam created.");
      setTitle("");
      setDescription("");
      setDuration("");
      setQuestions(null);
      setFileName("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to create exam.");
    } finally {
      setSaving(false);
    }
  };

  const changeDuration = async (exam: ManagedExam) => {
    const input = window.prompt("Duration in minutes (leave empty for no time limit)", exam.duration_minutes?.toString() ?? "");
    if (input === null) return;
    try {
      await updateExamSettings({ data: { id: exam.id, durationMinutes: parseDuration(input) } });
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <PageShell>
      <StaffNav />
      <PageHeader eyebrow="Staff workspace" title="Exams" description="Create exams from an Excel file and see how students performed." />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="panel space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Create a new exam</h2>
            <Button variant="outline" onClick={() => void downloadTemplate()}>
              <Download className="size-4" /> Download sample template
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Excel columns: Question | Option A | Option B | Option C | Option D | Correct Answer (A–D) | Marks
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Exam title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration in minutes (leave empty for no time limit)</Label>
              <Input id="duration" inputMode="numeric" placeholder="e.g. 30 or 60" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Instructions (optional)</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Questions file (.xlsx)</Label>
            <Input id="file" type="file" accept=".xlsx" onChange={(e) => void onFile(e.target.files?.[0])} />
            {questions && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="size-4" /> {fileName}: {questions.length} questions,{" "}
                {questions.reduce((s, q) => s + q.marks, 0)} total marks
              </p>
            )}
          </div>
          <Button onClick={() => void onCreate()} disabled={saving || !title.trim() || !questions}>
            {saving ? "Saving…" : "Create exam"}
          </Button>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Your exams</h2>
          {exams.length === 0 && <p className="text-sm text-muted-foreground">No exams yet.</p>}
          {exams.map((exam) => {
            const results = attempts.filter((a) => a.exam_id === exam.id);
            return (
              <div key={exam.id} className="panel space-y-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-semibold">{exam.title}</h3>
                  <Badge variant="secondary">{exam.question_count} questions</Badge>
                  <Badge variant="outline">{exam.duration_minutes ? `${exam.duration_minutes} min` : "No time limit"}</Badge>
                  {!exam.is_published && <Badge variant="destructive">Hidden</Badge>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => void changeDuration(exam)}>Change duration</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await updateExamSettings({ data: { id: exam.id, isPublished: !exam.is_published } });
                      await load();
                    }}
                  >
                    {exam.is_published ? "Hide from students" : "Show to students"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      if (!window.confirm("Delete this exam and all its results?")) return;
                      await deleteExam({ data: { id: exam.id } });
                      await load();
                    }}
                  >
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
                {results.length > 0 && (
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr><th className="py-1">Student</th><th>Score</th><th>Submitted</th></tr>
                    </thead>
                    <tbody>
                      {results.map((a) => (
                        <tr key={a.id} className="border-t border-border">
                          <td className="py-1.5">{a.student_name}</td>
                          <td>{a.score} / {a.total_marks}{a.auto_submitted ? " (time up)" : ""}</td>
                          <td>{new Date(a.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-lg font-semibold">Admin settings</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4" /> Church contact email:{" "}
            <a className="text-foreground underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </section>
      </div>
    </PageShell>
  );
}
