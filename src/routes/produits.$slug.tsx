import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, Check, Plus, Truck, ShieldCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/data/products";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/ProductCard";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

export const Route = createFileRoute("/produits/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Coloragy` },
      { name: "description", content: "Livre de coloragyge premium Coloragy." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const params = Route.useParams();
  const { t } = useTranslation();
  const { add } = useCart();
  const products = useProducts();
  const product = useMemo(() => products.find((p) => p.slug === params.slug), [products, params.slug]);
  const [active, setActive] = useState(0);

  const related = useMemo(
    () => (product ? products.filter((p) => p.slug !== product.slug && p.audience === product.audience).slice(0, 4) : []),
    [products, product],
  );

  if (!product) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-serif text-3xl">Produit introuvable</h1>
        <p className="mt-2 text-muted-foreground">Ce livre n'existe pas ou plus.</p>
        <Button asChild className="mt-6"><Link to="/catalogue">Voir le catalogue</Link></Button>
      </div>
    );
  }

  const onAdd = () => {
    add(product.slug, "book", 1);
    toast.success(`${product.title} ${t("cart.added")}`);
  };

  const waMsg = encodeURIComponent(
    `Bonjour Coloragy, je suis intéressé(e) par le livre "${product.title}" (${product.price} DH). Pouvez-vous m'en dire plus ?`,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link to="/catalogue" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Retour au catalogue
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-3xl border border-border bg-cream">
            <img
              src={product.images[active]}
              alt={`${product.title} — vue ${active + 1}`}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
            {product.images.map((src: string, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`overflow-hidden rounded-xl border bg-cream transition-all ${
                  active === i ? "border-foreground ring-2 ring-foreground/10" : "border-border hover:border-foreground/60"
                }`}
                aria-label={`Voir image ${i + 1}`}
              >
                <img src={src} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="inline-block w-fit rounded-full border border-border bg-cream px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
            Livre Coloragy
          </span>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl">{product.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{product.tagline}</p>

          <div className="mt-6 flex items-end gap-3">
            <span className="font-serif text-4xl text-primary">{product.price} <span className="text-base font-sans text-muted-foreground">DH</span></span>
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-coral/10 px-2.5 py-1 text-xs font-semibold text-coral">
              <Truck className="h-3 w-3" /> Livraison offerte
            </span>
          </div>

          <p className="mt-6 leading-relaxed text-foreground/85">{product.description}</p>

          <ul className="mt-6 space-y-2">
            {product.highlights.map((h: string) => (
              <li key={h} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                <span>{h}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={onAdd} className="rounded-full">
              <Plus className="me-2 h-4 w-4" /> {t("cart.add")}
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="me-2 h-4 w-4" /> Commander sur WhatsApp
              </a>
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 text-sm sm:grid-cols-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Pages</div>
              <div className="mt-1 font-medium">{product.specs.pages}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Format</div>
              <div className="mt-1 font-medium">{product.specs.format}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Papier</div>
              <div className="mt-1 font-medium">{product.specs.paper}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Reliure</div>
              <div className="mt-1 font-medium">{product.specs.binding}</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-turquoise" /> Paiement à la livraison</span>
            <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4 text-coral" /> Livraison partout au Maroc</span>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-2xl sm:text-3xl">Vous aimerez aussi</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
