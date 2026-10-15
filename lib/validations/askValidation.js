// Validasi pertanyaan Tanya SYCLE. Pertanyaan tidak disimpan dan tidak dicatat di log.
export const QUESTION_LIMITS = { min: 3, max: 300 };

export function validateQuestion(value) {
  if (typeof value !== "string") return { ok: false, message: "Tulis pertanyaanmu terlebih dahulu." };
  const question = value.replace(/\s+/g, " ").trim();
  if (question.length < QUESTION_LIMITS.min) return { ok: false, message: "Tulis pertanyaanmu terlebih dahulu." };
  if (question.length > QUESTION_LIMITS.max) {
    return { ok: false, message: `Pertanyaan terlalu panjang (maks. ${QUESTION_LIMITS.max} karakter).` };
  }
  return { ok: true, question };
}
