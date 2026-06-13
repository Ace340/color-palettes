import { Section } from "@/components/layout/section";
import { HarmonyControls } from "@/components/palette/harmony-controls";

export function HarmonySection() {
  return (
    <Section
      id="harmony"
      title="Harmony"
      description="Generate a complete palette from your primary color using color theory"
    >
      <HarmonyControls />
    </Section>
  );
}
