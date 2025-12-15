import { describe, expect, test } from "vitest";
import { calculateRebate } from "./calc";

const PRICE = 40;

describe("calculateRebate", () => {
  test("rejects dates outside supported schedule", () => {
    const res = calculateRebate({
      installationDate: new Date("2025-06-30T00:00:00Z"),
      usableKWh: 10,
      stcPriceAud: PRICE,
    });
    expect(res.ok).toBe(false);
  });

  test("phase1 (before 2026-05-01) has no taper; eligible is capped at 50", () => {
    const res = calculateRebate({
      installationDate: new Date("2026-04-30T00:00:00Z"),
      usableKWh: 60,
      stcPriceAud: PRICE,
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.phase).toBe("phase1");
    expect(res.factor).toBe(8.4);
    expect(res.eligibleUsableKWh).toBe(50);
    expect(res.weightedKWh).toBe(50);
    expect(res.stcs).toBeCloseTo(50 * 8.4, 2);
    expect(res.warnings.length).toBe(1);
    expect(res.buckets.length).toBe(1);
    expect(res.buckets[0].id).toBe("0_50");
  });

  test("phase2 (from 2026-05-01) applies 14/28/50 taper", () => {
    const res = calculateRebate({
      installationDate: new Date("2026-05-01T00:00:00Z"),
      usableKWh: 50,
      stcPriceAud: PRICE,
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.phase).toBe("phase2");
    expect(res.factor).toBe(6.8);
    // weightedKWh = 14*1 + 14*0.6 + 22*0.15 = 25.7
    expect(res.weightedKWh).toBeCloseTo(25.7, 2);
    expect(res.stcs).toBeCloseTo(25.7 * 6.8, 2);
    expect(res.buckets.length).toBe(3);
  });

  test("taper boundary at 14 kWh", () => {
    const res = calculateRebate({
      installationDate: new Date("2027-01-01T00:00:00Z"),
      usableKWh: 14,
      stcPriceAud: PRICE,
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.weightedKWh).toBe(14);
    expect(res.buckets[0].kWh).toBe(14);
    expect(res.buckets[1].kWh).toBe(0);
    expect(res.buckets[2].kWh).toBe(0);
  });

  test("taper boundary at 28 kWh", () => {
    const res = calculateRebate({
      installationDate: new Date("2027-01-01T00:00:00Z"),
      usableKWh: 28,
      stcPriceAud: PRICE,
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    // 14 + 14*0.6 = 22.4
    expect(res.weightedKWh).toBeCloseTo(22.4, 2);
  });
});




