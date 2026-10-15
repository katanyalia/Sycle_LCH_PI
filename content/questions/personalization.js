// Pertanyaan Personalisasi — teks, opsi, jenis, dan percabangan PERSIS sesuai Master Draft Tahap 2 (LOCKED).
// P-02 selalu tampil. P-04 tidak ada. PK-01 tidak ada (sudah tercakup di P-03).
// Jangan mengubah teks atau menambah/mengurangi opsi tanpa revisi Master Draft.

export const PERSONALIZATION_QUESTIONS = {
  "P-00": {
    code: "P-00",
    type: "single",
    question: "Kondisi apa yang ingin kamu pertimbangkan untuk panduan hari ini?",
    helper: "Pilihan ini tidak menilai kesehatan. Lewati tetap mendapatkan panduan umum.",
    options: [
      { value: "menstruasi", label: "Menstruasi" },
      { value: "kehamilan", label: "Kehamilan" },
      { value: "menyusui", label: "Menyusui" },
      { value: "lewati", label: "Lewati" },
    ],
  },
  "P-01": {
    code: "P-01",
    type: "single",
    question: "Aktivitas apa yang paling menggambarkan rencanamu hari ini?",
    helper: "Rencana dapat berubah.",
    options: [
      { value: "di_rumah", label: "Di rumah" },
      { value: "dalam_ruangan", label: "Bekerja atau belajar di dalam ruangan" },
      { value: "bepergian", label: "Bepergian" },
      { value: "luar_ruangan", label: "Aktivitas luar ruangan" },
    ],
  },
  "P-02": {
    code: "P-02",
    type: "single",
    question: "Berapa lama kamu memperkirakan akan berada di luar ruangan?",
    helper: "Perkiraan, bukan rekam aktivitas.",
    options: [
      { value: "tidak_keluar", label: "Tidak berencana keluar" },
      { value: "kurang_30", label: "Kurang dari 30 menit" },
      { value: "30_60", label: "30–60 menit" },
      { value: "1_2_jam", label: "1–2 jam" },
      { value: "lebih_2_jam", label: "Lebih dari 2 jam" },
      { value: "belum_tahu", label: "Belum tahu" },
    ],
  },
  "P-03": {
    code: "P-03",
    type: "multi",
    question: "Apa saja yang tersedia untuk membantumu beraktivitas dengan lebih nyaman?",
    helper: "Kamu boleh memilih lebih dari satu. \"Tidak ada\" dan \"Belum tahu\" tidak bisa digabung dengan pilihan lain.",
    options: [
      { value: "air_minum", label: "Air minum" },
      { value: "tempat_teduh", label: "Tempat teduh atau ruang sejuk" },
      { value: "masker", label: "Masker yang sesuai" },
      { value: "perlindungan_matahari", label: "Perlindungan matahari" },
      { value: "tidak_ada", label: "Tidak ada", exclusive: true },
      { value: "belum_tahu", label: "Belum tahu", exclusive: true },
    ],
  },
  "PM-01": {
    code: "PM-01",
    type: "single",
    question: "Apakah kamu sedang menstruasi saat ini?",
    helper: "Informasi ini bersifat sukarela.",
    options: [
      { value: "ya", label: "Ya" },
      { value: "tidak", label: "Tidak" },
      { value: "tidak_yakin", label: "Tidak yakin" },
      { value: "tidak_ingin_menjawab", label: "Tidak ingin menjawab" },
    ],
  },
  "PM-02": {
    code: "PM-02",
    type: "multi",
    question: "Adakah kebutuhan yang ingin kamu pertimbangkan untuk aktivitas hari ini?",
    helper: "Bukan penilaian medis. Dua pilihan terakhir tidak bisa digabung dengan pilihan lain.",
    options: [
      { value: "akses_toilet", label: "Akses toilet atau tempat mengganti pembalut" },
      { value: "istirahat", label: "Kesempatan beristirahat" },
      { value: "kurangi_aktivitas_berat", label: "Mengurangi aktivitas berat" },
      { value: "tidak_ada_kebutuhan", label: "Tidak ada kebutuhan khusus", exclusive: true },
      { value: "tidak_ingin_menjawab", label: "Tidak ingin menjawab", exclusive: true },
    ],
  },
  "PS-01": {
    code: "PS-01",
    type: "single",
    question: "Apakah kamu berencana menyusui atau memompa ASI selama aktivitas hari ini?",
    helper: "Untuk perencanaan aktivitas.",
    options: [
      { value: "ya", label: "Ya" },
      { value: "tidak", label: "Tidak" },
      { value: "belum_tahu", label: "Belum tahu" },
      { value: "tidak_ingin_menjawab", label: "Tidak ingin menjawab" },
    ],
  },
  "PS-02": {
    code: "PS-02",
    type: "single",
    question: "Apa yang mungkin kamu perlukan untuk mendukung aktivitas menyusui atau memompa ASI?",
    helper: "Kebutuhan praktis.",
    options: [
      { value: "tempat_nyaman", label: "Tempat yang nyaman" },
      { value: "waktu_istirahat", label: "Waktu untuk beristirahat" },
      { value: "keduanya", label: "Keduanya" },
      { value: "tidak_ada_kebutuhan", label: "Tidak ada kebutuhan khusus" },
      { value: "belum_tahu", label: "Belum tahu" },
    ],
  },
};

export function optionLabel(code, value) {
  return PERSONALIZATION_QUESTIONS[code]?.options.find((option) => option.value === value)?.label ?? value;
}
