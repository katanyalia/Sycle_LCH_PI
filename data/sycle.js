export const conditions = ["Menstruasi", "Hamil", "Menyusui"];

export const symptoms = {
  Menstruasi: [
    "Nyeri/kram",
    "Sakit kepala",
    "Kembung",
    "Pusing",
    "Mual",
    "Perubahan suasana hati",
  ],
  Hamil: [
    "Sakit kepala",
    "Pusing",
    "Mual",
    "Lemas/kelelahan",
    "Sangat haus",
    "Rasa panas/tidak nyaman karena panas",
  ],
  Menyusui: [
    "Lelah/kelelahan",
    "Pusing",
    "Sakit kepala",
    "Merasa kepanasan",
    "Sulit beristirahat",
    "Ketidaknyamanan saat menyusui",
  ],
};

// Pertanyaan Health Tracker mengikuti Master Draft Tahap 3 (kode HT/HM/HS di komentar).
// Format: [pertanyaan, opsi, { showIf }] — showIf membuat pertanyaan muncul hanya bila
// jawaban pertanyaan lain sesuai (percabangan Master Draft).
export const Q_COMFORT = "Secara umum, bagaimana kenyamanan tubuhmu hari ini?";
export const Q_OUTDOOR = "Berapa lama kamu berada di luar ruangan hari ini?";
export const Q_MENSTRUATING = "Apakah kamu sedang menstruasi hari ini?";
export const Q_MENSTRUATION_DAY = "Hari keberapa menstruasimu saat ini?";
export const Q_FLOW = "Bagaimana kamu menggambarkan jumlah darah menstruasimu hari ini?";
export const Q_PAIN = "Apakah kamu mengalami nyeri atau ketidaknyamanan terkait menstruasi yang ingin dicatat?";
export const Q_PAIN_DISRUPTION = "Seberapa jauh nyeri tersebut mengganggu aktivitasmu?";
export const Q_BREASTFEEDING = "Apakah kamu menyusui atau memompa ASI hari ini?";
export const Q_BF_DISCOMFORT = "Apakah kamu mengalami ketidaknyamanan saat menyusui atau memompa ASI?";
export const Q_BF_DISRUPTION = "Seberapa jauh ketidaknyamanan ini mengganggu aktivitasmu?";

const COMFORT_OPTIONS = ["Sangat nyaman", "Nyaman", "Biasa saja", "Kurang nyaman", "Sangat tidak nyaman", "Tidak ingin menjawab"];
const OUTDOOR_OPTIONS = ["Tidak", "Kurang dari 30 menit", "30–60 menit", "1–2 jam", "Lebih dari 2 jam", "Tidak yakin"];
const YES_NO = ["Ya", "Tidak", "Tidak ingin menjawab"];

// Skala gangguan aktivitas 0–4 (HM-05, HS-03). Bukan tingkat keparahan penyakit.
export const DISRUPTION_SCALE = [
  "Tidak mengganggu",
  "Sedikit mengganggu",
  "Cukup mengganggu",
  "Sangat mengganggu",
  "Amat sangat mengganggu",
];

export const coreQuestions = {
  Menstruasi: [
    [Q_COMFORT, COMFORT_OPTIONS], // HT-01
    [Q_MENSTRUATING, ["Ya", "Tidak", "Tidak yakin", "Tidak ingin menjawab"]], // HM-01
    [Q_MENSTRUATION_DAY, [], { showIf: { question: Q_MENSTRUATING, equals: "Ya" } }], // HM-02
    [Q_FLOW, ["Sedikit", "Sedang", "Banyak", "Tidak ingin menjawab"], { showIf: { question: Q_MENSTRUATING, equals: "Ya" } }], // HM-03
    [Q_PAIN, YES_NO], // HM-04
    [Q_PAIN_DISRUPTION, DISRUPTION_SCALE, { showIf: { question: Q_PAIN, equals: "Ya" } }], // HM-05
    [Q_OUTDOOR, OUTDOOR_OPTIONS], // HT-04
  ],

  Hamil: [
    [Q_COMFORT, COMFORT_OPTIONS], // HT-01
    ["Berapa usia kehamilanmu saat ini?", ["Trimester 1", "Trimester 2", "Trimester 3", "Tidak yakin"]],
    [Q_OUTDOOR, OUTDOOR_OPTIONS], // HT-04
    ["Apa yang mudah kamu akses saat lingkungan terasa panas?", ["Air minum", "Tempat teduh", "Tempat lebih sejuk", "Waktu beristirahat", "Tidak ada dari pilihan di atas"]],
  ],

  Menyusui: [
    [Q_COMFORT, COMFORT_OPTIONS], // HT-01
    [Q_BREASTFEEDING, YES_NO], // HS-01
    [Q_BF_DISCOMFORT, YES_NO, { showIf: { question: Q_BREASTFEEDING, equals: "Ya" } }], // HS-02
    [Q_BF_DISRUPTION, DISRUPTION_SCALE, { showIf: { question: Q_BF_DISCOMFORT, equals: "Ya" } }], // HS-03
    [Q_OUTDOOR, OUTDOOR_OPTIONS], // HT-04
  ],
};

// Pertanyaan tampil bila tidak punya syarat, atau syaratnya terpenuhi.
export function isQuestionVisible(entry, answers = {}) {
  const rule = entry?.[2]?.showIf;
  if (!rule) return true;
  return answers[rule.question] === rule.equals;
}

export function visibleQuestions(condition, answers = {}) {
  return (coreQuestions[condition] ?? []).filter((entry) => isQuestionVisible(entry, answers));
}

export const evidence = {
  Hamil: {
    text: "Kehamilan dapat meningkatkan kerentanan terhadap panas. Suhu hari ini dan durasi aktivitas luar ruangan relevan untuk diperhatikan. Ini tidak menjelaskan penyebab sakit kepala atau kelelahanmu.",
    source: "CDC · Heat and Pregnancy",
    url: "https://www.cdc.gov/heat-health/risk-factors/heat-and-pregnancy.html",
  },
  Menstruasi: {
    text: "Penelitian meninjau perbedaan pengaturan suhu sepanjang siklus. Temuan mengenai respons saat beraktivitas di lingkungan panas tidak konsisten. Catatan hari menstruasi tidak cukup untuk menyimpulkan bahwa panas menyebabkan kram atau perubahan aliran.",
    source: "Systematic review & meta-analysis · 2020",
    url: "https://pubmed.ncbi.nlm.nih.gov/32499153/",
  },  
  Menyusui: {
    text: "Menyusui membutuhkan perhatian terhadap kenyamanan, kecukupan cairan, dan kesempatan beristirahat. Kondisi lingkungan dicatat sebagai konteks, bukan sebagai diagnosis atau bukti penyebab keluhan.",
    source: "SYCLE · Informasi edukatif",
    url: "",
  },
};

export const guidance = [
  ["Air minum mudah dijangkau", "Minum air secara teratur saat cuaca panas.", "WHO · Heat and health"],
  ["Cari tempat lebih sejuk", "Pilih tempat teduh atau ruangan sejuk.", "WHO · Heat and health"],
  ["Atur waktu aktivitas", "Hindari aktivitas berat pada waktu terpanas.", "WHO · Heat and health"],
];

export const topics = [
  ["Panas & Kehamilan", "Kehamilan", "Konteks lingkungan panas selama kehamilan."],
  ["Menstruasi & Suhu Tubuh", "Menstruasi", "Kenali pengaturan suhu sepanjang siklus."],
  ["Menopause & Rasa Panas", "Menopause", "Istilah dan pengalaman yang sering dicatat."],
  ["PM2.5 & Kesehatan", "Kualitas Udara", "Mengenal data partikel pada kondisi lingkungan."],
];


/**
 * BANK PERTANYAAN ASSESSMENT UMUM SYCLE
 *
 * P-00 = Aktivitas
 * P-01 = Kondisi yang ingin dipertimbangkan
 *
 * Bank ini terpisah dari coreQuestions dan symptoms
 * yang masih digunakan oleh Health Tracker.
 */

export const PERSONALIZATION_QUESTIONS = {
  "P-00": {
    code: "P-00",
    type: "single",
    question: "Hari ini kamu akan lebih banyak beraktivitas di mana?",
    required: true,
    options: [
      { value: "indoor", label: "Di dalam ruangan" },
      { value: "outdoor", label: "Di luar ruangan" },
      {
        value: "travel",
        label: "Di perjalanan (jalan kaki, motor, atau angkutan umum)",
      },
      {
        value: "moving",
        label: "Berpindah-pindah, dalam dan luar ruangan",
      },
    ],
  },

  "P-01": {
    code: "P-01",
    type: "single",
    question:
      "Kondisi apa yang ingin kamu pertimbangkan untuk panduan hari ini?",
    required: true,
    options: [
      { value: "menstruasi", label: "Menstruasi" },
      { value: "kehamilan", label: "Kehamilan" },
      { value: "menyusui", label: "Menyusui" },
      { value: "lewati", label: "Lewati" },
    ],
  },

  "P-02": {
    code: "P-02",
    type: "single",
    question:
      "Berapa lama kamu memperkirakan akan berada di luar ruangan?",
    required: true,
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
    type: "multiple",
    question: "Apa saja yang kamu bawa atau tersedia hari ini?",
    required: true,
    exclusiveOptions: ["tidak_ada", "belum_tahu"],
    options: [
      { value: "air_minum", label: "Air minum" },
      { value: "tempat_teduh", label: "Tempat teduh" },
      { value: "masker", label: "Masker N95 atau KN95" },
      {
        value: "perlindungan_matahari",
        label: "Perlindungan matahari (topi, payung, tabir surya)",
      },
      { value: "tidak_ada", label: "Tidak ada" },
      { value: "belum_tahu", label: "Belum tahu" },
    ],
  },

  "PM-01": {
    code: "PM-01",
    type: "single",
    question: "Apakah kamu sedang menstruasi saat ini?",
    required: true,
    options: [
      { value: "ya", label: "Ya" },
      { value: "tidak", label: "Tidak" },
      { value: "tidak_yakin", label: "Tidak yakin" },
      {
        value: "tidak_ingin_menjawab",
        label: "Tidak ingin menjawab",
      },
    ],
  },

  "PM-02": {
    code: "PM-02",
    type: "multiple",
    question:
      "Adakah kebutuhan yang ingin kamu pertimbangkan untuk aktivitas hari ini?",
    required: true,
    exclusiveOptions: [
      "tidak_ada_kebutuhan",
      "tidak_ingin_menjawab",
    ],
    options: [
      {
        value: "akses_toilet",
        label: "Akses toilet atau tempat mengganti pembalut",
      },
      {
        value: "istirahat",
        label: "Kesempatan beristirahat",
      },
      {
        value: "kurangi_aktivitas_berat",
        label: "Mengurangi aktivitas berat",
      },
      {
        value: "tidak_ada_kebutuhan",
        label: "Tidak ada kebutuhan khusus",
      },
      {
        value: "tidak_ingin_menjawab",
        label: "Tidak ingin menjawab",
      },
    ],
  },

  "PS-01": {
    code: "PS-01",
    type: "single",
    question:
      "Apakah kamu berencana menyusui atau memompa ASI selama aktivitas hari ini?",
    required: true,
    options: [
      { value: "ya", label: "Ya" },
      { value: "tidak", label: "Tidak" },
      { value: "belum_tahu", label: "Belum tahu" },
      {
        value: "tidak_ingin_menjawab",
        label: "Tidak ingin menjawab",
      },
    ],
  },

  "PS-02": {
    code: "PS-02",
    type: "single",
    question:
      "Apa yang mungkin kamu perlukan untuk menyusui atau memompa ASI?",
    required: true,
    options: [
      {
        value: "tempat_nyaman",
        label: "Tempat yang nyaman",
      },
      {
        value: "waktu_istirahat",
        label: "Waktu untuk beristirahat",
      },
      {
        value: "keduanya",
        label: "Tempat yang nyaman dan waktu beristirahat",
      },
      {
        value: "tidak_ada_kebutuhan",
        label: "Tidak ada kebutuhan khusus",
      },
      {
        value: "belum_tahu",
        label: "Belum tahu",
      },
    ],
  },
};

/**
 * Urutan pertanyaan dan percabangan assessment umum.
 */
export const PERSONALIZATION_BASE_STEPS = [
  "P-00",
  "P-01",
  "P-02",
  "P-03",
];

export function getPersonalizationBranchSteps(answers = {}) {
  const condition = answers["P-01"];

  if (condition === "menstruasi") {
    const steps = ["PM-01"];

    if (answers["PM-01"] === "ya") {
      steps.push("PM-02");
    }

    return steps;
  }

  if (condition === "menyusui") {
    const steps = ["PS-01"];

    if (
      answers["PS-01"] === "ya" ||
      answers["PS-01"] === "belum_tahu"
    ) {
      steps.push("PS-02");
    }

    return steps;
  }

  // Kehamilan dan Lewati tidak memiliki cabang tambahan
  // dalam bank pertanyaan LCH yang digunakan saat ini.
  return [];
}

export function getVisiblePersonalizationSteps(answers = {}) {
  return [
    ...PERSONALIZATION_BASE_STEPS,
    ...getPersonalizationBranchSteps(answers),
  ];
}

export function setPersonalizationAnswer(
  answers = {},
  code,
  value,
) {
  let normalizedValue = value;

  const question = PERSONALIZATION_QUESTIONS[code];

  if (
    question?.type === "multiple" &&
    Array.isArray(value) &&
    question.exclusiveOptions
  ) {
    const selectedExclusive = value.find((item) =>
      question.exclusiveOptions.includes(item),
    );

    normalizedValue = selectedExclusive
      ? [selectedExclusive]
      : value.filter(
          (item) => !question.exclusiveOptions.includes(item),
        );
  }

  const nextAnswers = {
    ...answers,
    [code]: normalizedValue,
  };

  const visibleSteps = new Set(
    getVisiblePersonalizationSteps(nextAnswers),
  );

  for (const key of Object.keys(nextAnswers)) {
    if (
      (key.startsWith("PM-") || key.startsWith("PS-")) &&
      !visibleSteps.has(key)
    ) {
      delete nextAnswers[key];
    }
  }

  return nextAnswers;
}

export function isPersonalizationQuestionAnswered(
  code,
  answers = {},
) {
  const value = answers[code];

  if (value === undefined || value === null || value === "") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}