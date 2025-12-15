export type StcFactorPeriod = {
  id: string;
  startInclusive: string; // YYYY-MM-DD
  endInclusive: string; // YYYY-MM-DD
  factor: number;
  labelEn: string;
  labelZh: string;
};

export const STC_FACTOR_PERIODS: readonly StcFactorPeriod[] = [
  {
    id: "2025H2",
    startInclusive: "2025-07-01",
    endInclusive: "2025-12-31",
    factor: 9.3,
    labelEn: "2025 (Jul–Dec)",
    labelZh: "2025（7–12月）",
  },
  {
    id: "2026JanApr",
    startInclusive: "2026-01-01",
    endInclusive: "2026-04-30",
    factor: 8.4,
    labelEn: "2026 (Jan–Apr)",
    labelZh: "2026（1–4月）",
  },
  {
    id: "2026MayDec",
    startInclusive: "2026-05-01",
    endInclusive: "2026-12-31",
    factor: 6.8,
    labelEn: "2026 (May–Dec)",
    labelZh: "2026（5–12月）",
  },
  {
    id: "2027JanJun",
    startInclusive: "2027-01-01",
    endInclusive: "2027-06-30",
    factor: 5.7,
    labelEn: "2027 (Jan–Jun)",
    labelZh: "2027（1–6月）",
  },
  {
    id: "2027JulDec",
    startInclusive: "2027-07-01",
    endInclusive: "2027-12-31",
    factor: 5.2,
    labelEn: "2027 (Jul–Dec)",
    labelZh: "2027（7–12月）",
  },
  {
    id: "2028JanJun",
    startInclusive: "2028-01-01",
    endInclusive: "2028-06-30",
    factor: 4.6,
    labelEn: "2028 (Jan–Jun)",
    labelZh: "2028（1–6月）",
  },
  {
    id: "2028JulDec",
    startInclusive: "2028-07-01",
    endInclusive: "2028-12-31",
    factor: 4.1,
    labelEn: "2028 (Jul–Dec)",
    labelZh: "2028（7–12月）",
  },
  {
    id: "2029JanJun",
    startInclusive: "2029-01-01",
    endInclusive: "2029-06-30",
    factor: 3.6,
    labelEn: "2029 (Jan–Jun)",
    labelZh: "2029（1–6月）",
  },
  {
    id: "2029JulDec",
    startInclusive: "2029-07-01",
    endInclusive: "2029-12-31",
    factor: 3.1,
    labelEn: "2029 (Jul–Dec)",
    labelZh: "2029（7–12月）",
  },
  {
    id: "2030JanJun",
    startInclusive: "2030-01-01",
    endInclusive: "2030-06-30",
    factor: 2.6,
    labelEn: "2030 (Jan–Jun)",
    labelZh: "2030（1–6月）",
  },
  {
    id: "2030JulDec",
    startInclusive: "2030-07-01",
    endInclusive: "2030-12-31",
    factor: 2.1,
    labelEn: "2030 (Jul–Dec)",
    labelZh: "2030（7–12月）",
  },
] as const;

export function parseIsoDate(iso: string): Date | null {
  // Expect YYYY-MM-DD (no timezone ambiguity beyond midnight UTC).
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function isIsoOnOrAfter(aIso: string, bIso: string): boolean {
  const a = parseIsoDate(aIso);
  const b = parseIsoDate(bIso);
  if (!a || !b) return false;
  return a.getTime() >= b.getTime();
}

export function findStcFactorPeriod(date: Date): StcFactorPeriod | null {
  const ts = date.getTime();
  for (const p of STC_FACTOR_PERIODS) {
    const start = parseIsoDate(p.startInclusive)!.getTime();
    const end = parseIsoDate(p.endInclusive)!.getTime();
    if (ts >= start && ts <= end) return p;
  }
  return null;
}




