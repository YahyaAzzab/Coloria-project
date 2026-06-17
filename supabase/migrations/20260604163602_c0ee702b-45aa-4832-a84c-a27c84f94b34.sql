
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PRODUCTS ============
CREATE TYPE public.audience AS ENUM ('kids','teens','adults');

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  audience audience NOT NULL DEFAULT 'adults',
  image_url TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active products" ON public.products FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PACKS ============
CREATE TABLE public.packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  old_price NUMERIC(10,2),
  tier_size INT NOT NULL DEFAULT 2,
  badge TEXT,
  perk TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.packs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.packs TO authenticated;
GRANT ALL ON public.packs TO service_role;
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active packs" ON public.packs FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage packs" ON public.packs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER packs_updated BEFORE UPDATE ON public.packs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ QUOTES ============
CREATE TYPE public.quote_status AS ENUM ('new','processing','done');

CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status quote_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.quotes TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone insert quote" ON public.quotes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read quotes" ON public.quotes FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update quotes" ON public.quotes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete quotes" ON public.quotes FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER quotes_updated BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SITE CONTENT ============
CREATE TABLE public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read site content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage site content" ON public.site_content FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER site_content_updated BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEED PRODUCTS ============
INSERT INTO public.products (slug,title,tagline,description,price,audience,highlights,specs,sort_order) VALUES
('winter-vibes','Winter Vibes','Une parenthèse hivernale entre vos mains','Plongez dans une ambiance feutrée d''hiver : sapins givrés, tasses fumantes, fenêtres enneigées et silhouettes cosy. Chaque page invite à ralentir, respirer et savourer un moment doux, crayon en main.',98,'adults','["Illustrations originales aux détails fins","Pages décollables encadrables","Idéal pour la détente hivernale"]'::jsonb,'{"pages":64,"format":"21 × 29,7 cm (A4)","paper":"Papier épais 120g/m²","binding":"Reliure souple cousue"}'::jsonb,1),
('girl-moments','Girl Moments','Moments doux & élégants','Une collection chic et féminine célébrant les petits instants : cafés, beauté, mode, voyages. Un univers visuel raffiné pensé pour les adolescentes et jeunes femmes qui aiment l''esthétique douce.',98,'teens','["Esthétique éditoriale tendance","Compositions modernes","Parfait pour cadeau d''anniversaire"]'::jsonb,'{"pages":64,"format":"21 × 29,7 cm (A4)","paper":"Papier épais 120g/m²","binding":"Reliure souple cousue"}'::jsonb,2),
('florals','Florals','Délicates botaniques et fleurs sauvages','Un herbier artistique de fleurs sauvages, bouquets et compositions botaniques minutieusement dessinés. L''évasion pure pour les amoureux de la nature et du dessin détaillé.',98,'adults','["50+ illustrations florales","Niveau de détail moyen à expert","Inspirations botaniques anciennes"]'::jsonb,'{"pages":64,"format":"21 × 29,7 cm (A4)","paper":"Papier épais 120g/m²","binding":"Reliure souple cousue"}'::jsonb,3),
('mandalas-anti-stress','Mandalas Anti-Stress','Sérénité, équilibre et beauté','Une collection de mandalas géométriques et organiques conçue pour apaiser l''esprit. Chaque tracé est pensé pour induire un état méditatif et un sentiment de centrage profond.',98,'adults','["Exercice de pleine conscience","Symétries parfaites","Idéal anxiété & relaxation"]'::jsonb,'{"pages":64,"format":"21 × 29,7 cm (A4)","paper":"Papier épais 120g/m²","binding":"Reliure souple cousue"}'::jsonb,4),
('fashion-elegance','Fashion & Elegance','Silhouettes haute couture','Défilés, croquis de stylistes, accessoires et silhouettes inspirées des grandes maisons. Pour celles et ceux qui rêvent de mode et veulent exprimer leur sens du style.',98,'teens','["Croquis style atelier couture","Accessoires et matières détaillés","Coloriser comme un designer"]'::jsonb,'{"pages":64,"format":"21 × 29,7 cm (A4)","paper":"Papier épais 120g/m²","binding":"Reliure souple cousue"}'::jsonb,5),
('mystic-jars','Mystic Jars','Un univers magique au quotidien','Bocaux mystiques, potions, cristaux et symboles ésotériques. Un voyage onirique entre apothicairerie et magie douce, à colorier dans des tons profonds ou pastels.',98,'adults','["Univers cohérent et onirique","Détails fins pour fine-liner","Format encadrable"]'::jsonb,'{"pages":64,"format":"21 × 29,7 cm (A4)","paper":"Papier épais 120g/m²","binding":"Reliure souple cousue"}'::jsonb,6),
('animal-kingdom','Animal Kingdom','Les amis du monde sauvage','De la savane à la forêt, une grande famille d''animaux attend ses couleurs. Des tracés clairs pour les plus jeunes et des détails plus riches pour progresser.',98,'kids','["Animaux du monde entier","Tracés adaptés aux enfants","Encourage la motricité fine"]'::jsonb,'{"pages":64,"format":"21 × 29,7 cm (A4)","paper":"Papier épais 120g/m²","binding":"Reliure souple cousue"}'::jsonb,7),
('joyful-kids','Joyful Kids','Premières aventures créatives','Un livre joyeux et coloré pour les petits artistes : héros, jouets, paysages simples et formes ludiques. Le compagnon idéal des premières aventures créatives.',98,'kids','["Dès 4 ans","Gros traits, grandes zones","Stimule l''imagination"]'::jsonb,'{"pages":64,"format":"21 × 29,7 cm (A4)","paper":"Papier épais 120g/m²","binding":"Reliure souple cousue"}'::jsonb,8),
('pop-culture-teens','Pop Culture','Vibes ados et inspirations actuelles','Streetwear, musique, pop art, vinyles, sneakers... Un livre qui capture l''énergie de la culture ado actuelle, à customiser librement.',98,'teens','["Inspirations street & pop","Compositions dynamiques","Pour exprimer sa personnalité"]'::jsonb,'{"pages":64,"format":"21 × 29,7 cm (A4)","paper":"Papier épais 120g/m²","binding":"Reliure souple cousue"}'::jsonb,9),
('botanical-zen','Botanical Zen','Méditation florale détaillée','Une expérience méditative à travers des compositions botaniques riches : feuillages, fleurs rares, jardins secrets. Pensé pour de longues sessions de coloriage immersives.',98,'adults','["Niveau expert","Idéal slow-living","Sessions méditatives longues"]'::jsonb,'{"pages":64,"format":"21 × 29,7 cm (A4)","paper":"Papier épais 120g/m²","binding":"Reliure souple cousue"}'::jsonb,10);

-- ============ SEED PACKS ============
INSERT INTO public.packs (slug,title,subtitle,price,old_price,tier_size,badge,perk,sort_order) VALUES
('pack-duo','Pack Duo','2 livres + marque-page offert',169,196,2,'Cadeau offert','1 marque-page offert',1),
('pack-trio','Pack Trio','3 livres + carnet créatif',239,294,3,'Populaire','1 carnet créatif offert',2),
('pack-quatuor','Pack Quatuor','4 livres + marque-page offert',299,392,4,'Meilleur prix','1 carnet créatif offert',3),
('pack-famille','Pack Famille','5 livres + pochette premium',359,490,5,'Cadeau offert','Pochette cadeau premium offerte',4);
