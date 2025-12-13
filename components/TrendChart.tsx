"use client";

import { STC_FACTOR_PERIODS, parseIsoDate } from "@/lib/stcSchedule";
import { calculateRebate } from "@/lib/calc";
import { useI18n } from "@/i18n/I18nProvider";

export function TrendChart({
  usableKWh,
  stcPriceAud,
}: {
  usableKWh: number;
  stcPriceAud: number;
}) {
  const { locale, t } = useI18n();
  const points = STC_FACTOR_PERIODS.map((p) => {
    const d = parseIsoDate(p.startInclusive)!;
    const res = calculateRebate({ installationDate: d, usableKWh, stcPriceAud });
    const rebate = res.ok ? res.rebateAud : 0;
    return {
      id: p.id,
      label: locale === "zh" ? p.labelZh : p.labelEn,
      factor: p.factor,
      rebate,
    };
  });

  const max = Math.max(...points.map((p) => p.rebate), 1);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between gap-4">
        <div className="text-sm font-semibold text-zinc-900">{t("trendTitle")}</div>
        <div className="text-xs text-zinc-500">{t("trendSubtitle")}</div>
      </div>

      <div className="mt-3 text-sm text-zinc-600">
        {t("trendBasedOn", { kwh: usableKWh })}
      </div>

      <div className="mt-6 grid grid-cols-6 gap-3 md:grid-cols-11">
        {points.map((p) => {
          const h = Math.max(8, Math.round((p.rebate / max) * 140));
          return (
            <div key={p.id} className="flex flex-col items-center gap-2">
              <div className="h-40 w-full rounded-lg bg-zinc-50 p-2">
                <div
                  className="w-full rounded-md bg-emerald-500"
                  style={{ height: `${h}px`, marginTop: `${160 - h}px` }}
                  title={`${p.label}: $${p.rebate.toLocaleString()} AUD`}
                />
              </div>
              <div className="text-[10px] leading-4 text-zinc-500">{p.label}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        {t("trendTip")}
      </div>
    </div>
  );
}


