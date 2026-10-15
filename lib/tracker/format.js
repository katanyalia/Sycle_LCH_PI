import { TRACKER_QUESTIONS, trackerOptionLabel } from "@/content/questions/tracker";
import { DISRUPTION_SCALE } from "@/lib/forms/choices";
import { scaledItems } from "@/lib/tracker/flow";

export const scaleText = (level) =>
  level === null || level === undefined ? "Belum diisi" : `${level} — ${DISRUPTION_SCALE.find((s) => s.value === level)?.label}`;

// Label item untuk skala per item (HT-03, HK-02); "Lainnya" ikut menampilkan teks pengguna.
export function itemLabel(sourceCode, item, answers) {
  const base = trackerOptionLabel(sourceCode, item);
  const other = TRACKER_QUESTIONS[sourceCode].other;
  return item === "lainnya" && other && answers[other.key]?.trim() ? `${base}: ${answers[other.key].trim()}` : base;
}

// Teks jawaban untuk tinjau/ringkasan (tanpa interpretasi klinis).
export function trackerAnswerText(code, answers) {
  const q = TRACKER_QUESTIONS[code];
  const value = answers[code];
  if (q.type === "scale") return scaleText(value);
  if (q.type === "scale-per-item") {
    const items = scaledItems(answers, q.itemsFrom);
    return items.map((item) => `${itemLabel(q.itemsFrom, item, answers)}: ${scaleText(value?.[item])}`).join("; ");
  }
  if (q.type === "text") return value?.trim() ? value.trim() : "Tidak diisi";
  if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) return "Belum dijawab";
  if (Array.isArray(value)) {
    return value.map((v) => (v === "lainnya" ? itemLabel(code, v, answers) : trackerOptionLabel(code, v))).join(", ");
  }
  return trackerOptionLabel(code, value);
}

export const TRACKER_SHORT_LABEL = {
  KONTEKS: "Konteks catatan",
  "HT-01": "Kenyamanan tubuh",
  "HT-02": "Hal yang ingin dicatat",
  "HT-03": "Gangguan aktivitas per gejala",
  "HT-04": "Waktu di luar ruangan hari ini",
  "HM-01": "Menstruasi hari ini",
  "HM-02": "Hari menstruasi",
  "HM-03": "Jumlah darah (subjektif)",
  "HM-04": "Nyeri/ketidaknyamanan menstruasi",
  "HM-05": "Gangguan aktivitas akibat nyeri",
  "HK-01": "Situasi aktivitas (kehamilan)",
  "HK-02": "Gangguan aktivitas per hambatan",
  "HS-01": "Menyusui/memompa ASI hari ini",
  "HS-02": "Ketidaknyamanan saat menyusui",
  "HS-03": "Gangguan aktivitas (menyusui)",
  "HS-04": "Situasi saat menyusui",
  CERITA: "Cerita tambahan",
};
