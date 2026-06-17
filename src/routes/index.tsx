import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Leaf, Truck, Pencil, Quote, Star, Gift } from "lucide-react";
import heroImg from "@/assets/hero-coloria.jpg";
import { useProducts, usePacks } from "@/data/products";
import { useTestimonials } from "@/data/testimonials";
import { ProductCard } from "@/components/ProductCard";
import { PackCard } from "@/components/PackCard";
import { TrustStrip } from "@/components/TrustStrip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coloria — Livres de coloriage premium pour tous les âges" },
      { name: "description", content: "Découvrez Coloria : livres de coloriage premium et packs créatifs pour enfants, ados et adultes. Papier 120g, illustrations originales, livraison soignée." },
      { property: "og:title", content: "Coloria — L'art du coloriage, sublimé" },
      { property: "og:description", content: "Livres de coloriage premium et packs créatifs pour tous les âges. Détente, créativité, anti-stress." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useTranslation();
  const products = useProducts();
  const packs = usePacks();
  const benefits = t("benefits.items", { returnObjects: true }) as { title: string; desc: string }[];
  const fallbackTestimonials = t("testimonials.items", { returnObjects: true }) as { name: string; role: string; text: string }[];
  const dbTestimonials = useTestimonials();
  const testimonials = dbTestimonials.length
    ? dbTestimonials.map((x) => ({ name: x.name, role: x.role ?? "", text: x.text ?? "", image: x.image_url ?? null }))
    : fallbackTestimonials.map((x) => ({ ...x, image: null as string | null }));
  const benefitIcons = [Leaf, Pencil, Truck, Sparkles];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-cream" />
        <div className="absolute -top-32 -right-32 -z-10 h-96 w-96 rounded-full bg-coral/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 -z-10 h-96 w-96 rounded-full bg-turquoise/20 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-24 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-coral" />
              {t("hero.eyebrow")}
            </span>
            <h1 className="mt-6 text-balance font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {t("hero.title")}
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="group">
                <Link to="/catalogue">
                  {t("hero.cta")}
                  <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/devis">{t("hero.ctaSecondary")}</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl shadow-[var(--shadow-elevated)]">
              <img
                src={heroImg}
                alt="Livres de coloriage Coloria"
                width={1600}
                height={1100}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-background p-4 shadow-[var(--shadow-soft)] sm:block">
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-ocre text-ocre" />
                  ))}
                </div>
                <span className="text-sm font-medium">4.9 / 5</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">+1 200 clients satisfaits</p>
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* UNIVERSES section removed */}

      {/* PACKS SPECIAUX */}
      <section className="bg-cream/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1 rounded-full border border-coral/30 bg-coral/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-coral">
              <Gift className="h-3 w-3" />
              {t("packsPage.eyebrow")}
            </span>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">{t("packsPage.title")}</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">{t("packsPage.subtitle")}</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {packs.map((p) => (
              <PackCard key={p.slug} pack={p} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/packs">
                {t("nav.packs")}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="inline-block rounded-full border border-border bg-cream px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
            {t("cataloguePage.eyebrow")}
          </span>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl">{t("cataloguePage.title")}</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">{t("cataloguePage.subtitle")}</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 6).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link to="/catalogue">
              {t("product.showMore")}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-4xl sm:text-5xl">{t("benefits.title")}</h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => {
              const Icon = benefitIcons[i];
              return (
                <div key={b.title} className="text-center sm:text-start">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-background shadow-[var(--shadow-soft)] sm:mx-0">
                    <Icon className="h-5 w-5 text-coral" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-4xl sm:text-5xl">{t("testimonials.title")}</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((tst) => (
            <figure key={tst.name} className="overflow-hidden rounded-3xl border border-border bg-card">
              {tst.image && (
                <img
                  src={tst.image}
                  alt={`Témoignage ${tst.name}`}
                  loading="lazy"
                  className="h-56 w-full object-cover"
                />
              )}
              <div className="p-8">
                <Quote className="h-6 w-6 text-coral" />
                {tst.text && (
                  <blockquote className="mt-4 text-pretty text-base leading-relaxed">
                    "{tst.text}"
                  </blockquote>
                )}
                <figcaption className="mt-6 border-t border-border pt-4">
                  <div className="font-medium">{tst.name}</div>
                  {tst.role && <div className="text-sm text-muted-foreground">{tst.role}</div>}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </section>


      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-coral via-ocre to-lavender p-10 text-primary-foreground sm:p-16">
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-serif text-4xl text-balance sm:text-5xl">
              {t("ctaSection.title")}
            </h2>
            <p className="mt-4 text-lg opacity-90">{t("ctaSection.subtitle")}</p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link to="/devis">
                {t("ctaSection.cta")}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-background/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-background/10 blur-3xl" />
        </div>
      </section>
    </div>
  );
}
