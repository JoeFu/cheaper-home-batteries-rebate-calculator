import { findStcFactorPeriod } from "./stcSchedule";
import { buildBuckets, getTaperPhase, sumWeightedKWh } from "./taper";

export type CalculationInput = {
  installationDate: Date;
  usableKWh: number;
  stcPriceAud: number; // user-entered; default 40; excluding GST
};

export type BucketBreakdown = {
  id: string;
  labelEn: string;
  labelZh: string;
  kWh: number;
  rate: number;
  weightedKWh: number;
  stcs: number;
  rebateAud: number;
};

export type CalculationResult =
  | {
      ok: true;
      phase: "phase1" | "phase2";
      factor: number;
      factorPeriodId: string;
      factorLabelEn: string;
      factorLabelZh: string;
      eligibleUsableKWh: number;
      weightedKWh: number;
      stcs: number;
      rebateAud: number;
      buckets: BucketBreakdown[];
      warnings: string[];
    }
  | {
      ok: false;
      error: string;
    };

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateRebate(input: CalculationInput): CalculationResult {
  const { installationDate, usableKWh, stcPriceAud } = input;
  if (!(installationDate instanceof Date) || Number.isNaN(installationDate.getTime())) {
    return { ok: false, error: "Invalid installation date." };
  }
  if (!Number.isFinite(usableKWh) || usableKWh < 0) {
    return { ok: false, error: "Usable capacity must be a non-negative number." };
  }
  if (!Number.isFinite(stcPriceAud) || stcPriceAud <= 0) {
    return { ok: false, error: "STC price must be a positive number." };
  }

  const period = findStcFactorPeriod(installationDate);
  if (!period) {
    return {
      ok: false,
      error:
        "Date is outside supported program factor schedule (supported: 2025-07-01 to 2030-12-31).",
    };
  }

  const phase = getTaperPhase(installationDate);
  const buckets = buildBuckets(usableKWh, installationDate);
  const weightedKWh = sumWeightedKWh(buckets);
  const stcs = weightedKWh * period.factor;
  const rebateAud = stcs * stcPriceAud;

  const eligibleUsableKWh = Math.min(Math.max(usableKWh, 0), 50);
  const warnings: string[] = [];
  if (usableKWh > 50) warnings.push("Only the first 50 kWh of usable capacity can create STCs.");

  const bucketBreakdown: BucketBreakdown[] = buckets.map((b) => {
    const bucketStcs = b.weightedKWh * period.factor;
    const bucketRebate = bucketStcs * stcPriceAud;
    return {
      id: b.id,
      labelEn: b.labelEn,
      labelZh: b.labelZh,
      kWh: round2(b.kWh),
      rate: b.rate,
      weightedKWh: round2(b.weightedKWh),
      stcs: round2(bucketStcs),
      rebateAud: round2(bucketRebate),
    };
  });

  return {
    ok: true,
    phase,
    factor: period.factor,
    factorPeriodId: period.id,
    factorLabelEn: period.labelEn,
    factorLabelZh: period.labelZh,
    eligibleUsableKWh: round2(eligibleUsableKWh),
    weightedKWh: round2(weightedKWh),
    stcs: round2(stcs),
    rebateAud: round2(rebateAud),
    buckets: bucketBreakdown,
    warnings,
  };
}


