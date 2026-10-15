// Percabangan Personalisasi (Master Draft 2.2–2.5, Wireframe alur B):
// 13 → P-00 → P-01 → P-02 (selalu) → P-03 → cabang → Tinjau (23).
//   Menstruasi: PM-01, PM-02 · Kehamilan: tanpa pertanyaan tambahan · Menyusui: PS-01, PS-02 (jika Ya/Belum tahu)
//   Lewati / belum dijawab: tanpa cabang.

export const BASE_STEPS = ["P-00", "P-01", "P-02", "P-03"];

export function branchSteps(answers) {
  const condition = answers["P-00"];
  if (condition === "menstruasi") return ["PM-01", "PM-02"];
  if (condition === "menyusui") {
    return ["ya", "belum_tahu"].includes(answers["PS-01"]) ? ["PS-01", "PS-02"] : ["PS-01"];
  }
  return [];
}

export function visibleSteps(answers) {
  return [...BASE_STEPS, ...branchSteps(answers)];
}

// Mengisi jawaban lalu membersihkan jawaban turunan yang tidak lagi relevan (Lampiran A wireframe).
export function setAnswer(answers, code, value) {
  const next = { ...answers, [code]: value };
  const keep = new Set(visibleSteps(next));
  for (const key of Object.keys(next)) {
    if (!keep.has(key)) delete next[key];
  }
  return next;
}

export function hasAnyAnswer(answers) {
  return Object.values(answers).some((value) => (Array.isArray(value) ? value.length > 0 : value != null));
}

export const isAnswered = (value) => (Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null);
