import { getEnvironmentSnapshot } from "@/lib/services/environmentService";

const NOW = new Date("2026-10-15T06:20:00Z");

const BMKG_OK = {
  lokasi: { desa: "Kemayoran", kecamatan: "Kemayoran", kotkab: "Kota Adm. Jakarta Pusat", provinsi: "DKI Jakarta", lat: -6.1647, lon: 106.8454, timezone: "Asia/Jakarta" },
  data: [{ cuaca: [[{ utc_datetime: "2026-10-15 06:00:00", t: 33, hu: 52 }]] }],
};
const WEATHER_OK = {
  utc_offset_seconds: 25200,
  current_units: { temperature_2m: "°C", relative_humidity_2m: "%", uv_index: "" },
  current: { time: "2026-10-15T13:15", temperature_2m: 34, relative_humidity_2m: 46, uv_index: 8.4 },
};
const AIR_OK = { utc_offset_seconds: 25200, current_units: { us_aqi: "USAQI" }, current: { time: "2026-10-15T13:00", us_aqi: 151 } };
const ISPU_OK = {
  rows: [
    { id_stasiun: "JAKARTA", nama: "Jakarta", kota: "Jakarta", provinsi: "DKI Jakarta", lat: "-6.18", lon: "106.83", waktu: "2026-10-15 13:00:00", time_z: "WIB", stasiun_show: "1", is_maintenance: "0", param: "PM<sub>2.5</sub>", a_pm25: "24.5", t_pm25: "62", val: "62", kategori: { nilai: "SEDANG", color: "#0000FF" } },
  ],
};

function mockFetch(responses) {
  global.fetch = jest.fn(async (url) => {
    const key = Object.keys(responses).find((k) => url.includes(k));
    const body = responses[key];
    if (body instanceof Error || body === undefined) throw Object.assign(new Error("down"), { name: "TypeError" });
    return { ok: true, status: 200, json: async () => body };
  });
}

const ALL_OK = { "api.bmkg.go.id": BMKG_OK, "://api.open-meteo.com": WEATHER_OK, "air-quality-api": AIR_OK, "ispu.kemenlh.go.id": ISPU_OK };

describe("Layanan data lingkungan", () => {
  test("semua sumber utama tersedia: BMKG + ISPU + UV + Heat Index", async () => {
    mockFetch(ALL_OK);
    const { indicators, location } = await getEnvironmentSnapshot({ kind: "village", adm4: "31.71.03.1001" }, NOW);
    expect(location.lat).toBeCloseTo(-6.1647);
    expect(indicators.temperature).toMatchObject({ value: 33, source: { name: "BMKG" }, dataType: "prakiraan", isFallback: false });
    expect(indicators.airQuality).toMatchObject({ standard: "ISPU", value: 62, isFallback: false });
    expect(indicators.uv).toMatchObject({ value: 8.4, dataType: "model" });
    expect(indicators.heatIndex.status).toBe("ok");
    expect(indicators.heatIndex.inputs.source).toBe("BMKG");
  });

  test("ISPU gagal → US AQI berlabel cadangan, bukan ISPU (AC-14)", async () => {
    mockFetch({ ...ALL_OK, "ispu.kemenlh.go.id": new Error() });
    const { indicators } = await getEnvironmentSnapshot({ kind: "village", adm4: "31.71.03.1001" }, NOW);
    expect(indicators.airQuality).toMatchObject({ standard: "US AQI", unit: "US AQI", isFallback: true });
    expect(indicators.airQuality.fallbackReason).toMatch(/bukan ISPU/);
    expect(indicators.temperature.status).toBe("ok"); // suhu valid tetap tampil
  });

  test("BMKG gagal → suhu & kelembapan dari Open-Meteo berlabel cadangan (memakai koordinat tersimpan)", async () => {
    mockFetch({ ...ALL_OK, "api.bmkg.go.id": new Error() });
    const { indicators } = await getEnvironmentSnapshot({ kind: "village", adm4: "31.71.03.1001", coords: { lat: -6.16, lon: 106.85 } }, NOW);
    expect(indicators.temperature).toMatchObject({ value: 34, isFallback: true, source: { name: "Open-Meteo" } });
    expect(indicators.heatIndex.inputs.source).toBe("Open-Meteo");
  });

  test("semua sumber gagal → tidak ada angka, status belum tersedia", async () => {
    mockFetch({});
    const { indicators } = await getEnvironmentSnapshot({ kind: "village", adm4: "31.71.03.1001" }, NOW);
    for (const item of Object.values(indicators)) {
      expect(item.status).toBe("unavailable");
      expect(item.value).toBeUndefined();
    }
    expect(indicators.heatIndex.message).toBe("Indeks Panas belum tersedia.");
  });

  test("lokasi perangkat: suhu dari Open-Meteo dengan ajakan memilih desa", async () => {
    mockFetch(ALL_OK);
    const { indicators, location } = await getEnvironmentSnapshot({ kind: "device", coords: { lat: -6.2, lon: 106.82 } }, NOW);
    expect(location.code).toBeNull();
    expect(indicators.temperature.fallbackReason).toMatch(/Pilih kelurahan\/desa/);
    expect(global.fetch.mock.calls.some(([url]) => url.includes("bmkg"))).toBe(false);
  });

  test("kode wilayah tidak dikenal → not_found", async () => {
    mockFetch(ALL_OK);
    expect(await getEnvironmentSnapshot({ kind: "village", adm4: "99.99.99.9999" }, NOW)).toEqual({ error: "not_found" });
  });
});
