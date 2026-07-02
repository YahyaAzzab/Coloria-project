import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useProducts, usePacks } from "@/data/products";
import { SHIPPING_FEE, FREE_SHIPPING_FROM } from "@/data/morocco";
import { BadgeCheck, MessageCircle, ShoppingBag, Truck, Printer, MapPin, CreditCard, Calendar, Hash, Package } from "lucide-react";
import { z } from "zod";
import { useCart, type CartItem } from "@/lib/cart";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";

const search = z.object({ produit: z.string().optional() });

type OrderReceipt = {
  orderId: string;
  date: Date;
  customer: {
    name: string;
    phone: string;
    city: string;
    address: string;
  };
  items: Array<{
    title: string;
    qty: number;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
};

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
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);
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
    
    setReceipt({
      orderId: String(Math.floor(Math.random() * 90000) + 10000),
      date: new Date(),
      customer: { name, phone, city, address },
      items: lines.map(l => ({ title: l.label, qty: l.quantity, price: l.price, image: l.image })),
      subtotal,
      shipping,
      total
    });
  };

  const whatsappLink = () => {
    const list = lines.map((l) => `• ${l.label} × ${l.quantity} = ${l.price * l.quantity} DH`).join("%0A");
    const msg = `Bonjour Coloragy, je souhaite commander :%0A${list}%0A• Total : ${total} DH (paiement à la livraison)`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  };

  if (receipt) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <style>{`
          @keyframes slide-up-fade {
            0% { transform: translateY(40px) scale(0.95); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
          .animate-receipt {
            animation: slide-up-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              box-shadow: none !important;
              border: none !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-hide { display: none !important; }
            @page { margin: 1cm; }
          }
        `}</style>
        
        <div className="animate-receipt print-area mx-auto overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl print:rounded-none">
          {/* Header */}
          <div className="bg-coral/5 px-6 py-10 text-center sm:px-12 sm:py-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-coral/20 text-coral shadow-inner">
              <BadgeCheck className="h-10 w-10" />
            </div>
            <h1 className="mt-6 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Merci pour votre commande !
            </h1>
            <p className="mt-2 text-muted-foreground">
              Nous l'avons bien reçue et la préparons avec soin. L'équipe Coloragy vous contactera bientôt.
            </p>
          </div>
          
          {/* Order Meta */}
          <div className="grid grid-cols-2 gap-4 border-y border-dashed border-border bg-cream/30 px-6 py-6 sm:grid-cols-4 sm:px-12">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Hash className="h-3.5 w-3.5" /> N° de commande
              </div>
              <div className="mt-1.5 font-medium">{receipt.orderId}</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Date
              </div>
              <div className="mt-1.5 font-medium">
                {receipt.date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <CreditCard className="h-3.5 w-3.5" /> Paiement
              </div>
              <div className="mt-1.5 font-medium">À la livraison</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Package className="h-3.5 w-3.5" /> Statut
              </div>
              <div className="mt-1.5 font-medium text-turquoise">En préparation</div>
            </div>
          </div>

          <div className="grid gap-8 px-6 py-10 sm:grid-cols-5 sm:px-12 sm:py-12">
            {/* Items & Total */}
            <div className="sm:col-span-3">
              <h2 className="font-serif text-xl font-medium">Détails de la commande</h2>
              <ul className="mt-6 space-y-4">
                {receipt.items.map((it, idx) => (
                  <li key={idx} className="flex items-center gap-4">
                    <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-cream">
                      {it.image ? (
                        <img src={it.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-muted" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium line-clamp-1">{it.title}</div>
                      <div className="text-sm text-muted-foreground">Qté : {it.qty}</div>
                    </div>
                    <div className="text-end font-medium">
                      {it.price * it.qty} <span className="text-xs text-muted-foreground">DH</span>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 space-y-3 border-t border-dashed border-border pt-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium">{receipt.subtotal} DH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="font-medium">{receipt.shipping === 0 ? "Offerte" : `${receipt.shipping} DH`}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-4">
                  <span className="font-serif text-lg font-medium">Total à payer</span>
                  <span className="font-serif text-2xl text-primary">{receipt.total} DH</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="rounded-2xl border border-border bg-cream/40 p-6 sm:col-span-2">
              <h2 className="font-serif text-lg font-medium">Informations</h2>
              <div className="mt-6 space-y-6 text-sm">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <MapPin className="h-4 w-4 text-coral" /> Adresse de livraison
                  </div>
                  <address className="mt-2 text-muted-foreground not-italic">
                    <span className="block font-medium text-foreground">{receipt.customer.name}</span>
                    <span className="block mt-1">{receipt.customer.address}</span>
                    <span className="block">{receipt.customer.city}</span>
                    <span className="block mt-1">{receipt.customer.phone}</span>
                  </address>
                </div>
                <div className="rounded-xl bg-background p-4 text-xs text-muted-foreground shadow-sm">
                  Le livreur vous contactera sur ce numéro avant de passer. Veuillez garder votre téléphone à proximité.
                </div>
              </div>
            </div>
          </div>
          
          <div className="print-hide flex flex-col gap-3 bg-muted/30 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-12">
            <Button variant="outline" className="rounded-full bg-background" onClick={() => window.print()}>
              <Printer className="me-2 h-4 w-4" />
              Imprimer le reçu
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/catalogue">Continuer mes achats</Link>
            </Button>
          </div>
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
                <Input id="city" name="city" required placeholder="Ex: Casablanca" className="mt-1.5" />
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
