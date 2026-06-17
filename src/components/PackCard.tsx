import { Link } from "@tanstack/react-router";
import { Gift, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Pack } from "@/data/products";

export function PackCard({ pack }: { pack: Pack }) {
  const { t } = useTranslation();

  return (
    <Link
      to="/packs"
      search={{ tier: pack.tierSize }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative aspect-square overflow-hidden bg-cream">
        <img
          src={pack.image}
          alt={pack.title}
          loading="lazy"
          width={900}
          height={900}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {pack.badge && (
          <span className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-full bg-coral px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow sm:text-xs">
            <Gift className="h-3 w-3" />
            {pack.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <div>
          <h3 className="font-serif text-base leading-tight sm:text-lg">{pack.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{pack.subtitle}</p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-serif text-xl text-primary sm:text-2xl">
              {pack.price} <span className="text-xs font-sans text-muted-foreground">DH</span>
            </span>
            {pack.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">{pack.oldPrice} DH</span>
            )}
          </div>
          <span
            aria-label={t("cart.add") as string}
            className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-2 text-[11px] font-medium text-background transition-colors group-hover:bg-primary sm:text-xs"
          >
            Composer
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </span>
        </div>
      </div>
    </Link>
  );
}
