import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { getStudentExam, submitExam, type StudentExam } from "@/lib/exams";
import { shuffleExam, type ShuffledQuestion } from "@/lib/exam-shuffle";

export const Route = createFileRoute("/exams/$examId")({
  head: () => ({
    meta: [
      { title: "Take Exam — RCCG The Master's Place" },
      { name: "description", content: "Answer the exam questions and submit to see your score." },
      { property: "og:title", content: "Take Exam — RCCG The Master's Place" },
      { property: "og:description", content: "Answer the exam questions and submit to see your score." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TakeExamPage,
});

const fmt = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${h > 0 ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

function TakeExamPage() {
  const { examId } = Route.useParams();
  const [exam, setExam] = useState<StudentExam | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [displayQuestions, setDisplayQuestions] = useState<ShuffledQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remaining, setRemaining] = useState<number | null>(null);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const doneRef = useRef(false);
  const tabSwitchesRef = useRef(0);
  const lastLeaveEventAtRef = useRef(0);
  const lastLeaveEventTypeRef = useRef<"blur" | "visibility" | null>(null);

  useEffect(() => {
    getStudentExam(examId).then(setExam).catch(() => setExam(null));
  }, [examId]);

  const submit = useCallback(
    async (auto: boolean, reason: "time" | "leaving" = "time") => {
      if (doneRef.current) return;
      doneRef.current = true;
      setSubmitting(true);
      try {
        setResult(await submitExam({ examId, name, answers: answersRef.current, auto, tabSwitches: tabSwitchesRef.current }));
        if (auto && reason === "time") toast.info("Time is up — your exam was submitted automatically.");
        if (auto && reason === "leaving") toast.info("You left the exam again — it was submitted automatically.");
      } catch (e) {
        doneRef.current = false;
        toast.error(e instanceof Error ? e.message : "Could not submit exam.");
      } finally {
        setSubmitting(false);
      }
    },
    [examId, name],
  );

  // Warn on the first leave event; automatically submit after a second one.
  useEffect(() => {
    if (!started || result) return;
    const recordLeave = (eventType: "blur" | "visibility") => {
      const now = Date.now();
      if (lastLeaveEventTypeRef.current !== eventType && now - lastLeaveEventAtRef.current < 1000) return;
      lastLeaveEventAtRef.current = now;
      lastLeaveEventTypeRef.current = eventType;
      tabSwitchesRef.current += 1;
      if (tabSwitchesRef.current === 1) {
        setShowLeaveWarning(true);
      } else {
        void submit(true, "leaving");
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") recordLeave("visibility");
    };
    const onBlur = () => recordLeave("blur");
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [started, result, submit]);

  // Countdown only when the exam has a duration.
  useEffect(() => {
    if (!started || !exam?.duration_minutes || result) return;
    const end = Date.now() + exam.duration_minutes * 60_000;
    const tick = () => {
      const left = Math.max(0, Math.round((end - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) void submit(true, "time");
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [started, exam, result, submit]);

  if (exam === undefined) return <PageShell><p className="p-10 text-center text-sm">Loading…</p></PageShell>;
  if (exam === null)
    return (
      <PageShell>
        <div className="p-10 text-center">
          <p>This exam is not available.</p>
          <Link to="/exams" className="mt-4 inline-block underline">Back to exams</Link>
        </div>
      </PageShell>
    );

  const total = exam.questions.reduce((s, q) => s + Number(q.marks), 0);

  return (
    <PageShell>
      <PageHeader eyebrow="Exam" title={exam.title} {...(exam.description ? { description: exam.description } : {})} />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        {result ? (
          <div className="panel p-8 text-center">
            <h2 className="font-display text-2xl font-semibold">Your score</h2>
            <p className="mt-3 text-4xl font-bold text-accent">{result.score} / {result.total}</p>
            <Button asChild className="mt-6"><Link to="/exams">Back to exams</Link></Button>
          </div>
        ) : !started ? (
          <div className="panel space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              {exam.questions.length} questions · {total} marks ·{" "}
              {exam.duration_minutes ? `${exam.duration_minutes} minutes — submits automatically when time ends` : "No time limit"}
            </p>
            <div className="space-y-2">
              <Label htmlFor="name">Your full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button disabled={!name.trim()} onClick={() => {
              setDisplayQuestions(shuffleExam(exam.questions));
              setStarted(true);
            }}>Begin exam</Button>
          </div>
        ) : (
          <>
            {exam.duration_minutes && remaining !== null && (
              <div
                role="timer"
                className={`sticky top-24 z-10 ml-auto flex w-fit items-center gap-2 rounded-md border border-border bg-background px-4 py-2 font-mono text-lg font-semibold shadow ${remaining < 60 ? "text-destructive" : ""}`}
              >
                <Clock className="size-5" /> {fmt(remaining)}
              </div>
            )}
            {displayQuestions.map(({ question: q, options }, i) => (
              <fieldset key={q.id} className="panel space-y-3 p-5">
                <legend className="font-medium">
                  {i + 1}. {q.question} <span className="text-xs text-muted-foreground">({q.marks} mark{Number(q.marks) === 1 ? "" : "s"})</span>
                </legend>
                {options.map((option, optionIndex) => (
                  <label key={option.letter} className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 text-sm hover:bg-secondary">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === option.letter}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: option.letter }))}
                    />
                    <span className="font-semibold">{(["A", "B", "C", "D"] as const)[optionIndex]}.</span> {option.text}
                  </label>
                ))}
              </fieldset>
            ))}
            <Button
              size="lg"
              disabled={submitting}
              onClick={() => {
                const unanswered = displayQuestions.length - Object.keys(answers).length;
                if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
                void submit(false);
              }}
            >
              {submitting ? "Submitting…" : "Submit exam"}
            </Button>
          </>
        )}
      </div>
      {showLeaveWarning && !result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-6" role="alertdialog" aria-modal="true" aria-labelledby="leave-warning-title">
          <div className="max-w-lg space-y-5 text-center">
            <h2 id="leave-warning-title" className="font-display text-2xl font-semibold">You left the exam</h2>
            <p className="text-muted-foreground">Please stay on this page. Leaving again will submit your exam automatically.</p>
            <Button onClick={() => setShowLeaveWarning(false)}>Return to exam</Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
