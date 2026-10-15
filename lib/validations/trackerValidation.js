// Validasi server untuk penyimpanan catatan Health Tracker. Klien tidak dipercaya: semua jawaban dicek ulang
// terhadap definisi pertanyaan Master Draft Tahap 3 dan aturan percabangan.
import { TRACKER_QUESTIONS, SCALE_EXCLUDED_OPTIONS } from "@/content/questions/tracker";
import { scaledItems, trackerSteps } from "@/lib/tracker/flow";

const STEP_KEYS = { "HT-02": ["HT-02", "HT-02-other"], "HK-01": ["HK-01", "HK-01-other"] };
const isScale = (value) => value === null || (Number.isInteger(value) && value >= 0 && value <= 4);

function optionValues(code) {
  return new Set(TRACKER_QUESTIONS[code].options.map((o) => o.value));
}

export function validateTrackerAnswers(answers) {
  const errors = [];
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return { ok: false, errors: ["format_tidak_valid"] };
  if (!answers.KONTEKS) errors.push("Pilih konteks catatan terlebih dahulu.");

  const steps = trackerSteps(answers);
  const allowedKeys = new Set(steps.flatMap((step) => STEP_KEYS[step] ?? [step]));
  for (const key of Object.keys(answers)) {
    if (!allowedKeys.has(key)) errors.push(`Jawaban tidak sesuai alur: ${key}`);
  }

  for (const step of steps) {
    const q = TRACKER_QUESTIONS[step];
    const value = answers[step];
    if (value === undefined || value === null) continue;

    if (q.type === "single" && !optionValues(step).has(value)) errors.push(`Pilihan tidak dikenal: ${step}`);

    if (q.type === "multi") {
      const valid = optionValues(step);
      const exclusive = q.options.filter((o) => o.exclusive).map((o) => o.value);
      if (!Array.isArray(value) || value.some((v) => !valid.has(v)) || new Set(value).size !== value.length) {
        errors.push(`Pilihan tidak dikenal: ${step}`);
      } else if (value.length > 1 && value.some((v) => exclusive.includes(v))) {
        errors.push(`Opsi eksklusif tidak boleh digabung: ${step}`);
      }
      if (q.other) {
        const text = answers[q.other.key];
        if (text !== undefined && (typeof text !== "string" || text.length > q.other.maxLength)) {
          errors.push(`Teks Lainnya terlalu panjang (maks. ${q.other.maxLength} karakter).`);
        }
      }
    }

    if (q.type === "scale" && !isScale(value)) errors.push(`Nilai skala tidak valid: ${step}`);

    if (q.type === "scale-per-item") {
      const selected = new Set(scaledItems(answers, q.itemsFrom));
      if (typeof value !== "object" || Array.isArray(value)) {
        errors.push(`Format skala tidak valid: ${step}`);
      } else {
        for (const [item, level] of Object.entries(value)) {
          if (!selected.has(item) || !isScale(level)) errors.push(`Nilai skala tidak valid: ${step}`);
        }
      }
    }

    if (q.type === "text" && (typeof value !== "string" || value.length > q.maxLength)) {
      errors.push(`Cerita terlalu panjang (maks. ${q.maxLength} karakter).`);
    }
  }

  return errors.length ? { ok: false, errors: [...new Set(errors)] } : { ok: true };
}

const clean = (text) => {
  const trimmed = typeof text === "string" ? text.trim() : "";
  return trimmed ? trimmed : null;
};

// Mengubah jawaban (yang sudah valid) menjadi baris database migration 002.
export function buildTrackerPayload(answers) {
  const record = {
    context: answers.KONTEKS,
    ht01_comfort: answers["HT-01"] ?? null,
    ht02_other_text: (answers["HT-02"] ?? []).includes("lainnya") ? clean(answers["HT-02-other"]) : null,
    ht04_outdoor: answers["HT-04"] ?? null,
    hm01_menstruating: answers["HM-01"] ?? null,
    hm02_day: answers["HM-02"] ?? null,
    hm03_flow: answers["HM-03"] ?? null,
    hm04_pain: answers["HM-04"] ?? null,
    hm05_pain_disruption: answers["HM-05"] ?? null,
    hk01_other_text: (answers["HK-01"] ?? []).includes("lainnya") ? clean(answers["HK-01-other"]) : null,
    hs01_breastfeeding: answers["HS-01"] ?? null,
    hs02_discomfort: answers["HS-02"] ?? null,
    hs03_disruption: answers["HS-03"] ?? null,
    story: clean(answers.CERITA),
  };

  const items = [];
  for (const [code, scaleCode] of [["HT-02", "HT-03"], ["HK-01", "HK-02"], ["HS-04", null]]) {
    for (const option of answers[code] ?? []) {
      const level = scaleCode && option !== SCALE_EXCLUDED_OPTIONS[code] ? (answers[scaleCode]?.[option] ?? null) : null;
      items.push({ question_code: code, option_code: option, disruption_level: level });
    }
  }
  return { record, items };
}

// ---------- Kondisi lingkungan saat pencatatan (Master Draft 3.9, K-08) ----------
const INDICATOR_IDS = ["temperature", "humidity", "heatIndex", "airQuality", "uv"];
const MAX_INDICATOR_AGE_MINUTES = 180;
const roundTo2 = (n) => Math.round(n * 100) / 100;

// Membersihkan snapshot dari klien. Indikator yang tidak tersedia, basi, atau tidak valid dibuang.
// Mengembalikan null bila tidak ada indikator yang layak disimpan.
export function sanitizeEnvironmentSnapshot(snapshot, now = new Date()) {
  if (!snapshot || typeof snapshot !== "object") return null;
  const loc = snapshot.location ?? {};
  const capturedAt = new Date(snapshot.retrievedAt);
  if (Number.isNaN(capturedAt.getTime()) || capturedAt > new Date(now.getTime() + 5 * 60000)) return null;
  if (typeof loc.label !== "string" || !loc.label.trim() || loc.label.length > 200) return null;

  const lat = Number(loc.lat);
  const lon = Number(loc.lon);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon) && lat >= -12 && lat <= 7 && lon >= 94 && lon <= 142;
  const code = typeof loc.code === "string" && /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(loc.code) ? loc.code : null;

  const indicators = {};
  for (const id of INDICATOR_IDS) {
    const ind = snapshot.indicators?.[id];
    if (!ind || ind.status !== "ok" || !Number.isFinite(ind.value)) continue;
    const time = new Date(ind.timeUtc);
    if (Number.isNaN(time.getTime()) || now.getTime() - time.getTime() > MAX_INDICATOR_AGE_MINUTES * 60000) continue;
    indicators[id] = {
      label: String(ind.label ?? id).slice(0, 60),
      value: ind.value,
      unit: String(ind.unit ?? "").slice(0, 20),
      standard: ind.standard ? String(ind.standard).slice(0, 30) : null,
      category: ind.category?.label ? String(ind.category.label).slice(0, 60) : null,
      source: String(ind.source?.name ?? "").slice(0, 60),
      dataType: String(ind.dataType ?? "").slice(0, 20),
      timeUtc: time.toISOString(),
      isFallback: Boolean(ind.isFallback),
    };
  }
  if (Object.keys(indicators).length === 0) return null;

  return {
    captured_at: capturedAt.toISOString(),
    location_label: loc.label.trim(),
    location_code: code,
    lat: hasCoords ? roundTo2(lat) : null,
    lon: hasCoords ? roundTo2(lon) : null,
    indicators,
  };
}
