-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Permissions
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

-- Add category_id to products
ALTER TABLE public.products ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Insert default categories to match existing audiences
INSERT INTO public.categories (slug, title, description, sort_order) VALUES
  ('kids', 'Enfants', 'Livres de coloriage pour enfants : illustrations joyeuses et créatives.', 1),
  ('teens', 'Ados', 'Livres de coloriage pour ados : mandalas simples et univers fantastiques.', 2),
  ('adults', 'Adultes', 'Livres de coloriage pour adultes : motifs complexes et relaxation.', 3);

-- Map existing products to their new categories
UPDATE public.products p SET category_id = c.id FROM public.categories c WHERE p.audience::text = c.slug;

-- Make category_id NOT NULL if you want, but SET NULL allows orphaned products which might be safer or not.
-- Let's make it NOT NULL for integrity, assuming all products had valid audience
-- ALTER TABLE public.products ALTER COLUMN category_id SET NOT NULL;

-- Drop audience column and ENUM
ALTER TABLE public.products DROP COLUMN audience;
DROP TYPE IF EXISTS public.audience;
