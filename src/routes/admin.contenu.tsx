import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { guardAdminRoute } from "@/lib/admin-auth.functions";

export const Route = createFileRoute("/admin/contenu")({
  ssr: false,
  beforeLoad: guardAdminRoute,
  head: () => ({ meta: [{ title: "Admin — Contenu" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminContent,
});

type Row = { key: string; value: any };

function AdminContent() {
  const [rows, setRows] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase.from("site_content").select("*");
    if (error) { toast.error("Erreur"); return; }
    const map: Record<string, any> = {};
    (data as Row[]).forEach((r) => { map[r.key] = r.value; });
    setRows(map);
  }
  useEffect(() => { load(); }, []);

  async function save(key: string, value: any) {
    setSaving(key);
    const { error } = await supabase.from("site_content").upsert({ key, value }, { onConflict: "key" });
    setSaving(null);
    if (error) toast.error(error.message);
    else toast.success("Enregistré");
  }

  function update(key: string, patch: any) {
    setRows((r) => ({ ...(r ?? {}), [key]: { ...(r?.[key] ?? {}), ...patch } }));
  }

  if (rows === null) {
    return <AdminShell title="Contenu du site"><div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></AdminShell>;
  }

  return (
    <AdminShell title="Contenu du site">
      <div className="space-y-6 max-w-2xl">
        <Section title="Bandeau de livraison" desc="Texte affiché en haut de toutes les pages.">
          <Field label="Texte"><Input value={rows.shipping_banner?.text ?? ""} onChange={(e) => update("shipping_banner", { text: e.target.value })} /></Field>
          <SaveBtn loading={saving === "shipping_banner"} onClick={() => save("shipping_banner", rows.shipping_banner ?? {})} />
        </Section>

        <Section title="Page À propos">
          <Field label="Titre"><Input value={rows.about?.title ?? ""} onChange={(e) => update("about", { title: e.target.value })} /></Field>
          <Field label="Texte"><Textarea rows={6} value={rows.about?.body ?? ""} onChange={(e) => update("about", { body: e.target.value })} /></Field>
          <SaveBtn loading={saving === "about"} onClick={() => save("about", rows.about ?? {})} />
        </Section>

        <Section title="Contact">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Téléphone"><Input value={rows.contact?.phone ?? ""} onChange={(e) => update("contact", { phone: e.target.value })} /></Field>
            <Field label="Email"><Input value={rows.contact?.email ?? ""} onChange={(e) => update("contact", { email: e.target.value })} /></Field>
          </div>
          <Field label="Adresse"><Input value={rows.contact?.address ?? ""} onChange={(e) => update("contact", { address: e.target.value })} /></Field>
          <SaveBtn loading={saving === "contact"} onClick={() => save("contact", rows.contact ?? {})} />
        </Section>
      </div>
    </AdminShell>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="mb-4">
        <h2 className="font-semibold">{title}</h2>
        {desc && <p className="mt-1 text-xs text-muted-foreground">{desc}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
function SaveBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <div className="flex justify-end pt-2">
      <Button size="sm" onClick={onClick} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Save className="mr-2 h-4 w-4" />Enregistrer</>)}
      </Button>
    </div>
  );
}
