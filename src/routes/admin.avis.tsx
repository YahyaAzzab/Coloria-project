import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2, ImageIcon, EyeOff, MessageSquareQuote, User } from "lucide-react";
import { toast } from "sonner";
import { guardAdminRoute } from "@/lib/admin-auth.functions";
import { ImagePicker } from "@/components/admin/ImagePicker";

export const Route = createFileRoute("/admin/avis")({
  ssr: false,
  beforeLoad: guardAdminRoute,
  head: () => ({ meta: [{ title: "Admin — Avis" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminTestimonials,
});

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  text: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number | null;
};

const empty = (): Testimonial => ({
  id: "",
  name: "",
  role: "",
  text: "",
  image_url: "",
  is_active: true,
  sort_order: 0,
});

function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[] | null>(null);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) { toast.error("Erreur de chargement"); return; }
    setItems(data as Testimonial[]);
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(t: Testimonial) {
    const { error } = await supabase.from("testimonials").delete().eq("id", t.id);
    if (error) toast.error(error.message);
    else { toast.success("Avis supprimé"); setDeleting(null); load(); }
  }

  return (
    <AdminShell title="Avis clients">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-4">
        <p className="text-sm text-slate-500 max-w-lg">
          Gérez les témoignages affichés sur la page d'accueil. Vous pouvez ajouter du texte, une photo du client ou même une capture d'écran de conversation WhatsApp.
        </p>
        <Button onClick={() => setEditing(empty())} className="rounded-xl shadow-md whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" /> Nouvel avis
        </Button>
      </div>

      {items === null ? (
        <div className="grid place-items-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm animate-in fade-in">
          <div className="mx-auto h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <MessageSquareQuote className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Aucun avis client</h3>
          <p className="mt-2 text-slate-500">Ajoutez les premiers retours de vos clients pour rassurer vos visiteurs.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500">
          {items.map((t, i) => (
            <div key={t.id} className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${!t.is_active ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:border-primary/30'}`} style={{ animationDelay: `${i * 100}ms` }}>
              
              {!t.is_active && (
                <div className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/80 p-1.5 text-white backdrop-blur-md shadow-sm">
                  <EyeOff className="h-4 w-4" />
                </div>
              )}

              {t.image_url ? (
                <div className="aspect-square w-full overflow-hidden bg-slate-100">
                  <img src={t.image_url} alt={t.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              ) : (
                <div className="flex aspect-[3/1] w-full items-center justify-center bg-slate-50 border-b border-slate-100">
                   <MessageSquareQuote className="h-8 w-8 text-slate-300" />
                </div>
              )}
              
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 leading-none">{t.name}</h3>
                    {t.role && <p className="text-xs text-slate-500 mt-1">{t.role}</p>}
                  </div>
                </div>

                {t.text && (
                  <p className="text-sm text-slate-600 italic line-clamp-4 relative z-10 flex-1">
                    "{t.text}"
                  </p>
                )}

                <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <Button size="sm" variant="outline" className="rounded-lg text-slate-500 hover:text-primary hover:border-primary/30" onClick={() => setEditing(t)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Modifier
                  </Button>
                  <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200" onClick={() => setDeleting(t)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Editor item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-serif">Supprimer cet avis ?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              L'avis de « <span className="font-semibold text-slate-900">{deleting?.name}</span> » sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 mt-4">
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && handleDelete(deleting)} className="rounded-xl bg-red-600 text-white hover:bg-red-700">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

function Editor({ item, onClose, onSaved }: { item: Testimonial; onClose: () => void; onSaved: () => void }) {
  const isNew = !item.id;
  const [form, setForm] = useState<Testimonial>(item);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Testimonial>(k: K, v: Testimonial[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.name.trim()) { toast.error("Le nom est requis"); return; }
    if (!form.text?.trim() && !form.image_url?.trim()) {
      toast.error("Ajoutez un texte ou une image");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      role: form.role?.trim() || null,
      text: form.text?.trim() || null,
      image_url: form.image_url?.trim() || null,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = isNew
      ? await supabase.from("testimonials").insert(payload)
      : await supabase.from("testimonials").update(payload).eq("id", form.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isNew ? "Avis ajouté" : "Avis mis à jour");
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0 border-slate-200">
        <div className="bg-slate-50 border-b border-slate-100 p-6 sticky top-0 z-10">
          <DialogTitle className="text-xl font-serif">{isNew ? "Nouvel avis" : "Modifier l'avis"}</DialogTitle>
        </div>
        
        <div className="p-6 grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <Field label="Nom complet"><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="rounded-lg" /></Field>
            <Field label="Rôle / Lieu (ex: Maman de 2 enfants)"><Input value={form.role ?? ""} onChange={(e) => set("role", e.target.value)} className="rounded-lg" /></Field>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-6">
            <Field label="Message du client">
              <Textarea rows={4} value={form.text ?? ""} onChange={(e) => set("text", e.target.value)} placeholder="Ce que le client a pensé du produit..." className="rounded-lg resize-y" />
            </Field>
            <Field label="Photo du client ou capture d'écran WhatsApp">
              <ImagePicker value={form.image_url ?? ""} onChange={(v) => set("image_url", v)} />
            </Field>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <Field label="Ordre d'affichage"><Input type="number" value={form.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} className="rounded-lg" /></Field>
            <div className="flex items-center gap-3 pt-8">
              <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} id="is-active-avis" />
              <Label htmlFor="is-active-avis" className="text-sm font-medium cursor-pointer">Visible sur le site</Label>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 border-t border-slate-100 p-6 sticky bottom-0 z-10 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Annuler</Button>
          <Button onClick={save} disabled={saving} className="rounded-xl shadow-md">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Enregistrer l'avis
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {children}
    </div>
  );
}
