import { useTranslation } from "react-i18next";
import { LANGS, type Lang } from "@/i18n/translations";
import { applyDirection } from "@/i18n";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage ?? "fr") as Lang;

  const change = (code: Lang) => {
    i18n.changeLanguage(code);
    applyDirection(code);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("coloragy-lang", code);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 font-medium">
          <Globe className="h-4 w-4" />
          {LANGS.find((l) => l.code === current)?.native ?? "FR"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => change(l.code)}
            className={current === l.code ? "font-semibold text-primary" : ""}
          >
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
