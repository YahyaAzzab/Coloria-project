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
import { Loader2, Plus, Pencil, Trash2, EyeOff, Package } from "lucide-react";
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
    <AdminShell title="Packs créatifs">
      <div className="mb-8 flex justify-end animate-in fade-in slide-in-from-top-4">
        <Button onClick={() => setEditing(emptyPack())} className="rounded-xl shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Nouveau pack
        </Button>
      </div>

      {packs === null ? (
        <div className="grid place-items-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : packs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm animate-in fade-in">
          <div className="mx-auto h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Aucun pack configuré</h3>
          <p className="mt-2 text-slate-500">Créez votre premier pack (ex: Trio, Famille) pour l'afficher sur le site.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 animate-in fade-in duration-500">
          {packs.map((p, i) => (
            <div key={p.id} className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${!p.is_active ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:border-primary/30'}`} style={{ animationDelay: `${i * 100}ms` }}>
              
              {!p.is_active && (
                <div className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/80 p-1.5 text-white backdrop-blur-md shadow-sm">
                  <EyeOff className="h-4 w-4" />
                </div>
              )}

              <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-10 w-10 text-slate-300" />
                  </div>
                )}
                {p.badge && (
                  <div className="absolute top-4 left-4 rounded-full bg-coral px-3 py-1 text-xs font-bold text-white shadow-md">
                    {p.badge}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              
              <div className="flex flex-col p-6">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{p.slug}</div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
                    {p.tier_size} livres
                  </span>
                </div>
                
                <h3 className="font-serif text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{p.title}</h3>
                <p className="text-sm text-slate-500 min-h-[40px]">{p.subtitle}</p>
                
                {p.perk && (
                  <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 border border-blue-100/50">
                    <span className="font-semibold">🎁 Cadeau :</span> {p.perk}
                  </div>
                )}
                
                <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-5">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900">{p.price} DH</span>
                      {p.old_price && <span className="text-sm font-medium text-slate-400 line-through">{p.old_price} DH</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-xl text-slate-500 hover:text-primary hover:border-primary/30" onClick={() => setEditing(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200" onClick={() => setDeleting(p)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <PackDialog pack={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-serif">Supprimer ce pack ?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Le pack « <span className="font-semibold text-slate-900">{deleting?.title}</span> » sera définitivement supprimé.
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0 border-slate-200">
        <div className="bg-slate-50 border-b border-slate-100 p-6 sticky top-0 z-10">
          <DialogTitle className="text-xl font-serif">{isNew ? "Nouveau pack" : "Modifier le pack"}</DialogTitle>
        </div>
        
        <div className="p-6 grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <Field label="Titre"><Input value={form.title} onChange={(e) => set("title", e.target.value)} className="rounded-lg" /></Field>
            <Field label="Slug (identifiant court)"><Input value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className="rounded-lg" /></Field>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-6">
            <Field label="Sous-titre / Description"><Input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} className="rounded-lg" /></Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Badge (ex: Populaire)"><Input value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value)} className="rounded-lg" /></Field>
              <Field label="Cadeau / Perk"><Input value={form.perk ?? ""} onChange={(e) => set("perk", e.target.value)} className="rounded-lg" /></Field>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-3 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <Field label="Prix (DH)"><Input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} className="rounded-lg" /></Field>
            <Field label="Ancien prix (barré)"><Input type="number" value={form.old_price ?? ""} onChange={(e) => set("old_price", e.target.value === "" ? null : Number(e.target.value))} className="rounded-lg" /></Field>
            <Field label="Nombre de livres"><Input type="number" value={form.tier_size} onChange={(e) => set("tier_size", Number(e.target.value))} className="rounded-lg" /></Field>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <Field label="Image illustrative"><ImagePicker value={form.image_url ?? ""} onChange={(v) => set("image_url", v)} /></Field>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <Field label="Ordre d'affichage"><Input type="number" value={form.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} className="rounded-lg" /></Field>
            <div className="flex items-center gap-3 pt-8">
              <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} id="is-active-pack" />
              <Label htmlFor="is-active-pack" className="text-sm font-medium cursor-pointer">Visible sur le site</Label>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 border-t border-slate-100 p-6 sticky bottom-0 z-10 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Annuler</Button>
          <Button onClick={save} disabled={saving} className="rounded-xl shadow-md">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Enregistrer le pack
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
