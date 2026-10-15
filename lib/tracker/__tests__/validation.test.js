import { buildTrackerPayload, sanitizeEnvironmentSnapshot, validateTrackerAnswers } from "@/lib/validations/trackerValidation";

const BASE = { KONTEKS: "lewati", "HT-01": "kurang_nyaman", "HT-02": ["lelah", "pusing"], "HT-03": { lelah: 2 }, "HT-04": "1_2_jam" };

describe("Validasi jawaban Tracker di server", () => {
  test("jawaban sah lolos", () => {
    expect(validateTrackerAnswers(BASE).ok).toBe(true);
  });

  test("konteks wajib dipilih", () => {
    expect(validateTrackerAnswers({ "HT-01": "nyaman" }).ok).toBe(false);
  });

  test("opsi eksklusif digabung → ditolak", () => {
    const r = validateTrackerAnswers({ ...BASE, "HT-02": ["lelah", "tidak_ada_gejala"], "HT-03": {} });
    expect(r.ok).toBe(false);
  });

  test("jawaban cabang yang tidak sesuai konteks → ditolak", () => {
    expect(validateTrackerAnswers({ ...BASE, "HM-01": "ya" }).ok).toBe(false);
  });

  test("skala di luar 0–4 atau untuk gejala yang tidak dipilih → ditolak", () => {
    expect(validateTrackerAnswers({ ...BASE, "HT-03": { lelah: 5 } }).ok).toBe(false);
    expect(validateTrackerAnswers({ ...BASE, "HT-03": { mual: 1 } }).ok).toBe(false);
  });

  test("nilai tidak dikenal & cerita terlalu panjang → ditolak", () => {
    expect(validateTrackerAnswers({ ...BASE, "HT-01": "sangat_sakit" }).ok).toBe(false);
    expect(validateTrackerAnswers({ ...BASE, CERITA: "x".repeat(2001) }).ok).toBe(false);
  });
});

describe("Penyusunan data untuk database", () => {
  test("skala dilewati = null, bukan 0 (AC-09); skala per gejala (AC-08)", () => {
    const { items } = buildTrackerPayload(BASE);
    expect(items).toEqual([
      { question_code: "HT-02", option_code: "lelah", disruption_level: 2 },
      { question_code: "HT-02", option_code: "pusing", disruption_level: null },
    ]);
  });

  test("tidak ada kolom skor total; teks kosong menjadi null", () => {
    const { record } = buildTrackerPayload({ ...BASE, CERITA: "   " });
    expect(record.story).toBeNull();
    expect(Object.keys(record).some((k) => /score|total|skor/.test(k))).toBe(false);
  });

  test("cabang menyusui: HS-04 tanpa skala", () => {
    const { record, items } = buildTrackerPayload({ KONTEKS: "menyusui", "HS-01": "ya", "HS-02": "ya", "HS-03": 1, "HS-04": ["lingkungan_panas"] });
    expect(record).toMatchObject({ context: "menyusui", hs01_breastfeeding: "ya", hs03_disruption: 1 });
    expect(items).toEqual([{ question_code: "HS-04", option_code: "lingkungan_panas", disruption_level: null }]);
  });
});

describe("Kondisi lingkungan saat pencatatan", () => {
  const NOW = new Date("2026-10-15T12:00:00Z");
  const snap = {
    retrievedAt: "2026-10-15T11:50:00Z",
    location: { label: "Dago, Coblong, Kota Bandung, Jawa Barat", code: "32.73.02.1004", lat: -6.87654, lon: 107.61234 },
    indicators: {
      temperature: { status: "ok", label: "Suhu udara", value: 24, unit: "°C", source: { name: "BMKG" }, dataType: "prakiraan", timeUtc: "2026-10-15T12:00:00Z" },
      uv: { status: "unavailable", label: "Indeks UV" },
      airQuality: { status: "ok", label: "Kualitas udara", value: 32, unit: "ISPU", standard: "ISPU", category: { label: "BAIK" }, source: { name: "KLH/BPLH — ISPU" }, dataType: "pengamatan", timeUtc: "2026-10-15T06:00:00Z" },
    },
  };

  test("koordinat dibulatkan 2 desimal (K-08); indikator tidak tersedia & basi dibuang", () => {
    const s = sanitizeEnvironmentSnapshot(snap, NOW);
    expect(s).toMatchObject({ location_code: "32.73.02.1004", lat: -6.88, lon: 107.61 });
    expect(Object.keys(s.indicators)).toEqual(["temperature"]);
  });

  test("tanpa indikator valid atau label lokasi → null", () => {
    expect(sanitizeEnvironmentSnapshot({ ...snap, indicators: {} }, NOW)).toBeNull();
    expect(sanitizeEnvironmentSnapshot({ ...snap, location: {} }, NOW)).toBeNull();
    expect(sanitizeEnvironmentSnapshot(null, NOW)).toBeNull();
  });
});
