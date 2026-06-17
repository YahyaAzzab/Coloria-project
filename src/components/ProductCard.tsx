import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { useCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const { add } = useCart();

  const onAdd = () => {
    add(product.slug, "book", 1);
    toast.success(`${product.title} ${t("cart.added")}`);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
      <Link
        to="/produits/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[4/5] overflow-hidden bg-cream"
      >
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          width={800}
          height={1000}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col justify-between gap-3 p-3 sm:p-4">
        <div>
          <h3 className="font-serif text-base leading-tight sm:text-lg">{product.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">{product.tagline}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-serif text-lg text-primary">
            {product.price} <span className="text-xs font-sans text-muted-foreground">DH</span>
          </span>
          <button
            type="button"
            onClick={onAdd}
            aria-label={t("cart.add") as string}
            className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-background transition-colors hover:bg-primary sm:text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("cart.add")}
          </button>
        </div>
      </div>
    </div>
  );
}
