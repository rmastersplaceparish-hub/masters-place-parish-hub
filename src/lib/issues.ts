import { supabase } from "@/integrations/supabase/client";

export interface ThreadMessage {
  id: string;
  sender_type: "visitor" | "pastor";
  message: string;
  created_at: string;
}

export interface ThreadData {
  found: boolean;
  submission?: {
    id: string;
    category: string;
    title: string;
    status: string;
    created_at: string;
  };
  messages?: ThreadMessage[];
}

// These database routines are not part of the generated types yet.
const rpc = (
  supabase as unknown as {
    rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
  }
).rpc.bind(supabase);

export async function submitIssue(data: {
  category: string;
  title: string;
  message: string;
}): Promise<{ success: boolean; accessCode: string }> {
  const { data: result, error } = await rpc("submit_issue", {
    p_category: data.category,
    p_title: data.title,
    p_message: data.message,
  });

  if (error) throw new Error(error.message);

  const parsed = result as unknown as { access_code: string; submission_id: string };
  return { success: true, accessCode: parsed.access_code };
}

export async function getThreadByCode(accessCode: string): Promise<ThreadData> {
  const { data, error } = await rpc("get_thread_by_code", {
    p_access_code: accessCode,
  });

  if (error) throw new Error(error.message);
  return data as unknown as ThreadData;
}

export async function replyToThread(
  accessCode: string,
  message: string,
): Promise<{ success: boolean }> {
  const { data, error } = await rpc("reply_to_thread", {
    p_access_code: accessCode,
    p_message: message,
  });

  if (error) throw new Error(error.message);
  const parsed = data as unknown as { success: boolean; error?: string };
  if (!parsed.success) throw new Error(parsed.error || "Failed to send reply");
  return { success: true };
}

export function subscribeToMessages(
  submissionId: string,
  callback: (msg: ThreadMessage) => void,
) {
  const channel = supabase
    .channel(`messages-${submissionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "pastoral_messages",
        filter: `submission_id=eq.${submissionId}`,
      },
      (payload) => {
        callback(payload.new as ThreadMessage);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
