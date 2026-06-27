import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Section } from "@/components/layout/section";

type FaqItem = { question: string; answer: string };

/**
 * FAQ section. Uses native `<details>`/`<summary>` so the content is fully
 * crawlable (always present in the HTML), keyboard-accessible by default, and
 * needs no JS state or accordion dependency. The same `items` array feeds the
 * `FAQPage` structured data rendered on the page, so visible copy and schema
 * never drift.
 */
export function FaqSection() {
  const t = useTranslations("FaqSection");
  const items = t.raw("items") as FaqItem[];

  return (
    <Section id="faq" title={t("title")} description={t("description")}>
      <div className="flex flex-col gap-3 max-w-3xl">
        {items.map((item, index) => (
          <details
            key={index}
            className="group rounded-xl border border-border bg-card/40 px-5 py-1 transition-colors hover:border-primary/40 open:border-primary/40 open:bg-card/60"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-foreground [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="pb-4 -mt-1 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}
