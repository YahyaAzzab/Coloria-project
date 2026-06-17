--
-- PostgreSQL database dump
--

\restrict viIaS8RGOZ80MaW3I2epdmkbUjgZGv31YDpUXi3RCQEmczVEVKsSgOVFexCqrXL

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin'
);


--
-- Name: audience; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.audience AS ENUM (
    'kids',
    'teens',
    'adults'
);


--
-- Name: quote_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quote_status AS ENUM (
    'new',
    'processing',
    'done'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: packs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.packs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    subtitle text DEFAULT ''::text NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    old_price numeric(10,2),
    tier_size integer DEFAULT 2 NOT NULL,
    badge text,
    perk text,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    tagline text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    audience public.audience DEFAULT 'adults'::public.audience NOT NULL,
    image_url text,
    images jsonb DEFAULT '[]'::jsonb NOT NULL,
    highlights jsonb DEFAULT '[]'::jsonb NOT NULL,
    specs jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    display_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    message text,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    status public.quote_status DEFAULT 'new'::public.quote_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: site_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_content (
    key text NOT NULL,
    value jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    role text,
    text text,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: packs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.packs (id, slug, title, subtitle, price, old_price, tier_size, badge, perk, image_url, is_active, sort_order, created_at, updated_at) FROM stdin;
08c8f6bd-cdd9-4bbe-91d4-9f65ae15ff43	pack-trio	Pack Trio	3 livres + carnet créatif	239.00	294.00	3	Populaire	1 carnet créatif offert	\N	t	2	2026-06-04 16:36:01.582949+00	2026-06-04 16:36:01.582949+00
9c1a483f-4ed4-425d-9a80-cd01a3495f21	pack-quatuor	Pack Quatuor	4 livres + marque-page offert	299.00	392.00	4	Meilleur prix	1 carnet créatif offert	\N	t	3	2026-06-04 16:36:01.582949+00	2026-06-04 16:36:01.582949+00
a512d486-25f1-44a0-80a8-e885e1b91b1c	pack-famille	Pack Famille	5 livres + pochette premium	359.00	490.00	5	Cadeau offert	Pochette cadeau premium offerte	\N	t	4	2026-06-04 16:36:01.582949+00	2026-06-04 16:36:01.582949+00
6bcfba58-15ba-4597-824f-88843e1cf29d	pack-duo	Pack Duo fx	2 livres + marque-page offert	169.00	196.00	2	Cadeau offert	1 marque-page offert		t	1	2026-06-04 16:36:01.582949+00	2026-06-04 17:33:21.204422+00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, slug, title, tagline, description, price, audience, image_url, images, highlights, specs, is_active, sort_order, created_at, updated_at) FROM stdin;
4ba94d38-61c9-4827-951a-8c3ec29bc30f	girl-moments	Girl Moments	Moments doux & élégants	Une collection chic et féminine célébrant les petits instants : cafés, beauté, mode, voyages. Un univers visuel raffiné pensé pour les adolescentes et jeunes femmes qui aiment l'esthétique douce.	98.00	teens	\N	[]	["Esthétique éditoriale tendance", "Compositions modernes", "Parfait pour cadeau d'anniversaire"]	{"pages": 64, "paper": "Papier épais 120g/m²", "format": "21 × 29,7 cm (A4)", "binding": "Reliure souple cousue"}	t	2	2026-06-04 16:36:01.582949+00	2026-06-04 16:36:01.582949+00
daa0f62d-6062-4c12-afbf-02cef9de1075	florals	Florals	Délicates botaniques et fleurs sauvages	Un herbier artistique de fleurs sauvages, bouquets et compositions botaniques minutieusement dessinés. L'évasion pure pour les amoureux de la nature et du dessin détaillé.	98.00	adults	\N	[]	["50+ illustrations florales", "Niveau de détail moyen à expert", "Inspirations botaniques anciennes"]	{"pages": 64, "paper": "Papier épais 120g/m²", "format": "21 × 29,7 cm (A4)", "binding": "Reliure souple cousue"}	t	3	2026-06-04 16:36:01.582949+00	2026-06-04 16:36:01.582949+00
e0047813-071d-4086-8461-113c03bf9d72	mandalas-anti-stress	Mandalas Anti-Stress	Sérénité, équilibre et beauté	Une collection de mandalas géométriques et organiques conçue pour apaiser l'esprit. Chaque tracé est pensé pour induire un état méditatif et un sentiment de centrage profond.	98.00	adults	\N	[]	["Exercice de pleine conscience", "Symétries parfaites", "Idéal anxiété & relaxation"]	{"pages": 64, "paper": "Papier épais 120g/m²", "format": "21 × 29,7 cm (A4)", "binding": "Reliure souple cousue"}	t	4	2026-06-04 16:36:01.582949+00	2026-06-04 16:36:01.582949+00
cea607ac-afc6-46e9-b92b-5ac5a1c4d136	fashion-elegance	Fashion & Elegance	Silhouettes haute couture	Défilés, croquis de stylistes, accessoires et silhouettes inspirées des grandes maisons. Pour celles et ceux qui rêvent de mode et veulent exprimer leur sens du style.	98.00	teens	\N	[]	["Croquis style atelier couture", "Accessoires et matières détaillés", "Coloriser comme un designer"]	{"pages": 64, "paper": "Papier épais 120g/m²", "format": "21 × 29,7 cm (A4)", "binding": "Reliure souple cousue"}	t	5	2026-06-04 16:36:01.582949+00	2026-06-04 16:36:01.582949+00
ac28fc8f-91ed-44c7-826c-5242faf11c85	mystic-jars	Mystic Jars	Un univers magique au quotidien	Bocaux mystiques, potions, cristaux et symboles ésotériques. Un voyage onirique entre apothicairerie et magie douce, à colorier dans des tons profonds ou pastels.	98.00	adults	\N	[]	["Univers cohérent et onirique", "Détails fins pour fine-liner", "Format encadrable"]	{"pages": 64, "paper": "Papier épais 120g/m²", "format": "21 × 29,7 cm (A4)", "binding": "Reliure souple cousue"}	t	6	2026-06-04 16:36:01.582949+00	2026-06-04 16:36:01.582949+00
2c851e73-df60-444e-9225-2966614989ee	animal-kingdom	Animal Kingdom	Les amis du monde sauvage	De la savane à la forêt, une grande famille d'animaux attend ses couleurs. Des tracés clairs pour les plus jeunes et des détails plus riches pour progresser.	98.00	kids	\N	[]	["Animaux du monde entier", "Tracés adaptés aux enfants", "Encourage la motricité fine"]	{"pages": 64, "paper": "Papier épais 120g/m²", "format": "21 × 29,7 cm (A4)", "binding": "Reliure souple cousue"}	t	7	2026-06-04 16:36:01.582949+00	2026-06-04 16:36:01.582949+00
16f28e68-dfb0-46cf-8843-e761e9a9350d	joyful-kids	Joyful Kids	Premières aventures créatives	Un livre joyeux et coloré pour les petits artistes : héros, jouets, paysages simples et formes ludiques. Le compagnon idéal des premières aventures créatives.	98.00	kids	\N	[]	["Dès 4 ans", "Gros traits, grandes zones", "Stimule l'imagination"]	{"pages": 64, "paper": "Papier épais 120g/m²", "format": "21 × 29,7 cm (A4)", "binding": "Reliure souple cousue"}	t	8	2026-06-04 16:36:01.582949+00	2026-06-04 16:36:01.582949+00
231d3b21-4a6a-41bf-a886-fdd76e476d03	pop-culture-teens	Pop Culture	Vibes ados et inspirations actuelles	Streetwear, musique, pop art, vinyles, sneakers... Un livre qui capture l'énergie de la culture ado actuelle, à customiser librement.	98.00	teens	\N	[]	["Inspirations street & pop", "Compositions dynamiques", "Pour exprimer sa personnalité"]	{"pages": 64, "paper": "Papier épais 120g/m²", "format": "21 × 29,7 cm (A4)", "binding": "Reliure souple cousue"}	t	9	2026-06-04 16:36:01.582949+00	2026-06-04 16:36:01.582949+00
8d9d2dae-d537-4255-90cf-a1ec9ad81349	botanical-zen	Botanical Zen	Méditation florale détaillée	Une expérience méditative à travers des compositions botaniques riches : feuillages, fleurs rares, jardins secrets. Pensé pour de longues sessions de coloriage immersives.	98.00	adults	\N	[]	["Niveau expert", "Idéal slow-living", "Sessions méditatives longues"]	{"pages": 64, "paper": "Papier épais 120g/m²", "format": "21 × 29,7 cm (A4)", "binding": "Reliure souple cousue"}	t	10	2026-06-04 16:36:01.582949+00	2026-06-04 16:36:01.582949+00
ac619450-ae49-49f9-8bee-f27370ae71c2	winter-vibes	Winter Vibes	Une parenthèse hivernale entre vos mains	Plongez dans une ambiance feutrée d'hiver : sapins givrés, tasses fumantes, fenêtres enneigées et silhouettes cosy. Chaque page invite à ralentir, respirer et savourer un moment doux, crayon en main.	106.00	adults		[]	["Illustrations originales aux détails fins", "Pages décollables encadrables", "Idéal pour la détente hivernale"]	{"pages": 64, "paper": "Papier épais 120g/m²", "format": "21 × 29,7 cm (A4)", "binding": "Reliure souple cousue"}	t	1	2026-06-04 16:36:01.582949+00	2026-06-04 22:44:29.223476+00
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, display_name, created_at, updated_at) FROM stdin;
92878da5-41ec-499e-b23d-5f066d505066	rouissemohamed08	2026-06-04 16:44:44.066057+00	2026-06-04 16:44:44.066057+00
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quotes (id, name, email, phone, message, items, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: site_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_content (key, value, updated_at) FROM stdin;
shipping_banner	{"text": "Livraison gratuite dès 200 DH partout au Maroc"}	2026-06-04 16:52:23.021298+00
about	{"body": "Texte à propos modifiable depuis l'admin.", "title": "À propos"}	2026-06-04 16:52:23.021298+00
contact	{"email": "contact@example.com", "phone": "+212 6 00 00 00 00", "address": "Casablanca, Maroc"}	2026-06-04 16:52:23.021298+00
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.testimonials (id, name, role, text, image_url, is_active, sort_order, created_at, updated_at) FROM stdin;
1ec25f7b-9b7e-47d6-b554-76b21335d471	fdf	ed	\N	https://gxkhmgjqwqydgruwlozt.supabase.co/storage/v1/object/sign/product-images/4cfdb460-b361-40c3-aa9a-e50b0b6bdd91.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85MGVkMmExZC1kNDNmLTRkNjItOTMxNi00OTdmYmRiYTY4OTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0LWltYWdlcy80Y2ZkYjQ2MC1iMzYxLTQwYzMtYWE5YS1lNTBiMGI2YmRkOTEuanBnIiwiaWF0IjoxNzgwNjEzNDE3LCJleHAiOjIwOTU5NzM0MTd9.75POGRljmGxBGvx6NRkYRzndy8_KoUPALSuQgyrnD3I	t	1	2026-06-04 22:50:30.422229+00	2026-06-04 22:50:30.422229+00
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (id, user_id, role, created_at) FROM stdin;
47ba8835-0cd6-4c05-be17-075988c90392	92878da5-41ec-499e-b23d-5f066d505066	admin	2026-06-04 16:46:28.53138+00
\.


--
-- Name: packs packs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packs
    ADD CONSTRAINT packs_pkey PRIMARY KEY (id);


--
-- Name: packs packs_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packs
    ADD CONSTRAINT packs_slug_key UNIQUE (slug);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: site_content site_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_content
    ADD CONSTRAINT site_content_pkey PRIMARY KEY (key);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: packs packs_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER packs_updated BEFORE UPDATE ON public.packs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products products_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: quotes quotes_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER quotes_updated BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: site_content site_content_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER site_content_updated BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: testimonials update_testimonials_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: testimonials Admins can manage testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage testimonials" ON public.testimonials USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: testimonials Public can view active testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view active testimonials" ON public.testimonials FOR SELECT USING (((is_active = true) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: quotes admins delete quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins delete quotes" ON public.quotes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: packs admins manage packs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins manage packs" ON public.packs TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: products admins manage products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins manage products" ON public.products TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_content admins manage site content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins manage site content" ON public.site_content TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles admins read all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles admins read all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quotes admins read quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins read quotes" ON public.quotes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quotes admins update quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins update quotes" ON public.quotes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quotes anyone insert quote; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "anyone insert quote" ON public.quotes FOR INSERT TO authenticated, anon WITH CHECK (((length(TRIM(BOTH FROM name)) > 0) AND (length(name) <= 200) AND (length(COALESCE(email, ''::text)) <= 254) AND (length(COALESCE(phone, ''::text)) <= 30) AND (length(COALESCE(message, ''::text)) <= 5000) AND (octet_length(COALESCE((items)::text, ''::text)) <= 10000)));


--
-- Name: packs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: packs public read active packs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read active packs" ON public.packs FOR SELECT TO authenticated, anon USING (((is_active = true) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: products public read active products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read active products" ON public.products FOR SELECT TO authenticated, anon USING (((is_active = true) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: site_content public read site content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read site content" ON public.site_content FOR SELECT TO authenticated, anon USING (true);


--
-- Name: quotes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

--
-- Name: site_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

--
-- Name: testimonials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles users read own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users read own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: user_roles users read own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: profiles users update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION has_role(_user_id uuid, _role public.app_role); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) FROM PUBLIC;
GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO authenticated;
GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: TABLE packs; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.packs TO anon;
GRANT ALL ON TABLE public.packs TO authenticated;
GRANT ALL ON TABLE public.packs TO service_role;


--
-- Name: TABLE products; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE quotes; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.quotes TO anon;
GRANT ALL ON TABLE public.quotes TO authenticated;
GRANT ALL ON TABLE public.quotes TO service_role;


--
-- Name: TABLE site_content; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.site_content TO anon;
GRANT ALL ON TABLE public.site_content TO authenticated;
GRANT ALL ON TABLE public.site_content TO service_role;


--
-- Name: TABLE testimonials; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.testimonials TO anon;
GRANT ALL ON TABLE public.testimonials TO authenticated;
GRANT ALL ON TABLE public.testimonials TO service_role;


--
-- Name: TABLE user_roles; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.user_roles TO anon;
GRANT ALL ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict viIaS8RGOZ80MaW3I2epdmkbUjgZGv31YDpUXi3RCQEmczVEVKsSgOVFexCqrXL

