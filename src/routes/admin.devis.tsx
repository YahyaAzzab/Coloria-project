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
import { Loader2, Trash2, Mail, Phone, MessageSquare, Inbox } from "lucide-react";
import { toast } from "sonner";
import { guardAdminRoute } from "@/lib/admin-auth.functions";

export const Route = createFileRoute("/admin/devis")({
  ssr: false,
  beforeLoad: guardAdminRoute,
  head: () => ({ meta: [{ title: "Admin — Devis" }, { name: "robots", content: "noindex,nofollow" }] }),
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
const STATUS_COLOR: Record<Status, string> = {
  new: "bg-blue-500", processing: "bg-amber-500", done: "bg-green-500",
};

function AdminQuotes() {
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [deleting, setDeleting] = useState<Quote | null>(null);
  const [filter, setFilter] = useState<Status | "all">("all");

  async function load() {
    const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
    if (error) { toast.error("Erreur"); return; }
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
    else { toast.success("Devis supprimé"); setDeleting(null); load(); }
  }

  const filtered = (quotes ?? []).filter((q) => filter === "all" || q.status === filter);

  return (
    <AdminShell title="Devis">
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "new", "processing", "done"] as const).map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
            {s === "all" ? "Tous" : STATUS_LABEL[s]}
          </Button>
        ))}
      </div>

      {quotes === null ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-background p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Aucun devis pour ce filtre.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <div key={q.id} className="rounded-lg border border-border bg-background p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${STATUS_COLOR[q.status]}`} />
                    <span className="font-medium">{q.name ?? "Sans nom"}</span>
                    <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {q.email && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {q.email}</span>}
                    {q.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {q.phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={q.status} onValueChange={(v) => setStatus(q, v as Status)}>
                    <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nouveau</SelectItem>
                      <SelectItem value="processing">En cours</SelectItem>
                      <SelectItem value="done">Traité</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => setDeleting(q)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              {q.message && (
                <div className="mt-3 flex gap-2 rounded-md bg-muted/50 p-3 text-sm">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="whitespace-pre-wrap">{q.message}</p>
                </div>
              )}
              {Array.isArray(q.items) && q.items.length > 0 && (
                <div className="mt-3 text-xs text-muted-foreground">
                  <span className="font-medium">Articles :</span>{" "}
                  {q.items.map((it: any, i: number) => (
                    <span key={i}>{i > 0 && ", "}{it.title ?? it.slug ?? JSON.stringify(it)}{it.qty ? ` ×${it.qty}` : ""}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce devis ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && handleDelete(deleting)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
