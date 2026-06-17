import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, type Audience } from "@/data/products";

const STEP = 6;

export function UniverseView({ audience, titleKey, descKey }: { audience: Audience; titleKey: string; descKey: string; }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(STEP);
  const products = useProducts();
  const items = products.filter((p) => p.audience === audience);
  const shown = items.slice(0, visible);
  const hasMore = visible < items.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="text-center">
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl">{t(titleKey)}</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t(descKey)}</p>
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
