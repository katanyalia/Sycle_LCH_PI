import { ispuCategory, readableTextColor, usAqiCategory, uvCategory } from "@/lib/environment/categories";

describe("Kategori indeks standar", () => {
  test("US AQI mengikuti batas EPA dan menyertakan nama asli", () => {
    expect(usAqiCategory(50)).toMatchObject({ label: "Baik", original: "Good" });
    expect(usAqiCategory(51)).toMatchObject({ original: "Moderate" });
    expect(usAqiCategory(151)).toMatchObject({ original: "Unhealthy" });
    expect(usAqiCategory(400)).toMatchObject({ original: "Hazardous" });
    expect(usAqiCategory(-1)).toBeNull();
  });

  test("UV mengikuti kategori WHO", () => {
    expect(uvCategory(0)).toMatchObject({ original: "Low" });
    expect(uvCategory(8.4)).toMatchObject({ original: "Very High" });
    expect(uvCategory(11)).toMatchObject({ original: "Extreme" });
  });

  test("ISPU memakai label & warna resmi dari sumber", () => {
    expect(ispuCategory({ label: "SEDANG", color: "#0000FF" })).toMatchObject({ label: "SEDANG", color: "#0000FF", textColor: "#FFFFFF" });
    expect(ispuCategory({ label: "BAIK", color: "bukan-warna" }).color).toBeNull();
  });

  test("warna teks kategori kontras", () => {
    expect(readableTextColor("#FFFF00")).toBe("#000000");
    expect(readableTextColor("#7E0023")).toBe("#FFFFFF");
  });
});
