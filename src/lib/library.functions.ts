import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export const BOOK_CATEGORIES = ["school_of_disciples", "workers_in_training", "baptismal_class", "other"] as const;
export type BookCategory = (typeof BOOK_CATEGORIES)[number];

export const BOOK_CATEGORY_LABELS: Record<BookCategory, string> = {
  school_of_disciples: "School of Disciples",
  workers_in_training: "Workers in Training",
  baptismal_class: "Baptismal Class",
  other: "Other Study Material",
};

export interface LibraryBook {
  id: string;
  title: string;
  description: string | null;
  category: BookCategory;
  fileName: string;
  fileSize: number | null;
  downloadUrl: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
}

interface BookRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  is_visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

function toBook(row: BookRow, downloadUrl: string): LibraryBook {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: (BOOK_CATEGORIES as readonly string[]).includes(row.category) ? (row.category as BookCategory) : "other",
    fileName: row.file_name,
    fileSize: row.file_size,
    downloadUrl,
    isVisible: row.is_visible,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

async function signBookUrls(paths: string[]): Promise<Map<string, string>> {
  const empty = new Map<string, string>();
  if (paths.length === 0) return empty;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.storage.from("church-books").createSignedUrls(paths, 3600);
    if (error) throw new Error(error.message);
    return new Map(
      (data ?? []).flatMap((item, index) => (item.signedUrl ? [[paths[index]!, item.signedUrl] as const] : [])),
    );
  } catch (error) {
    console.error("[library] Unable to sign book URLs", error);
    return empty;
  }
}

async function assertLibraryStaff(supabase: SupabaseClient<Database>, userId: string) {
  const [admin, pastor] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "pastor" }),
  ]);
  if (admin.error || pastor.error || !(admin.data || pastor.data)) {
    throw new Error("You do not have permission to manage the library.");
  }
}

export const listPublicBooks = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Supabase is not configured.");
  const publicClient = createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await publicClient
    .from("library_books")
    .select("*")
    .eq("is_visible", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as BookRow[];
  const urls = await signBookUrls(rows.map((row) => row.storage_path));
  return rows.map((row) => toBook(row, urls.get(row.storage_path) ?? ""));
});

export const listManagedBooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertLibraryStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("library_books")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as unknown as BookRow[];
    const urls = await signBookUrls(rows.map((row) => row.storage_path));
    return rows.map((row) => toBook(row, urls.get(row.storage_path) ?? ""));
  });

const bookInput = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional().nullable(),
  category: z.enum(BOOK_CATEGORIES),
  storagePath: z.string().trim().min(3).max(500),
  fileName: z.string().trim().min(1).max(255),
  fileSize: z.number().int().min(0).max(52_428_800).nullable(),
  isVisible: z.boolean().default(true),
  displayOrder: z.number().int().min(0).max(9999).default(0),
});

export const createBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => bookInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertLibraryStaff(context.supabase, context.userId);
    const { error } = await context.supabase.from("library_books").insert({
      title: data.title,
      description: data.description || null,
      category: data.category,
      storage_path: data.storagePath,
      file_name: data.fileName,
      file_size: data.fileSize,
      is_visible: data.isVisible,
      display_order: data.displayOrder,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        isVisible: z.boolean().optional(),
        displayOrder: z.number().int().min(0).max(9999).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertLibraryStaff(context.supabase, context.userId);
    const patch: Record<string, unknown> = {};
    if (data.isVisible !== undefined) patch["is_visible"] = data.isVisible;
    if (data.displayOrder !== undefined) patch["display_order"] = data.displayOrder;
    const { error } = await context.supabase.from("library_books").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertLibraryStaff(context.supabase, context.userId);
    const { data: item, error } = await context.supabase
      .from("library_books")
      .select("storage_path")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const { error: delErr } = await context.supabase.from("library_books").delete().eq("id", data.id);
    if (delErr) throw new Error(delErr.message);
    const storagePath = (item as { storage_path: string } | null)?.storage_path;
    if (storagePath) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: rmErr } = await supabaseAdmin.storage.from("church-books").remove([storagePath]);
      if (rmErr) console.error("[library] Unable to remove book file", rmErr);
    }
    return { ok: true };
  });
