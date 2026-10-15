import { normalizeDisruptionValue, toggleMultiChoice } from "@/lib/forms/choices";

const EXCLUSIVE = ["tidak_ada", "belum_tahu"];

describe("toggleMultiChoice — opsi eksklusif (AC-06)", () => {
  test("memilih opsi biasa menambahkannya", () => {
    expect(toggleMultiChoice(["air_minum"], "masker", EXCLUSIVE)).toEqual(["air_minum", "masker"]);
  });

  test("memilih 'Tidak ada' membatalkan pilihan lain", () => {
    expect(toggleMultiChoice(["air_minum", "masker"], "tidak_ada", EXCLUSIVE)).toEqual(["tidak_ada"]);
  });

  test("memilih opsi biasa membatalkan opsi eksklusif", () => {
    expect(toggleMultiChoice(["belum_tahu"], "air_minum", EXCLUSIVE)).toEqual(["air_minum"]);
  });

  test("dua opsi eksklusif saling membatalkan", () => {
    expect(toggleMultiChoice(["tidak_ada"], "belum_tahu", EXCLUSIVE)).toEqual(["belum_tahu"]);
  });

  test("menekan opsi terpilih membatalkannya", () => {
    expect(toggleMultiChoice(["air_minum", "masker"], "masker", EXCLUSIVE)).toEqual(["air_minum"]);
  });
});

describe("normalizeDisruptionValue — skala 0–4 (AC-09)", () => {
  test("nilai dilewati menjadi null, bukan 0", () => {
    expect(normalizeDisruptionValue(null)).toBeNull();
    expect(normalizeDisruptionValue(undefined)).toBeNull();
    expect(normalizeDisruptionValue("")).toBeNull();
  });

  test("0 tetap 0 (Tidak mengganggu)", () => {
    expect(normalizeDisruptionValue(0)).toBe(0);
    expect(normalizeDisruptionValue("0")).toBe(0);
  });

  test("nilai di luar 0–4 atau bukan bilangan bulat ditolak", () => {
    expect(normalizeDisruptionValue(5)).toBeNull();
    expect(normalizeDisruptionValue(-1)).toBeNull();
    expect(normalizeDisruptionValue(2.5)).toBeNull();
  });
});
