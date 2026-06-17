import { Truck, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ShippingMarquee() {
  const { t } = useTranslation();
  const label = t("ribbon.freeShipping");
  const items = Array.from({ length: 10 });
  return (
    <div
      className="relative overflow-hidden border-y border-coral/30 bg-gradient-to-r from-coral via-ocre to-coral text-primary-foreground"
      role="region"
      aria-label={label as string}
    >
      <div className="flex w-max animate-marquee whitespace-nowrap py-2">
        {items.concat(items).map((_, i) => (
          <span
            key={i}
            className="mx-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm"
          >
            <Truck className="h-4 w-4" />
            {label}
            <Sparkles className="h-3 w-3 opacity-80" />
            <span aria-hidden className="opacity-60">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
