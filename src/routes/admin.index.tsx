import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Package, Inbox, ArrowRight, ShieldCheck, Mail, Phone } from "lucide-react";
import { guardAdminRoute } from "@/lib/admin-auth.functions";
import { ensureBucketsExist } from "@/lib/api/storage.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  beforeLoad: guardAdminRoute,
  head: () => ({ meta: [{ title: "Admin — Tableau de bord" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminDashboard,
});

type Stats = { products: number; packs: number; newQuotes: number };
type RecentQuote = { id: string; name: string; email: string | null; phone: string | null; created_at: string; status: string; items: any };

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<RecentQuote[]>([]);
  const [systemReady, setSystemReady] = useState(false);

  useEffect(() => {
    async function load() {
      // Auto-configure missing buckets
      ensureBucketsExist().then(res => {
        if (res.ok) setSystemReady(true);
        else toast.error("Erreur de configuration du stockage: " + res.error);
      });

      const [p, k, q, recent] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("packs").select("id", { count: "exact", head: true }),
        supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("quotes").select("id, name, email, phone, created_at, status, items").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({ products: p.count ?? 0, packs: k.count ?? 0, newQuotes: q.count ?? 0 });
      if (recent.data) setRecentQuotes(recent.data);
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

      <div className="mt-8 rounded-lg border border-dashed border-border bg-background p-6">
        <div className="flex items-center gap-2 mb-4">
          {systemReady ? (
            <span className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full"><ShieldCheck className="w-4 h-4" /> Stockage configuré et prêt</span>
          ) : (
            <span className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full"><div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" /> Vérification du système...</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Bienvenue dans l'espace administrateur. Utilisez le menu pour gérer les livres, les packs, les devis reçus et les textes du site.</p>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Dernières commandes</h2>
          <Link to="/admin/devis" className="text-sm text-primary hover:underline">Voir tout</Link>
        </div>
        <div className="space-y-3">
          {recentQuotes.length === 0 ? (
            <div className="rounded-md border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">Aucune commande pour le moment.</div>
          ) : (
            recentQuotes.map((q) => (
              <div key={q.id} className="rounded-lg border border-border bg-background p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${q.status === 'new' ? 'bg-blue-500' : q.status === 'processing' ? 'bg-amber-500' : 'bg-green-500'}`} />
                    <span className="font-medium">{q.name}</span>
                    <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                    {q.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {q.phone}</span>}
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {Array.isArray(q.items) ? q.items.length : 0} article(s)</span>
                  </div>
                </div>
                <Link to="/admin/devis" className="text-sm bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-md transition-colors">Gérer</Link>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}
