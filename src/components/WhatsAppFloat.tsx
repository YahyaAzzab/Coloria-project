import { MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart";
import { buildCartWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppFloat() {
  const { items, getInfo } = useCart();
  const href = buildCartWhatsAppLink(items, getInfo);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Commander via WhatsApp"
      className="fixed bottom-5 end-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-[var(--shadow-elevated)] transition-transform hover:scale-105"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
