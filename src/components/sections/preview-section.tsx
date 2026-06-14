import { useTranslations } from "next-intl";
import { Section } from "@/components/layout/section";
import { LivePreview } from "@/components/palette/live-preview";

export function PreviewSection() {
  const t = useTranslations("PreviewSection");

  return (
    <Section
      id="preview"
      title={t("title")}
      description={t("description")}
    >
      <LivePreview />
    </Section>
  );
}
