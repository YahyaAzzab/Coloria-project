import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { SHIPPING_FEE, FREE_SHIPPING_FROM } from "@/data/morocco";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Panier — Coloria" },
      { name: "description", content: "Vérifiez votre panier et passez commande avec paiement à la livraison." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { t } = useTranslation();
  const { items, subtotal, count, setQty, remove, clear, getInfo } = useCart();

  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl">{t("cart.title")}</h1>
          {count > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {count} {t("cart.items")}
            </p>
          )}
        </div>
        {items.length > 0 && (
          <button onClick={clear} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
            {t("cart.clear")}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-cream/40 p-12 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">{t("cart.empty")}</p>
          <Button asChild className="mt-6">
            <Link to="/catalogue">{t("cart.emptyCta")}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <ul className="space-y-3">
            {items.map((it) => {
              const info = getInfo(it);
              if (!info) return null;
              return (
                <li
                  key={it.slug}
                  className="flex gap-3 rounded-2xl border border-border bg-card p-3 sm:gap-4 sm:p-4"
                >
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream sm:h-28 sm:w-24">
                    <img src={info.image} alt={info.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-base sm:text-lg">{info.title}</h3>
                      <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">{info.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          onClick={() => setQty(it.slug, it.quantity - 1)}
                          aria-label="−"
                          className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-medium">{it.quantity}</span>
                        <button
                          onClick={() => setQty(it.slug, it.quantity + 1)}
                          aria-label="+"
                          className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-base text-primary sm:text-lg">
                          {info.price * it.quantity} <span className="text-xs font-sans text-muted-foreground">DH</span>
                        </span>
                        <button
                          onClick={() => remove(it.slug)}
                          aria-label={t("cart.remove") as string}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit rounded-3xl border border-border bg-cream p-6 sm:p-8">
            <h2 className="font-serif text-xl">{t("cart.total")}</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                <span className="font-medium">{subtotal} DH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("cart.shipping")}</span>
                <span className="font-medium">{shipping === 0 ? t("quote.free") : `${shipping} DH`}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">{t("cart.total")}</span>
                  <span className="font-serif text-2xl text-primary">{total} DH</span>
                </div>
              </div>
            </div>
            <Button asChild size="lg" className="mt-6 w-full">
              <Link to="/devis">{t("cart.checkout")}</Link>
            </Button>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link to="/catalogue">{t("cart.continue")}</Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
