import batteriesJson from "@/data/cec-batteries.json";
import metaJson from "@/data/cec-batteries.meta.json";

export type CecBattery = {
  manufacturer: string;
  model: string;
  usable_kwh: number | null;
};

export type CecMeta = {
  fetchedAt: string;
  sourcePageUrl: string;
  sourceCsvUrl: string;
  recordCount: number;
  columnMapping: Record<string, string>;
};

export const cecBatteries = batteriesJson as unknown as CecBattery[];
export const cecMeta = metaJson as unknown as CecMeta;

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function formatBatteryLabel(b: CecBattery): string {
  return `${b.manufacturer} — ${b.model}`;
}

export function searchBatteries(query: string, limit = 25): CecBattery[] {
  const q = normalize(query);
  if (!q) return cecBatteries.slice(0, limit);
  const parts = q.split(" ").filter(Boolean);
  const matches: CecBattery[] = [];
  for (const b of cecBatteries) {
    const hay = normalize(`${b.manufacturer} ${b.model}`);
    let ok = true;
    for (const p of parts) {
      if (!hay.includes(p)) {
        ok = false;
        break;
      }
    }
    if (ok) matches.push(b);
    if (matches.length >= limit) break;
  }
  return matches;
}




