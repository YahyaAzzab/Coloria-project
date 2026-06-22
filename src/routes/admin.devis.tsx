import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Mail, Phone, MessageSquare, Inbox, Search, Calendar, Package } from "lucide-react";
import { toast } from "sonner";
import { guardAdminRoute } from "@/lib/admin-auth.functions";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/devis")({
  ssr: false,
  beforeLoad: guardAdminRoute,
  head: () => ({ meta: [{ title: "Admin — Commandes" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminQuotes,
});

type Status = "new" | "processing" | "done";
type Quote = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  items: any;
  status: Status;
  created_at: string;
};

const STATUS_LABEL: Record<Status, string> = {
  new: "Nouveau", processing: "En cours", done: "Traité",
};
const STATUS_COLORS = {
  new: "bg-blue-50 text-blue-700 ring-blue-600/20",
  processing: "bg-amber-50 text-amber-700 ring-amber-600/20",
  done: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

function AdminQuotes() {
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [deleting, setDeleting] = useState<Quote | null>(null);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");

  async function load() {
    const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
    if (error) { toast.error("Erreur de chargement"); return; }
    setQuotes(data as Quote[]);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(q: Quote, s: Status) {
    const { error } = await supabase.from("quotes").update({ status: s }).eq("id", q.id);
    if (error) toast.error(error.message);
    else { toast.success("Statut mis à jour"); load(); }
  }
  async function handleDelete(q: Quote) {
    const { error } = await supabase.from("quotes").delete().eq("id", q.id);
    if (error) toast.error(error.message);
    else { toast.success("Commande supprimée"); setDeleting(null); load(); }
  }

  const filtered = (quotes ?? []).filter((q) => {
    if (filter !== "all" && q.status !== filter) return false;
    if (search) {
      const term = search.toLowerCase();
      if (!q.name?.toLowerCase().includes(term) && !q.phone?.includes(term) && !q.email?.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  return (
    <AdminShell title="Commandes">
      
      {/* FILTERS & SEARCH */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-4">
        <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-xl border shadow-sm">
          {(["all", "new", "processing", "done"] as const).map((s) => (
            <button 
              key={s} 
              onClick={() => setFilter(s)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                filter === s 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s === "all" ? "Toutes" : STATUS_LABEL[s]}
              {quotes && s !== "all" && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${filter === s ? "bg-white/20" : "bg-slate-200"}`}>
                  {quotes.filter(q => q.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Rechercher un client, téléphone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-slate-200 rounded-xl shadow-sm focus-visible:ring-primary/20"
          />
        </div>
      </div>

      {quotes === null ? (
        <div className="grid place-items-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm animate-in fade-in">
          <div className="mx-auto h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <Inbox className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Aucune commande trouvée</h3>
          <p className="mt-2 text-slate-500">Essayez de modifier vos filtres de recherche.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 animate-in fade-in duration-500">
          {filtered.map((q) => (
            <div key={q.id} className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:border-primary/30 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${STATUS_COLORS[q.status]}`}>
                    {q.status === 'new' && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />}
                    {STATUS_LABEL[q.status]}
                  </div>
                  <Select value={q.status} onValueChange={(v) => setStatus(q, v as Status)}>
                    <SelectTrigger className="h-8 w-[130px] bg-slate-50/50 border-slate-200 text-xs font-medium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nouveau</SelectItem>
                      <SelectItem value="processing">En cours</SelectItem>
                      <SelectItem value="done">Traité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <h3 className="text-lg font-serif font-semibold text-slate-900 leading-tight">
                  {q.name ?? "Client anonyme"}
                </h3>
                
                <div className="mt-4 space-y-2.5 text-sm text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{new Date(q.created_at).toLocaleString("fr-FR", { dateStyle: 'long', timeStyle: 'short' })}</span>
                  </div>
                  {q.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <a href={`tel:${q.phone}`} className="hover:text-primary hover:underline">{q.phone}</a>
                    </div>
                  )}
                  {q.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <a href={`mailto:${q.email}`} className="hover:text-primary hover:underline truncate">{q.email}</a>
                    </div>
                  )}
                </div>

                {q.message && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-100 relative">
                    <MessageSquare className="absolute top-4 right-4 h-4 w-4 text-slate-300" />
                    <p className="text-sm text-slate-600 italic whitespace-pre-wrap pr-6">"{q.message}"</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-end justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    <Package className="h-3.5 w-3.5" /> Articles commandés
                  </div>
                  {Array.isArray(q.items) && q.items.length > 0 ? (
                    <ul className="space-y-3">
                      {q.items.map((it: any, i: number) => (
                        <li key={i} className="flex gap-3 items-start">
                          {it.image ? (
                            <img src={it.image} alt={it.title} className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                              <Package className="h-5 w-5 text-slate-300" />
                            </div>
                          )}
                          <div className="flex-1 flex flex-col justify-center min-w-0">
                            <div className="flex items-start gap-2">
                              <span className="text-primary font-medium shrink-0">{it.qty ? `${it.qty}x` : "1x"}</span>
                              <span className="text-sm text-slate-700 font-medium truncate">{it.title ?? it.slug ?? JSON.stringify(it)}</span>
                            </div>
                            {it.subtitle && !it.customPack?.bookTitles && (
                              <span className="text-xs text-slate-500 truncate ml-[1.6rem]">{it.subtitle}</span>
                            )}
                            {it.customPack?.bookTitles && (
                              <ul className="mt-1 ml-[1.6rem] space-y-0.5">
                                {it.customPack.bookTitles.map((bTitle: string, idx: number) => (
                                  <li key={idx} className="text-xs text-slate-500 flex items-center gap-1.5 before:content-['•'] before:text-slate-300">
                                    {bTitle}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-slate-400">Aucun détail</span>
                  )}
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setDeleting(q)}
                  className="shrink-0 h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-serif">Supprimer la commande ?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Êtes-vous sûr de vouloir supprimer définitivement la commande de <span className="font-semibold text-slate-900">{deleting?.name}</span> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 mt-4">
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleting && handleDelete(deleting)} 
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              Oui, supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
