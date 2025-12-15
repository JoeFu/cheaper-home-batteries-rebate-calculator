"use client";

import { useMemo, useState } from "react";
import type { CecBattery } from "@/lib/batteries";
import { calculateRebate } from "@/lib/calc";
import { InputCard } from "@/components/InputCard";
import { ResultCard } from "@/components/ResultCard";
import { TrendChart } from "@/components/TrendChart";
import { RulesAccordion } from "@/components/RulesAccordion";

export function Calculator() {
  const [battery, setBattery] = useState<CecBattery | null>(null);
  const [installationDate, setInstallationDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [usableKWh, setUsableKWh] = useState<number>(10);
  const [stcPriceAud, setStcPriceAud] = useState<number>(40);

  const result = useMemo(() => {
    const date = new Date(`${installationDate}T00:00:00Z`);
    return calculateRebate({ installationDate: date, usableKWh, stcPriceAud });
  }, [installationDate, usableKWh, stcPriceAud]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <InputCard
          battery={battery}
          onBatteryChange={setBattery}
          installationDate={installationDate}
          onInstallationDateChange={setInstallationDate}
          usableKWh={usableKWh}
          onUsableKWhChange={setUsableKWh}
          stcPriceAud={stcPriceAud}
          onStcPriceAudChange={setStcPriceAud}
          result={result}
        />

        <ResultCard result={result} />
      </div>

      <TrendChart usableKWh={usableKWh} stcPriceAud={stcPriceAud} />
      <RulesAccordion />
    </div>
  );
}




