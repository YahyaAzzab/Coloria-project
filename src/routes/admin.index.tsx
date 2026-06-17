import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Package, Inbox, ArrowRight } from "lucide-react";
import { guardAdminRoute } from "@/lib/admin-auth.functions";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  beforeLoad: guardAdminRoute,
  head: () => ({ meta: [{ title: "Admin — Tableau de bord" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminDashboard,
});

type Stats = { products: number; packs: number; newQuotes: number };

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const [p, k, q] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("packs").select("id", { count: "exact", head: true }),
        supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "new"),
      ]);
      setStats({ products: p.count ?? 0, packs: k.count ?? 0, newQuotes: q.count ?? 0 });
    }
    load();
  }, []);

  const cards = [
    { label: "Livres", value: stats?.products, to: "/admin/livres", icon: BookOpen },
    { label: "Packs", value: stats?.packs, to: "/admin/packs", icon: Package },
    { label: "Devis nouveaux", value: stats?.newQuotes, to: "/admin/devis", icon: Inbox },
  ] as const;

  return (
    <AdminShell title="Tableau de bord">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-lg border border-border bg-background p-6 transition-colors hover:border-primary/50"
          >
            <div className="flex items-center justify-between">
              <c.icon className="h-5 w-5 text-muted-foreground" />
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
            <div className="mt-4 text-3xl font-semibold tabular-nums">
              {c.value ?? "—"}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
        Bienvenue dans l'espace administrateur. Utilisez le menu pour gérer les livres, les packs, les devis reçus et les textes du site.
      </div>
    </AdminShell>
  );
}
