import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, LogOut, MessageCircle, RefreshCw, Send, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { StaffNav } from "@/components/site/staff-nav";
import { supabase } from "@/integrations/supabase/client";
import {
  getPastoralThread,
  listPastoralSubmissions,
  replyAsPastor,
  deletePastoralThread,
  updatePastoralStatus,
} from "@/lib/pastoral.functions";
import type { Database, Tables } from "@/integrations/supabase/types";

type Status = Database["public"]["Enums"]["pastoral_submission_status"];
type Submission = Pick<Tables<"pastoral_submissions">, "id" | "category" | "title" | "status" | "created_at" | "updated_at">;
type Thread = Awaited<ReturnType<typeof getPastoralThread>>;

const statusLabels: Record<Status, string> = {
  pending: "Pending reply",
  in_review: "In review",
  responded: "Responded",
  resolved: "Resolved",
};

export const Route = createFileRoute("/_authenticated/pastoral-care")({
  head: () => ({
    meta: [
      { title: "Pastoral Care Workspace — RCCG The Master's Place" },
      { name: "description", content: "Private pastoral care workspace for approved church leadership." },
      { property: "og:title", content: "Pastoral Care Workspace — RCCG The Master's Place" },
      { property: "og:description", content: "Private pastoral care workspace for approved church leadership." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PastoralCarePage,
});

function PastoralCarePage() {
  const navigate = useNavigate();
  const fetchSubmissions = listPastoralSubmissions;
  const fetchThread = getPastoralThread;
  const sendReply = replyAsPastor;
  const changeStatus = updatePastoralStatus;
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const items = await fetchSubmissions();
      setSubmissions(items);
      if (!selectedId && items[0]) setSelectedId(items[0].id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load pastoral care.");
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (id: string) => {
    setThreadLoading(true);
    try {
      setThread(await fetchThread({ data: { submissionId: id } }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to open this conversation.");
    } finally {
      setThreadLoading(false);
    }
  };

  useEffect(() => {
    void loadSubmissions();
  }, []);

  useEffect(() => {
    if (selectedId) void loadThread(selectedId);
  }, [selectedId]);

  const filtered = useMemo(
    () => submissions.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || `${item.title} ${item.category}`.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    }),
    [search, statusFilter, submissions],
  );

  const submitReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!thread || !message.trim()) return;
    setSending(true);
    try {
      await sendReply({ data: { submissionId: thread.submission.id, message: message.trim() } });
      setMessage("");
      await Promise.all([loadThread(thread.submission.id), loadSubmissions()]);
      toast.success("Pastoral reply sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send the reply.");
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (status: Status) => {
    if (!thread) return;
    try {
      await changeStatus({ data: { submissionId: thread.submission.id, status } });
      await Promise.all([loadThread(thread.submission.id), loadSubmissions()]);
      toast.success("Conversation status updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update the status.");
    }
  };

  const removeThread = async () => {
    if (!thread) return;
    if (!window.confirm("Delete this conversation permanently? The member will no longer be able to open it with their access code.")) return;
    try {
      await deletePastoralThread({ data: { submissionId: thread.submission.id } });
      setThread(null);
      setSelectedId(null);
      await loadSubmissions();
      toast.success("Conversation deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete the conversation.");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/auth" });
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Private workspace"
        title="Pastoral Care"
        description="Review confidential conversations and respond with care."
        actions={
          <Button variant="outline" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        }
      />
      <StaffNav />
      <section className="bg-background py-8 lg:py-12">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[22rem_1fr] lg:px-8">
          <aside className="panel flex min-h-[34rem] flex-col overflow-hidden">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Inbox</p>
                  <p className="mt-1 text-sm text-muted-foreground">{submissions.length} conversation{submissions.length === 1 ? "" : "s"}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => void loadSubmissions()} aria-label="Refresh conversations">
                  <RefreshCw className="size-4" />
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                <Input placeholder="Search conversations" value={search} onChange={(event) => setSearch(event.target.value)} />
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Status | "all")}>
                  <SelectTrigger aria-label="Filter by status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {(Object.keys(statusLabels) as Status[]).map((status) => <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <p className="p-5 text-sm text-muted-foreground">Loading conversations...</p>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle2 className="mx-auto size-8 text-success" />
                  <p className="mt-3 text-sm font-medium text-foreground">No conversations here</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">New confidential submissions will appear in this inbox.</p>
                </div>
              ) : filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full border-b border-border p-4 text-left transition-colors hover:bg-secondary ${selectedId === item.id ? "bg-secondary" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-sm font-semibold text-foreground">{item.title}</p>
                    <Badge variant={item.status === "resolved" ? "secondary" : "outline"}>{statusLabels[item.status]}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{item.category} · {new Date(item.created_at).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          </aside>

          <main className="panel min-h-[34rem] overflow-hidden">
            {!selectedId ? (
              <div className="flex min-h-[34rem] items-center justify-center p-8 text-center">
                <div><MessageCircle className="mx-auto size-10 text-accent" /><p className="mt-4 font-medium text-foreground">Choose a conversation</p><p className="mt-1 text-sm text-muted-foreground">Select a submission from the inbox to read and reply.</p></div>
              </div>
            ) : threadLoading || !thread ? (
              <div className="flex min-h-[34rem] items-center justify-center p-8 text-sm text-muted-foreground">Opening conversation...</div>
            ) : (
              <>
                <div className="flex flex-col gap-4 border-b border-border bg-secondary p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="eyebrow">{thread.submission.category}</p>
                    <h2 className="mt-2 text-xl font-semibold text-foreground">{thread.submission.title}</h2>
                    <p className="mt-2 text-xs text-muted-foreground">Submitted {new Date(thread.submission.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                  <Select value={thread.submission.status} onValueChange={(value) => void setStatus(value as Status)}>
                    <SelectTrigger className="w-full sm:w-44" aria-label="Conversation status"><SelectValue /></SelectTrigger>
                    <SelectContent>{(Object.keys(statusLabels) as Status[]).map((status) => <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>)}</SelectContent>
                  </Select>
                    <Button variant="outline" size="icon" onClick={() => void removeThread()} aria-label="Delete conversation" title="Delete conversation" className="shrink-0 text-destructive hover:text-destructive"><Trash2 className="size-4" /></Button>
                  </div>
                </div>
                <div className="max-h-[30rem] space-y-4 overflow-y-auto p-5 sm:p-6">
                  {thread.messages.map((item) => (
                    <div key={item.id} className={`flex ${item.sender_type === "pastor" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-relaxed ${item.sender_type === "pastor" ? "bg-primary text-primary-foreground" : "border border-border bg-secondary text-secondary-foreground"}`}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">{item.sender_type === "pastor" ? "Your reply" : "Visitor"}</p>
                        <p className="mt-1.5 whitespace-pre-wrap">{item.message}</p>
                        <p className="mt-2 text-[10px] opacity-60">{new Date(item.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={submitReply} className="space-y-3 border-t border-border p-5 sm:p-6">
                  <Textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a thoughtful pastoral reply..." />
                  <Button type="submit" disabled={sending || !message.trim()}><Send className="size-4" />{sending ? "Sending..." : "Send pastoral reply"}</Button>
                </form>
              </>
            )}
          </main>
        </div>
      </section>
    </PageShell>
  );
}