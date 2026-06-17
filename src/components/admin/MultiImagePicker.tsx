import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, X, Plus } from "lucide-react";
import { toast } from "sonner";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
};

export function MultiImagePicker({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 5 Mo)");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const uuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 15);
    const path = `${uuid}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data: signed, error: sErr } = await supabase.storage
      .from("product-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (sErr || !signed?.signedUrl) {
      toast.error(sErr?.message || "Erreur d'URL");
      setUploading(false);
      return;
    }
    onChange([...value, signed.signedUrl]);
    toast.success("Image téléversée");
    setUploading(false);
  }

  function remove(index: number) {
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {value.map((url, i) => (
          <div key={i} className="relative overflow-hidden rounded-md border border-border bg-cream aspect-square">
            <img src={url} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
            <div className="absolute top-1 right-1">
              <Button type="button" variant="destructive" size="icon" className="h-6 w-6" onClick={() => remove(i)} aria-label="Supprimer">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {i === 0 && (
              <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Principale</span>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/50 text-muted-foreground hover:bg-muted transition-colors aspect-square"
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
          <span className="text-xs">Ajouter</span>
        </button>
      </div>

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
