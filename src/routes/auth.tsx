import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Pastoral Staff Sign In — RCCG The Master's Place" },
      { name: "description", content: "Sign in to the private pastoral care workspace." },
      { property: "og:title", content: "Pastoral Staff Sign In — RCCG The Master's Place" },
      { property: "og:description", content: "Private access for approved pastoral care staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Enter your email and password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in securely.");
    await navigate({ to: "/pastoral-care" });
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Pastoral care"
        title="Staff sign in"
        description="This private area is for approved church leadership only."
      />
      <section className="bg-background py-14 lg:py-20">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <form onSubmit={signIn} className="panel space-y-6 p-6 sm:p-8">
            <div className="flex items-start gap-3 rounded-md border border-border bg-secondary p-4">
              <LockKeyhole className="mt-0.5 size-5 shrink-0 text-accent" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Use the email and password provided for your pastoral staff account.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-email">Email</Label>
              <Input
                id="staff-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-password">Password</Label>
              <Input
                id="staff-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight className="size-4" />
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Need access? <Link className="text-foreground underline underline-offset-4" to="/">Contact church leadership.</Link>
            </p>
          </form>
        </div>
      </section>
    </PageShell>
  );
}