import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Lead = {
  id: string;
  request_id: string;
  full_name: string;
  corporate_email: string;
  company: string;
  scheduling_date: string;
  scheduling_time: string;
  scheduling_timezone_label: string | null;
  upstream_ok: boolean;
  upstream_status: number | null;
  upstream_error: string | null;
  created_at: string;
};

const Admin = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "queued" | "ok">("queued");

  useEffect(() => {
    document.title = "Admin · Lead Seller";

    // Set up listener FIRST (per Supabase guidance)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setSession(data.session);
      const { data: roleOk } = await supabase.rpc("has_role", {
        _user_id: data.session.user.id,
        _role: "admin",
      });
      setIsAdmin(Boolean(roleOk));
      setAuthChecked(true);
    });

    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const loadLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select(
        "id, request_id, full_name, corporate_email, company, scheduling_date, scheduling_time, scheduling_timezone_label, upstream_ok, upstream_status, upstream_error, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(500);
    setLoading(false);
    if (error) {
      toast({ title: "Failed to load leads", description: error.message, variant: "destructive" });
      return;
    }
    setLeads((data ?? []) as Lead[]);
  };

  useEffect(() => {
    if (isAdmin) loadLeads();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (filter === "queued" && l.upstream_ok) return false;
      if (filter === "ok" && !l.upstream_ok) return false;
      if (!q) return true;
      return (
        l.full_name.toLowerCase().includes(q) ||
        l.corporate_email.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.request_id.toLowerCase().includes(q)
      );
    });
  }, [leads, search, filter]);

  const handleResend = async (id: string) => {
    setResending(id);
    const { data, error } = await supabase.functions.invoke("lead-resend", {
      body: { lead_id: id },
    });
    setResending(null);
    if (error) {
      toast({ title: "Resend failed", description: error.message, variant: "destructive" });
      return;
    }
    if (data?.ok) {
      toast({ title: "Lead delivered", description: `Upstream responded ${data.status}` });
    } else {
      toast({
        title: "Upstream still failing",
        description: data?.error ?? `Status ${data?.status}`,
        variant: "destructive",
      });
    }
    loadLeads();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  if (!authChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="text-muted-foreground max-w-md">
          Your account is signed in but does not have the <code>admin</code> role.
          Ask another admin to grant it via the <code>user_roles</code> table.
        </p>
        <p className="text-xs text-muted-foreground">
          Signed in as {session?.user.email}
        </p>
        <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Lead Backup Admin</h1>
            <p className="text-sm text-muted-foreground">
              Inspect and re-send leads that didn't reach the upstream API gateway.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{session?.user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>Sign out</Button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search name, email, company, request id…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-1">
            {(["queued", "ok", "all"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "queued" ? "Queued (failed)" : f === "ok" ? "Delivered" : "All"}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={loadLeads} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
          <span className="ml-auto text-sm text-muted-foreground">
            {filtered.length} lead{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Scheduling</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No leads match the current filter.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{l.full_name}</div>
                    <div className="text-xs text-muted-foreground">{l.corporate_email}</div>
                  </TableCell>
                  <TableCell>{l.company}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {l.scheduling_date} {l.scheduling_time}
                    {l.scheduling_timezone_label ? ` ${l.scheduling_timezone_label}` : ""}
                  </TableCell>
                  <TableCell>
                    {l.upstream_ok ? (
                      <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Delivered</Badge>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <Badge variant="destructive">
                          {l.upstream_status ? `Failed ${l.upstream_status}` : "Queued"}
                        </Badge>
                        {l.upstream_error && (
                          <span className="text-xs text-muted-foreground max-w-xs truncate">
                            {l.upstream_error}
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={l.upstream_ok ? "outline" : "default"}
                      disabled={resending === l.id}
                      onClick={() => handleResend(l.id)}
                    >
                      {resending === l.id ? "Sending…" : l.upstream_ok ? "Re-send" : "Retry"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
};

export default Admin;
