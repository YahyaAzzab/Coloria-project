import type { CartItem, CartItemInfo } from "@/lib/cart";
import { SHIPPING_FEE, FREE_SHIPPING_FROM } from "@/data/morocco";

export const WHATSAPP_NUMBER = "212772305473";

export function buildCartWhatsAppLink(
  items: CartItem[],
  getInfo: (it: CartItem) => CartItemInfo | null,
): string {
  if (items.length === 0) {
    const msg = encodeURIComponent("Bonjour Coloria, je souhaite passer une commande.");
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }
  const lines = items
    .map((it) => {
      const info = getInfo(it);
      if (!info) return null;
      return `• ${info.title} × ${it.quantity} = ${info.price * it.quantity} DH`;
    })
    .filter(Boolean) as string[];

  const subtotal = items.reduce((s, it) => {
    const info = getInfo(it);
    return s + (info ? info.price * it.quantity : 0);
  }, 0);
  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const shippingLine = shipping === 0 ? "Livraison : offerte" : `Livraison : ${shipping} DH`;

  const text = [
    "Bonjour Coloria, je souhaite passer la commande suivante :",
    "",
    ...lines,
    "",
    shippingLine,
    `Total : ${total} DH (paiement à la livraison)`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
