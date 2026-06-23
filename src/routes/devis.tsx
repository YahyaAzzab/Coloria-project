import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useProducts, usePacks } from "@/data/products";
import { MOROCCAN_CITIES, SHIPPING_FEE, FREE_SHIPPING_FROM } from "@/data/morocco";
import { BadgeCheck, MessageCircle, ShoppingBag, Truck } from "lucide-react";
import { z } from "zod";
import { useCart, type CartItem } from "@/lib/cart";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";

const search = z.object({ produit: z.string().optional() });

export const Route = createFileRoute("/devis")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Commander — Coloragy | Paiement à la livraison" },
      { name: "description", content: "Passez commande chez Coloragy avec paiement à la livraison partout au Maroc. Livraison rapide 24–72h." },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { t } = useTranslation();
  const { produit } = Route.useSearch();
  const { items: cartItems, clear: clearCart, getInfo } = useCart();
  const products = useProducts();
  const packs = usePacks();
  const [sending, setSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [singleQty, setSingleQty] = useState(1);

  const catalog = useMemo(
    () => [
      ...packs.map((p) => ({ slug: p.slug, label: p.title, price: p.price, kind: "pack" as const })),
      ...products.map((p) => ({ slug: p.slug, label: p.title, price: p.price, kind: "book" as const })),
    ],
    [products, packs],
  );

  // Mode: explicit single product via URL > cart contents > empty selector fallback
  const explicit = produit ? catalog.find((p) => p.slug === produit) : null;
  const usingCart = !explicit && cartItems.length > 0;

  const lines = useMemo(() => {
    if (explicit) {
      const explicitImg = explicit.kind === "pack" 
        ? packs.find(p => p.slug === explicit.slug)?.image 
        : products.find(p => p.slug === explicit.slug)?.image;
      
      return [{ 
        slug: explicit.slug, 
        kind: explicit.kind, 
        label: explicit.label, 
        price: explicit.price, 
        quantity: singleQty,
        image: explicitImg,
        subtitle: undefined,
        customPack: undefined
      }];
    }
    return cartItems
      .map((it: CartItem) => {
        const info = getInfo(it);
        return info ? { 
          slug: info.slug, 
          kind: info.kind, 
          label: info.title, 
          price: info.price, 
          quantity: it.quantity,
          image: info.image,
          subtitle: info.subtitle,
          customPack: it.customPack
        } : null;
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  }, [explicit, cartItems, singleQty, getInfo, packs, products]);

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (lines.length === 0) {
      toast.error(t("cart.empty"));
      return;
    }
    setSending(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const city = formData.get("city") as string;
    const address = formData.get("address") as string;
    const details = formData.get("details") as string;

    const message = `Ville : ${city}\nAdresse : ${address}\nNotes : ${details}`;
    const items = lines.map(l => ({
      slug: l.slug,
      title: l.label,
      qty: l.quantity,
      price: l.price,
      kind: l.kind,
      image: l.image,
      subtitle: l.subtitle,
      customPack: l.customPack
    }));

    const { error } = await supabase.from('quotes').insert({
      name,
      phone,
      message,
      items,
      status: 'new'
    });

    setSending(false);

    if (error) {
      console.error(error);
      toast.error("Une erreur est survenue lors de la commande.");
      return;
    }

    (e.target as HTMLFormElement).reset();
    setSingleQty(1);
    if (usingCart) clearCart();
    setIsSuccess(true);
  };

  const whatsappLink = () => {
    const list = lines.map((l) => `• ${l.label} × ${l.quantity} = ${l.price * l.quantity} DH`).join("%0A");
    const msg = `Bonjour Coloragy, je souhaite commander :%0A${list}%0A• Total : ${total} DH (paiement à la livraison)`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  };

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <style>{`
          @keyframes success-pop {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-success-pop {
            animation: success-pop 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
        `}</style>
        <div className="flex flex-col items-center justify-center space-y-8 text-center animate-success-pop">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-coral/10 text-coral">
            <BadgeCheck className="h-14 w-14" />
            <div className="absolute inset-0 rounded-full animate-ping bg-coral/20 opacity-20 duration-1000" style={{ animationDuration: '2s' }}></div>
          </div>
          <div className="space-y-4">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Commande confirmée !
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              Merci pour votre confiance. L'équipe de <span className="font-serif font-medium text-foreground">Coloragy</span> vous contactera dans quelques instants pour confirmer votre commande.
            </p>
          </div>
          <Button asChild size="lg" className="mt-8 rounded-full px-8">
            <Link to="/catalogue">Retour au catalogue</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="text-center">
        <span className="inline-flex items-center gap-1 rounded-full border border-coral/30 bg-coral/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-coral">
          <BadgeCheck className="h-3 w-3" />
          {t("quote.codBadge")}
        </span>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl">{t("quote.title")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("quote.subtitle")}</p>
      </div>

      {lines.length === 0 && !explicit ? (
        <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-dashed border-border bg-cream/40 p-10 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">{t("cart.empty")}</p>
          <Button asChild className="mt-6">
            <Link to="/catalogue">{t("cart.emptyCta")}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
            {explicit && (
              <>
                <div>
                  <Label htmlFor="product">{t("quote.product")}</Label>
                  <Input id="product" value={explicit.label} readOnly className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="quantity">{t("quote.quantity")}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={singleQty}
                    onChange={(e) => setSingleQty(Math.max(1, Number(e.target.value) || 1))}
                    required
                    className="mt-1.5"
                  />
                </div>
              </>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">{t("contact.name")}</Label>
                <Input id="name" name="name" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="phone">{t("contact.phone")}</Label>
                <Input id="phone" name="phone" type="tel" required placeholder="+212 6 00 00 00 00" className="mt-1.5" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="city">{t("quote.city")}</Label>
                <select
                  id="city"
                  name="city"
                  required
                  defaultValue=""
                  className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                >
                  <option value="" disabled>—</option>
                  {MOROCCAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="address">{t("quote.address")}</Label>
                <Input id="address" name="address" required className="mt-1.5" />
              </div>
            </div>

            <div>
              <Label htmlFor="details">{t("quote.details")}</Label>
              <Textarea id="details" name="details" rows={3} className="mt-1.5" />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={sending}>
              {t("quote.send")}
            </Button>

            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-md border border-[#25D366] bg-[#25D366]/5 px-4 py-2.5 text-sm font-medium text-[#1faa56] transition-colors hover:bg-[#25D366] hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              {t("quote.whatsappOrder")}
            </a>
          </form>

          <aside className="h-fit rounded-3xl border border-border bg-cream p-6 sm:p-8">
            <h2 className="font-serif text-xl">Récapitulatif</h2>
            <ul className="mt-5 space-y-2 text-sm">
              {lines.map((l) => (
                <li key={l.slug} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{l.label} × {l.quantity}</span>
                  <span className="font-medium">{l.price * l.quantity} DH</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  {t("quote.shippingNote")}
                </span>
                <span className="font-medium">{shipping === 0 ? t("quote.free") : `${shipping} DH`}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">{t("quote.total")}</span>
                  <span className="font-serif text-2xl text-primary">{total} DH</span>
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-background p-4 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                <p>
                  Vous payez en espèces directement au livreur. Aucune avance, aucun risque.
                  Livraison offerte dès <strong>{FREE_SHIPPING_FROM} DH</strong>.
                </p>
              </div>
            </div>
            {usingCart && (
              <Button asChild variant="outline" className="mt-3 w-full">
                <Link to="/panier">{t("cart.title")}</Link>
              </Button>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
