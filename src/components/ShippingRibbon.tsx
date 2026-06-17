import { Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ShippingRibbon() {
  const { t } = useTranslation();
  const label = t("ribbon.freeShipping");
  const items = Array.from({ length: 8 });
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 overflow-hidden">
      <div className="mx-2 rounded-full bg-coral/95 py-1 text-primary-foreground shadow-[var(--shadow-soft)]">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {items.concat(items).map((_, i) => (
            <span key={i} className="mx-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
              <Truck className="h-3 w-3" />
              {label}
              <span aria-hidden className="opacity-70">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
