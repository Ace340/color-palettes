import { useTranslations } from "next-intl";
import { Section } from "@/components/layout/section";
import { AiMoodInput } from "@/components/palette/ai-mood-input";

export function AiSection() {
  const t = useTranslations("AiSection");

  return (
    <Section
      id="ai"
      title={t("title")}
      description={t("description")}
    >
      <AiMoodInput />
    </Section>
  );
}
