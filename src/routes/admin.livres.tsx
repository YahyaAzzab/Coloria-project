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
import { Loader2, Plus, Pencil, Trash2, Search } from "lucide-react";
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
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setEditing(emptyBook())}><Plus className="mr-2 h-4 w-4" /> Nouveau livre</Button>
      </div>

      {books === null ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 w-16">Image</th>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3 hidden md:table-cell">Slug</th>
                <th className="px-4 py-3 hidden md:table-cell">Univers</th>
                <th className="px-4 py-3 text-right">Prix</th>
                <th className="px-4 py-3 text-center">Actif</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    {b.image_url ? (
                      <img src={b.image_url} alt={b.title} className="h-12 w-12 rounded object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{b.title}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{b.slug}</td>
                  <td className="px-4 py-3 hidden md:table-cell capitalize">{b.audience}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{b.price} DH</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block h-2 w-2 rounded-full ${b.is_active ? "bg-green-500" : "bg-muted-foreground"}`} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(b)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleting(b)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Aucun livre.</td></tr>
              )}
            </tbody>
          </table>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce livre ?</AlertDialogTitle>
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isNew ? "Nouveau livre" : "Modifier le livre"}</DialogTitle></DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Titre"><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Slug (URL)"><Input value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} /></Field>
          </div>
          <Field label="Sous-titre"><Input value={form.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} /></Field>
          <Field label="Description"><Textarea rows={4} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Prix (DH)"><Input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} /></Field>
            <Field label="Univers">
              <Select value={form.audience} onValueChange={(v) => set("audience", v as Audience)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kids">Enfants</SelectItem>
                  <SelectItem value="teens">Ados</SelectItem>
                  <SelectItem value="adults">Adultes</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Ordre d'affichage"><Input type="number" value={form.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} /></Field>
          </div>
          <Field label="Images (la première est l'image principale)"><MultiImagePicker value={form.images ?? []} onChange={(v) => set("images", v)} /></Field>
          <Field label="Points forts (un par ligne)"><Textarea rows={3} value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} /></Field>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Pages"><Input type="number" value={form.specs?.pages ?? 64} onChange={(e) => set("specs", { ...(form.specs ?? {}), pages: Number(e.target.value) })} /></Field>
            <Field label="Format"><Input value={form.specs?.format ?? ""} onChange={(e) => set("specs", { ...(form.specs ?? {}), format: e.target.value })} /></Field>
            <Field label="Papier"><Input value={form.specs?.paper ?? ""} onChange={(e) => set("specs", { ...(form.specs ?? {}), paper: e.target.value })} /></Field>
            <Field label="Reliure"><Input value={form.specs?.binding ?? ""} onChange={(e) => set("specs", { ...(form.specs ?? {}), binding: e.target.value })} /></Field>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
            <Label>Visible sur le site</Label>
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
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
