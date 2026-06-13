import { Section } from "@/components/layout/section";
import { AiMoodInput } from "@/components/palette/ai-mood-input";

export function AiSection() {
  return (
    <Section
      id="ai"
      title="AI Generator"
      description="Describe a mood in natural language and let AI craft your palette"
    >
      <AiMoodInput />
    </Section>
  );
}
