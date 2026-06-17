import { useTranslation } from "react-i18next";
import { Truck, BadgeCheck, Phone, MapPin } from "lucide-react";

export function TrustStrip() {
  const { t } = useTranslation();
  const items = [
    { Icon: BadgeCheck, label: t("trust.cod") },
    { Icon: Truck, label: t("trust.shipping") },
    { Icon: MapPin, label: t("trust.everywhere") },
    { Icon: Phone, label: t("trust.support") },
  ];
  return (
    <div className="border-y border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-5 sm:grid-cols-4 sm:px-6 lg:px-8">
        {items.map(({ Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream">
              <Icon className="h-4 w-4 text-coral" />
            </div>
            <span className="text-xs font-medium leading-tight sm:text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
