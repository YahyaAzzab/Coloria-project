import { createFileRoute } from "@tanstack/react-router";
import { UniverseView } from "@/components/UniverseView";

export const Route = createFileRoute("/univers/ados")({
  head: () => ({ meta: [{ title: "Univers Ados — Coloragy" }, { name: "description", content: "Livres de coloragyge pour ados : pop-art, manga et univers tendance." }] }),
  component: () => <UniverseView audience="teens" titleKey="universes.teens.title" descKey="universes.teens.desc" />,
});
