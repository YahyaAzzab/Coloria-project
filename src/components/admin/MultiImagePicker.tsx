import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, X, Plus, ImageIcon } from "lucide-react";
import { toast } from "sonner";

const BUCKET = "product-images";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
};

export function MultiImagePicker({ value, onChange }: Props) {
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
      // Afficher un message d'erreur détaillé pour aider au débogage
      console.error("Upload error:", uploadError);
      if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("bucket")) {
        toast.error("Erreur : le dossier de stockage n'existe pas encore dans Supabase. Allez dans Supabase > Storage et créez un bucket nommé 'product-images'.");
      } else if (uploadError.message.includes("not authorized") || uploadError.message.includes("security")) {
        toast.error("Erreur d'autorisation : vous devez être connecté en tant qu'admin pour uploader.");
      } else {
        toast.error(`Erreur upload : ${uploadError.message}`);
      }
      setUploading(false);
      return;
    }

    // 4. Récupérer l'URL publique définitive
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    // 5. Ajouter l'URL dans la liste et afficher l'aperçu
    onChange([...value, data.publicUrl]);
    toast.success("Image téléversée avec succès !");
    setUploading(false);
  }

  function remove(index: number) {
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {value.map((url, i) => (
          <div key={i} className="relative overflow-hidden rounded-lg border border-border bg-muted aspect-square group">
            <img src={url} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
              aria-label="Supprimer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-sm">
                Principale
              </span>
            )}
          </div>
        ))}

        {/* Bouton d'ajout */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:border-primary/50 transition-all aspect-square cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs">Envoi…</span>
            </>
          ) : (
            <>
              <Plus className="h-6 w-6" />
              <span className="text-xs font-medium">Ajouter</span>
            </>
          )}
        </button>
      </div>

      {value.length === 0 && !uploading && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5" />
          Cliquez sur le carré pointillé pour ajouter une image.
        </p>
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
