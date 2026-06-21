import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, type Audience } from "@/data/products";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/catalogue")({
  head: () => ({
    meta: [
      { title: "Catalogue — Coloragy" },
      { name: "description", content: "Tous nos livres de coloragyge premium en un coup d'œil." },
    ],
  }),
  component: CataloguePage,
});

const STEP = 6;

function CataloguePage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"all" | Audience>("all");
  const [visible, setVisible] = useState(STEP);
  const products = useProducts();

  const filtered = filter === "all" ? products : products.filter((p) => p.audience === filter);
  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const filters: { key: "all" | Audience; label: string }[] = [
    { key: "all", label: t("nav.catalogue") },
    { key: "kids", label: t("nav.kids") },
    { key: "teens", label: t("nav.teens") },
    { key: "adults", label: t("nav.adults") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="text-center">
        <span className="inline-block rounded-full border border-border bg-cream px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
          {t("cataloguePage.eyebrow")}
        </span>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl">{t("cataloguePage.title")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("cataloguePage.subtitle")}</p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setVisible(STEP); }}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              filter === f.key
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <Button onClick={() => setVisible((v) => v + STEP)} size="lg" variant="outline" className="rounded-full">
            {t("product.showMore")}
            <ChevronDown className="ms-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
