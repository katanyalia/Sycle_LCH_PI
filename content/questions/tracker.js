// Pertanyaan Health Tracker — teks, opsi, jenis, dan percabangan PERSIS Master Draft Tahap 3 (LOCKED).
// Pertanyaan konteks & label skala dari Master Wireframe (screen 28, 31, 32, 38, 40, 43, 45).
// Kode opsi (value) sama dengan kode di database (migration 002).

const YA_TIDAK_TIDAK_INGIN = [
  { value: "ya", label: "Ya" },
  { value: "tidak", label: "Tidak" },
  { value: "tidak_ingin_menjawab", label: "Tidak ingin menjawab" },
];

export const TRACKER_QUESTIONS = {
  KONTEKS: {
    code: "KONTEKS",
    type: "single",
    question: "Apa konteks yang ingin kamu gunakan untuk catatan ini?",
    helper: "Pilihan ini mengatur pertanyaan berikutnya. Lewati tetap bisa mencatat pengalaman umum.",
    options: [
      { value: "menstruasi", label: "Menstruasi" },
      { value: "kehamilan", label: "Kehamilan" },
      { value: "menyusui", label: "Menyusui" },
      { value: "lewati", label: "Lewati" },
    ],
  },
  "HT-01": {
    code: "HT-01",
    type: "single",
    question: "Secara umum, bagaimana kenyamanan tubuhmu hari ini?",
    helper: "Jawabanmu adalah pengalaman subjektif.",
    options: [
      { value: "sangat_nyaman", label: "Sangat nyaman" },
      { value: "nyaman", label: "Nyaman" },
      { value: "biasa_saja", label: "Biasa saja" },
      { value: "kurang_nyaman", label: "Kurang nyaman" },
      { value: "sangat_tidak_nyaman", label: "Sangat tidak nyaman" },
      { value: "tidak_ingin_menjawab", label: "Tidak ingin menjawab" },
    ],
  },
  "HT-02": {
    code: "HT-02",
    type: "multi",
    question: "Apakah ada hal berikut yang ingin kamu catat?",
    helper: "Kamu boleh memilih lebih dari satu. \"Tidak ada gejala yang ingin dicatat\" tidak bisa digabung dengan pilihan lain.",
    options: [
      { value: "lelah", label: "Lelah" },
      { value: "pusing", label: "Pusing" },
      { value: "sakit_kepala", label: "Sakit kepala" },
      { value: "mual", label: "Mual" },
      { value: "merasa_kepanasan", label: "Merasa kepanasan" },
      { value: "lainnya", label: "Lainnya" },
      { value: "tidak_ada_gejala", label: "Tidak ada gejala yang ingin dicatat", exclusive: true },
    ],
    other: { key: "HT-02-other", label: "Ceritakan gejala lain yang ingin kamu catat.", maxLength: 200 },
  },
  "HT-03": {
    code: "HT-03",
    type: "scale-per-item",
    question: "Seberapa jauh gejala ini mengganggu aktivitasmu?",
    helper: "Nilai setiap gejala secara terpisah. Skala ini menggambarkan gangguan aktivitas, bukan tingkat keparahan penyakit. Kamu boleh melewatinya.",
    itemsFrom: "HT-02",
  },
  "HT-04": {
    code: "HT-04",
    type: "single",
    question: "Berapa lama kamu berada di luar ruangan hari ini?",
    helper: "Ini pengalaman aktual hari ini, bukan rencana.",
    options: [
      { value: "tidak", label: "Tidak" },
      { value: "kurang_30", label: "Kurang dari 30 menit" },
      { value: "30_60", label: "30–60 menit" },
      { value: "1_2_jam", label: "1–2 jam" },
      { value: "lebih_2_jam", label: "Lebih dari 2 jam" },
      { value: "tidak_yakin", label: "Tidak yakin" },
    ],
  },
  "HM-01": {
    code: "HM-01",
    type: "single",
    question: "Apakah kamu sedang menstruasi hari ini?",
    options: [
      { value: "ya", label: "Ya" },
      { value: "tidak", label: "Tidak" },
      { value: "tidak_yakin", label: "Tidak yakin" },
      { value: "tidak_ingin_menjawab", label: "Tidak ingin menjawab" },
    ],
  },
  "HM-02": {
    code: "HM-02",
    type: "single",
    question: "Hari keberapa menstruasimu saat ini?",
    options: [
      ...[1, 2, 3, 4, 5, 6, 7].map((n) => ({ value: `hari_${n}`, label: `Hari ke-${n}` })),
      { value: "lebih_7", label: "Lebih dari 7 hari" },
      { value: "tidak_yakin", label: "Tidak yakin" },
    ],
  },
  "HM-03": {
    code: "HM-03",
    type: "single",
    question: "Bagaimana kamu menggambarkan jumlah darah menstruasimu hari ini?",
    helper: "Ini penilaian subjektif, bukan pengukuran klinis.",
    options: [
      { value: "sedikit", label: "Sedikit" },
      { value: "sedang", label: "Sedang" },
      { value: "banyak", label: "Banyak" },
      { value: "tidak_ingin_menjawab", label: "Tidak ingin menjawab" },
    ],
  },
  "HM-04": {
    code: "HM-04",
    type: "single",
    question: "Apakah kamu mengalami nyeri atau ketidaknyamanan terkait menstruasi yang ingin dicatat?",
    options: YA_TIDAK_TIDAK_INGIN,
  },
  "HM-05": {
    code: "HM-05",
    type: "scale",
    question: "Seberapa jauh nyeri tersebut mengganggu aktivitasmu?",
    helper: "Penilaian ini khusus nyeri menstruasi dan tidak perlu diulang pada gejala lain.",
  },
  "HK-01": {
    code: "HK-01",
    type: "multi",
    question: "Apakah ada situasi berikut yang ingin kamu catat terkait aktivitas hari ini?",
    helper: "Kamu boleh memilih lebih dari satu. \"Tidak ada\" tidak bisa digabung dengan pilihan lain.",
    options: [
      { value: "tidak_ada", label: "Tidak ada", exclusive: true },
      { value: "sulit_istirahat", label: "Sulit beristirahat" },
      { value: "sulit_tempat_sejuk", label: "Sulit menemukan tempat sejuk" },
      { value: "aktivitas_berat", label: "Aktivitas terasa berat" },
      { value: "lainnya", label: "Lainnya" },
    ],
    other: { key: "HK-01-other", label: "Jelaskan singkat situasi lainnya.", maxLength: 200 },
  },
  "HK-02": {
    code: "HK-02",
    type: "scale-per-item",
    question: "Seberapa jauh hambatan ini mengganggu aktivitasmu?",
    helper: "Nilai setiap hambatan secara terpisah. Nilainya bukan tingkat risiko kehamilan atau kondisi klinis.",
    itemsFrom: "HK-01",
  },
  "HS-01": {
    code: "HS-01",
    type: "single",
    question: "Apakah kamu menyusui atau memompa ASI hari ini?",
    options: YA_TIDAK_TIDAK_INGIN,
  },
  "HS-02": {
    code: "HS-02",
    type: "single",
    question: "Apakah kamu mengalami ketidaknyamanan saat menyusui atau memompa ASI?",
    options: YA_TIDAK_TIDAK_INGIN,
  },
  "HS-03": {
    code: "HS-03",
    type: "scale",
    question: "Seberapa jauh ketidaknyamanan ini mengganggu aktivitasmu?",
  },
  "HS-04": {
    code: "HS-04",
    type: "multi",
    question: "Situasi apa yang ingin kamu catat saat menyusui atau memompa ASI?",
    helper: "Kamu boleh memilih lebih dari satu. \"Tidak ada\" tidak bisa digabung dengan pilihan lain.",
    options: [
      { value: "lingkungan_panas", label: "Lingkungan terasa panas" },
      { value: "sulit_istirahat", label: "Sulit beristirahat" },
      { value: "sulit_tempat_nyaman", label: "Sulit mendapatkan tempat nyaman" },
      { value: "akses_air_terbatas", label: "Akses air minum terbatas" },
      { value: "lainnya", label: "Lainnya" },
      { value: "tidak_ada", label: "Tidak ada", exclusive: true },
    ],
  },
  CERITA: {
    code: "CERITA",
    type: "text",
    question: "Ada cerita lain yang ingin kamu sampaikan?",
    helper: "Opsional. Tuliskan pengalamanmu dengan kata-katamu sendiri. Tidak otomatis disimpan atau dikirim ke AI.",
    maxLength: 2000,
  },
};

export const SCALE_EXCLUDED_OPTIONS = { "HT-02": "tidak_ada_gejala", "HK-01": "tidak_ada" };

export function trackerOptionLabel(code, value) {
  return TRACKER_QUESTIONS[code]?.options?.find((option) => option.value === value)?.label ?? value;
}
