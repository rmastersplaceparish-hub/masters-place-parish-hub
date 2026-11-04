import { Link, useRouter } from "@tanstack/react-router";
import { CalendarDays, HeartHandshake, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const tabClass =
  "focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground";

/** Navigation shown to signed-in pastoral staff across the staff workspace pages. */
export function StaffNav() {
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    await router.navigate({ to: "/auth" });
  };

  return (
    <div className="border-b border-border bg-background">
      <nav
        aria-label="Staff workspace"
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6 lg:px-8"
      >
        <Link to="/pastoral-care" className={tabClass}>
          <HeartHandshake className="size-4" /> Pastoral Care
        </Link>
        <Link to="/content" className={tabClass}>
          <CalendarDays className="size-4" /> Events &amp; Gallery
        </Link>
        <button
          onClick={() => void signOut()}
          className="focus-ring ml-auto inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </nav>
    </div>
  );
}
