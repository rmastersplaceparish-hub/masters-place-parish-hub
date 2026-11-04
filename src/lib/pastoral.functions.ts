import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database, Tables } from "@/integrations/supabase/types";

type PastoralSubmission = Tables<"pastoral_submissions">;
type PastoralMessage = Tables<"pastoral_messages">;

const isPastoralStaff = async (
  supabase: SupabaseClient<Database>,
  userId: string,
) => {
  const [admin, pastor] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "pastor" }),
  ]);
  if (admin.error || pastor.error) throw new Error("Unable to verify pastoral access.");
  return Boolean(admin.data || pastor.data);
};

export const listPastoralSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isPastoralStaff(context.supabase, context.userId))) {
      throw new Error("You do not have permission to open pastoral care.");
    }

    const { data, error } = await context.supabase
      .from("pastoral_submissions")
      .select("id, category, title, status, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Array<Pick<PastoralSubmission, "id" | "category" | "title" | "status" | "created_at" | "updated_at">>;
  });

export const getPastoralThread = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { submissionId: string }) => z.object({ submissionId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    if (!(await isPastoralStaff(context.supabase, context.userId))) {
      throw new Error("You do not have permission to open pastoral care.");
    }

    const [{ data: submission, error: submissionError }, { data: messages, error: messagesError }] =
      await Promise.all([
        context.supabase
          .from("pastoral_submissions")
          .select("id, category, title, status, created_at, updated_at")
          .eq("id", data.submissionId)
          .single(),
        context.supabase
          .from("pastoral_messages")
          .select("id, submission_id, sender_type, message, created_at")
          .eq("submission_id", data.submissionId)
          .order("created_at", { ascending: true }),
      ]);

    if (submissionError) throw new Error(submissionError.message);
    if (messagesError) throw new Error(messagesError.message);
    return { submission, messages: (messages ?? []) as PastoralMessage[] };
  });

export const replyAsPastor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { submissionId: string; message: string }) =>
    z
      .object({ submissionId: z.string().uuid(), message: z.string().trim().min(1).max(10000) })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    if (!(await isPastoralStaff(context.supabase, context.userId))) {
      throw new Error("You do not have permission to reply to pastoral threads.");
    }

    const { error: messageError } = await context.supabase.from("pastoral_messages").insert({
      submission_id: data.submissionId,
      sender_type: "pastor",
      message: data.message,
    });
    if (messageError) throw new Error(messageError.message);

    const { error: statusError } = await context.supabase
      .from("pastoral_submissions")
      .update({ status: "responded" })
      .eq("id", data.submissionId);
    if (statusError) throw new Error(statusError.message);
    return { success: true };
  });

export const updatePastoralStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { submissionId: string; status: Database["public"]["Enums"]["pastoral_submission_status"] }) =>
    z.object({
      submissionId: z.string().uuid(),
      status: z.enum(["pending", "in_review", "responded", "resolved"]),
    }).parse(input),
  )
  .handler(async ({ context, data }) => {
    if (!(await isPastoralStaff(context.supabase, context.userId))) {
      throw new Error("You do not have permission to update pastoral threads.");
    }

    const { error } = await context.supabase
      .from("pastoral_submissions")
      .update({ status: data.status })
      .eq("id", data.submissionId);
    if (error) throw new Error(error.message);
    return { success: true };
  });
export const deletePastoralThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { submissionId: string }) => z.object({ submissionId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    if (!(await isPastoralStaff(context.supabase, context.userId))) {
      throw new Error("You do not have permission to delete pastoral threads.");
    }
    const { error } = await context.supabase.from("pastoral_submissions").delete().eq("id", data.submissionId);
    if (error) throw new Error(error.message);
    return { success: true };
  });
