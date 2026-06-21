import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Instagram, Facebook, Phone, MapPin, BadgeCheck, Truck } from "lucide-react";
import logo from "@/assets/logo-coloragy.png";

export function SiteFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border/60 bg-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center">
            <img src={logo} alt={t("brand")} className="h-20 w-auto scale-110 object-contain -ml-2" />
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">{t("tagline")}</p>

          <ul className="mt-6 space-y-2 text-sm">
            <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-coral" />{t("trust.cod")}</li>
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-coral" />{t("trust.shipping")} — {t("trust.everywhere")}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-sm uppercase tracking-wider text-muted-foreground">
            {t("footer.navTitle")}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/catalogue" className="hover:text-primary">{t("nav.catalogue")}</Link></li>
            <li><Link to="/packs" className="hover:text-primary">{t("nav.packs")}</Link></li>
            <li><Link to="/a-propos" className="hover:text-primary">{t("nav.about")}</Link></li>
            <li><Link to="/contact" className="hover:text-primary">{t("nav.contact")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-sm uppercase tracking-wider text-muted-foreground">
            {t("footer.contactTitle")}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-coral" />Fès, Maroc</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-coral" />+212 772-305473</li>
          </ul>
          <div className="mt-5 flex gap-3">
            <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-border transition-colors hover:bg-primary hover:text-primary-foreground">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-border transition-colors hover:bg-primary hover:text-primary-foreground">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span>© {year} {t("brand")}. {t("footer.rights")}</span>
          <Link
            to="/admin/login"
            className="text-[11px] text-muted-foreground/60 transition-colors hover:text-foreground"
          >
            Espace admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
