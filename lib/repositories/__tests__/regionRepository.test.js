import { findVillageByCode, searchVillages, toTitleCase } from "@/lib/repositories/regionRepository";

describe("Repositori kode wilayah (Kepmendagri 2022)", () => {
  test("kode BMKG contoh ditemukan", () => {
    expect(findVillageByCode("31.71.03.1001")).toMatchObject({ village: "Kemayoran", regency: "Kota Adm. Jakarta Pusat" });
    expect(findVillageByCode("99.99.99.9999")).toBeNull();
  });

  test("pencarian memprioritaskan nama desa yang sama persis", () => {
    const { items } = searchVillages("kemayoran");
    expect(items[0].village).toBe("Kemayoran");
  });

  test("kata tambahan mempersempit hasil (desa + kota)", () => {
    const { items } = searchVillages("cemani sukoharjo");
    expect(items.every((item) => item.regency.includes("Sukoharjo"))).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  test("tidak ada hasil → kosong, tidak mengganti lokasi lain", () => {
    expect(searchVillages("zzzxqw").items).toEqual([]);
  });

  test("judul huruf kapital dirapikan", () => {
    expect(toTitleCase("KOTA ADM. JAKARTA PUSAT")).toBe("Kota Adm. Jakarta Pusat");
    expect(toTitleCase("DKI JAKARTA")).toBe("DKI Jakarta");
    expect(toTitleCase("DI YOGYAKARTA")).toBe("DI Yogyakarta");
  });
});
