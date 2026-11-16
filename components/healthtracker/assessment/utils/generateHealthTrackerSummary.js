import { getHealthTrackerQuestion } from "@/data/healthTrackerQuestions";
import { getSummaryQuestionData } from "./healthTrackerSummary";

const CONDITION_LABELS = {
  menstruasi: "menstruasi",
  kehamilan: "kehamilan",
  menyusui: "menyusui",
  lewati: "kondisi umum",
};

const EXCLUSIVE_OPTIONS = [
  "tidak_ada",
  "tidak_ada_yang_ingin_dicatat",
];

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function formatList(items = []) {
  const validItems = items.map(cleanText).filter(Boolean);

  if (validItems.length === 0) return "";
  if (validItems.length === 1) return validItems[0];

  if (validItems.length === 2) {
    return `${validItems[0]} dan ${validItems[1]}`;
  }

  return `${validItems.slice(0, -1).join(", ")}, dan ${
    validItems[validItems.length - 1]
  }`;
}

function getAnswer(code, answers, scores, condition) {
  const question = getHealthTrackerQuestion(code);

  if (!question) return null;

  const data = getSummaryQuestionData(
    question,
    answers,
    scores,
    condition
  );

  if (!data?.isAnswered) return null;

  return {
    value: data.answerLabel || "",
    rawValue: data.value,
    other: data.hasOther ? cleanText(data.otherText) : "",
    scoredOptions: data.scoredOptions || [],
  };
}

function isExclusiveAnswer(answer) {
  if (!answer) return false;

  const values = Array.isArray(answer.rawValue)
    ? answer.rawValue
    : [];

  return values.some((value) =>
    EXCLUSIVE_OPTIONS.includes(value)
  );
}

// Membaca skor hanya jika pengguna benar-benar mengisinya.
function getValidScoredOptions(options = []) {
  return options
    .filter((item) => {
      if (!item?.label || !item.scoreAnswered) return false;

      const score = Number(item.score);

      return Number.isInteger(score) && score >= 0 && score <= 4;
    })
    .map((item) => ({
      label: cleanText(item.label),
      score: Number(item.score),
      scoreLabel: cleanText(item.scoreLabel),
    }));
}

// Membuat narasi tingkat gangguan untuk gejala atau situasi.
function buildImpactNarrative(
  options = [],
  {
    subject = "kondisi",
    activityWord = "mengganggu",
  } = {}
) {
  const scored = getValidScoredOptions(options);

  if (!scored.length) return "";

  const highestScore = Math.max(
    ...scored.map((item) => item.score)
  );

  const highestItems = scored.filter(
    (item) => item.score === highestScore
  );

  const otherItems = scored.filter(
    (item) => item.score !== highestScore
  );

  const highestLabels = formatList(
    highestItems.map((item) => item.label.toLowerCase())
  );

  if (highestScore === 0) {
    return `${subject} yang kamu catat meliputi ${formatList(
      scored.map((item) => item.label.toLowerCase())
    )}. Seluruhnya tidak ${activityWord} aktivitasmu.`;
  }

  if (otherItems.length === 0) {
    return `${subject} yang kamu catat meliputi ${formatList(
      scored.map((item) => item.label.toLowerCase())
    )}. Seluruhnya ${highestItems[0].scoreLabel.toLowerCase()} ${activityWord} aktivitasmu.`;
  }

  const otherDescriptions = otherItems.map(
    (item) =>
      `${item.label.toLowerCase()} (${item.scoreLabel.toLowerCase()})`
  );

  return `${highestLabels} menjadi ${subject} yang paling ${activityWord} aktivitasmu, dengan tingkat ${highestItems[0].scoreLabel.toLowerCase()}. ${formatList(
    otherDescriptions
  )} juga kamu catat dengan tingkat gangguan yang berbeda.`;
}

// ==========================================
// 1. KONDISI TUBUH
// ==========================================

function buildBodyNarrative(answers, scores, condition) {
  const paragraphs = [];

  const comfort = getAnswer(
    "HT-01",
    answers,
    scores,
    condition
  );

  if (comfort?.value) {
    if (comfort.rawValue === "tidak_ingin_menjawab") {
      paragraphs.push(
        "Kamu memilih untuk tidak menjawab pertanyaan mengenai kenyamanan tubuh hari ini."
      );
    } else {
      paragraphs.push(
        `Hari ini kamu merasa ${comfort.value.toLowerCase()}.`
      );
    }
  }

  const symptoms = getAnswer(
    "HT-02",
    answers,
    scores,
    condition
  );

  if (!symptoms) return paragraphs;

  if (isExclusiveAnswer(symptoms)) {
    paragraphs.push(
      "Hari ini kamu tidak mencatat gejala yang ingin dimasukkan dalam check-in."
    );

    return paragraphs;
  }

  const scored = getValidScoredOptions(
    symptoms.scoredOptions
  );

  if (scored.length > 0) {
    const highestScore = Math.max(
      ...scored.map((item) => Number(item.score))
    );

    const mainSymptoms = scored.filter(
      (item) => Number(item.score) === highestScore
    );

    const otherSymptoms = scored.filter(
      (item) => Number(item.score) < highestScore
    );

    const mainLabels = mainSymptoms.map(
      (item) => item.label.toLowerCase()
    );

    const mainScoreLabel =
      mainSymptoms[0]?.scoreLabel?.toLowerCase() ?? "";

    paragraphs.push(
      `${mainSymptoms.length > 1 ? "Keluhan yang paling mengganggu" : "Keluhan yang paling mengganggu aktivitasmu"} adalah ${formatList(mainLabels)}, dengan tingkat gangguan ${mainScoreLabel}.`
    );

    if (otherSymptoms.length > 0) {
      const otherLabels = otherSymptoms.map(
        (item) =>
          `${item.label.toLowerCase()} (${item.scoreLabel.toLowerCase()})`
      );

      paragraphs.push(
        `Selain itu, kamu juga mencatat keluhan lain, yaitu ${formatList(otherLabels)}.`
      );
    }
  } else if (symptoms.value) {
    paragraphs.push(
      `Hari ini kamu mencatat ${symptoms.value.toLowerCase()} sebagai hal yang dirasakan.`
    );
  }

  const unscored = symptoms.scoredOptions.filter(
    (item) => !item.scoreAnswered
  );

  if (unscored.length > 0 && scored.length > 0) {
    paragraphs.push(
      `Tingkat gangguan untuk ${formatList(
        unscored.map((item) => item.label.toLowerCase())
      )} belum dicatat.`
    );
  }

  if (symptoms.other) {
    paragraphs.push(
      `Kamu juga menambahkan catatan keluhan lainnya: ${symptoms.other}.`
    );
  }

  return paragraphs;
}

// ==========================================
// 2. AKTIVITAS HARIAN
// ==========================================

function buildActivityNarrative(answers, scores, condition) {
  const paragraphs = [];

  const activity = getAnswer(
    "HT-04",
    answers,
    scores,
    condition
  );

  const activityDescriptions = {
    dalam_ruangan: "lebih banyak beraktivitas di dalam ruangan",
    luar_ruangan: "lebih banyak beraktivitas di luar ruangan",
    perjalanan: "lebih banyak beraktivitas dalam perjalanan",
    berpindah_pindah: "beraktivitas dengan berpindah-pindah tempat",
  };

  if (activity?.rawValue) {
    const description =
      activityDescriptions[activity.rawValue];

    if (description) {
      paragraphs.push(`Hari ini kamu ${description}.`);
    }
  }

  const duration = getAnswer(
    "HT-05",
    answers,
    scores,
    condition
  );

  if (duration?.rawValue) {
    const durationDescriptions = {
      tidak: "tidak berada di luar ruangan",
      kurang_30: "kurang dari 30 menit",
      "30_60": "30–60 menit",
      "1_2_jam": "1–2 jam",
      lebih_2_jam: "lebih dari 2 jam",
      tidak_yakin: "belum yakin mengenai durasinya",
    };

    const description =
      durationDescriptions[duration.rawValue];

    if (description) {
      if (duration.rawValue === "tidak") {
        paragraphs.push(
          "Kamu mencatat tidak berada di luar ruangan hari ini."
        );
      } else if (duration.rawValue === "tidak_yakin") {
        paragraphs.push(
          "Kamu belum yakin berapa lama berada di luar ruangan hari ini."
        );
      } else {
        paragraphs.push(
          `Total waktu yang kamu catat untuk berada di luar ruangan sekitar ${description}.`
        );
      }
    }
  }

  return paragraphs;
}

// ==========================================
// 3. KONTEKS MENSTRUASI
// ==========================================

function buildMenstruationNarrative(
  answers,
  scores,
  condition
) {
  const paragraphs = [];

  const day = getAnswer(
    "HM-02",
    answers,
    scores,
    condition
  );

  const flow = getAnswer(
    "HM-03",
    answers,
    scores,
    condition
  );

  const discomfort = getAnswer(
    "HM-04",
    answers,
    scores,
    condition
  );

  const pain = getAnswer(
    "HM-05",
    answers,
    scores,
    condition
  );

  const toilet = getAnswer(
    "HM-06",
    answers,
    scores,
    condition
  );

  const details = [];

  if (day?.rawValue) {
    const dayMatch = day.rawValue.match(/^hari_(\d+)$/);

    if (dayMatch) {
      details.push(`berada pada hari ke-${dayMatch[1]} menstruasi`);
    } else if (day.rawValue === "tidak_yakin") {
      details.push("belum yakin hari keberapa menstruasimu saat ini");
    }
  }

  if (
    flow?.rawValue &&
    flow.rawValue !== "tidak_ingin_menjawab"
  ) {
    details.push(
      `jumlah darah menstruasi yang kamu catat tergolong ${flow.value.toLowerCase()}`
    );
  }

  if (details.length > 0) {
    paragraphs.push(`Saat ini kamu ${details.join(" dan ")}.`);
  }

  if (discomfort?.rawValue === "ya") {
    if (pain?.value) {
      paragraphs.push(
        `Kamu juga melaporkan nyeri atau ketidaknyamanan terkait menstruasi yang ${pain.value.toLowerCase()} aktivitasmu.`
      );
    } else {
      paragraphs.push(
        "Kamu juga melaporkan nyeri atau ketidaknyamanan terkait menstruasi."
      );
    }
  } else if (discomfort?.rawValue === "tidak") {
    paragraphs.push(
      "Kamu tidak mencatat nyeri atau ketidaknyamanan terkait menstruasi pada check-in ini."
    );
  }

  if (toilet?.rawValue) {
    const toiletDescriptions = {
      mudah: "mudah",
      cukup: "cukup mudah",
      sulit: "sulit",
      tidak_ingin_menjawab: "tidak ingin menjawab",
    };

    const description =
      toiletDescriptions[toilet.rawValue];

    if (description === "tidak ingin menjawab") {
      paragraphs.push(
        "Kamu memilih untuk tidak menjawab pertanyaan mengenai akses toilet atau tempat mengganti pembalut."
      );
    } else if (description) {
      paragraphs.push(
        `Aksesmu terhadap toilet atau tempat mengganti pembalut hari ini tergolong ${description}.`
      );
    }
  }

  return paragraphs;
}

// ==========================================
// 4. KONTEKS KEHAMILAN
// ==========================================

function buildPregnancyNarrative(
  answers,
  scores,
  condition
) {
  const paragraphs = [];

  const circumstances = getAnswer(
    "HK-01",
    answers,
    scores,
    condition
  );

  if (!circumstances) return paragraphs;

  if (isExclusiveAnswer(circumstances)) {
    paragraphs.push(
      "Kamu tidak mencatat situasi khusus yang dialami selama beraktivitas hari ini."
    );

    return paragraphs;
  }

  const scored = getValidScoredOptions(
    circumstances.scoredOptions
  );

  if (scored.length > 0) {
    paragraphs.push(
      buildImpactNarrative(circumstances.scoredOptions, {
        subject: "situasi",
        activityWord: "memengaruhi",
      })
    );
  } else if (circumstances.value) {
    paragraphs.push(
      `Selama beraktivitas hari ini, kamu mencatat beberapa situasi, yaitu ${circumstances.value.toLowerCase()}.`
    );
  }

  const unscored = circumstances.scoredOptions.filter(
    (item) => !item.scoreAnswered
  );

  if (unscored.length > 0 && scored.length > 0) {
    paragraphs.push(
      `Tingkat pengaruh ${formatList(
        unscored.map((item) => item.label.toLowerCase())
      )} terhadap aktivitasmu belum dicatat.`
    );
  }

  if (circumstances.other) {
    paragraphs.push(
      `Kamu juga memberikan catatan tambahan: ${circumstances.other}.`
    );
  }

  return paragraphs;
}

// ==========================================
// 5. KONTEKS MENYUSUI
// ==========================================

function buildBreastfeedingNarrative(
  answers,
  scores,
  condition
) {
  const paragraphs = [];

  const breastfeeding = getAnswer(
    "HS-01",
    answers,
    scores,
    condition
  );

  if (breastfeeding?.rawValue === "ya") {
    paragraphs.push(
      "Hari ini kamu menyusui atau memompa ASI."
    );
  } else if (breastfeeding?.rawValue === "tidak") {
    paragraphs.push(
      "Hari ini kamu tidak menyusui atau memompa ASI."
    );
  }

  const discomfort = getAnswer(
    "HS-02",
    answers,
    scores,
    condition
  );

  if (discomfort?.rawValue === "ya") {
    const severity = getAnswer(
      "HS-03",
      answers,
      scores,
      condition
    );

    if (severity?.value) {
      paragraphs.push(
        `Kamu melaporkan ketidaknyamanan saat menyusui atau memompa ASI yang ${severity.value.toLowerCase()} aktivitasmu.`
      );
    } else {
      paragraphs.push(
        "Kamu melaporkan ketidaknyamanan saat menyusui atau memompa ASI."
      );
    }
  } else if (discomfort?.rawValue === "tidak") {
    paragraphs.push(
      "Kamu tidak mencatat ketidaknyamanan saat menyusui atau memompa ASI."
    );
  }

  const circumstances = getAnswer(
    "HS-04",
    answers,
    scores,
    condition
  );

  if (circumstances) {
    if (isExclusiveAnswer(circumstances)) {
      paragraphs.push(
        "Kamu tidak mencatat kondisi khusus selama menyusui atau memompa ASI hari ini."
      );
    } else if (circumstances.value) {
      paragraphs.push(
        `Kondisi yang kamu alami selama menyusui atau memompa ASI meliputi ${circumstances.value.toLowerCase()}.`
      );
    }

    if (circumstances.other) {
      paragraphs.push(
        `Kamu juga memberikan catatan tambahan: ${circumstances.other}.`
      );
    }
  }

  return paragraphs;
}

// ==========================================
// 6. KONTEKS LINGKUNGAN
// ==========================================

function getEnvironmentalContext(snapshot) {
  const rawIndicators = snapshot?.indicators;

  const indicators = Array.isArray(rawIndicators)
    ? rawIndicators
    : Object.values(
        rawIndicators && typeof rawIndicators === "object"
          ? rawIndicators
          : {}
      );

  const validIndicators = indicators.filter(
    (item) =>
      item &&
      typeof item === "object" &&
      item.status === "ok" &&
      item.value !== null &&
      item.value !== undefined &&
      item.value !== ""
  );

  if (!validIndicators.length) return null;

  const values = validIndicators.map((item) => {
    const label = cleanText(item.label) || "Indikator lingkungan";
    const value = item.value;
    const unit = cleanText(item.unit);

    return `${label}: ${value}${unit ? ` ${unit}` : ""}`;
  });

  return `Selama check-in, data lingkungan yang tercatat meliputi ${formatList(values)}. Informasi ini merupakan konteks paparan lingkungan dan bukan diagnosis atau bukti penyebab keluhan tubuh.`;
}

// ==========================================
// 7. GENERATOR UTAMA
// ==========================================

function buildGeneralBranchNarrative(
  condition,
  answers,
  scores
) {
  if (condition === "menstruasi") {
    return buildMenstruationNarrative(
      answers,
      scores,
      condition
    );
  }

  if (condition === "kehamilan") {
    return buildPregnancyNarrative(
      answers,
      scores,
      condition
    );
  }

  if (condition === "menyusui") {
    return buildBreastfeedingNarrative(
      answers,
      scores,
      condition
    );
  }

  return [];
}

export function generateHealthTrackerSummary({
  condition,
  answers = {},
  scores = {},
  story = "",
  snapshot = null,
}) {
  const conditionLabel =
    CONDITION_LABELS[condition] || "kondisi umum";

  const intro = `Check-in ini menggambarkan kondisi tubuh dan aktivitasmu dalam konteks ${conditionLabel}.`;

  const sections = [];

  // 1. Konteks tubuh
  const bodyParagraphs = buildBodyNarrative(
    answers,
    scores,
    condition
  );

  if (bodyParagraphs.length > 0) {
    sections.push({
      title: "KONTEKS TUBUH",
      content: bodyParagraphs,
    });
  }

  // 2. Aktivitas harian
  const activityParagraphs = buildActivityNarrative(
    answers,
    scores,
    condition
  );

  if (activityParagraphs.length > 0) {
    sections.push({
      title: "AKTIVITAS HARIAN",
      content: activityParagraphs,
    });
  }

  // 3. Konteks sesuai kondisi reproduksi
  const branchParagraphs = buildGeneralBranchNarrative(
    condition,
    answers,
    scores
  );

  if (branchParagraphs.length > 0) {
    const branchTitles = {
      menstruasi: "KONTEKS MENSTRUASI",
      kehamilan: "KONTEKS KEHAMILAN",
      menyusui: "KONTEKS MENYUSUI",
    };

    sections.push({
      title: branchTitles[condition] || "KONTEKS KONDISI UMUM",
      content: branchParagraphs,
    });
  }

  // 4. Konteks lingkungan
  const environmentalContext =
    getEnvironmentalContext(snapshot);

  if (environmentalContext) {
    sections.push({
      title: "KONTEKS LINGKUNGAN",
      content: [environmentalContext],
    });
  }

  // 5. Catatan pribadi
  if (typeof story === "string" && story.trim()) {
    sections.push({
      title: "CATATAN PRIBADI",
      content: [
        "Kamu juga menambahkan catatan pribadi untuk melengkapi gambaran check-in ini.",
      ],
    });
  }

  // Jika belum ada jawaban tambahan
  if (sections.length === 0) {
    sections.push({
      title: "INFORMASI CHECK-IN",
      content: [
        "Belum ada jawaban tambahan yang dicatat. Ringkasan ini hanya menggambarkan informasi yang tersedia pada check-in.",
      ],
    });
  }

  return {
    title: "Ringkasan Check-In",
    intro,
    sections,
    disclaimer:
      "Ringkasan ini menggambarkan jawaban dan konteks yang kamu catat. Informasi ini bukan diagnosis medis dan tidak menggantikan konsultasi dengan tenaga kesehatan.",
  };
}