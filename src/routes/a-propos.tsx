import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Sparkles, Heart, Award } from "lucide-react";
import heroImg from "@/assets/hero-coloria.jpg";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — Coloria" },
      { name: "description", content: "L'histoire de Coloria, marque marocaine de livres de coloriage premium." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useTranslation();
  const values = t("about.valueList", { returnObjects: true }) as { title: string; desc: string }[];
  const icons = [Award, Sparkles, Heart];
  return (
    <div>
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl">{t("about.title")}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{t("about.subtitle")}</p>
            <p className="mt-6 text-pretty leading-relaxed">{t("about.p1")}</p>
            <p className="mt-4 text-pretty leading-relaxed">{t("about.p2")}</p>
          </div>
          <div className="overflow-hidden rounded-3xl shadow-[var(--shadow-elevated)]">
            <img src={heroImg} alt="Coloria" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-serif text-3xl sm:text-4xl">{t("about.values")}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {values.map((v, i) => {
            const Icon = icons[i];
            return (
              <div key={v.title} className="rounded-3xl border border-border bg-card p-6">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cream">
                  <Icon className="h-5 w-5 text-coral" />
                </div>
                <h3 className="mt-5 font-serif text-xl">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
