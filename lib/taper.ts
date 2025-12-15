export type TaperPhase = "phase1" | "phase2";

export type Bucket = {
  id: "0_14" | "14_28" | "28_50" | "0_50";
  labelEn: string;
  labelZh: string;
  kWh: number; // raw kWh in this bucket
  rate: number; // multiplier applied to STC factor
  weightedKWh: number; // kWh * rate
};

export const TAPER_START_ISO = "2026-05-01";

export function getTaperPhase(date: Date): TaperPhase {
  const taperStart = new Date(`${TAPER_START_ISO}T00:00:00Z`).getTime();
  return date.getTime() >= taperStart ? "phase2" : "phase1";
}

export function clampNumber(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function buildBuckets(usableKWh: number, date: Date): Bucket[] {
  const eligible = clampNumber(usableKWh, 0, 50);
  const phase = getTaperPhase(date);

  if (eligible === 0) {
    return [
      {
        id: "0_50",
        labelEn: "0 - 50 kWh",
        labelZh: "0 - 50 kWh",
        kWh: 0,
        rate: 1,
        weightedKWh: 0,
      },
    ];
  }

  if (phase === "phase1") {
    return [
      {
        id: "0_50",
        labelEn: "0 - 50 kWh",
        labelZh: "0 - 50 kWh",
        kWh: eligible,
        rate: 1,
        weightedKWh: eligible,
      },
    ];
  }

  const b1 = clampNumber(eligible, 0, 14);
  const b2 = clampNumber(eligible - 14, 0, 14);
  const b3 = clampNumber(eligible - 28, 0, 22);

  return [
    {
      id: "0_14",
      labelEn: "0 - 14 kWh",
      labelZh: "0 - 14 kWh",
      kWh: b1,
      rate: 1,
      weightedKWh: b1 * 1,
    },
    {
      id: "14_28",
      labelEn: "14 - 28 kWh",
      labelZh: "14 - 28 kWh",
      kWh: b2,
      rate: 0.6,
      weightedKWh: b2 * 0.6,
    },
    {
      id: "28_50",
      labelEn: "28 - 50 kWh",
      labelZh: "28 - 50 kWh",
      kWh: b3,
      rate: 0.15,
      weightedKWh: b3 * 0.15,
    },
  ];
}

export function sumWeightedKWh(buckets: Bucket[]): number {
  return buckets.reduce((acc, b) => acc + b.weightedKWh, 0);
}




