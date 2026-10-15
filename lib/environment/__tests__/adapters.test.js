import { parseBmkgForecast } from "@/lib/environment/adapters/bmkg";
import { parseOpenMeteoCurrent } from "@/lib/environment/adapters/openMeteo";
import { parameterKey, selectIspuStation, validateStation } from "@/lib/environment/adapters/ispu";

const NOW = new Date("2026-10-15T06:20:00Z"); // 13:20 WIB

const bmkgJson = (slots) => ({
  lokasi: { desa: "Kemayoran", kecamatan: "Kemayoran", kotkab: "Kota Adm. Jakarta Pusat", provinsi: "DKI Jakarta", lat: -6.1647, lon: 106.8454, timezone: "Asia/Jakarta" },
  data: [{ cuaca: [slots] }],
});

describe("Adapter BMKG", () => {
  test("memilih slot prakiraan terdekat (≤ 90 menit)", () => {
    const result = parseBmkgForecast(
      bmkgJson([
        { utc_datetime: "2026-10-15 03:00:00", t: 31, hu: 60 },
        { utc_datetime: "2026-10-15 06:00:00", t: 33, hu: 52, analysis_date: "2026-10-15T00:00:00" },
        { utc_datetime: "2026-10-15 09:00:00", t: 35, hu: 43 },
      ]),
      NOW
    );
    expect(result.slot).toMatchObject({ temperature: 33, humidity: 52, timeUtc: "2026-10-15T06:00:00.000Z" });
    expect(result.location.lat).toBeCloseTo(-6.1647);
  });

  test("tidak ada slot dekat waktu sekarang → tidak dipakai (data kedaluwarsa)", () => {
    const result = parseBmkgForecast(bmkgJson([{ utc_datetime: "2026-10-14 06:00:00", t: 33, hu: 52 }]), NOW);
    expect(result.slot).toBeNull();
    expect(result.reason).toBe("no_current_slot");
  });

  test("nilai bukan angka menjadi null", () => {
    const result = parseBmkgForecast(bmkgJson([{ utc_datetime: "2026-10-15 06:00:00", t: "33", hu: null }]), NOW);
    expect(result.slot).toMatchObject({ temperature: null, humidity: null });
  });
});

describe("Adapter Open-Meteo", () => {
  const json = (current, units = { temperature_2m: "°C", relative_humidity_2m: "%", uv_index: "" }) => ({
    utc_offset_seconds: 25200,
    timezone: "Asia/Jakarta",
    current_units: units,
    current,
  });

  test("waktu lokal dikonversi ke UTC dan satuan dicek", () => {
    const result = parseOpenMeteoCurrent(json({ time: "2026-10-15T13:15", temperature_2m: 34, relative_humidity_2m: 46, uv_index: 8.4 }), NOW);
    expect(result.timeUtc).toBe("2026-10-15T06:15:00.000Z");
    expect(result.values).toMatchObject({ temperature: 34, humidity: 46, uvIndex: 8.4 });
  });

  test("satuan tidak sesuai → nilai ditolak", () => {
    const result = parseOpenMeteoCurrent(json({ time: "2026-10-15T13:15", temperature_2m: 93 }, { temperature_2m: "°F" }), NOW);
    expect(result.values.temperature).toBeNull();
  });

  test("data lama → stale", () => {
    const result = parseOpenMeteoCurrent(json({ time: "2026-10-15T08:00", temperature_2m: 30 }), NOW);
    expect(result.reason).toBe("stale");
  });
});

describe("Adapter ISPU", () => {
  const station = (overrides = {}) => ({
    id_stasiun: "JAKARTA",
    nama: "Jakarta",
    kota: "Jakarta",
    provinsi: "DKI Jakarta",
    lat: "-6.18",
    lon: "106.83",
    waktu: "2026-10-15 13:00:00",
    time_z: "WIB",
    stasiun_show: "1",
    is_maintenance: "0",
    param: "PM<sub>2.5</sub>",
    a_pm25: "24.53",
    t_pm25: "62",
    val: "62",
    kategori: { nilai: "SEDANG", color: "#0000FF" },
    ...overrides,
  });

  test("nama parameter HTML dinormalisasi", () => {
    expect(parameterKey("PM<sub>2.5</sub>")).toBe("pm25");
    expect(parameterKey("NO<sub>2</sub>")).toBe("no2");
    expect(parameterKey("??")).toBeNull();
  });

  test("anomali konsentrasi 0 tetapi indeks > 0 ditolak", () => {
    expect(validateStation(station({ a_pm25: "0", t_pm25: "116" }), NOW)).toBe("inconsistent_values");
    expect(validateStation(station({ is_maintenance: "1" }), NOW)).toBe("not_active");
    expect(validateStation(station(), NOW)).toBeNull();
  });

  test("hanya stasiun ≤ 25 km yang dipakai (K-24)", () => {
    const near = selectIspuStation({ rows: [station()] }, -6.2, 106.82, NOW);
    expect(near.station).toMatchObject({ name: "Jakarta", value: 62, isFresh: true });
    expect(near.station.distanceKm).toBeLessThan(5);

    const far = selectIspuStation({ rows: [station()] }, -6.92, 107.61, NOW); // Bandung, ± 117 km
    expect(far.station).toBeNull();
    expect(far.reason).toBe("no_station_in_radius");
  });

  test("data > 3 jam ditandai tidak segar; zona waktu WIT dihitung benar", () => {
    const old = selectIspuStation({ rows: [station({ waktu: "2026-10-15 09:00:00" })] }, -6.2, 106.82, NOW);
    expect(old.station.isFresh).toBe(false);
    const wit = selectIspuStation({ rows: [station({ waktu: "2026-10-15 15:00:00", time_z: "WIT" })] }, -6.2, 106.82, NOW);
    expect(wit.station.timeUtc).toBe("2026-10-15T06:00:00.000Z");
  });
});
