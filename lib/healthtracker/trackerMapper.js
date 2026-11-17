const CONDITION_MAP = {
  Menstruasi: "menstruasi",
  menstruasi: "menstruasi",
  Hamil: "kehamilan",
  Kehamilan: "kehamilan",
  kehamilan: "kehamilan",
  Menyusui: "menyusui",
  menyusui: "menyusui",
  Lewati: "lewati",
  lewati: "lewati",
};

const VALUE_MAP = {
  comfort: {
    sangat_nyaman: "sangat_nyaman",
    nyaman: "nyaman",
    biasa_saja: "biasa_saja",
    kurang_nyaman: "kurang_nyaman",
    sangat_tidak_nyaman: "sangat_tidak_nyaman",
    tidak_ingin_menjawab: "tidak_ingin_menjawab",
  },

  yesNo: {
    ya: "ya",
    tidak: "tidak",
    tidak_yakin: "tidak_yakin",
    tidak_ingin_menjawab: "tidak_ingin_menjawab",
  },

  flow: {
    sedikit: "sedikit",
    sedang: "sedang",
    banyak: "banyak",
    tidak_ingin_menjawab: "tidak_ingin_menjawab",
  },

  day: {
    hari_1: "hari_1",
    hari_2: "hari_2",
    hari_3: "hari_3",
    hari_4: "hari_4",
    hari_5: "hari_5",
    hari_6: "hari_6",
    hari_7: "hari_7",
    lebih_7: "lebih_7",
    tidak_yakin: "tidak_yakin",
  },

  activityLocation: {
    dalam_ruangan: "dalam_ruangan",
    luar_ruangan: "luar_ruangan",
    perjalanan: "perjalanan",
    berpindah_pindah: "berpindah_pindah",
  },

  outdoor: {
    tidak: "tidak",
    kurang_30: "kurang_30",
    "30_60": "30_60",
    "1_2_jam": "1_2_jam",
    lebih_2_jam: "lebih_2_jam",
    tidak_yakin: "tidak_yakin",
  },

  toiletAccess: {
    mudah: "mudah",
    cukup: "cukup",
    sulit: "sulit",
    tidak_ingin_menjawab: "tidak_ingin_menjawab",
  },
};

const ITEM_OPTION_MAP = {
  "HT-02": [
    "lelah",
    "pusing",
    "sakit_kepala",
    "mual",
    "kram_otot",
    "merasa_kepanasan",
    "batuk_tenggorokan_gatal",
    "mata_perih",
    "lainnya",
    "tidak_ada_yang_ingin_dicatat",
  ],

  "HK-01": [
    "sulit_istirahat",
    "sulit_tempat_sejuk",
    "sulit_air_minum",
    "aktivitas_berat",
    "lainnya",
    "tidak_ada",
  ],

  "HS-04": [
    "lingkungan_panas",
    "bayi_menyusu_lebih_sering",
    "sulit_istirahat",
    "sulit_tempat_nyaman",
    "akses_air_terbatas",
    "lainnya",
    "tidak_ada",
  ],
};

function getAnswer(answers, code) {
  return answers?.[code] ?? null;
}

function mapValue(type, value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const allowedValues = VALUE_MAP[type];

  if (!allowedValues || !Object.hasOwn(allowedValues, value)) {
    throw new Error(`Nilai jawaban tidak valid untuk ${type}: ${value}`);
  }

  return allowedValues[value];
}

function mapScale(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number < 0 || number > 4) {
    throw new Error(`Nilai skala tidak valid: ${value}`);
  }

  return number;
}

function cleanText(value, maxLength = 200) {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();

  return cleaned ? cleaned.slice(0, maxLength) : null;
}

function mapItems(questionCode, selectedOptions, scores = {}) {
  if (!Array.isArray(selectedOptions)) {
    return [];
  }

  const allowedOptions = ITEM_OPTION_MAP[questionCode];

  if (!allowedOptions) {
    throw new Error(`Kode pertanyaan tidak dikenal: ${questionCode}`);
  }

  const invalidOptions = selectedOptions.filter(
    (option) => !allowedOptions.includes(option),
  );

  if (invalidOptions.length > 0) {
    throw new Error(
      `Pilihan tidak valid pada ${questionCode}: ${invalidOptions.join(", ")}`,
    );
  }

  const noneOptions = selectedOptions.filter(
    (option) =>
      option === "tidak_ada" ||
      option === "tidak_ada_yang_ingin_dicatat",
  );

  if (noneOptions.length > 0 && selectedOptions.length > 1) {
    throw new Error(
      `Pilihan Tidak ada harus eksklusif pada ${questionCode}.`,
    );
  }

  return selectedOptions.map((option) => {
    const isNone =
      option === "tidak_ada" ||
      option === "tidak_ada_yang_ingin_dicatat";

    return {
      question_code: questionCode,
      option_code: option,
      disruption_level:
        isNone || questionCode === "HS-04"
          ? null
          : mapScale(scores?.[option]),
    };
  });
}

function mapContext(condition) {
  return CONDITION_MAP[condition] ?? null;
}

function hasOption(answers, questionCode, option) {
  const selected = getAnswer(answers, questionCode);

  return Array.isArray(selected) && selected.includes(option);
}

export function mapHealthTrackerToPayload({
  condition,
  answers = {},
  scores = {},
  story = "",
  snapshot = null,
}) {
  const context = mapContext(condition);

  if (!context) {
    throw new Error("Kondisi Health Tracker tidak valid.");
  }

  const record = {
    context,

    // Pertanyaan umum
    ht01_comfort: mapValue(
      "comfort",
      getAnswer(answers, "HT-01"),
    ),

    ht02_other_text: hasOption(answers, "HT-02", "lainnya")
      ? cleanText(getAnswer(answers, "HT-02_OTHER"))
      : null,

    ht04_activity_location: mapValue(
      "activityLocation",
      getAnswer(answers, "HT-04"),
    ),

    ht05_outdoor: mapValue(
      "outdoor",
      getAnswer(answers, "HT-05"),
    ),

    // Menstruasi
    hm01_menstruating: null,
    hm02_day: null,
    hm03_flow: null,
    hm04_pain: null,
    hm05_pain_disruption: null,
    hm06_toilet_access: null,

    // Kehamilan
    hk01_other_text: null,

    // Menyusui
    hs01_breastfeeding: null,
    hs02_discomfort: null,
    hs03_disruption: null,
    hs04_other_text: null,

    story:
      typeof story === "string" && story.trim()
        ? story.trim()
        : null,
  };

  const items = [];

  // HT-02 dan HT-03
  items.push(
    ...mapItems(
      "HT-02",
      getAnswer(answers, "HT-02"),
      scores,
    ),
  );

  // Cabang menstruasi
  if (context === "menstruasi") {
    // Dipertahankan untuk kompatibilitas data lama.
    // Assessment baru tidak lagi menggunakan HM-01.
    record.hm01_menstruating = mapValue(
      "yesNo",
      getAnswer(answers, "HM-01"),
    );

    // HM-02 dan HM-03 sekarang tidak bergantung pada HM-01.
    record.hm02_day = mapValue(
      "day",
      getAnswer(answers, "HM-02"),
    );

    record.hm03_flow = mapValue(
      "flow",
      getAnswer(answers, "HM-03"),
    );

    record.hm04_pain = mapValue(
      "yesNo",
      getAnswer(answers, "HM-04"),
    );

    if (record.hm04_pain === "ya") {
      record.hm05_pain_disruption = mapScale(
        getAnswer(answers, "HM-05"),
      );
    }

    record.hm06_toilet_access = mapValue(
      "toiletAccess",
      getAnswer(answers, "HM-06"),
    );
  }

  // Cabang kehamilan
  if (context === "kehamilan") {
    items.push(
      ...mapItems(
        "HK-01",
        getAnswer(answers, "HK-01"),
        scores,
      ),
    );

    record.hk01_other_text = hasOption(
      answers,
      "HK-01",
      "lainnya",
    )
      ? cleanText(getAnswer(answers, "HK-01_OTHER"))
      : null;
  }

  // Cabang menyusui
  if (context === "menyusui") {
    record.hs01_breastfeeding = mapValue(
      "yesNo",
      getAnswer(answers, "HS-01"),
    );

    if (record.hs01_breastfeeding === "ya") {
      record.hs02_discomfort = mapValue(
        "yesNo",
        getAnswer(answers, "HS-02"),
      );

      if (record.hs02_discomfort === "ya") {
        record.hs03_disruption = mapScale(
          getAnswer(answers, "HS-03"),
        );
      }
    }

    items.push(
      ...mapItems(
        "HS-04",
        getAnswer(answers, "HS-04"),
        scores,
      ),
    );

    record.hs04_other_text = hasOption(
      answers,
      "HS-04",
      "lainnya",
    )
      ? cleanText(getAnswer(answers, "HS-04_OTHER"))
      : null;
  }

  return {
    record,
    items,
    snapshot,
  };
}

function formatGeneratedSummary(summary) {
  if (!summary || typeof summary !== "object") {
    return null;
  }

  const sections = Array.isArray(summary.sections)
    ? summary.sections
        .map((section) => ({
          title:
            typeof section.title === "string"
              ? section.title.trim()
              : "",
          content: Array.isArray(section.content)
            ? section.content
                .filter(
                  (item) =>
                    typeof item === "string" && item.trim()
                )
                .map((item) => item.trim())
            : [],
        }))
        .filter(
          (section) =>
            section.title && section.content.length > 0
        )
    : [];

  const formattedSummary = {
    title:
      typeof summary.title === "string"
        ? summary.title.trim()
        : "Gambaran Check-In Kamu",
    intro:
      typeof summary.intro === "string"
        ? summary.intro.trim()
        : "",
    sections,
    disclaimer:
      typeof summary.disclaimer === "string"
        ? summary.disclaimer.trim()
        : "",
  };

  return JSON.stringify(formattedSummary);
}

export function mapHealthTrackerToTable({
  condition,
  answers = {},
  scores = {},
  story = "",
  snapshot = null,
  aiNotice ={},
  generatedSummary = null,
}) {

  const context = mapContext(condition);

  if (!context) {
    throw new Error("Kondisi Health Tracker tidak valid.");
  }

  const health_tracker = {
    context,
    story: typeof story === "string" && story.trim() ? story.trim() : null,
    // Hanya refleksi yang berhasil disimpan; pesan gagal tidak ikut ke riwayat/PDF.
    refleksi_ai:
      aiNotice?.status === "answer" && aiNotice?.answer ? aiNotice.answer : null,
    ringkasan_checkin: formatGeneratedSummary(generatedSummary),
  };
  
  const answer_tracker = [];

  for (const code_question in answers) {
    const answer_value = answers[code_question];

    if (Array.isArray(answer_value)) {
      // pecah: satu entri per jawaban
      for (const item of answer_value) {
        answer_tracker.push({
          code_question,
          answer_value: item,
          scale: scores[item] ?? null,   // angka dari { lelah: 4, sakit_kepala: 3, kram_otot: 1 }
        });
      }
    } else if (typeof answer_value === 'number') {
      // angka: masuk ke scale, value dikosongkan
      answer_tracker.push({
        code_question,
        answer_value: null,
        scale: answer_value,
      });

    } else {
      // string biasa
      answer_tracker.push({
        code_question,
        answer_value,
        scale: null,
      });
    }
  }

  const hasSnapshot =
  snapshot != null &&
  typeof snapshot === "object" &&
  Object.keys(snapshot).length > 0;

const environment = hasSnapshot
  ? {
      location_label: snapshot.location_label ?? null,
      location_code: snapshot.location_code ?? null,
      lat: snapshot.lat ?? null,
      lon: snapshot.lon ?? null,
      indicators: snapshot.indicators ?? null,
    }
  : null;

  return {
    health_tracker,
    answer_tracker,
    environment,
  };
}