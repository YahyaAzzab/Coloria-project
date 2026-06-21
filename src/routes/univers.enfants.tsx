import { createFileRoute } from "@tanstack/react-router";
import { UniverseView } from "@/components/UniverseView";

export const Route = createFileRoute("/univers/enfants")({
  head: () => ({ meta: [{ title: "Univers Enfants — Coloragy" }, { name: "description", content: "Livres de coloragyge pour enfants : illustrations joyeuses et créatives." }] }),
  component: () => <UniverseView audience="kids" titleKey="universes.kids.title" descKey="universes.kids.desc" />,
});
