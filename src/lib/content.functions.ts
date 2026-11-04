import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database, Tables } from "@/integrations/supabase/types";

type EventRow = Tables<"church_events">;
type GalleryRow = Tables<"gallery_photos">;

export type PublicEvent = Pick<
  EventRow,
  | "id"
  | "title"
  | "theme"
  | "description"
  | "event_date"
  | "end_date"
  | "location"
  | "is_featured"
  | "status"
> & { flyer_url: string | null };

export type PublicGalleryPhoto = Pick<
  GalleryRow,
  "id" | "caption" | "category" | "display_order" | "created_at"
> & { image_url: string };

export type ManagedEvent = PublicEvent & Pick<EventRow, "is_published" | "flyer_path" | "updated_at">;
export type ManagedGalleryPhoto = PublicGalleryPhoto & Pick<GalleryRow, "storage_path" | "is_visible" | "updated_at">;

const eventInput = z.object({
  title: z.string().trim().min(2).max(120),
  theme: z.string().trim().max(160).optional().nullable(),
  description: z.string().trim().min(2).max(2000),
  eventDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  location: z.string().trim().min(2).max(180),
  flyerPath: z.string().trim().max(500).optional().nullable(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  status: z.enum(["upcoming", "ongoing", "concluded"]).default("upcoming"),
});

const galleryInput = z.object({
  storagePath: z.string().trim().min(3).max(500),
  caption: z.string().trim().max(180).optional().nullable(),
  category: z.string().trim().min(2).max(80).default("Church life"),
  displayOrder: z.number().int().min(0).max(9999).default(0),
  isVisible: z.boolean().default(true),
});

async function getSignedUrls(paths: string[]) {
  const empty = new Map<string, string>();
  if (paths.length === 0) return empty;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.storage.from("church-media").createSignedUrls(paths, 3600);
    if (error) throw new Error(error.message);
    return new Map((data ?? []).flatMap((item, index) => item.signedUrl ? [[paths[index]!, item.signedUrl] as const] : []));
  } catch (error) {
    console.error("[content] Unable to sign media URLs", error);
    return empty;
  }
}

export const getPublicContent = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Supabase is not configured.");
  const publicClient = createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const [eventsResult, photosResult] = await Promise.all([
    publicClient
      .from("church_events")
      .select("id, title, theme, description, event_date, end_date, location, flyer_path, is_featured, status")
      .eq("is_published", true)
      .order("event_date", { ascending: true }),
    publicClient
      .from("gallery_photos")
      .select("id, storage_path, caption, category, display_order, created_at")
      .eq("is_visible", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),
  ]);
  if (eventsResult.error) throw new Error(eventsResult.error.message);
  if (photosResult.error) throw new Error(photosResult.error.message);

  const events = eventsResult.data ?? [];
  const photos = photosResult.data ?? [];
  const urls = await getSignedUrls([
    ...events.flatMap((item) => item.flyer_path ? [item.flyer_path] : []),
    ...photos.map((item) => item.storage_path),
  ]);

  return {
    events: events.map((item) => ({
      ...item,
      flyer_url: item.flyer_path ? urls.get(item.flyer_path) ?? null : null,
    })) as PublicEvent[],
    photos: photos.map((item) => ({
      ...item,
      image_url: urls.get(item.storage_path) ?? "",
    })) as PublicGalleryPhoto[],
  };
});

async function assertPastoralStaff(supabase: SupabaseClient<Database>, userId: string) {
  const [admin, pastor] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "pastor" }),
  ]);
  if (admin.error || pastor.error || !(admin.data || pastor.data)) {
    throw new Error("You do not have permission to manage church content.");
  }
}

export const listManagedContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertPastoralStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [eventsResult, photosResult] = await Promise.all([
      supabaseAdmin.from("church_events").select("*").order("event_date", { ascending: true }),
      supabaseAdmin.from("gallery_photos").select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false }),
    ]);
    if (eventsResult.error) throw new Error(eventsResult.error.message);
    if (photosResult.error) throw new Error(photosResult.error.message);
    const urls = await getSignedUrls([
      ...(eventsResult.data ?? []).flatMap((item) => item.flyer_path ? [item.flyer_path] : []),
      ...(photosResult.data ?? []).map((item) => item.storage_path),
    ]);
    return {
      events: (eventsResult.data ?? []).map((item) => ({ ...item, flyer_url: item.flyer_path ? urls.get(item.flyer_path) ?? null : null })) as ManagedEvent[],
      photos: (photosResult.data ?? []).map((item) => ({ ...item, image_url: urls.get(item.storage_path) ?? "" })) as ManagedGalleryPhoto[],
    };
  });

export const createEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => eventInput.parse(input))
  .handler(async ({ context, data }) => {
    await assertPastoralStaff(context.supabase, context.userId);
    const { data: item, error } = await context.supabase.from("church_events").insert({
      title: data.title,
      theme: data.theme || null,
      description: data.description,
      event_date: data.eventDate,
      end_date: data.endDate || null,
      location: data.location,
      flyer_path: data.flyerPath || null,
      is_featured: data.isFeatured,
      is_published: data.isPublished,
      status: data.status,
    }).select("*").single();
    if (error) throw new Error(error.message);
    return item;
  });

export const updateEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), ...eventInput.shape }).parse(input))
  .handler(async ({ context, data }) => {
    await assertPastoralStaff(context.supabase, context.userId);
    const { id, ...event } = data;
    const { data: item, error } = await context.supabase.from("church_events").update({
      title: event.title,
      theme: event.theme || null,
      description: event.description,
      event_date: event.eventDate,
      end_date: event.endDate || null,
      location: event.location,
      flyer_path: event.flyerPath || null,
      is_featured: event.isFeatured,
      is_published: event.isPublished,
      status: event.status,
    }).eq("id", id).select("*").single();
    if (error) throw new Error(error.message);
    return item;
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), flyerPath: z.string().nullable().optional() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertPastoralStaff(context.supabase, context.userId);
    const { error } = await context.supabase.from("church_events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (data.flyerPath) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.storage.from("church-media").remove([data.flyerPath]);
    }
    return { ok: true };
  });

export const createGalleryPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => galleryInput.parse(input))
  .handler(async ({ context, data }) => {
    await assertPastoralStaff(context.supabase, context.userId);
    const { data: item, error } = await context.supabase.from("gallery_photos").insert({
      storage_path: data.storagePath,
      caption: data.caption || null,
      category: data.category,
      display_order: data.displayOrder,
      is_visible: data.isVisible,
    }).select("*").single();
    if (error) throw new Error(error.message);
    return item;
  });

export const updateGalleryPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), caption: z.string().trim().max(180).nullable(), category: z.string().trim().min(2).max(80), displayOrder: z.number().int().min(0).max(9999), isVisible: z.boolean() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertPastoralStaff(context.supabase, context.userId);
    const { id, ...photo } = data;
    const { data: item, error } = await context.supabase.from("gallery_photos").update({
      caption: photo.caption || null,
      category: photo.category,
      display_order: photo.displayOrder,
      is_visible: photo.isVisible,
    }).eq("id", id).select("*").single();
    if (error) throw new Error(error.message);
    return item;
  });

export const replaceGalleryPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), storagePath: z.string().regex(/^gallery\/[a-f0-9-]+\.(jpg|jpeg|png|webp)$/) }).parse(input))
  .handler(async ({ context, data }) => {
    await assertPastoralStaff(context.supabase, context.userId);
    const { data: existing, error: lookupError } = await context.supabase
      .from("gallery_photos").select("storage_path").eq("id", data.id).single();
    if (lookupError || !existing) throw new Error(lookupError?.message ?? "Photo not found.");
    const { data: item, error } = await context.supabase.from("gallery_photos")
      .update({ storage_path: data.storagePath }).eq("id", data.id).select("*").single();
    if (error) throw new Error(error.message);
    if (existing.storage_path !== data.storagePath) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.storage.from("church-media").remove([existing.storage_path]);
    }
    return item;
  });

export const deleteGalleryPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertPastoralStaff(context.supabase, context.userId);
    const { data: existing, error: lookupError } = await context.supabase
      .from("gallery_photos").select("storage_path").eq("id", data.id).single();
    if (lookupError || !existing) throw new Error(lookupError?.message ?? "Photo not found.");
    const { error } = await context.supabase.from("gallery_photos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.storage.from("church-media").remove([existing.storage_path]);
    return { ok: true };
  });