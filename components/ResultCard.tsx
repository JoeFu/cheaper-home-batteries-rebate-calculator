"use client";

import type { CalculationResult } from "@/lib/calc";
import { useI18n } from "@/i18n/I18nProvider";

const COLORS: Record<string, string> = {
  "0_14": "bg-emerald-500",
  "14_28": "bg-blue-500",
  "28_50": "bg-orange-500",
  "0_50": "bg-emerald-500",
};

export function ResultCard({ result }: { result: CalculationResult }) {
  const { locale, t } = useI18n();
  if (!result.ok) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-900">{t("estimatedRebate")}</div>
        <div className="mt-3 text-sm text-zinc-600">{result.error}</div>
      </div>
    );
  }

  const maxBucketRebate = Math.max(...result.buckets.map((b) => b.rebateAud), 1);

  return (
    <div className="sticky top-6 rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-zinc-700">{t("estimatedRebate")}</div>
          <div className="mt-2 text-5xl font-semibold tracking-tight text-emerald-700">
            ${result.rebateAud.toLocaleString()}
            <span className="ml-2 text-base font-semibold text-zinc-500">AUD</span>
          </div>
        </div>
        <div className="rounded-full bg-emerald-50 px-5 py-4 text-center">
          <div className="text-xs font-medium text-zinc-600">STCs</div>
          <div className="mt-1 text-2xl font-semibold text-zinc-900">{result.stcs}</div>
        </div>
      </div>

      <div className="mt-6 border-t border-zinc-100 pt-5">
        <div className="text-sm font-semibold text-zinc-900">{t("calculationBreakdown")}</div>
        <div className="mt-4 space-y-4">
          {result.buckets.map((b) => {
            const widthPct = Math.round((b.rebateAud / maxBucketRebate) * 100);
            return (
              <div key={b.id} className="space-y-2">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-sm font-medium text-zinc-900">
                    {(locale === "zh" ? b.labelZh : b.labelEn)}{" "}
                    <span className="text-zinc-500">({b.kWh} kWh)</span>
                  </div>
                  <div className="text-sm font-semibold text-zinc-900">
                    ${b.rebateAud.toLocaleString()}{" "}
                    <span className="text-xs font-medium text-zinc-500">({b.stcs} STCs)</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-100">
                  <div
                    className={`h-2 rounded-full ${COLORS[b.id] ?? "bg-emerald-500"}`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <div className="flex justify-end text-xs text-zinc-500">
                  {t("rate")}: {Math.round(b.rate * 100)}%
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600">
          <div>
            {t("baseFactor")}: <span className="font-semibold">{result.factor}</span>{" "}
            <span className="text-zinc-400">
              ({locale === "zh" ? result.factorLabelZh : result.factorLabelEn})
            </span>
          </div>
          <div>
            {t("formula")}: <span className="font-semibold">STCs × Price</span>
          </div>
        </div>

        {result.warnings.length ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-amber-700">
            {result.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}


