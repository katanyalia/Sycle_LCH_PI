// Percabangan Health Tracker (Master Draft 3.3–3.8, Wireframe alur C):
// 28 KONTEKS → HT-01 → HT-02 → HT-03 (bila ada gejala) → HT-04 → cabang → CERITA → Tinjau.
//   Menstruasi: HM-01; HM-02 & HM-03 bila HM-01 = Ya; HM-04 (selalu dalam cabang); HM-05 bila HM-04 = Ya
//   Kehamilan:  HK-01; HK-02 bila ada hambatan selain "Tidak ada"
//   Menyusui:   HS-01; HS-02 & HS-04 bila HS-01 = Ya; HS-03 bila HS-02 = Ya
//   Lewati:     tanpa cabang
import { SCALE_EXCLUDED_OPTIONS } from "@/content/questions/tracker";

export const scaledItems = (answers, code) =>
  (answers[code] ?? []).filter((value) => value !== SCALE_EXCLUDED_OPTIONS[code]);

export function trackerSteps(answers) {
  const steps = ["KONTEKS", "HT-01", "HT-02"];
  if (scaledItems(answers, "HT-02").length > 0) steps.push("HT-03");
  steps.push("HT-04");

  const context = answers.KONTEKS;
  if (context === "menstruasi") {
    steps.push("HM-01");
    if (answers["HM-01"] === "ya") steps.push("HM-02", "HM-03");
    steps.push("HM-04");
    if (answers["HM-04"] === "ya") steps.push("HM-05");
  } else if (context === "kehamilan") {
    steps.push("HK-01");
    if (scaledItems(answers, "HK-01").length > 0) steps.push("HK-02");
  } else if (context === "menyusui") {
    steps.push("HS-01");
    if (answers["HS-01"] === "ya") {
      steps.push("HS-02");
      if (answers["HS-02"] === "ya") steps.push("HS-03");
      steps.push("HS-04");
    }
  }
  steps.push("CERITA");
  return steps;
}

// Kunci jawaban tambahan yang ikut sebuah langkah.
const EXTRA_KEYS = { "HT-02": ["HT-02-other"], "HK-01": ["HK-01-other"] };

// Mengisi jawaban lalu membersihkan jawaban yang tidak lagi relevan (Lampiran A wireframe).
export function setTrackerAnswer(answers, key, value) {
  const next = { ...answers, [key]: value };
  const visible = new Set(trackerSteps(next));
  const allowed = new Set([...visible].flatMap((step) => [step, ...(EXTRA_KEYS[step] ?? [])]));
  for (const k of Object.keys(next)) if (!allowed.has(k)) delete next[k];

  // Teks "Lainnya" hanya bila "Lainnya" dipilih.
  for (const code of ["HT-02", "HK-01"]) {
    if (!(next[code] ?? []).includes("lainnya")) delete next[`${code}-other`];
  }
  // Skala per item hanya untuk item yang masih dipilih.
  for (const [scaleCode, sourceCode] of [["HT-03", "HT-02"], ["HK-02", "HK-01"]]) {
    if (next[scaleCode]) {
      const keep = new Set(scaledItems(next, sourceCode));
      next[scaleCode] = Object.fromEntries(Object.entries(next[scaleCode]).filter(([item]) => keep.has(item)));
    }
  }
  return next;
}

export function hasTrackerInput(answers) {
  return Object.values(answers).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === "object") return Object.keys(value).length > 0;
    return value !== undefined && value !== null && value !== "";
  });
}
