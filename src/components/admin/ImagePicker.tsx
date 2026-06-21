import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const BUCKET = "product-images";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export function ImagePicker({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    // 1. Valider la taille
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 5 Mo)");
      return;
    }

    setUploading(true);

    // 2. Générer un nom unique
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    // 3. Uploader dans le bucket product-images
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("bucket")) {
        toast.error("Erreur : dossier 'product-images' introuvable dans Supabase. Créez-le manuellement dans Storage.");
      } else if (uploadError.message.includes("not authorized") || uploadError.message.includes("security")) {
        toast.error("Erreur d'autorisation. Vérifiez que vous êtes connecté comme admin.");
      } else {
        toast.error(`Erreur upload : ${uploadError.message}`);
      }
      setUploading(false);
      return;
    }

    // 4. Récupérer l'URL publique
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    // 5. Enregistrer l'URL et afficher l'aperçu
    onChange(data.publicUrl);
    toast.success("Image téléversée !");
    setUploading(false);
  }

  return (
    <div className="space-y-3">
      {/* Champ URL + bouton upload */}
      <div className="flex gap-2">
        <Input
          placeholder="URL de l'image (https://…) ou téléversez →"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="shrink-0"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span className="ms-2 hidden sm:inline">
            {uploading ? "Envoi…" : "Téléverser"}
          </span>
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange("")}
            aria-label="Effacer"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Aperçu de l'image après upload */}
      {value && (
        <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
          <img src={value} alt="Aperçu" className="h-40 w-full object-cover" />
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs text-white">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            Image enregistrée
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
