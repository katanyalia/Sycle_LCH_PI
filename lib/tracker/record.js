// Catatan tersimpan (baris migration 002) → tampilan Riwayat, detail, dan PDF.
// Satu sumber untuk ketiganya agar teks tidak menyimpang dari formulir (Master Draft 3.12).
import {
  HEALTH_TRACKER_BASE_STEPS,
  HEALTH_TRACKER_BRANCH_STEPS,
  HEALTH_TRACKER_CONDITIONS,
  HEALTH_TRACKER_QUESTIONS,
  HEALTH_TRACKER_SCALE,
} from "@/data/healthTrackerQuestions";
import { DATA_TYPE_LABEL, formatNumber, zoneLabel } from "@/lib/environment/format";
import { IANA_BY_ZONE } from "@/lib/environment/time";

const INDICATOR_ORDER = ["temperature", "humidity", "heatIndex", "airQuality", "uv"];

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

export const contextLabel = (context) =>
  HEALTH_TRACKER_CONDITIONS.find((item) => item.value === context)?.label ?? context ?? "-";

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

// Jawaban untuk PDF, memakai bank pertanyaan yang sama dengan formulir dan halaman detail Riwayat
// (data/healthTrackerQuestions.js), agar label dan urutannya tidak berbeda.
function scaleText(value) {
  const number = Number(value);
  return HEALTH_TRACKER_SCALE.find((item) => item.value === number)?.label ?? String(value);
}

function optionText(question, value) {
  const option = question?.options?.find((item) => String(item.value) === String(value));
  return option?.label ?? String(value).replaceAll("_", " ");
}

function hasAnswer(value) {
  return value !== null && value !== undefined && value !== "";
}

function buildAnswerFields(record) {
  const rows = Array.isArray(record.answers) ? record.answers : [];
  const steps = [
    ...HEALTH_TRACKER_BASE_STEPS,
    ...(HEALTH_TRACKER_BRANCH_STEPS[record.context] ?? []),
  ];
  const fields = [];

  for (const code of steps) {
    const question = HEALTH_TRACKER_QUESTIONS[code];
    // Skala per pilihan (HT-03, HK-02) sudah tampil di samping jawaban induknya.
    if (!question || question.type === "per_option_scale") continue;

    const parts = rows
      .filter((row) => row.code_question === code)
      .map((row) => {
        const answer = hasAnswer(row.answer) ? optionText(question, row.answer) : null;
        const scale = hasAnswer(row.scale) ? scaleText(row.scale) : null;
        if (answer && scale) return `${answer} (${scale})`;
        return answer ?? scale;
      })
      .filter(Boolean);

    const otherKey = question.otherText?.key;
    const otherText = otherKey
      ? rows.find((row) => row.code_question === otherKey && hasAnswer(row.answer))?.answer
      : null;
    if (otherText) {
      const index = parts.findIndex((part) => part.startsWith("Lainnya"));
      if (index >= 0) parts[index] = parts[index].replace("Lainnya", `Lainnya: ${otherText}`);
      else parts.push(`Lainnya: ${otherText}`);
    }

    if (parts.length) fields.push({ code, label: question.question, text: parts.join(", ") });
  }

  if (record.story) fields.push({ code: "CERITA", label: "Cerita tambahan", text: record.story });

  return fields;
}

// Ringkasan check-in tersimpan (JSON di kolom ringkasan_checkin) → satu teks untuk PDF.
// Format baru: paragraf di `intro`. Format lama: daftar `sections` berisi kalimat.
export function checkInSummaryText(value) {
  if (!value) return "";
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return value.trim();
    }
  }
  if (!parsed || typeof parsed !== "object") return "";

  const intro = typeof parsed.intro === "string" ? parsed.intro.trim() : "";
  const sections = Array.isArray(parsed.sections)
    ? parsed.sections
        .flatMap((section) => (Array.isArray(section?.content) ? section.content : []))
        .filter((item) => typeof item === "string" && item.trim())
        .map((item) => item.trim())
    : [];

  return [intro, ...sections].filter(Boolean).join("\n\n");
}

// Snapshot lingkungan bisa menyimpan teks atau objek (mis. { name } / { label }).
const textOf = (value, key) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    const text = value[key] ?? value.label ?? value.name;
    return typeof text === "string" || typeof text === "number" ? String(text) : null;
  }
  return null;
};

// Detail (screen 56), pratinjau (57), dan PDF memakai struktur yang sama.
export function buildRecordView(record) {
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
            standard: textOf(ind.standard),
            category: textOf(ind.category, "label"),
            source: textOf(ind.source, "name") || "Sumber tidak tercatat",
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
    answers: buildAnswerFields(record),
    environment,
    checkInSummary: checkInSummaryText(record.ringkasan_checkin),
    aiReflection:
      typeof record.refleksi_ai === "string"
        ? record.refleksi_ai.trim()
        : "",
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
