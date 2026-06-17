import { useTranslation } from "react-i18next";

export function ComingSoon({ titleKey, descKey }: { titleKey: string; descKey: string }) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <span className="inline-block rounded-full border border-border bg-cream px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
        Bientôt disponible
      </span>
      <h1 className="mt-6 font-serif text-5xl sm:text-6xl">{t(titleKey)}</h1>
      <p className="mt-6 text-lg text-muted-foreground">{t(descKey)}</p>
    </div>
  );
}
