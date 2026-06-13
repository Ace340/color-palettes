import { Section } from "@/components/layout/section";
import { LivePreview } from "@/components/palette/live-preview";

export function PreviewSection() {
  return (
    <Section
      id="preview"
      title="Live Preview"
      description="See your palette in a real UI context"
    >
      <LivePreview />
    </Section>
  );
}
