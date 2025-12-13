"use client";

import { useState } from "react";
import { BatteryPicker } from "@/components/BatteryPicker";
import type { CecBattery } from "@/lib/batteries";
import type { CalculationResult } from "@/lib/calc";
import { useI18n } from "@/i18n/I18nProvider";

const DEFAULT_PRICE = 40;

export type InputCardProps = {
  battery: CecBattery | null;
  onBatteryChange: (battery: CecBattery | null) => void;
  installationDate: string;
  onInstallationDateChange: (iso: string) => void;
  usableKWh: number;
  onUsableKWhChange: (kWh: number) => void;
  stcPriceAud: number;
  onStcPriceAudChange: (price: number) => void;
  result: CalculationResult;
};

export function InputCard({
  battery,
  onBatteryChange,
  installationDate,
  onInstallationDateChange,
  usableKWh,
  onUsableKWhChange,
  stcPriceAud,
  onStcPriceAudChange,
  result,
}: InputCardProps) {
  const { locale, t } = useI18n();
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-base font-semibold text-zinc-900">{t("systemParameters")}</div>
      </div>

      <div className="space-y-5">
        <BatteryPicker
          value={battery}
          onChange={onBatteryChange}
          onAutoFillUsableKWh={(k) => {
            if (typeof k === "number") onUsableKWhChange(k);
          }}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-900">{t("installationDate")}</label>
          <input
            type="date"
            value={installationDate}
            onChange={(e) => onInstallationDateChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm"
          />
          <div className="text-xs text-zinc-500">{t("installationDateHint")}</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <label className="block text-sm font-medium text-zinc-900">{t("usableCapacity")}</label>
            <div className="text-sm font-semibold text-emerald-700">{usableKWh} kWh</div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={0.01}
            value={usableKWh}
            onChange={(e) => onUsableKWhChange(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>0</span>
            <span>100</span>
          </div>
          <div className="text-xs text-zinc-500">{t("stcCapHint")}</div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? t("hideAdvanced") : t("advancedPrice")}
          </button>
          {showAdvanced ? (
            <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-xs text-zinc-600">
                {t("defaultPriceHint", { price: DEFAULT_PRICE })}
              </div>
              <div className="flex items-center gap-3">
                <label className="w-28 text-sm font-medium text-zinc-900">{t("stcPrice")}</label>
                <input
                  type="number"
                  min={1}
                  step={0.01}
                  value={stcPriceAud}
                  onChange={(e) => onStcPriceAudChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm"
                />
              </div>
            </div>
          ) : null}
        </div>

        {result.ok ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
            {t("activeRule")}: {result.phase} • {t("factor")}: {result.factor} •{" "}
            {locale === "zh" ? result.factorLabelZh : result.factorLabelEn}
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
            {result.error}
          </div>
        )}
      </div>
    </div>
  );
}


