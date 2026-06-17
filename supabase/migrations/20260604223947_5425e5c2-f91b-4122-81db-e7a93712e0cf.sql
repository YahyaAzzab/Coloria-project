-- 1) Remove duplicate permissive upload policy on storage.objects
DROP POLICY IF EXISTS "Authenticated upload product-images" ON storage.objects;

-- Ensure an admin-only upload policy exists for product-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname='Admins upload product-images'
  ) THEN
    CREATE POLICY "Admins upload product-images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'product-images'
        AND public.has_role(auth.uid(), 'admin')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname='Admins update product-images'
  ) THEN
    CREATE POLICY "Admins update product-images"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'))
      WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname='Admins delete product-images'
  ) THEN
    CREATE POLICY "Admins delete product-images"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END$$;

-- 2) Tighten quotes INSERT validation
DROP POLICY IF EXISTS "anyone insert quote" ON public.quotes;
CREATE POLICY "anyone insert quote" ON public.quotes
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(name)) > 0
    AND length(name) <= 200
    AND length(coalesce(email, '')) <= 254
    AND length(coalesce(phone, '')) <= 30
    AND length(coalesce(message, '')) <= 5000
    AND octet_length(coalesce(items::text, '')) <= 10000
  );