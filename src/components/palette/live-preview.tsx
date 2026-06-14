"use client";

import { useTranslations } from "next-intl";
import { usePalette } from "@/hooks/use-palette";

export function LivePreview() {
  const t = useTranslations("LivePreview");
  const { palette } = usePalette();

  const metrics = [
    { label: t("metricRevenue"), value: "$12.4k" },
    { label: t("metricUsers"), value: "2,847" },
    { label: t("metricGrowth"), value: "+14%" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">{t("heading")}</h3>
      <div
        className="rounded-xl p-6 border border-border/50"
        style={{ backgroundColor: palette.background }}
      >
        <div
          className="rounded-lg p-4 shadow-sm"
          style={{ backgroundColor: palette.surface }}
        >
          <h4
            className="text-lg font-bold mb-1"
            style={{ color: palette.primary }}
          >
            {t("mockDashboardOverview")}
          </h4>
          <p
            className="text-sm mb-3"
            style={{ color: palette.secondary }}
          >
            {t("mockSubtitle")}
          </p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded-md text-sm font-medium text-white"
              style={{ backgroundColor: palette.accent }}
            >
              {t("mockViewReports")}
            </button>
            <button
              className="px-3 py-1.5 rounded-md text-sm font-medium border"
              style={{
                borderColor: palette.primary,
                color: palette.primary,
                backgroundColor: "transparent",
              }}
            >
              {t("mockSettings")}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-md p-2 text-center"
                style={{
                  backgroundColor: palette.background,
                  borderTop: `2px solid ${palette.accent}`,
                }}
              >
                <div
                  className="text-xs font-medium"
                  style={{ color: palette.secondary }}
                >
                  {metric.label}
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: palette.primary }}
                >
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
