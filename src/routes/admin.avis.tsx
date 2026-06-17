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
import { Loader2, Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
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
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Ajoutez des avis clients avec texte et/ou photo (capture de conversation, témoignage…).
        </p>
        <Button onClick={() => setEditing(empty())}><Plus className="mr-2 h-4 w-4" /> Nouvel avis</Button>
      </div>

      {items === null ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
          Aucun avis. Cliquez sur « Nouvel avis » pour en ajouter un.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((t) => (
            <div key={t.id} className="overflow-hidden rounded-lg border border-border bg-background">
              {t.image_url ? (
                <img src={t.image_url} alt={t.name} className="h-48 w-full object-cover" />
              ) : (
                <div className="grid h-48 w-full place-items-center bg-muted text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{t.name}</div>
                    {t.role && <div className="text-xs text-muted-foreground">{t.role}</div>}
                  </div>
                  <span className={`mt-1 inline-block h-2 w-2 rounded-full ${t.is_active ? "bg-green-500" : "bg-muted-foreground"}`} />
                </div>
                {t.text && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{t.text}</p>}
                <div className="mt-3 flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(t)}><Pencil className="mr-1 h-4 w-4" /> Modifier</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleting(t)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet avis ?</AlertDialogTitle>
            <AlertDialogDescription>L'avis de « {deleting?.name} » sera définitivement supprimé.</AlertDialogDescription>
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isNew ? "Nouvel avis" : "Modifier l'avis"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom"><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Rôle / lieu (optionnel)"><Input value={form.role ?? ""} onChange={(e) => set("role", e.target.value)} placeholder="Enseignante, Casablanca…" /></Field>
          </div>
          <Field label="Témoignage (optionnel si image)">
            <Textarea rows={4} value={form.text ?? ""} onChange={(e) => set("text", e.target.value)} placeholder="Ce que dit le client…" />
          </Field>
          <Field label="Image (capture de conversation, photo client…)">
            <ImagePicker value={form.image_url ?? ""} onChange={(v) => set("image_url", v)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ordre"><Input type="number" value={form.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} /></Field>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
              <Label>Visible sur le site</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
