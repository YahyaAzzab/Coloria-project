import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState, type FormEvent } from "react";
import { MapPin, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Coloragy" },
      { name: "description", content: "Contactez Coloragy pour toute question, projet ou commande." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      (e.target as HTMLFormElement).reset();
      toast.success(t("contact.success"));
    }, 600);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl">{t("contact.title")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("contact.subtitle")}</p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          {[
            { Icon: MapPin, label: t("contact.addressLabel"), value: t("contact.address") },
            { Icon: Clock, label: t("contact.hoursLabel"), value: t("contact.hours") },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream">
                <Icon className="h-4 w-4 text-coral" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
                <div className="mt-1 font-medium">{value}</div>
              </div>
            </div>
          ))}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour Coloragy, j'ai une question.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#25D366] bg-[#25D366]/10 px-5 py-4 text-sm font-medium text-[#1faa56] transition-colors hover:bg-[#25D366] hover:text-white"
          >
            <MessageCircle className="h-4 w-4" />
            {t("contact.whatsappCta")}
          </a>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">{t("contact.name")}</Label>
              <Input id="name" name="name" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">{t("contact.email")}</Label>
              <Input id="email" name="email" type="email" required className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">{t("contact.phone")}</Label>
            <Input id="phone" name="phone" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="message">{t("contact.message")}</Label>
            <Textarea id="message" name="message" rows={5} required className="mt-1.5" />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={sending}>
            {t("contact.send")}
          </Button>
        </form>
      </div>
    </div>
  );
}
