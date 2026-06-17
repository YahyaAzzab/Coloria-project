import { createFileRoute } from "@tanstack/react-router";
import { UniverseView } from "@/components/UniverseView";

export const Route = createFileRoute("/univers/enfants")({
  head: () => ({ meta: [{ title: "Univers Enfants — Coloria" }, { name: "description", content: "Livres de coloriage pour enfants : illustrations joyeuses et créatives." }] }),
  component: () => <UniverseView audience="kids" titleKey="universes.kids.title" descKey="universes.kids.desc" />,
});
