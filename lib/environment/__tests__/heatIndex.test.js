import { computeHeatIndexC } from "@/lib/environment/heatIndex";

const fToC = (f) => ((f - 32) * 5) / 9;

describe("Heat Index NWS/NOAA", () => {
  // Nilai dari tabel Heat Index NWS (°F), toleransi ±1°F karena tabel dibulatkan.
  test.each([
    [80, 40, 80],
    [90, 50, 95],
    [100, 40, 109],
    [86, 90, 105],
    [96, 65, 121],
    [84, 70, 90],
  ])("T=%i°F RH=%i%% → ±%i°F", (tF, rh, expectedF) => {
    const resultC = computeHeatIndexC(fToC(tF), rh);
    expect(Math.abs(resultC - fToC(expectedF))).toBeLessThanOrEqual(fToC(33) - fToC(32) + 0.06);
  });

  test("di bawah ambang Rothfusz memakai rumus sederhana (hasil dekat suhu udara)", () => {
    expect(computeHeatIndexC(20, 50)).toBeCloseTo(19.6, 0);
  });

  test("input tidak valid → null (Indeks Panas belum tersedia, AC-15)", () => {
    expect(computeHeatIndexC(null, 50)).toBeNull();
    expect(computeHeatIndexC(30, undefined)).toBeNull();
    expect(computeHeatIndexC(30, 120)).toBeNull();
    expect(computeHeatIndexC(80, 50)).toBeNull();
    expect(computeHeatIndexC(NaN, 50)).toBeNull();
  });
});
