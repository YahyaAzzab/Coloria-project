import { createFileRoute } from "@tanstack/react-router";
import { UniverseView } from "@/components/UniverseView";

export const Route = createFileRoute("/univers/adultes")({
  head: () => ({ meta: [{ title: "Univers Adultes — Coloragy" }, { name: "description", content: "Livres de coloragyge pour adultes : mandalas, botaniques, anti-stress." }] }),
  component: () => <UniverseView audience="adults" titleKey="universes.adults.title" descKey="universes.adults.desc" />,
});
