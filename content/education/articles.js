// Artikel Info & Edukasi (WF-08 screen 62–63).
// T3-1: ISI DITULIS OLEH TIM. Claude hanya memasukkan teks yang diberikan tim apa adanya.
// Panduan pengisian: docs/PANDUAN_KONTEN.md. Setiap artikel dicek oleh lib/content/rules.js:
// tanpa referensi / referensi internal atau safety draft / status tidak sah → tidak ditampilkan.
//
// Bentuk satu artikel:
// {
//   slug: "contoh-slug",                    // huruf kecil & tanda hubung, unik
//   category: "panas",                      // panas | kualitas-udara | uv | kesehatan-perempuan
//   title: "Judul artikel",
//   summary: "Ringkasan 1–2 kalimat untuk kartu katalog.",
//   sections: [{ heading: "Subjudul", paragraphs: ["Paragraf 1", "Paragraf 2"] }],
//   terms: ["heat-index"],                  // id istilah glosarium yang relevan (opsional)
//   limitations: "Batasan informasi ini.",  // wajib diisi tim
//   evidenceIds: ["E16"],                   // kode sumber dari content/evidence/sources.js (≥ 1)
//   status: "draft",                        // draft | approved
//   author: "Nama penulis (tim)",
//   approvedBy: null, approvedAt: null,     // wajib untuk "approved" (lihat content/approvers.js)
//   updatedAt: "2026-10-15",
// }
export const ARTICLES = [];
