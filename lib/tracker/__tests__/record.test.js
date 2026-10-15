import { buildTrackerPayload } from "@/lib/validations/trackerValidation";
import { buildRecordCard, buildRecordView, recordToAnswers, snapshotTimezone } from "@/lib/tracker/record";

// Baris database tiruan dari jawaban formulir (seperti yang dibuat save_tracker_record).
function rowFrom(answers, snapshot = null) {
  const { record, items } = buildTrackerPayload(answers);
  return { id: "11111111-1111-4111-8111-111111111111", recorded_at: "2026-10-15T05:30:00Z", ...record, tracker_record_items: items, tracker_environment_snapshots: snapshot };
}

const MENSTRUASI = {
  KONTEKS: "menstruasi",
  "HT-01": "kurang_nyaman",
  "HT-02": ["lelah", "lainnya"],
  "HT-02-other": "Kram kaki",
  "HT-03": { lelah: 2, lainnya: null },
  "HT-04": "1_2_jam",
  "HM-01": "ya",
  "HM-02": "hari_2",
  "HM-04": "ya",
  "HM-05": 0,
  CERITA: "Hari yang panas.",
};

const SNAPSHOT = {
  captured_at: "2026-10-15T05:00:00Z",
  location_label: "Gambir, Jakarta Pusat",
  location_code: "31.71.01.1001",
  lat: -6.17,
  lon: 106.82,
  indicators: {
    uv: { label: "Indeks UV", value: 7, unit: "", standard: "Skala WHO", category: "Tinggi", source: "Open-Meteo", dataType: "model", timeUtc: "2026-10-15T05:00:00Z", isFallback: false },
    temperature: { label: "Suhu udara", value: 31.5, unit: "°C", standard: null, category: null, source: "BMKG", dataType: "prakiraan", timeUtc: "2026-10-15T05:00:00Z", isFallback: false },
  },
};

describe("Catatan tersimpan → jawaban (kebalikan buildTrackerPayload)", () => {
  test("jawaban kembali sama persis, skala dilewati tetap null (bukan 0)", () => {
    const answers = recordToAnswers(rowFrom(MENSTRUASI));
    expect(answers).toEqual(MENSTRUASI);
    expect(answers["HT-03"].lainnya).toBeNull();
    expect(answers["HM-05"]).toBe(0);
  });

  test("opsi eksklusif tidak mendapat skala", () => {
    const answers = recordToAnswers(rowFrom({ KONTEKS: "kehamilan", "HT-02": ["tidak_ada_gejala"], "HK-01": ["tidak_ada"] }));
    expect(answers["HT-03"]).toBeUndefined();
    expect(answers["HK-02"]).toBeUndefined();
  });
});

describe("Tampilan Riwayat & detail", () => {
  test("kartu hanya berisi tanggal, konteks, wilayah — tanpa gejala/cerita (T7-5)", () => {
    const card = buildRecordCard(rowFrom(MENSTRUASI, [SNAPSHOT]));
    expect(card).toEqual({
      id: expect.any(String),
      recordedAt: "2026-10-15T05:30:00Z",
      timeText: expect.stringContaining("15 Oktober 2026"),
      contextLabel: "Menstruasi",
      locationLabel: "Gambir, Jakarta Pusat",
    });
    expect(JSON.stringify(card)).not.toMatch(/Lelah|panas|Kram/);
  });

  test("detail memuat jawaban sesuai alur dan lingkungan dengan sumber & waktu", () => {
    const view = buildRecordView(rowFrom(MENSTRUASI, SNAPSHOT));
    expect(view.timeText).toBe("15 Oktober 2026 pukul 12.30 WIB");
    expect(view.answers.map((a) => a.code)).toEqual(["KONTEKS", "HT-01", "HT-02", "HT-03", "HT-04", "HM-01", "HM-02", "HM-03", "HM-04", "HM-05", "CERITA"]);
    expect(view.answers.find((a) => a.code === "HT-03").text).toContain("Lainnya: Kram kaki: Belum diisi");
    expect(view.answers.find((a) => a.code === "HM-03").text).toBe("Belum dijawab");
    expect(view.environment.indicators.map((i) => i.id)).toEqual(["temperature", "uv"]);
    expect(view.environment.indicators[0]).toMatchObject({ valueText: "31,5 °C", source: "BMKG", dataTypeLabel: "Prakiraan" });
  });

  test("tanpa data lingkungan → environment null", () => {
    expect(buildRecordView(rowFrom({ KONTEKS: "lewati" })).environment).toBeNull();
  });

  test("zona waktu dari kode provinsi atau bujur", () => {
    expect(snapshotTimezone({ location_code: "51.71.01.1001" })).toBe("Asia/Makassar");
    expect(snapshotTimezone({ location_code: "94.71.01.1001" })).toBe("Asia/Jayapura");
    expect(snapshotTimezone({ location_code: null, lon: 110.4 })).toBe("Asia/Jakarta");
    expect(snapshotTimezone(null)).toBe("Asia/Jakarta");
  });
});
