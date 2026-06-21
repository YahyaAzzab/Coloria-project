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
import { Loader2, Plus, Pencil, Trash2, EyeOff, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { guardAdminRoute } from "@/lib/admin-auth.functions";

export const Route = createFileRoute("/admin/categories")({
  ssr: false,
  beforeLoad: guardAdminRoute,
  head: () => ({ meta: [{ title: "Admin — Catégories" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminCategories,
});

type Category = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

const emptyCategory = (): Category => ({
  id: "",
  slug: "",
  title: "",
  description: "",
  sort_order: 0,
  is_active: true,
});

function AdminCategories() {
  const [items, setItems] = useState<Category[] | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) { toast.error("Erreur de chargement"); return; }
    setItems(data as Category[]);
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(c: Category) {
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) toast.error("Impossible de supprimer cette catégorie car des livres y sont associés. Modifiez les livres d'abord.");
    else { toast.success("Catégorie supprimée"); setDeleting(null); load(); }
  }

  return (
    <AdminShell title="Univers & Catégories">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-4">
        <p className="text-sm text-slate-500 max-w-lg">
          Gérez les différents univers de coloriage (ex: Enfants, Ados, Mandalas...). Les livres pourront y être rattachés.
        </p>
        <Button onClick={() => setEditing(emptyCategory())} className="rounded-xl shadow-md whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" /> Nouvelle catégorie
        </Button>
      </div>

      {items === null ? (
        <div className="grid place-items-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm animate-in fade-in">
          <div className="mx-auto h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <FolderTree className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Aucune catégorie</h3>
          <p className="mt-2 text-slate-500">Créez votre première catégorie pour y ranger vos livres.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500">
          {items.map((c, i) => (
            <div key={c.id} className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${!c.is_active ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:border-primary/30'}`} style={{ animationDelay: `${i * 100}ms` }}>
              
              {!c.is_active && (
                <div className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/80 p-1.5 text-white backdrop-blur-md shadow-sm">
                  <EyeOff className="h-4 w-4" />
                </div>
              )}

              <div className="flex aspect-[3/1] w-full items-center justify-center bg-slate-50 border-b border-slate-100">
                  <FolderTree className="h-8 w-8 text-slate-300" />
              </div>
              
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.slug}</div>
                </div>

                <h3 className="font-semibold text-slate-900 leading-none mb-2">{c.title}</h3>
                
                {c.description && (
                  <p className="text-sm text-slate-600 line-clamp-3 relative z-10 flex-1">
                    {c.description}
                  </p>
                )}

                <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <Button size="sm" variant="outline" className="rounded-lg text-slate-500 hover:text-primary hover:border-primary/30" onClick={() => setEditing(c)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Modifier
                  </Button>
                  <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200" onClick={() => setDeleting(c)}>
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
            <AlertDialogTitle className="text-center text-xl font-serif">Supprimer cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              La catégorie « <span className="font-semibold text-slate-900">{deleting?.title}</span> » sera définitivement supprimée. Les livres associés pourraient se retrouver sans catégorie.
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

function Editor({ item, onClose, onSaved }: { item: Category; onClose: () => void; onSaved: () => void }) {
  const isNew = !item.id;
  const [form, setForm] = useState<Category>(item);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Category>(k: K, v: Category[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.title.trim() || !form.slug.trim()) { toast.error("Le titre et le slug sont requis"); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      description: form.description?.trim() || null,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = isNew
      ? await supabase.from("categories").insert(payload)
      : await supabase.from("categories").update(payload).eq("id", form.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isNew ? "Catégorie créée" : "Catégorie mise à jour");
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0 border-slate-200">
        <div className="bg-slate-50 border-b border-slate-100 p-6 sticky top-0 z-10">
          <DialogTitle className="text-xl font-serif">{isNew ? "Nouvelle catégorie" : "Modifier la catégorie"}</DialogTitle>
        </div>
        
        <div className="p-6 grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <Field label="Titre (ex: Mandalas)"><Input value={form.title} onChange={(e) => set("title", e.target.value)} className="rounded-lg" /></Field>
            <Field label="Slug (URL, ex: mandalas)"><Input value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className="rounded-lg" /></Field>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <Field label="Description">
              <Textarea rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Description affichée sur la page de l'univers..." className="rounded-lg resize-y" />
            </Field>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <Field label="Ordre d'affichage"><Input type="number" value={form.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} className="rounded-lg" /></Field>
            <div className="flex items-center gap-3 pt-8">
              <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} id="is-active-cat" />
              <Label htmlFor="is-active-cat" className="text-sm font-medium cursor-pointer">Visible sur le site</Label>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 border-t border-slate-100 p-6 sticky bottom-0 z-10 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Annuler</Button>
          <Button onClick={save} disabled={saving} className="rounded-xl shadow-md">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Enregistrer
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
