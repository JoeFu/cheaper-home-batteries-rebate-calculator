"use client";

import { STC_FACTOR_PERIODS } from "@/lib/stcSchedule";
import { useI18n } from "@/i18n/I18nProvider";

export function RulesAccordion() {
  const { locale, t } = useI18n();
  return (
    <details className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <summary className="cursor-pointer select-none text-sm font-semibold text-zinc-900">
        {t("rulesSummary")}
      </summary>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div>
          <div className="text-sm font-semibold text-zinc-900">{t("rulesTitleFactors")}</div>
          <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200">
            <table className="min-w-max w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="px-3 py-2 font-medium">{t("period")}</th>
                  <th className="px-3 py-2 font-medium">{t("factor")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {STC_FACTOR_PERIODS.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 text-zinc-800">
                      {locale === "zh" ? p.labelZh : p.labelEn}
                    </td>
                    <td className="px-3 py-2 font-semibold text-emerald-700">{p.factor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold text-zinc-900">{t("rulesTitleTaper")}</div>

          <div className="rounded-xl border border-zinc-200 p-4">
            <div className="text-xs font-semibold text-zinc-900">{t("phase1Title")}</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-zinc-700">
              <li>{t("phase1Rule1")}</li>
              <li>{t("phase1Rule2")}</li>
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-200 p-4">
            <div className="text-xs font-semibold text-zinc-900">{t("phase2Title")}</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-zinc-700">
              <li>{t("phase2Rule1")}</li>
              <li>{t("phase2Rule2")}</li>
              <li>{t("phase2Rule3")}</li>
              <li>{t("phase2Rule4")}</li>
            </ul>
          </div>

          <div className="text-xs text-zinc-500">
            {t("sources")}:{" "}
            <a
              className="underline hover:text-zinc-700"
              href="https://www.dcceew.gov.au/energy/programs/cheaper-home-batteries"
              target="_blank"
              rel="noreferrer"
            >
              DCCEEW program page
            </a>{" "}
            and{" "}
            <a
              className="underline hover:text-zinc-700"
              href="https://cer.gov.au/document_page/cec-approved-solar-batteries"
              target="_blank"
              rel="noreferrer"
            >
              CEC approved batteries list
            </a>
            .
          </div>
        </div>
      </div>
    </details>
  );
}


