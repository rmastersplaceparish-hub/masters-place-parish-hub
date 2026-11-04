import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, FileImage, ImagePlus, Pencil, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { StaffNav } from "@/components/site/staff-nav";
import { supabase } from "@/integrations/supabase/client";
import {
  createEvent,
  createGalleryPhoto,
  deleteEvent,
  deleteGalleryPhoto,
  listManagedContent,
  replaceGalleryPhoto,
  updateEvent,
  updateGalleryPhoto,
  type ManagedEvent,
  type ManagedGalleryPhoto,
} from "@/lib/content.functions";
import { CHURCH_ADDRESS } from "@/lib/site-data";

export const Route = createFileRoute("/_authenticated/content")({
  head: () => ({
    meta: [
      { title: "Church Content Manager — RCCG The Master's Place" },
      { name: "description", content: "Manage church events, announcements, flyers and gallery photos." },
      { property: "og:title", content: "Church Content Manager — RCCG The Master's Place" },
      { property: "og:description", content: "Manage church events, announcements, flyers and gallery photos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContentManagerPage,
});

type Tab = "events" | "gallery";

function ContentManagerPage() {
  const [tab, setTab] = useState<Tab>("events");
  const [events, setEvents] = useState<ManagedEvent[]>([]);
  const [photos, setPhotos] = useState<ManagedGalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const result = await listManagedContent();
      setEvents(result.events);
      setPhotos(result.photos);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load church content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Staff workspace"
        title="Church Content"
        description="Keep the public events and photo gallery current from one place."
        actions={<Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className="size-4" /> Refresh</Button>}
      />
      <StaffNav />
      <section className="bg-background py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-3">
            <Button variant={tab === "events" ? "default" : "ghost"} onClick={() => setTab("events")}><CalendarDays className="size-4" /> Events & announcements</Button>
            <Button variant={tab === "gallery" ? "default" : "ghost"} onClick={() => setTab("gallery")}><FileImage className="size-4" /> Photo gallery</Button>
          </div>
          {loading ? <div className="panel p-8 text-sm text-muted-foreground">Loading your content...</div> : tab === "events" ? (
            <EventsManager events={events} onRefresh={load} />
          ) : <GalleryManager photos={photos} onRefresh={load} />}
        </div>
      </section>
    </PageShell>
  );
}

function EventsManager({ events, onRefresh }: { events: ManagedEvent[]; onRefresh: () => Promise<void> }) {
  const [editing, setEditing] = useState<ManagedEvent | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const remove = async (event: ManagedEvent) => {
    if (!window.confirm(`Delete “${event.title}”?`)) return;
    try {
      await deleteEvent({ data: { id: event.id, flyerPath: event.flyer_path } });
      await onRefresh();
      toast.success("Event removed.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to remove event."); }
  };

  const save = async (data: EventFormData, flyerPath: string | null) => {
    setSaving(true);
    try {
      const payload = { ...data, flyerPath };
      if (editing) await updateEvent({ data: { id: editing.id, ...payload } });
      else await createEvent({ data: payload });
      setFormOpen(false);
      setEditing(null);
      await onRefresh();
      toast.success(editing ? "Event updated." : "Event added.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save event."); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="eyebrow">Public calendar</p><h2 className="mt-2 text-2xl font-semibold text-foreground">Events & announcements</h2><p className="mt-2 text-sm text-muted-foreground">{events.length} event{events.length === 1 ? "" : "s"} currently saved.</p></div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}><CalendarDays className="size-4" /> Add event</Button>
      </div>
      {formOpen && <EventForm event={editing} onCancel={() => { setFormOpen(false); setEditing(null); }} onSave={save} saving={saving} />}
      {events.length === 0 ? <EmptyState icon={CalendarDays} title="No events yet" text="Add the next programme, service or special announcement." /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {events.map((event) => <article key={event.id} className="panel overflow-hidden">
            {event.flyer_url && <img src={event.flyer_url} alt="" className="aspect-[2/1] w-full object-cover" />}
            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2"><Badge>{event.status}</Badge>{event.is_featured && <Badge variant="secondary">Featured</Badge>}{!event.is_published && <Badge variant="outline">Hidden</Badge>}</div><h3 className="mt-3 text-lg font-semibold text-foreground">{event.title}</h3></div><CalendarDays className="size-5 shrink-0 text-accent" /></div>
              <p className="text-sm text-muted-foreground">{new Date(event.event_date).toLocaleString()} · {event.location}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>
              <div className="flex flex-wrap gap-2 border-t border-border pt-4"><Button variant="outline" size="sm" onClick={() => { setEditing(event); setFormOpen(true); }}><Pencil className="size-4" /> Edit</Button><Button variant="ghost" size="sm" onClick={() => void remove(event)}><Trash2 className="size-4" /> Delete</Button></div>
            </div>
          </article>)}
        </div>
      )}
    </div>
  );
}

type EventFormData = { title: string; theme: string | null; description: string; eventDate: string; endDate: string | null; location: string; isFeatured: boolean; isPublished: boolean; status: "upcoming" | "ongoing" | "concluded" };

function EventForm({ event, onCancel, onSave, saving }: { event: ManagedEvent | null; onCancel: () => void; onSave: (data: EventFormData, flyerPath: string | null) => Promise<void>; saving: boolean }) {
  const [form, setForm] = useState<EventFormData>(() => ({ title: event?.title ?? "", theme: event?.theme ?? "", description: event?.description ?? "", eventDate: event ? toLocalDateTime(event.event_date) : "", endDate: event?.end_date ? toLocalDateTime(event.end_date) : null, location: event?.location ?? CHURCH_ADDRESS, isFeatured: event?.is_featured ?? false, isPublished: event?.is_published ?? true, status: (event?.status as EventFormData["status"]) ?? "upcoming" }));
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.eventDate) { toast.error("Add a title, description and date."); return; }
    let flyerPath = event?.flyer_path ?? null;
    if (file) {
      setUploading(true);
      try { flyerPath = await uploadMedia(file, "flyers"); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to upload flyer."); setUploading(false); return; }
      setUploading(false);
    }
    await onSave({ ...form, theme: form.theme || null, eventDate: new Date(form.eventDate).toISOString(), endDate: form.endDate ? new Date(form.endDate).toISOString() : null }, flyerPath);
  };
  return <form onSubmit={(e) => void submit(e)} className="panel grid gap-5 p-5 lg:grid-cols-2">
    <div className="lg:col-span-2 flex items-center justify-between border-b border-border pb-4"><div><p className="eyebrow">{event ? "Edit event" : "New event"}</p><h3 className="mt-1 text-lg font-semibold text-foreground">Event details</h3></div><Button type="button" variant="ghost" size="icon" onClick={onCancel} aria-label="Close event form"><X className="size-4" /></Button></div>
    <Field label="Event title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Cultural Sunday" /></Field>
    <Field label="Theme or scripture"><Input value={form.theme ?? ""} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder="Optional" /></Field>
    <Field label="Date and time"><Input type="datetime-local" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} /></Field>
    <Field label="End date and time"><Input type="datetime-local" value={form.endDate ?? ""} onChange={(e) => setForm({ ...form, endDate: e.target.value || null })} /></Field>
    <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
    <Field label="Status"><select className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EventFormData["status"] })}><option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option><option value="concluded">Concluded</option></select></Field>
    <Field label="Description" className="lg:col-span-2"><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What should people know about this event?" /></Field>
    <Field label="Flyer image" className="lg:col-span-2"><Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /><p className="mt-1 text-xs text-muted-foreground">Optional. Images up to 15 MB.</p></Field>
    <div className="flex flex-wrap gap-4 text-sm text-foreground lg:col-span-2"><label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Feature on homepage</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Visible publicly</label></div>
    <div className="flex gap-2 lg:col-span-2"><Button type="submit" disabled={saving || uploading}><Upload className="size-4" />{uploading ? "Uploading flyer..." : saving ? "Saving..." : event ? "Save changes" : "Add event"}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div>
  </form>;
}

function GalleryManager({ photos, onRefresh }: { photos: ManagedGalleryPhoto[]; onRefresh: () => Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const replacementRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [replacing, setReplacing] = useState<string | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ caption: "", category: "Church life", displayOrder: 0, isVisible: true });

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = await uploadMedia(file, "gallery");
        await createGalleryPhoto({ data: { storagePath: path, caption: file.name.replace(/\.[^.]+$/, ""), category: "Church life", displayOrder: photos.length, isVisible: true } });
      }
      await onRefresh();
      toast.success(`${files.length} photo${files.length === 1 ? "" : "s"} added.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to upload photos."); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  };
  const remove = async (photo: ManagedGalleryPhoto) => {
    if (!window.confirm("Delete this photo from the gallery?")) return;
    try { await deleteGalleryPhoto({ data: { id: photo.id } }); await onRefresh(); toast.success("Photo removed."); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to remove photo."); }
  };
  const savePhoto = async (photo: ManagedGalleryPhoto) => {
    try { await updateGalleryPhoto({ data: { id: photo.id, ...draft } }); setEditing(null); await onRefresh(); toast.success("Photo details updated."); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update photo."); }
  };
  const replacePhoto = async (file: File | undefined) => {
    if (!file || !replaceTarget) return;
    const id = replaceTarget;
    setReplacing(id);
    try {
      const storagePath = await uploadMedia(file, "gallery");
      try {
        await replaceGalleryPhoto({ data: { id, storagePath } });
      } catch (error) {
        await supabase.storage.from("church-media").remove([storagePath]);
        throw error;
      }
      await onRefresh();
      toast.success("Photo replaced.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to replace photo."); }
    finally { setReplacing(null); setReplaceTarget(null); if (replacementRef.current) replacementRef.current.value = ""; }
  };
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Public gallery</p><h2 className="mt-2 text-2xl font-semibold text-foreground">Photo gallery</h2><p className="mt-2 text-sm text-muted-foreground">Add, label, hide, replace or remove the photos visitors see.</p></div><><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => void upload(e.target.files)} /><input ref={replacementRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label="Choose replacement photo" onChange={(e) => void replacePhoto(e.target.files?.[0])} /><Button onClick={() => inputRef.current?.click()} disabled={uploading || Boolean(replacing)}><ImagePlus className="size-4" />{uploading ? "Uploading..." : "Add photos"}</Button></></div>
    {photos.length === 0 ? <EmptyState icon={FileImage} title="No gallery photos yet" text="Choose Add photos to start building the public gallery." /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{photos.map((photo) => <article key={photo.id} className="panel overflow-hidden"><div className="relative aspect-[4/3] bg-secondary">{photo.image_url ? <img src={photo.image_url} alt={photo.caption ?? "Church gallery photo"} className="size-full object-cover" /> : <FileImage className="absolute inset-0 m-auto size-8 text-muted-foreground" />}{!photo.is_visible && <Badge className="absolute top-2 left-2" variant="secondary">Hidden</Badge>}</div><div className="space-y-3 p-4">{editing === photo.id ? <><Input value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} placeholder="Caption" /><Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Category" /><label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={draft.isVisible} onChange={(e) => setDraft({ ...draft, isVisible: e.target.checked })} /> Visible publicly</label><div className="flex gap-2"><Button size="sm" onClick={() => void savePhoto(photo)}>Save</Button><Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button></div></> : <><p className="line-clamp-2 text-sm font-medium text-foreground">{photo.caption || "Untitled photo"}</p><p className="text-xs text-muted-foreground">{photo.category}</p><div className="flex flex-wrap gap-1 border-t border-border pt-3"><Button size="sm" variant="outline" onClick={() => { setEditing(photo.id); setDraft({ caption: photo.caption ?? "", category: photo.category, displayOrder: photo.display_order, isVisible: photo.is_visible }); }}><Pencil className="size-3.5" /> Edit</Button><Button size="sm" variant="outline" disabled={Boolean(replacing)} onClick={() => { setReplaceTarget(photo.id); replacementRef.current?.click(); }}><Upload className="size-3.5" /> {replacing === photo.id ? "Replacing..." : "Replace"}</Button><Button size="sm" variant="ghost" onClick={() => void remove(photo)} aria-label="Delete photo"><Trash2 className="size-3.5" /></Button></div></>}</div></article>)}</div>}
  </div>;
}

async function uploadMedia(file: File, folder: "gallery" | "flyers") {
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const extension = extensions[file.type];
  if (!extension) throw new Error("Please choose a JPG, PNG or WebP image.");
  if (file.size > 15 * 1024 * 1024) throw new Error("Each image must be 15 MB or smaller.");
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("church-media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

function toLocalDateTime(value: string) { const date = new Date(value); const pad = (number: number) => String(number).padStart(2, "0"); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`; }
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) { return <label className={`grid gap-2 text-sm font-medium text-foreground ${className}`}><span>{label}</span>{children}</label>; }
function EmptyState({ icon: Icon, title, text }: { icon: typeof CalendarDays; title: string; text: string }) { return <div className="panel p-10 text-center"><Icon className="mx-auto size-9 text-accent" /><h3 className="mt-4 font-semibold text-foreground">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{text}</p></div>; }