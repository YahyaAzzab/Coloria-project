import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { guardAdminRoute } from "@/lib/admin-auth.functions";
import { ImagePicker } from "@/components/admin/ImagePicker";

export const Route = createFileRoute("/admin/packs")({
  ssr: false,
  beforeLoad: guardAdminRoute,
  head: () => ({ meta: [{ title: "Admin — Packs" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminPacks,
});

type Pack = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  price: number;
  old_price: number | null;
  tier_size: number;
  badge: string | null;
  perk: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number | null;
};

const emptyPack = (): Pack => ({
  id: "", slug: "", title: "", subtitle: "", price: 0, old_price: null,
  tier_size: 2, badge: "", perk: "", image_url: "", is_active: true, sort_order: 0,
});

function AdminPacks() {
  const [packs, setPacks] = useState<Pack[] | null>(null);
  const [editing, setEditing] = useState<Pack | null>(null);
  const [deleting, setDeleting] = useState<Pack | null>(null);

  async function load() {
    const { data, error } = await supabase.from("packs").select("*").order("sort_order");
    if (error) { toast.error("Erreur"); return; }
    setPacks(data as Pack[]);
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(p: Pack) {
    const { error } = await supabase.from("packs").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else { toast.success("Pack supprimé"); setDeleting(null); load(); }
  }

  return (
    <AdminShell title="Packs">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing(emptyPack())}><Plus className="mr-2 h-4 w-4" /> Nouveau pack</Button>
      </div>

      {packs === null ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {packs.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-lg border border-border bg-background">
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} className="h-40 w-full object-cover" />
              ) : (
                <div className="h-40 w-full bg-muted" />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.slug}</div>
                  </div>
                  <span className={`inline-block h-2 w-2 rounded-full ${p.is_active ? "bg-green-500" : "bg-muted-foreground"}`} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.subtitle}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-semibold">{p.price} DH</span>
                  {p.old_price && <span className="text-sm text-muted-foreground line-through">{p.old_price} DH</span>}
                  <span className="ml-auto text-xs text-muted-foreground">{p.tier_size} livres</span>
                </div>
                {p.badge && <div className="mt-2 inline-block rounded bg-muted px-2 py-0.5 text-xs">{p.badge}</div>}
                <div className="mt-4 flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(p)}><Pencil className="mr-1 h-4 w-4" /> Modifier</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleting(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <PackDialog pack={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce pack ?</AlertDialogTitle>
            <AlertDialogDescription>« {deleting?.title} » sera définitivement supprimé.</AlertDialogDescription>
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

function PackDialog({ pack, onClose, onSaved }: { pack: Pack; onClose: () => void; onSaved: () => void }) {
  const isNew = !pack.id;
  const [form, setForm] = useState<Pack>(pack);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Pack>(k: K, v: Pack[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.title.trim() || !form.slug.trim()) { toast.error("Titre et slug requis"); return; }
    setSaving(true);
    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle ?? "",
      price: Number(form.price) || 0,
      old_price: form.old_price === null || (form.old_price as any) === "" ? null : Number(form.old_price),
      tier_size: Number(form.tier_size) || 2,
      badge: form.badge ?? "",
      perk: form.perk ?? "",
      image_url: form.image_url ?? "",
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = isNew
      ? await supabase.from("packs").insert(payload)
      : await supabase.from("packs").update(payload).eq("id", form.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isNew ? "Pack créé" : "Pack mis à jour");
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isNew ? "Nouveau pack" : "Modifier le pack"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Titre"><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Slug"><Input value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} /></Field>
          </div>
          <Field label="Sous-titre"><Input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Prix (DH)"><Input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} /></Field>
            <Field label="Ancien prix"><Input type="number" value={form.old_price ?? ""} onChange={(e) => set("old_price", e.target.value === "" ? null : Number(e.target.value))} /></Field>
            <Field label="Nb livres"><Input type="number" value={form.tier_size} onChange={(e) => set("tier_size", Number(e.target.value))} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Badge"><Input value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value)} /></Field>
            <Field label="Cadeau / Perk"><Input value={form.perk ?? ""} onChange={(e) => set("perk", e.target.value)} /></Field>
          </div>
          <Field label="Image"><ImagePicker value={form.image_url ?? ""} onChange={(v) => set("image_url", v)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ordre"><Input type="number" value={form.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} /></Field>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
              <Label>Visible</Label>
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
