// Catatan tersimpan (baris migration 002) → tampilan Riwayat, detail, dan PDF.
// Satu sumber untuk ketiganya agar teks tidak menyimpang dari formulir (Master Draft 3.12).
import { SCALE_EXCLUDED_OPTIONS, trackerOptionLabel } from "@/content/questions/tracker";
import { trackerSteps } from "@/lib/tracker/flow";
import { trackerAnswerText, TRACKER_SHORT_LABEL } from "@/lib/tracker/format";
import { DATA_TYPE_LABEL, formatNumber, zoneLabel } from "@/lib/environment/format";
import { IANA_BY_ZONE } from "@/lib/environment/time";

const COLUMN_BY_CODE = {
  "HT-01": "ht01_comfort",
  "HT-04": "ht04_outdoor",
  "HM-01": "hm01_menstruating",
  "HM-02": "hm02_day",
  "HM-03": "hm03_flow",
  "HM-04": "hm04_pain",
  "HM-05": "hm05_pain_disruption",
  "HS-01": "hs01_breastfeeding",
  "HS-02": "hs02_discomfort",
  "HS-03": "hs03_disruption",
};
const SCALE_FOR = { "HT-02": "HT-03", "HK-01": "HK-02" };
const INDICATOR_ORDER = ["temperature", "humidity", "heatIndex", "airQuality", "uv"];

// Kebalikan dari buildTrackerPayload: baris database → objek jawaban seperti draf formulir.
export function recordToAnswers(record) {
  const answers = { KONTEKS: record.context };
  for (const [code, column] of Object.entries(COLUMN_BY_CODE)) {
    if (record[column] !== null && record[column] !== undefined) answers[code] = record[column];
  }
  for (const item of record.tracker_record_items ?? []) {
    const code = item.question_code;
    answers[code] = [...(answers[code] ?? []), item.option_code];
    const scaleCode = SCALE_FOR[code];
    if (scaleCode && item.option_code !== SCALE_EXCLUDED_OPTIONS[code]) {
      answers[scaleCode] = { ...(answers[scaleCode] ?? {}), [item.option_code]: item.disruption_level ?? null };
    }
  }
  if (record.ht02_other_text) answers["HT-02-other"] = record.ht02_other_text;
  if (record.hk01_other_text) answers["HK-01-other"] = record.hk01_other_text;
  if (record.story) answers.CERITA = record.story;
  return answers;
}

// Zona waktu tidak disimpan di catatan; ditentukan dari kode provinsi wilayah (BMKG) atau perkiraan bujur.
const WITA_PROVINCES = new Set(["51", "52", "53", "63", "64", "65", "71", "72", "73", "74", "75", "76"]);
const WIT_PROVINCES = new Set(["81", "82", "91", "92", "93", "94", "95", "96"]);

export function snapshotTimezone(snapshot) {
  const province = snapshot?.location_code?.slice(0, 2);
  if (province) {
    if (WIT_PROVINCES.has(province)) return IANA_BY_ZONE.WIT;
    if (WITA_PROVINCES.has(province)) return IANA_BY_ZONE.WITA;
    return IANA_BY_ZONE.WIB;
  }
  const lon = Number(snapshot?.lon);
  if (Number.isFinite(lon)) {
    if (lon >= 127) return IANA_BY_ZONE.WIT;
    if (lon >= 115) return IANA_BY_ZONE.WITA;
  }
  return IANA_BY_ZONE.WIB;
}

// "15 Oktober 2026, 19.05 WIB"
export function formatRecordTime(isoString, timezone = IANA_BY_ZONE.WIB) {
  if (!isoString) return "Waktu tidak diketahui";
  const text = new Intl.DateTimeFormat("id-ID", {
    timeZone: timezone,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
  return `${text} ${zoneLabel(timezone)}`.trim();
}

const snapshotOf = (record) => {
  const s = record.tracker_environment_snapshots;
  return Array.isArray(s) ? (s[0] ?? null) : (s ?? null);
};

export const contextLabel = (context) => trackerOptionLabel("KONTEKS", context);

// Kartu Riwayat (screen 55): tanggal, konteks, wilayah — tanpa gejala atau cerita (T7-5).
export function buildRecordCard(record) {
  const snapshot = snapshotOf(record);
  const timezone = snapshotTimezone(snapshot);
  return {
    id: record.id,
    recordedAt: record.recorded_at,
    timeText: formatRecordTime(record.recorded_at, timezone),
    contextLabel: contextLabel(record.context),
    locationLabel: snapshot?.location_label ?? null,
  };
}

// Detail (screen 56), pratinjau (57), dan PDF memakai struktur yang sama.
export function buildRecordView(record) {
  const answers = recordToAnswers(record);
  const snapshot = snapshotOf(record);
  const timezone = snapshotTimezone(snapshot);

  const environment = snapshot
    ? {
        locationLabel: snapshot.location_label,
        capturedText: formatRecordTime(snapshot.captured_at, timezone),
        indicators: INDICATOR_ORDER.filter((id) => snapshot.indicators?.[id]).map((id) => {
          const ind = snapshot.indicators[id];
          const unit = ind.unit && ind.unit !== ind.standard ? ` ${ind.unit}` : "";
          return {
            id,
            label: ind.label,
            valueText: `${formatNumber(ind.value)}${unit}`,
            standard: ind.standard ?? null,
            category: ind.category ?? null,
            source: ind.source || "Sumber tidak tercatat",
            dataTypeLabel: DATA_TYPE_LABEL[ind.dataType] ?? null,
            timeText: formatRecordTime(ind.timeUtc, timezone),
            isFallback: Boolean(ind.isFallback),
          };
        }),
      }
    : null;

  return {
    id: record.id,
    recordedAt: record.recorded_at,
    timeText: formatRecordTime(record.recorded_at, timezone),
    contextLabel: contextLabel(record.context),
    answers: trackerSteps(answers).map((code) => ({
      code,
      label: TRACKER_SHORT_LABEL[code],
      text: trackerAnswerText(code, answers),
    })),
    environment,
  };
}

// Keterangan tetap pada detail, pratinjau, dan PDF (Master Draft 3.12, 6.3; wireframe 56–57).
export const RECORD_NOTES = {
  nonDiagnostic:
    "Dokumen ini adalah ringkasan pengalaman yang kamu catat sendiri untuk membantu komunikasi dengan tenaga kesehatan. Dokumen ini bukan hasil diagnosis atau laporan pemeriksaan medis.",
  scale: "Skala 0–4 menggambarkan gangguan aktivitas, bukan tingkat keparahan penyakit. Nilai ditampilkan apa adanya dan tidak dijumlahkan.",
  environment:
    "Data lingkungan berasal dari stasiun, prakiraan, atau model untuk wilayah tersebut pada waktu pencatatan. Data ini tidak mewakili paparan lingkunganmu secara pribadi.",
  noEnvironment: "Catatan ini disimpan tanpa data lingkungan.",
  noAi: "Tidak ada refleksi AI pada catatan ini.",
};
