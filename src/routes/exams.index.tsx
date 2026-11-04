import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { listPublishedExams, type PublicExam } from "@/lib/exams";

export const Route = createFileRoute("/exams/")({
  head: () => ({
    meta: [
      { title: "Exams — RCCG The Master's Place" },
      { name: "description", content: "Take Bible study and class exams online at RCCG The Master's Place." },
      { property: "og:title", content: "Exams — RCCG The Master's Place" },
      { property: "og:description", content: "Take Bible study and class exams online at RCCG The Master's Place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExamsPage,
});

function ExamsPage() {
  const [exams, setExams] = useState<PublicExam[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    listPublishedExams().then(setExams).catch((e) => setError(e.message));
  }, []);

  return (
    <PageShell>
      <PageHeader eyebrow="Learning" title="Exams" description="Choose an exam below to begin." />
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10 sm:px-6 lg:px-8">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {exams === null && !error && <p className="text-sm text-muted-foreground">Loading exams…</p>}
        {exams?.length === 0 && <p className="text-sm text-muted-foreground">No exams are available right now.</p>}
        {exams?.map((e) => (
          <div key={e.id} className="panel flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <h2 className="font-display flex items-center gap-2 font-semibold">
                <GraduationCap className="size-5 text-accent" /> {e.title}
              </h2>
              {e.description && <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>}
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" /> {e.duration_minutes ? `${e.duration_minutes} minutes` : "No time limit"}
              </p>
            </div>
            <Button asChild>
              <Link to="/exams/$examId" params={{ examId: e.id }}>Start exam</Link>
            </Button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
