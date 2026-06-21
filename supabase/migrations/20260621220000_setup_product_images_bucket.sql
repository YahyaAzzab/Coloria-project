-- Création et configuration du bucket de stockage public pour les images produits
-- Ce script est idempotent : il peut être exécuté plusieurs fois sans erreur

-- 1. Créer le bucket s'il n'existe pas, ou le rendre public s'il existe déjà
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

-- 2. Politique : tout le monde peut lire les images (pour l'affichage sur le site)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read product-images v2'
  ) THEN
    CREATE POLICY "Public read product-images v2"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');
  END IF;
END $$;

-- 3. Politique : seuls les utilisateurs authentifiés peuvent uploader
-- (l'admin étant authentifié, cela lui permet d'uploader)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated users can upload product-images'
  ) THEN
    CREATE POLICY "Authenticated users can upload product-images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;

-- 4. Politique : seuls les utilisateurs authentifiés peuvent supprimer leurs images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated users can delete product-images'
  ) THEN
    CREATE POLICY "Authenticated users can delete product-images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-images');
  END IF;
END $$;
