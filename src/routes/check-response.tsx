import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import {
  getThreadByCode,
  replyToThread,
  subscribeToMessages,
  type ThreadData,
  type ThreadMessage,
} from "@/lib/issues";

export const Route = createFileRoute("/check-response")({
  head: () => ({
    meta: [
      { title: "Check Response — RCCG The Master's Place" },
      {
        name: "description",
        content:
          "Enter your private access code to read the pastoral response to your confidential submission and continue the conversation.",
      },
      { property: "og:title", content: "Check Response — RCCG The Master's Place" },
      {
        property: "og:description",
        content: "Read the pastoral reply to your confidential submission using your access code.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckResponsePage,
});

function CheckResponsePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const submissionId = thread?.submission?.id;

  useEffect(() => {
    if (!submissionId) return;
    return subscribeToMessages(submissionId, (msg) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });
  }, [submissionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter your access code.");
      return;
    }
    setLoading(true);
    try {
      const data = await getThreadByCode(code.trim().toUpperCase());
      if (!data.found) {
        toast.error("No submission found with that access code.");
        setThread(null);
        setMessages([]);
      } else {
        setThread(data);
        setMessages(data.messages ?? []);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to look up that code.");
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await replyToThread(code.trim().toUpperCase(), reply.trim());
      const refreshed = await getThreadByCode(code.trim().toUpperCase());
      setMessages(refreshed.messages ?? []);
      setReply("");
      toast.success("Message sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send your message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Secure thread"
        title="Check Response"
        description="Enter the access code you received when submitting your issue to read the pastoral reply."
      />

      <section className="bg-background py-14 lg:py-20">
        <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
          <form onSubmit={lookup} className="panel space-y-4 p-6 sm:p-8">
            <div className="space-y-2">
              <Label htmlFor="code">Access code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3D4"
                className="font-display tracking-[0.2em]"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Search className="size-4" />
              {loading ? "Looking up..." : "View my thread"}
            </Button>
          </form>

          {thread?.found && thread.submission && (
            <div className="panel overflow-hidden">
              <div className="border-b border-border bg-secondary p-6">
                <span className="eyebrow">{thread.submission.category}</span>
                <h2 className="mt-2 text-lg font-semibold text-foreground">
                  {thread.submission.title}
                </h2>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-accent" /> Status:{" "}
                    {thread.submission.status}
                  </span>
                  <span>
                    Submitted {new Date(thread.submission.created_at).toLocaleDateString()}
                  </span>
                </p>
              </div>

              <div className="max-h-[28rem] space-y-4 overflow-y-auto p-6">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_type === "visitor" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        m.sender_type === "visitor"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="text-[10px] font-semibold tracking-[0.18em] uppercase opacity-70">
                        {m.sender_type === "visitor" ? "You" : "Church leadership"}
                      </p>
                      <p className="mt-1.5 whitespace-pre-wrap">{m.message}</p>
                      <p className="mt-2 text-[10px] opacity-60">
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={sendReply} className="space-y-3 border-t border-border p-6">
                <Textarea
                  rows={3}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a follow-up message..."
                />
                <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                  <Send className="size-4" />
                  {sending ? "Sending..." : "Send message"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
