import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { StaffNav } from "@/components/site/staff-nav";
import { STAFF_ROLES, createUser, deleteUser, listUsers, setUserRole, type ManagedUser, type StaffRole } from "@/lib/users.functions";

export const Route = createFileRoute("/_authenticated/users-admin")({
  head: () => ({
    meta: [
      { title: "Users & Roles — RCCG The Master's Place" },
      { name: "description", content: "Create staff accounts and assign roles." },
      { property: "og:title", content: "Users & Roles — RCCG The Master's Place" },
      { property: "og:description", content: "Create staff accounts and assign roles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UsersAdminPage,
});

const ROLE_LABELS: Record<StaffRole, string> = { admin: "Admin", pastor: "Pastor", moderator: "Moderator", user: "Member" };

function UsersAdminPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("pastor");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { setUsers(await listUsers()); } catch (e) { toast.error(e instanceof Error ? e.message : "Unable to load users."); }
  };
  useEffect(() => { void load(); }, []);

  const onCreate = async () => {
    setBusy(true);
    try {
      await createUser({ data: { email, password, role } });
      toast.success("User created. Share the email and password with them.");
      setEmail(""); setPassword("");
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Unable to create user."); }
    finally { setBusy(false); }
  };

  return (
    <PageShell>
      <StaffNav />
      <PageHeader eyebrow="Staff workspace" title="Users & Roles" description="Create accounts for workers and choose what each person can manage. Only admins can use this page." />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="panel space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold">Create a user</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2"><Label htmlFor="u-email">Email</Label><Input id="u-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="u-pass">Password (min 8 characters)</Label><Input id="u-pass" type="text" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAFF_ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Admins manage everything including users. Pastors manage pastoral care, events, gallery, exams and books.</p>
          <Button onClick={() => void onCreate()} disabled={busy || !email.trim() || password.length < 8}>
            <UserPlus className="size-4" /> {busy ? "Creating…" : "Create user"}
          </Button>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold">All users</h2>
          {users.map((u) => (
            <div key={u.id} className="panel flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{u.email}</p>
                <p className="text-xs text-muted-foreground">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {STAFF_ROLES.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={u.roles.includes(r)}
                      onCheckedChange={async (v) => {
                        try { await setUserRole({ data: { userId: u.id, role: r, enabled: v === true } }); await load(); }
                        catch (e) { toast.error(e instanceof Error ? e.message : "Unable to update role."); }
                      }}
                    />
                    {ROLE_LABELS[r]}
                  </label>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={async () => {
                if (!window.confirm(`Delete ${u.email} permanently?`)) return;
                try { await deleteUser({ data: { userId: u.id } }); toast.success("User deleted."); await load(); }
                catch (e) { toast.error(e instanceof Error ? e.message : "Unable to delete user."); }
              }}><Trash2 className="size-4" /> Delete</Button>
            </div>
          ))}
        </section>
      </div>
    </PageShell>
  );
}
