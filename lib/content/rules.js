// Gerbang konten Tahap 3 (CLAUDE.md §10, K-01, T3-1, T3-5).
// Setiap artikel/butir panduan dicek sebelum dirender. Konten yang gagal tidak ditampilkan.

// Pemeriksaan bantu kata diagnostik/kausal-individual. BUKAN pengganti tinjauan manusia.
const FORBIDDEN_PATTERNS = [
  /\bdiagnos(is|a)\b/i,
  /\bkamu (menderita|mengidap|terkena)\b/i,
  /\bpenyebab (gejala|keluhan)mu\b/i,
  /\bmenyebabkan (gejala|keluhan|penyakit)mu\b/i,
  /\bpasti (aman|sembuh|berbahaya)\b/i,
  /\brisiko(mu| kamu) (adalah|sebesar)\b/i,
];

export const CONTENT_STATUS = { DRAFT: "draft", APPROVED: "approved" };

function collectText(item) {
  const parts = [item.title, item.summary, item.text, item.reason, item.limitations];
  for (const section of item.sections ?? []) parts.push(section.heading, ...(section.paragraphs ?? []));
  return parts.filter(Boolean).join("\n");
}

// Mengembalikan daftar alasan penolakan (kosong = lolos).
export function validateContentItem(item, { sources, approvers }) {
  const errors = [];
  if (!item || typeof item !== "object") return ["format_tidak_valid"];

  if (![CONTENT_STATUS.DRAFT, CONTENT_STATUS.APPROVED].includes(item.status)) errors.push("status_tidak_dikenal");

  const ids = Array.isArray(item.evidenceIds) ? item.evidenceIds : [];
  if (ids.length === 0) errors.push("tanpa_referensi");
  for (const id of ids) {
    const source = sources.find((entry) => entry.id === id);
    if (!source) errors.push(`referensi_tidak_dikenal:${id}`);
    else if (source.internal) errors.push(`referensi_internal:${id}`);
    else if (source.safetyDraft) errors.push(`referensi_safety_draft:${id}`);
  }

  if (item.status === CONTENT_STATUS.APPROVED) {
    const approver = approvers.find((entry) => entry.id === item.approvedBy);
    if (!approver) errors.push("pemberi_persetujuan_tidak_terdaftar");
    if (!item.approvedAt || Number.isNaN(Date.parse(item.approvedAt))) errors.push("tanggal_persetujuan_tidak_valid");
  }

  const text = collectText(item);
  if (!text.trim()) errors.push("isi_kosong");
  // Artikel wajib punya bagian isi dan batasan informasi (WF-08 screen 63).
  if ("slug" in item) {
    if (!Array.isArray(item.sections) || item.sections.length === 0) errors.push("artikel_tanpa_isi");
    if (!item.limitations?.trim()) errors.push("artikel_tanpa_batasan");
  }
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) errors.push(`kata_terlarang:${pattern.source}`);
  }
  return errors;
}

// Memilih konten yang boleh tampil: lolos validasi, dan draf hanya bila sakelar K-01 aktif.
export function selectVisibleContent(items, { sources, approvers, showDraft }) {
  return items.filter((item) => {
    if (validateContentItem(item, { sources, approvers }).length > 0) return false;
    return item.status === CONTENT_STATUS.APPROVED || showDraft;
  });
}

// Referensi untuk ditampilkan: judul, penerbit, tautan, jenis sumber — tanpa kode E-xx (Master Draft 5.7).
const toReference = ({ title, publisher, url, sourceType, populationStudy, safetyDraft }) => ({
  title,
  publisher,
  url,
  sourceType,
  populationStudy: Boolean(populationStudy),
  safetyDraft: Boolean(safetyDraft),
});

// Dasar isi konten: tanpa sumber internal maupun safety draft.
export function resolveReferences(evidenceIds, sources) {
  return (evidenceIds ?? [])
    .map((id) => sources.find((entry) => entry.id === id))
    .filter((source) => source && !source.internal && !source.safetyDraft)
    .map(toReference);
}

// Daftar bacaan (bukan dasar isi): sumber safety draft boleh tampil berlabel (E-4); sumber internal tidak pernah.
export function resolveReadingList(evidenceIds, sources) {
  return (evidenceIds ?? [])
    .map((id) => sources.find((entry) => entry.id === id))
    .filter((source) => source && !source.internal)
    .map(toReference);
}

// Katalog referensi untuk pengguna: semua sumber kecuali INTERNAL (data tetap disimpan, tidak dihapus).
export function publicSources(sources) {
  return sources.filter((source) => !source.internal);
}
