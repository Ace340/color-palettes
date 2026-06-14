import { useTranslations } from "next-intl";
import { Section } from "@/components/layout/section";
import { HarmonyControls } from "@/components/palette/harmony-controls";

export function HarmonySection() {
  const t = useTranslations("HarmonySection");

  return (
    <Section
      id="harmony"
      title={t("title")}
      description={t("description")}
    >
      <HarmonyControls />
    </Section>
  );
}
