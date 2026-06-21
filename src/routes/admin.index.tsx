import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Package, Inbox, ArrowRight, ShieldCheck, Phone, CheckCircle2, AlertCircle, Clock, Search } from "lucide-react";
import { guardAdminRoute } from "@/lib/admin-auth.functions";
import { ensureBucketsExist } from "@/lib/api/storage.functions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  beforeLoad: guardAdminRoute,
  head: () => ({ meta: [{ title: "Admin — Tableau de bord" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminDashboard,
});

type Stats = { products: number; packs: number; newQuotes: number };
type RecentQuote = { id: string; name: string; email: string | null; phone: string | null; created_at: string; status: string; items: any };

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 1000;
    let startTime: number | null = null;
    
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{count}</span>;
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<RecentQuote[]>([]);
  const [systemReady, setSystemReady] = useState(false);

  useEffect(() => {
    async function load() {
      ensureBucketsExist().then(res => {
        if (res.ok) setSystemReady(true);
        else toast.error("Erreur de configuration du stockage: " + res.error);
      });

      const [p, k, q, recent] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("packs").select("id", { count: "exact", head: true }),
        supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("quotes").select("id, name, email, phone, created_at, status, items").order("created_at", { ascending: false }).limit(6),
      ]);
      setStats({ products: p.count ?? 0, packs: k.count ?? 0, newQuotes: q.count ?? 0 });
      if (recent.data) setRecentQuotes(recent.data);
    }
    load();
  }, []);

  const cards = [
    { label: "Livres actifs", value: stats?.products, to: "/admin/livres", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100/50", border: "border-blue-100" },
    { label: "Packs créés", value: stats?.packs, to: "/admin/packs", icon: Package, color: "text-purple-600", bg: "bg-purple-100/50", border: "border-purple-100" },
    { label: "Nouvelles commandes", value: stats?.newQuotes, to: "/admin/devis", icon: Inbox, color: "text-orange-600", bg: "bg-orange-100/50", border: "border-orange-100" },
  ] as const;

  return (
    <AdminShell title="Tableau de bord">
      
      {/* SYSTEM STATUS BANNER */}
      <div className={`mb-8 flex items-center justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-500 animate-in fade-in slide-in-from-top-4 ${
        systemReady ? "bg-emerald-50/50 border-emerald-100" : "bg-amber-50/50 border-amber-100"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-inner ${
            systemReady ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
          }`}>
            {systemReady ? <ShieldCheck className="h-6 w-6" /> : <AlertCircle className="h-6 w-6 animate-pulse" />}
          </div>
          <div>
            <h3 className={`font-semibold ${systemReady ? "text-emerald-900" : "text-amber-900"}`}>
              {systemReady ? "Système optimal" : "Vérification en cours..."}
            </h3>
            <p className={`text-sm ${systemReady ? "text-emerald-700" : "text-amber-700"}`}>
              {systemReady ? "Les bases de données et le stockage sont parfaitement configurés." : "Configuration automatique de l'espace de stockage."}
            </p>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <Link
            key={c.to}
            to={c.to}
            className={`group relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${c.border}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full blur-3xl opacity-50 ${c.bg} transition-transform group-hover:scale-150`} />
            <div className="relative z-10 flex items-center justify-between">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${c.bg} ${c.color} shadow-sm`}>
                <c.icon className="h-7 w-7" />
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm text-slate-400 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                 <ArrowRight className="h-5 w-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </div>
            <div className="relative z-10 mt-6">
              <div className="text-4xl font-serif font-semibold text-slate-900">
                {stats ? <AnimatedCounter value={c.value ?? 0} /> : "—"}
              </div>
              <div className="mt-2 text-sm font-medium text-slate-500">{c.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* RECENT ORDERS */}
      <div className="mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif font-semibold text-slate-900">Commandes récentes</h2>
            <p className="text-sm text-slate-500 mt-1">Les 6 dernières commandes reçues sur le site.</p>
          </div>
          <Button asChild variant="outline" className="rounded-xl hidden sm:flex">
             <Link to="/admin/devis">Tout voir</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentQuotes.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <Inbox className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">Aucune commande pour le moment.</p>
            </div>
          ) : (
            recentQuotes.map((q, i) => (
              <Link 
                key={q.id} 
                to="/admin/devis"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      q.status === 'new' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20' : 
                      q.status === 'processing' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20' : 
                      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                    }`}>
                      {q.status === 'new' && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />}
                      {q.status === 'new' ? 'Nouveau' : q.status === 'processing' ? 'En cours' : 'Traité'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(q.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h4 className="font-medium text-slate-900 group-hover:text-primary transition-colors">{q.name}</h4>
                  <div className="mt-2.5 flex items-center gap-4 text-xs text-slate-500">
                    {q.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> {q.phone}</span>}
                    <span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5 text-slate-400" /> {Array.isArray(q.items) ? q.items.length : 0} article(s)</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}
