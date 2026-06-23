import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Gift, Sparkles, ShoppingBag, ArrowRight, RotateCcw, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useProducts, PACK_TIERS, packTierImage, type PackTier } from "@/data/products";
import { useCart } from "@/lib/cart";

type PacksSearch = { tier?: 2 | 3 | 4 | 5 };

export const Route = createFileRoute("/packs")({
  validateSearch: (search: Record<string, unknown>): PacksSearch => {
    const raw = Number(search.tier);
    return raw === 2 || raw === 3 || raw === 4 || raw === 5 ? { tier: raw } : {};
  },
  head: () => ({
    meta: [
      { title: "Composez votre pack — Coloragy" },
      {
        name: "description",
        content:
          "Créez votre pack sur-mesure : choisissez 2, 3, 4 ou 5 livres parmi notre collection et profitez de prix doux + un cadeau offert.",
      },
    ],
  }),
  component: PacksPage,
});

function PacksPage() {
  const { t } = useTranslation();
  const { addCustomPack } = useCart();
  const navigate = useNavigate();
  const products = useProducts();
  const { tier: tierParam } = Route.useSearch();
  const initialTier = useMemo(
    () => PACK_TIERS.find((t) => t.size === tierParam) ?? PACK_TIERS[1],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [tier, setTier] = useState<PackTier>(initialTier);
  const [selected, setSelected] = useState<string[]>([]);
  const [addedPack, setAddedPack] = useState(false);

  const tierLabel = (size: number) =>
    t(`packsCreate.tiers.${size}.label`, { defaultValue: PACK_TIERS.find((x) => x.size === size)?.label ?? "" });
  const tierTagline = (size: number) =>
    t(`packsCreate.tiers.${size}.tagline`, { defaultValue: PACK_TIERS.find((x) => x.size === size)?.tagline ?? "" });
  const tierPerk = (size: number) =>
    t(`packsCreate.tiers.${size}.perk`, { defaultValue: PACK_TIERS.find((x) => x.size === size)?.perk ?? "" });
  const tierBadge = (size: number) => {
    const fallback = PACK_TIERS.find((x) => x.size === size)?.badge;
    const v = t(`packsCreate.tiers.${size}.badge`, { defaultValue: fallback ?? "" });
    return v || undefined;
  };

  useEffect(() => {
    if (!tierParam) return;
    const next = PACK_TIERS.find((t) => t.size === tierParam);
    if (next && next.size !== tier.size) {
      setTier(next);
      setSelected((prev) => prev.slice(0, next.size));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tierParam]);

  const remaining = tier.size - selected.length;
  const isComplete = remaining === 0;
  const unitOriginal = 98;
  const fullPrice = tier.size * unitOriginal;
  const savings = fullPrice - tier.price;
  const progress = Math.min(100, (selected.length / tier.size) * 100);

  const selectedProducts = useMemo(
    () => selected.map((slug) => products.find((p) => p.slug === slug)).filter(Boolean) as typeof products,
    [selected, products],
  );

  const toggle = (slug: string) => {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= tier.size) {
        toast.info(t("packsCreate.toastFull", { label: tierLabel(tier.size) }));
        return prev;
      }
      const next = [...prev, slug];
      if (next.length === tier.size) {
        toast.success(t("packsCreate.toastReady"));
      }
      return next;
    });
  };

  const changeTier = (t: PackTier) => {
    setTier(t);
    setSelected((prev) => prev.slice(0, t.size));
  };

  const addToCart = (opts?: { goToCheckout?: boolean }) => {
    if (!isComplete) return;
    addCustomPack({
      tierSize: tier.size,
      tierLabel: tierLabel(tier.size),
      bookSlugs: selectedProducts.map((p) => p.slug),
      bookTitles: selectedProducts.map((p) => p.title),
      perk: tierPerk(tier.size),
      price: tier.price,
      image: selectedProducts[0]?.image ?? packTierImage,
    });
    toast.success(t("packsCreate.toastAdded", { label: tierLabel(tier.size) }));
    setSelected([]);
    if (opts?.goToCheckout) {
      navigate({ to: "/panier" });
    } else {
      setAddedPack(true);
      setTimeout(() => setAddedPack(false), 2000);
    }
  };


  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {/* Hero */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-coral/30 bg-coral/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-coral">
          <Sparkles className="h-3 w-3" />
          {t("packsCreate.eyebrow")}
        </span>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl">{t("packsCreate.title")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          {t("packsCreate.subtitle")}
        </p>
      </div>

      {/* Step 1 — tier */}
      <section className="mt-12">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {t("packsCreate.step1")}
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {PACK_TIERS.map((pt) => {
            const active = tier.size === pt.size;
            const economy = pt.size * unitOriginal - pt.price;
            const badge = tierBadge(pt.size);
            return (
              <button
                key={pt.size}
                onClick={() => changeTier(pt)}
                className={`group relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-start transition-all sm:p-5 ${
                  active
                    ? "border-foreground bg-foreground text-background shadow-[var(--shadow-elevated)]"
                    : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/40"
                }`}
              >
                {badge && (
                  <span className="absolute -top-2 end-3 rounded-full bg-coral px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow">
                    {badge}
                  </span>
                )}
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl sm:text-4xl">{pt.size}</span>
                  <span className={`text-xs ${active ? "text-background/70" : "text-muted-foreground"}`}>{t("packsCreate.books")}</span>
                </div>
                <div className="font-medium">{tierLabel(pt.size)}</div>
                <p className={`text-xs ${active ? "text-background/70" : "text-muted-foreground"}`}>{tierTagline(pt.size)}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-serif text-xl">{pt.price} DH</span>
                  <span className={`text-xs line-through ${active ? "text-background/50" : "text-muted-foreground/60"}`}>
                    {pt.size * unitOriginal} DH
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    active ? "bg-background/15 text-background" : "bg-turquoise/15 text-turquoise"
                  }`}
                >
                  −{economy} DH
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2 — picker */}
      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div className={!isComplete ? "animate-float-rise origin-left" : ""}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {t("packsCreate.step2")}
            </h2>
            <p className="relative mt-2 inline-block font-serif text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl xl:text-7xl">
              <span className={!isComplete ? "text-shimmer" : "text-foreground"}>
                {isComplete
                  ? t("packsCreate.complete")
                  : remaining > 1
                    ? t("packsCreate.choose_other", { count: remaining })
                    : t("packsCreate.choose_one", { count: remaining })}
              </span>
              {!isComplete && (
                <span className="animate-underline-grow absolute -bottom-2 left-0 block h-[3px] w-full rounded-full bg-gradient-to-r from-primary via-primary/70 to-transparent" />
              )}
            </p>
          </div>
          {selected.length > 0 && (
            <button
              onClick={() => setSelected([])}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              <RotateCcw className="h-3 w-3" /> {t("packsCreate.reset")}
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-coral via-ocre to-turquoise transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const isPicked = selected.includes(p.slug);
            const index = selected.indexOf(p.slug);
            const disabled = !isPicked && isComplete;
            return (
              <button
                key={p.slug}
                onClick={() => toggle(p.slug)}
                disabled={disabled}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-card text-start transition-all ${
                  isPicked
                    ? "border-foreground shadow-[var(--shadow-elevated)]"
                    : disabled
                      ? "border-border opacity-40"
                      : "border-border hover:-translate-y-1 hover:border-foreground/40"
                }`}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-cream">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className={`h-full w-full object-cover transition-transform duration-500 ${
                      isPicked ? "scale-105" : "group-hover:scale-105"
                    }`}
                  />
                  {isPicked ? (
                    <span className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-foreground text-background shadow">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100">
                      <Plus className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  )}
                  {isPicked && (
                    <span className="absolute start-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-coral text-[11px] font-bold text-primary-foreground shadow">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-1 font-serif text-sm sm:text-base">{p.title}</h3>
                  <p className="line-clamp-1 text-[11px] text-muted-foreground sm:text-xs">{p.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sticky summary bar */}
      <div className="sticky bottom-3 z-30 mt-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-background/95 p-4 shadow-[var(--shadow-elevated)] backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {/* mini stack of selected covers */}
              <div className="flex -space-x-3">
                {Array.from({ length: tier.size }).map((_, i) => {
                  const p = selectedProducts[i];
                  return (
                    <div
                      key={i}
                      className={`grid h-12 w-9 place-items-center overflow-hidden rounded-md border-2 border-background bg-cream text-xs text-muted-foreground sm:h-14 sm:w-10 ${
                        p ? "" : "border-dashed"
                      }`}
                    >
                      {p ? (
                        <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div>
                <div className="font-serif text-lg sm:text-xl">
                  {t("packsCreate.summary", { label: tierLabel(tier.size), selected: selected.length, size: tier.size })}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-coral">
                  <Gift className="h-3 w-3" />
                  {tierPerk(tier.size)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <div className="text-end">
                <div className="font-serif text-2xl text-primary">{tier.price} DH</div>
                <div className="text-[11px] text-muted-foreground">
                  <span className="line-through">{fullPrice} DH</span>
                  <span className="ms-1.5 font-medium text-turquoise">−{savings} DH</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => addToCart()}
                  disabled={!isComplete || addedPack}
                  size="lg"
                  variant="outline"
                  className={`rounded-full transition-all duration-300 ${addedPack ? "bg-green-500 text-white hover:bg-green-600 border-transparent" : ""}`}
                >
                  {addedPack ? (
                    <>
                      <svg className="me-1.5 h-4 w-4 animate-in zoom-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Ajouté au panier !
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="me-1.5 h-4 w-4" />
                      {isComplete ? t("packsCreate.addToCart") : t("packsCreate.remaining", { n: remaining })}
                    </>
                  )}
                </Button>
                {isComplete && (
                  <Button
                    onClick={() => addToCart({ goToCheckout: true })}
                    size="lg"
                    className="rounded-full"
                  >
                    Finaliser la commande
                    <ArrowRight className="ms-1.5 h-4 w-4 rtl:rotate-180" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reassurance */}
      <div className="mt-16 grid gap-4 rounded-3xl bg-gradient-to-br from-cream via-background to-cream p-8 sm:grid-cols-3 sm:p-10">
        {(t("packsCreate.reassurance", { returnObjects: true }) as Array<{ title: string; desc: string }>).map((b) => (
          <div key={b.title} className="text-center sm:text-start">
            <div className="font-serif text-lg">{b.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link to="/catalogue" className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:underline">
          {t("packsCreate.catalogueLink")}
          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
