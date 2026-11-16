import {
  HEALTH_TRACKER_BASE_STEPS,
  HEALTH_TRACKER_BRANCH_STEPS,
  HEALTH_TRACKER_SCALE,
  getHealthTrackerQuestion,
  isHealthTrackerQuestionVisible,
} from "@/data/healthTrackerQuestions";

// Mengambil label dari opsi pertanyaan.
export function getLabel(option) {
  if (typeof option === "string") return option;

  return (
    option?.label ??
    option?.title ??
    option?.value ??
    option?.code ??
    ""
  );
}

// Mengambil value dari opsi pertanyaan.
export function getValue(option) {
  if (typeof option === "string") return option;

  return option?.value ?? option?.code ?? "";
}

// Mengubah kode pertanyaan menjadi objek pertanyaan.
function resolveQuestions(items = []) {
  return items
    .map((item) => {
      const code = typeof item === "string" ? item : item?.code;
      return code ? getHealthTrackerQuestion(code) : item;
    })
    .filter(Boolean);
}

// Mencari pertanyaan skala yang berhubungan dengan pertanyaan utama.
export function getInlineScaleQuestion(question, condition) {
  if (!question?.code) return null;

  const allSteps = [
    ...HEALTH_TRACKER_BASE_STEPS,
    ...(HEALTH_TRACKER_BRANCH_STEPS[condition] ?? []),
  ];

  return (
    resolveQuestions(allSteps).find(
      (item) =>
        item &&
        item.type === "per_option_scale" &&
        item.dependsOn === question.code
    ) ?? null
  );
}

// Membaca jawaban dan mengubahnya menjadi label.
export function getAnswerLabel(question, answers) {
  const value = answers[question.code];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        const option = question.options?.find(
          (candidate) => getValue(candidate) === item
        );

        return getLabel(option) || item;
      })
      .join(", ");
  }

  const option = question.options?.find(
    (candidate) => getValue(candidate) === value
  );

  return getLabel(option) || String(value ?? "");
}

// Menyusun daftar pertanyaan untuk ringkasan.
export function buildSummaryQuestions(condition, activityQuestion) {
  return [
    activityQuestion,
    ...resolveQuestions(HEALTH_TRACKER_BASE_STEPS).filter(
      (question) =>
        question.code !== "HT-04" &&
        question.type !== "per_option_scale"
    ),
    ...resolveQuestions(
      HEALTH_TRACKER_BRANCH_STEPS[condition] ?? []
    ).filter(
      (question) => question.type !== "per_option_scale"
    ),
  ].filter(Boolean);
}

// Mengambil pertanyaan umum yang perlu ditampilkan.
export function getGeneralQuestions(answers) {
  return resolveQuestions(HEALTH_TRACKER_BASE_STEPS).filter(
    (question) =>
      question.code !== "HT-04" &&
      question.type !== "per_option_scale" &&
      isHealthTrackerQuestionVisible(question, answers)
  );
}

// Mengambil pertanyaan lanjutan sesuai kondisi.
export function getConditionQuestions(condition, answers) {
  return resolveQuestions(
    HEALTH_TRACKER_BRANCH_STEPS[condition] ?? []
  ).filter(
    (question) =>
      question.type !== "per_option_scale" &&
      isHealthTrackerQuestionVisible(question, answers)
  );
}

// Memeriksa apakah jawaban sudah diisi.
export function isAnswered(value) {
  return Array.isArray(value)
    ? value.length > 0
    : value !== undefined && value !== null && value !== "";
}

// Mengambil label dari skala Health Tracker.
export function getScaleLabel(value) {
  const option = HEALTH_TRACKER_SCALE.find(
    (item) => String(getValue(item)) === String(value)
  );

  return option ? getLabel(option) : "Belum diisi";
}

// Mengolah seluruh informasi jawaban untuk ringkasan.
export function getSummaryQuestionData(
  question,
  answers = {},
  scores = {},
  condition
) {
  if (!question || !answers) return null;

  const value = answers[question.code];

  const answerLabel =
    question.type === "scale"
      ? getScaleLabel(value)
      : getAnswerLabel(question, answers);

  const otherTextKey = question.otherText?.key;

  const hasOther =
    Boolean(otherTextKey) &&
    Array.isArray(value) &&
    value.includes("lainnya");

  const scaleQuestion = getInlineScaleQuestion(
    question,
    condition
  );

  const scoredOptions =
    scaleQuestion && Array.isArray(value)
      ? value
          .filter(
            (optionCode) =>
              ![
                "lainnya",
                "tidak_ada",
                "tidak_ada_yang_ingin_dicatat",
              ].includes(optionCode)
          )
          .map((optionCode) => {
            const option = question.options?.find(
              (item) => getValue(item) === optionCode
            );

            const score = scores?.[optionCode];
            const scoreAnswered = isAnswered(score);

            return {
              code: optionCode,
              label: getLabel(option) || optionCode,
              score,
              scoreAnswered,
              scoreLabel: scoreAnswered
                ? getScaleLabel(score)
                : "Belum diisi",
            };
          })
      : [];

  return {
    value,
    isAnswered: isAnswered(value),
    answerLabel,
    otherTextKey,
    hasOther,
    otherText: otherTextKey
      ? answers[otherTextKey] || "Belum diisi"
      : "",
    scoredOptions,
  };
}