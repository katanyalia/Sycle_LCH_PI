/**
 * BANK PERTANYAAN HEALTH TRACKER SYCLE V2.1
 *
 * Bank ini terpisah dari General Assessment (data/sycle.js).
 *
 * HT = Pertanyaan umum
 * HM = Konteks menstruasi
 * HK = Konteks kehamilan
 * HS = Konteks menyusui
 *
 * Skala 0–4 merupakan tingkat gangguan aktivitas,
 * bukan tingkat keparahan penyakit atau diagnosis.
 */

export const HEALTH_TRACKER_CONDITIONS = [
  {
    value: "menstruasi",
    label: "Menstruasi",
  },
  {
    value: "kehamilan",
    label: "Hamil",
  },
  {
    value: "menyusui",
    label: "Menyusui",
  },
  {
    value: "lewati",
    label: "Tidak ingin menjawab",
  },
];

export const HEALTH_TRACKER_SCALE = [
  { value: 0, label: "Tidak mengganggu" },
  { value: 1, label: "Sedikit mengganggu" },
  { value: 2, label: "Cukup mengganggu" },
  { value: 3, label: "Sangat mengganggu" },
  { value: 4, label: "Amat sangat mengganggu" },
];

export const HEALTH_TRACKER_QUESTIONS = {
  // ==========================================
  // PERTANYAAN UMUM
  // ==========================================

  "HT-01": {
    code: "HT-01",
    type: "single",
    question: "Secara umum, bagaimana kenyamanan tubuhmu hari ini?",
    required: true,
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
    type: "multiple",
    question: "Apa yang kamu rasakan hari ini?",
    required: false,
    exclusiveOptions: ["tidak_ada_yang_ingin_dicatat"],
    options: [
      { value: "lelah", label: "Lelah atau lemas" },
      { value: "pusing", label: "Pusing" },
      { value: "sakit_kepala", label: "Sakit kepala" },
      { value: "mual", label: "Mual" },
      { value: "kram_otot", label: "Kram otot" },
      {
        value: "merasa_kepanasan",
        label: "Merasa kepanasan atau berkeringat berlebihan",
      },
      {
        value: "batuk_tenggorokan_gatal",
        label: "Batuk atau tenggorokan gatal",
      },
      { value: "mata_perih", label: "Mata perih" },
      {
        value: "tidak_ada_yang_ingin_dicatat",
        label: "Tidak Ada Gejala",
      },
    ],
  },

  "HT-03": {
    code: "HT-03",
    type: "per_option_scale",
    question: "Seberapa jauh kondisi tersebut mengganggu aktivitasmu?",
    required: false,
    scale: HEALTH_TRACKER_SCALE,
    dependsOn: "HT-02",
    description:
      "Skala ditampilkan di samping setiap gejala yang dipilih.",
  },

  "HT-04": {
    code: "HT-04",
    type: "single",
    question: "Di mana kamu lebih banyak beraktivitas hari ini?",
    required: true,
    options: [
      { value: "dalam_ruangan", label: "Dalam ruangan" },
      { value: "luar_ruangan", label: "Luar ruangan" },
      { value: "perjalanan", label: "Di perjalanan" },
      { value: "berpindah_pindah", label: "Berpindah-pindah" },
    ],
  },

  "HT-05": {
    code: "HT-05",
    type: "single",
    question: "Berapa lama kamu berada di luar ruangan hari ini?",
    required: true,
    options: [
      { value: "tidak", label: "Tidak berada di luar ruangan" },
      { value: "kurang_30", label: "Kurang dari 30 menit" },
      { value: "30_60", label: "30–60 menit" },
      { value: "1_2_jam", label: "1–2 jam" },
      { value: "lebih_2_jam", label: "Lebih dari 2 jam" },
      { value: "tidak_yakin", label: "Tidak yakin" },
    ],
  },

  // ==========================================
  // KONTEKS MENSTRUASI
  // ==========================================

  "HM-02": {
    code: "HM-02",
    type: "single",
    question: "Hari keberapa menstruasimu saat ini?",
    required: true,
    condition: "menstruasi",
    options: [
      { value: "hari_1", label: "Hari 1" },
      { value: "hari_2", label: "Hari 2" },
      { value: "hari_3", label: "Hari 3" },
      { value: "hari_4", label: "Hari 4" },
      { value: "hari_5", label: "Hari 5" },
      { value: "hari_6", label: "Hari 6" },
      { value: "hari_7", label: "Hari 7" },
      { value: "hari_8", label: "Hari 8" },
      { value: "hari_9", label: "Hari 9" },
      { value: "hari_10", label: "Hari 10" },
      { value: "hari_11", label: "Hari 11" },
      { value: "hari_12", label: "Hari 12" },
      { value: "hari_13", label: "Hari 13" },
      { value: "hari_14", label: "Hari 14" },
      { value: "tidak_yakin", label: "Tidak yakin" },
    ],
  },

  "HM-03": {
    code: "HM-03",
    type: "single",
    question: "Bagaimana kamu menggambarkan jumlah darah menstruasimu hari ini?",
    required: true,
    condition: "menstruasi",
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
    required: true,
    condition: "menstruasi",
    options: [
      { value: "ya", label: "Ya" },
      { value: "tidak", label: "Tidak" },
      { value: "tidak_ingin_menjawab", label: "Tidak ingin menjawab" },
    ],
  },

  "HM-05": {
    code: "HM-05",
    type: "scale",
    question: "Seberapa jauh nyeri tersebut mengganggu aktivitasmu?",
    required: true,
    condition: "menstruasi",
    showIf: { question: "HM-04", equals: "ya" },
    scale: HEALTH_TRACKER_SCALE,
  },

  "HM-06": {
    code: "HM-06",
    type: "single",
    question: "Bagaimana aksesmu terhadap toilet atau tempat mengganti pembalut hari ini?",
    required: true,
    condition: "menstruasi",
    options: [
      { value: "mudah", label: "Mudah" },
      { value: "cukup", label: "Cukup" },
      { value: "sulit", label: "Sulit" },
      { value: "tidak_ingin_menjawab", label: "Tidak ingin menjawab" },
    ],
  },

  // ==========================================
  // KONTEKS KEHAMILAN
  // ==========================================

  "HK-01": {
    code: "HK-01",
    type: "multiple",
    question: "Apa saja situasi yang kamu alami selama beraktivitas hari ini?",
    required: true,
    condition: "kehamilan",
    exclusiveOptions: ["tidak_ada"],
    options: [
      { value: "sulit_istirahat", label: "Sulit beristirahat" },
      { value: "sulit_tempat_sejuk", label: "Sulit menemukan tempat sejuk" },
      { value: "sulit_air_minum", label: "Sulit mendapat air minum" },
      { value: "aktivitas_berat", label: "Aktivitas terasa berat" },
      { value: "lainnya", label: "Lainnya" },
      { value: "tidak_ada", label: "Tidak ada" },
    ],
    otherText: {
      key: "HK-01_OTHER",
      maxLength: 200,
      showIf: { includes: "lainnya" },
    },
  },

  "HK-02": {
    code: "HK-02",
    type: "per_option_scale",
    question: "Seberapa jauh situasi tersebut memengaruhi aktivitasmu?",
    required: false,
    condition: "kehamilan",
    scale: HEALTH_TRACKER_SCALE,
    dependsOn: "HK-01",
    description: "Skala ditampilkan untuk setiap pilihan HK-01 yang dipilih, kecuali Lainnya dan Tidak ada.",
  },

  // ==========================================
  // KONTEKS MENYUSUI
  // ==========================================

  "HS-01": {
    code: "HS-01",
    type: "single",
    question: "Apakah kamu menyusui atau memompa ASI hari ini?",
    required: true,
    condition: "menyusui",
    options: [
      { value: "ya", label: "Ya" },
      { value: "tidak", label: "Tidak" },
      { value: "tidak_ingin_menjawab", label: "Tidak ingin menjawab" },
    ],
  },

  "HS-02": {
    code: "HS-02",
    type: "single",
    question: "Apakah kamu mengalami ketidaknyamanan saat menyusui atau memompa ASI?",
    required: true,
    condition: "menyusui",
    showIf: { question: "HS-01", equals: "ya" },
    options: [
      { value: "ya", label: "Ya" },
      { value: "tidak", label: "Tidak" },
      { value: "tidak_ingin_menjawab", label: "Tidak ingin menjawab" },
    ],
  },

  "HS-03": {
    code: "HS-03",
    type: "scale",
    question: "Seberapa jauh ketidaknyamanan ini mengganggu aktivitasmu?",
    required: true,
    condition: "menyusui",
    showIf: { question: "HS-02", equals: "ya" },
    scale: HEALTH_TRACKER_SCALE,
  },

  "HS-04": {
    code: "HS-04",
    type: "multiple",
    question: "Apa saja kondisi yang kamu alami selama menyusui atau memompa ASI hari ini?",
    required: true,
    condition: "menyusui",
    exclusiveOptions: ["tidak_ada"],
    options: [
      { value: "lingkungan_panas", label: "Lingkungan terasa panas" },
      { value: "bayi_menyusu_lebih_sering", label: "Bayi menyusu lebih sering dari biasanya" },
      { value: "sulit_istirahat", label: "Sulit beristirahat" },
      { value: "sulit_tempat_nyaman", label: "Sulit mendapat tempat nyaman" },
      { value: "akses_air_terbatas", label: "Akses air minum terbatas" },
      { value: "lainnya", label: "Lainnya" },
      { value: "tidak_ada", label: "Tidak ada" },
    ],
    otherText: {
      key: "HS-04_OTHER",
      maxLength: 200,
      showIf: { includes: "lainnya" },
    },
  },
};

// ==========================================
// URUTAN DAN PERCABANGAN PERTANYAAN
// ==========================================

export const HEALTH_TRACKER_BASE_STEPS = [
  "HT-01",
  "HT-02",
  "HT-03",
  "HT-04",
  "HT-05",
];

export const HEALTH_TRACKER_BRANCH_STEPS = {
  menstruasi: [
    "HM-02",
    "HM-03",
    "HM-04",
    "HM-05",
    "HM-06",
  ],

  kehamilan: [
    "HK-01",
    "HK-02",
  ],

  menyusui: [
    "HS-01",
    "HS-02",
    "HS-03",
    "HS-04",
  ],

  lewati: [],
};

/**
 * Memeriksa apakah pertanyaan memenuhi kondisi tampil.
 */
export function isHealthTrackerQuestionVisible(
  question,
  answers = {},
) {
  const rule = question?.showIf;

  if (!rule) return true;

  return answers[rule.question] === rule.equals;
}

/**
 * Mengambil urutan pertanyaan sesuai konteks dan jawaban.
 */
export function getVisibleHealthTrackerSteps(
  condition,
  answers = {},
) {
  const branch = HEALTH_TRACKER_BRANCH_STEPS[condition] ?? [];

  const steps = [
    ...HEALTH_TRACKER_BASE_STEPS,
    ...branch,
  ];

  return steps.filter((code) => {
    const question = HEALTH_TRACKER_QUESTIONS[code];

    return isHealthTrackerQuestionVisible(question, answers);
  });
}

/**
 * Mengambil definisi pertanyaan berdasarkan kode.
 */
export function getHealthTrackerQuestion(code) {
  return HEALTH_TRACKER_QUESTIONS[code] ?? null;
}

/**
 * Mengatur jawaban pilihan multiple.
 * Pilihan eksklusif otomatis menghapus pilihan lainnya.
 */
export function setHealthTrackerAnswer(
  answers = {},
  code,
  value,
) {
  const question = HEALTH_TRACKER_QUESTIONS[code];

  let normalizedValue = value;

  if (
    question?.type === "multiple" &&
    Array.isArray(value)
  ) {
    const exclusiveOptions = question.exclusiveOptions ?? [];

    const selectedExclusive = value.find((item) =>
      exclusiveOptions.includes(item),
    );

    normalizedValue = selectedExclusive
      ? [selectedExclusive]
      : value.filter(
          (item) => !exclusiveOptions.includes(item),
        );
  }

  return {
    ...answers,
    [code]: normalizedValue,
  };
}