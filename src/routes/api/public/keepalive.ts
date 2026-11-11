import { createFileRoute } from "@tanstack/react-router";

// Daily ping that runs a tiny read so the Supabase project stays active.
export const Route = createFileRoute("/api/public/keepalive")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("church_events").select("id").limit(1);
        if (error) return Response.json({ ok: false }, { status: 500 });
        return Response.json({ ok: true, at: new Date().toISOString() });
      },
    },
  },
});
