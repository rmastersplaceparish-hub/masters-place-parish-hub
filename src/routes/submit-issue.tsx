import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Copy, Check, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { issueCategories } from "@/lib/site-data";
import { submitIssue } from "@/lib/issues";

export const Route = createFileRoute("/submit-issue")({
  head: () => ({
    meta: [
      { title: "Submit a Confidential Issue — RCCG The Master's Place" },
      {
        name: "description",
        content:
          "Share a concern anonymously with pastoral leadership at RCCG The Master's Place and receive a private access code to track the response.",
      },
      { property: "og:title", content: "Submit a Confidential Issue — RCCG The Master's Place" },
      {
        property: "og:description",
        content: "Anonymous, secure pastoral care requests with a private access code.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubmitIssuePage,
});

function SubmitIssuePage() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !title.trim() || !message.trim()) {
      toast.error("Please complete every field before submitting.");
      return;
    }
    setLoading(true);
    try {
      const result = await submitIssue({ category, title: title.trim(), message: message.trim() });
      setAccessCode(result.accessCode);
      toast.success("Your issue has been submitted securely.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!accessCode) return;
    await navigator.clipboard.writeText(accessCode);
    setCopied(true);
    toast.success("Access code copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Confidential pastoral care"
        title="Submit an Issue"
        description="Your submission is completely anonymous. You will receive a unique access code — keep it safe, it is the only way to read the reply."
      />

      <section className="bg-background py-14 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {accessCode ? (
            <div className="panel p-8 text-center lg:p-12">
              <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-success/10">
                <ShieldCheck className="size-7 text-success" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-foreground">Submission received</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Save this access code now. It will not be shown again, and it is the only way to
                view the pastoral response.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border border-dashed border-accent bg-secondary p-6 sm:flex-row sm:justify-center">
                <code className="font-display text-2xl font-semibold tracking-[0.25em] text-foreground">
                  {accessCode}
                </code>
                <Button variant="outline" size="sm" onClick={copyCode}>
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link to="/check-response">
                    Check response <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Back to home</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="panel mb-8 flex gap-4 p-5">
                <Lock className="mt-0.5 size-5 shrink-0 text-accent" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  No name, email or phone number is collected. Only church leadership can read your
                  message, and replies are tied solely to your access code.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="panel space-y-6 p-6 sm:p-8">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {issueCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of your concern"
                    maxLength={120}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Your message</Label>
                  <Textarea
                    id="message"
                    rows={8}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share as much detail as you feel comfortable with..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Submitting securely..." : "Submit confidentially"}
                </Button>
              </form>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
