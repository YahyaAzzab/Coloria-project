import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Loader2, Plus, Pencil, Trash2, Search, Image as ImageIcon, EyeOff, BookTemplate } from "lucide-react";
import { toast } from "sonner";
import { guardAdminRoute } from "@/lib/admin-auth.functions";
import { MultiImagePicker } from "@/components/admin/MultiImagePicker";

export const Route = createFileRoute("/admin/livres")({
  ssr: false,
  beforeLoad: guardAdminRoute,
  head: () => ({ meta: [{ title: "Admin — Livres" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminBooks,
});

type Audience = "kids" | "teens" | "adults";
type Book = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  price: number;
  audience: Audience;
  image_url: string | null;
  images: string[];
  highlights: string[];
  specs: { pages?: number; format?: string; paper?: string; binding?: string } | null;
  is_active: boolean;
  sort_order: number | null;
};

const emptyBook = (): Book => ({
  id: "",
  slug: "",
  title: "",
  tagline: "",
  description: "",
  price: 98,
  audience: "adults",
  image_url: "",
  images: [],
  highlights: [],
  specs: { pages: 64, format: "21 × 29,7 cm (A4)", paper: "Papier épais 120g/m²", binding: "Reliure souple cousue" },
  is_active: true,
  sort_order: 0,
});

function AdminBooks() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const queryClient = useQueryClient();

  async function load() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erreur de chargement");
      return;
    }
    setBooks(
      (data ?? []).map((p: any) => {
        let images = Array.isArray(p.images) && p.images.length > 0 ? p.images : [];
        if (images.length === 0 && p.image_url) {
          images = [p.image_url];
        }
        return {
          ...p,
          highlights: Array.isArray(p.highlights) ? p.highlights : [],
          images,
          specs: p.specs ?? null,
        };
      })
    );
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(b: Book) {
    const { error } = await supabase.from("products").delete().eq("id", b.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Livre supprimé");
      setDeleting(null);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      load();
    }
  }

  const filtered = (books ?? []).filter((b) =>
    [b.title, b.slug, b.tagline ?? ""].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AdminShell title="Livres">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Rechercher un livre..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            className="pl-9 bg-white border-slate-200 rounded-xl shadow-sm focus-visible:ring-primary/20" 
          />
        </div>
        <Button onClick={() => setEditing(emptyBook())} className="rounded-xl shadow-md whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un livre
        </Button>
      </div>

      {books === null ? (
        <div className="grid place-items-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm animate-in fade-in">
          <div className="mx-auto h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <BookTemplate className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Aucun livre trouvé</h3>
          <p className="mt-2 text-slate-500">Ajoutez votre premier livre de coloriage pour commencer.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500">
          {filtered.map((b) => (
            <div key={b.id} className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${!b.is_active ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:border-primary/30'}`}>
              
              {!b.is_active && (
                <div className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/80 p-1.5 text-white backdrop-blur-md shadow-sm">
                  <EyeOff className="h-4 w-4" />
                </div>
              )}
              
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                {b.images.length > 0 ? (
                  <img src={b.images[0]} alt={b.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{b.audience}</span>
                  <span className="truncate">{b.slug}</span>
                </div>
                
                <h3 className="font-serif text-lg font-semibold text-slate-900 leading-tight mb-2 group-hover:text-primary transition-colors">
                  {b.title}
                </h3>
                
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                  {b.tagline || b.description || "Aucune description"}
                </p>
                
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                  <span className="text-lg font-bold text-slate-900">{b.price} DH</span>
                  <div className="flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => setEditing(b)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => setDeleting(b)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <BookDialog
          book={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { 
            setEditing(null); 
            queryClient.invalidateQueries({ queryKey: ["products"] });
            load(); 
          }}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-serif">Supprimer le livre ?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Le livre « <span className="font-semibold text-slate-900">{deleting?.title}</span> » sera définitivement supprimé.
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

function BookDialog({ book, onClose, onSaved }: { book: Book; onClose: () => void; onSaved: () => void }) {
  const isNew = !book.id;
  const [form, setForm] = useState<Book>(book);
  const [saving, setSaving] = useState(false);
  const [highlightsText, setHighlightsText] = useState((book.highlights ?? []).join("\n"));

  function set<K extends keyof Book>(k: K, v: Book[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.title.trim() || !form.slug.trim()) { toast.error("Titre et slug requis"); return; }
    setSaving(true);
    const highlights = highlightsText.split("\n").map((s) => s.trim()).filter(Boolean);
    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      tagline: form.tagline ?? "",
      description: form.description ?? "",
      price: Number(form.price) || 0,
      audience: form.audience,
      image_url: form.images && form.images.length > 0 ? form.images[0] : "",
      images: form.images ?? [],
      highlights,
      specs: form.specs ?? {},
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", form.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isNew ? "Livre créé" : "Livre mis à jour");
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0 border-slate-200">
        <div className="bg-slate-50 border-b border-slate-100 p-6 sticky top-0 z-10 flex justify-between items-center">
          <DialogTitle className="text-xl font-serif">{isNew ? "Nouveau livre" : "Modifier le livre"}</DialogTitle>
        </div>

        <div className="p-6 grid gap-8">
          <div className="grid gap-6 sm:grid-cols-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <Field label="Titre"><Input value={form.title} onChange={(e) => set("title", e.target.value)} className="rounded-lg" /></Field>
            <Field label="Slug (URL)"><Input value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className="rounded-lg" /></Field>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-6">
            <Field label="Sous-titre"><Input value={form.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} className="rounded-lg" /></Field>
            <Field label="Description"><Textarea rows={4} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} className="rounded-lg resize-y" /></Field>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-3 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <Field label="Prix (DH)"><Input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} className="rounded-lg" /></Field>
            <Field label="Univers">
              <Select value={form.audience} onValueChange={(v) => set("audience", v as Audience)}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kids">Enfants</SelectItem>
                  <SelectItem value="teens">Ados</SelectItem>
                  <SelectItem value="adults">Adultes</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Ordre d'affichage"><Input type="number" value={form.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} className="rounded-lg" /></Field>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-6">
            <Field label="Images (la première est l'image principale)"><MultiImagePicker value={form.images ?? []} onChange={(v) => set("images", v)} /></Field>
            <Field label="Points forts (un par ligne)"><Textarea rows={4} value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} className="rounded-lg resize-y" /></Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <Field label="Pages"><Input type="number" value={form.specs?.pages ?? 64} onChange={(e) => set("specs", { ...(form.specs ?? {}), pages: Number(e.target.value) })} className="rounded-lg" /></Field>
            <Field label="Format"><Input value={form.specs?.format ?? ""} onChange={(e) => set("specs", { ...(form.specs ?? {}), format: e.target.value })} className="rounded-lg" /></Field>
            <Field label="Papier"><Input value={form.specs?.paper ?? ""} onChange={(e) => set("specs", { ...(form.specs ?? {}), paper: e.target.value })} className="rounded-lg" /></Field>
            <Field label="Reliure"><Input value={form.specs?.binding ?? ""} onChange={(e) => set("specs", { ...(form.specs ?? {}), binding: e.target.value })} className="rounded-lg" /></Field>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} id="is-active" />
            <Label htmlFor="is-active" className="text-sm font-medium cursor-pointer">Visible sur le catalogue public</Label>
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-100 p-6 sticky bottom-0 z-10 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Annuler</Button>
          <Button onClick={save} disabled={saving} className="rounded-xl shadow-md">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Enregistrer le livre
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
