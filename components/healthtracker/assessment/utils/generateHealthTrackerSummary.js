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

// ==========================================
// NARASI RINGKASAN
// Ringkasan ditulis sebagai satu paragraf yang mengalir: kalimat dihubungkan
// dengan kata sambung, tanpa menambah makna dan tanpa menghubungkan keluhan
// dengan kondisi lingkungan sebagai sebab-akibat.
// ==========================================

const ORDINALS = [
  "", "pertama", "kedua", "ketiga", "keempat", "kelima", "keenam", "ketujuh",
  "kedelapan", "kesembilan", "kesepuluh", "kesebelas", "kedua belas",
  "ketiga belas", "keempat belas",
];

const SKIP = "tidak_ingin_menjawab";

function lower(text) {
  return cleanText(text).toLowerCase();
}

function capitalize(text) {
  const value = cleanText(text);
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

function sentence(text) {
  const value = capitalize(text);
  if (!value) return "";
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return number.toLocaleString("id-ID", { maximumFractionDigits: 1 });
}

// ---------- Pembuka: kondisi + hari menstruasi + rasa nyaman ----------
function buildOpening(condition, answers, scores) {
  const comfort = getAnswer("HT-01", answers, scores, condition);
  const comfortText =
    comfort?.value && comfort.rawValue !== SKIP
      ? `merasa ${lower(comfort.value)}`
      : "";

  let base = "";

  if (condition === "menstruasi") {
    const day = getAnswer("HM-02", answers, scores, condition);
    const match = day?.rawValue?.match?.(/^hari_(\d+)$/);
    const number = match ? Number(match[1]) : null;

    if (number && ORDINALS[number]) {
      base = `hari ini kamu sedang menstruasi pada hari ${ORDINALS[number]}`;
    } else if (number) {
      base = `hari ini kamu sedang menstruasi pada hari ke-${number}`;
    } else if (day?.rawValue === "tidak_yakin") {
      base = "hari ini kamu sedang menstruasi, meski belum yakin hari keberapa";
    } else {
      base = "hari ini kamu sedang menstruasi";
    }
  } else if (condition === "kehamilan") {
    base = "hari ini kamu sedang hamil";
  } else if (condition === "menyusui") {
    const feeding = getAnswer("HS-01", answers, scores, condition);
    if (feeding?.rawValue === "ya") {
      base = "hari ini kamu menyusui atau memompa ASI";
    } else if (feeding?.rawValue === "tidak") {
      base = "hari ini kamu tidak menyusui atau memompa ASI";
    } else {
      base = "hari ini kamu sedang dalam masa menyusui";
    }
  } else if (comfortText) {
    return sentence(`hari ini kamu ${comfortText}`);
  } else {
    return "";
  }

  return sentence(comfortText ? `${base} dan ${comfortText}` : base);
}

// ---------- Keluhan (HT-02 + skala HT-03) ----------
function describeGroup(items) {
  return formatList(items.map((item) => lower(item.label)));
}

// "kram otot dan mual sedikit mengganggu, serta pusing tidak mengganggu":
// item dengan tingkat gangguan yang sama digabung agar tidak berulang.
function describeByLevel(items) {
  const groups = [];
  [...items]
    .sort((a, b) => b.score - a.score)
    .forEach((item) => {
      const group = groups.find((g) => g.score === item.score);
      if (group) group.items.push(item);
      else groups.push({ score: item.score, label: item.scoreLabel, items: [item] });
    });

  const parts = groups.map(
    (group) => `${describeGroup(group.items)} ${lower(group.label)}`
  );
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")}, serta ${parts[parts.length - 1]}`;
}

function buildSymptoms(condition, answers, scores) {
  const symptoms = getAnswer("HT-02", answers, scores, condition);
  if (!symptoms) return "";

  if (isExclusiveAnswer(symptoms)) {
    return "Kamu tidak mencatat keluhan tubuh pada check-in ini.";
  }

  const scored = getValidScoredOptions(symptoms.scoredOptions);
  const unscored = (symptoms.scoredOptions || [])
    .filter((item) => item?.label && !item.scoreAnswered)
    .map((item) => ({ label: cleanText(item.label) }));

  const parts = [];

  if (scored.length > 0) {
    const highest = Math.max(...scored.map((item) => item.score));
    const main = scored.filter((item) => item.score === highest);
    const rest = scored.filter((item) => item.score < highest);
    const mainLabel = lower(main[0].scoreLabel);

    if (highest === 0) {
      parts.push(
        `kamu merasakan ${describeGroup(scored)}, tetapi ${
          scored.length > 1 ? "semuanya" : "keluhan ini"
        } tidak mengganggu aktivitasmu`
      );
    } else {
      // "Paling terasa" hanya dipakai jika keluhan teratas memang menonjol
      // (minimal cukup mengganggu dan tidak lebih dari dua keluhan).
      const standsOut = highest >= 2 && main.length <= 2;
      const both = main.length > 1 ? "sama-sama " : "";
      let text = standsOut
        ? `${describeGroup(main)} menjadi keluhan yang paling terasa dan ${both}${mainLabel} aktivitas`
        : `${describeGroup(main)} ${mainLabel} aktivitas`;

      if (rest.length > 0) {
        const sameLevel = rest.every((item) => item.score === rest[0].score);
        const restVerb = rest.length > 1 ? "" : "rasa ";
        if (sameLevel) {
          const level = lower(rest[0].scoreLabel);
          const only = rest[0].score > 0 ? "hanya " : "";
          text += `, sementara ${restVerb}${describeGroup(rest)} ${only}${level}`;
        } else {
          text += `, sementara ${describeByLevel(rest)}`;
        }
      }

      parts.push(text);
    }
  } else if (symptoms.value) {
    parts.push(`kamu merasakan ${lower(symptoms.value)}`);
  }

  let result = parts.map(sentence).join(" ");

  if (unscored.length > 0 && scored.length > 0) {
    result += ` ${sentence(`kamu juga merasakan ${describeGroup(unscored)}`)}`;
  }

  if (symptoms.other) {
    result += ` ${sentence(`kamu juga menambahkan keluhan lain: ${symptoms.other.replace(/[.!?]+$/, "")}`)}`;
  }

  return result.trim();
}

// ---------- Aktivitas (HT-04) + lama di luar ruangan (HT-05) ----------
function buildActivity(condition, answers, scores) {
  const activity = getAnswer("HT-04", answers, scores, condition)?.rawValue;
  const duration = getAnswer("HT-05", answers, scores, condition)?.rawValue;

  const where = {
    dalam_ruangan: "lebih banyak beraktivitas di dalam ruangan",
    luar_ruangan: "lebih banyak beraktivitas di luar ruangan",
    perjalanan: "lebih banyak berada di perjalanan",
    berpindah_pindah: "banyak berpindah-pindah tempat",
  }[activity];

  const howLong = {
    kurang_30: "kurang dari 30 menit",
    "30_60": "sekitar 30–60 menit",
    "1_2_jam": "sekitar 1–2 jam",
    lebih_2_jam: "lebih dari 2 jam",
  }[duration];

  if (!where && !duration) return "";

  if (!where) {
    if (duration === "tidak") return "Kamu tidak berada di luar ruangan hari ini.";
    if (duration === "tidak_yakin") return "Kamu belum yakin berapa lama berada di luar ruangan hari ini.";
    return howLong ? `Kamu menghabiskan ${howLong} di luar ruangan.` : "";
  }

  if (duration === "tidak") {
    return sentence(`kamu ${where} dan tidak berada di luar ruangan`);
  }
  if (duration === "tidak_yakin") {
    return sentence(`kamu ${where}, meski belum yakin berapa lama berada di luar ruangan`);
  }
  if (howLong) {
    if (activity === "luar_ruangan") {
      return sentence(`kamu ${where}, ${howLong}`);
    }
    return sentence(`kamu ${where} dan menghabiskan ${howLong} di luar ruangan`);
  }
  return sentence(`kamu ${where}`);
}

// ---------- Menstruasi (HM-03, HM-04, HM-05, HM-06) ----------
function buildMenstruation(answers, scores) {
  const condition = "menstruasi";
  const flow = getAnswer("HM-03", answers, scores, condition);
  const discomfort = getAnswer("HM-04", answers, scores, condition)?.rawValue;
  const pain = getAnswer("HM-05", answers, scores, condition);
  const toilet = getAnswer("HM-06", answers, scores, condition)?.rawValue;

  const clauses = [];

  if (flow?.value && flow.rawValue !== SKIP) {
    clauses.push(`darah menstruasi keluar dalam jumlah ${lower(flow.value)}`);
  }

  let hasPain = false;
  if (discomfort === "ya") {
    hasPain = true;
    const painText = pain?.value
      ? `nyeri haid yang ${lower(pain.value)}`
      : "nyeri atau ketidaknyamanan saat haid";
    clauses.push(clauses.length ? `disertai ${painText}` : `kamu merasakan ${painText}`);
  } else if (discomfort === "tidak") {
    clauses.push(clauses.length ? "tanpa nyeri haid" : "kamu tidak merasakan nyeri haid");
  }

  const toiletText = {
    mudah: "akses ke toilet dan tempat mengganti pembalut mudah",
    cukup: "akses ke toilet dan tempat mengganti pembalut cukup mudah",
    sulit: "akses ke toilet dan tempat mengganti pembalut sulit",
  }[toilet];

  let text = clauses.join(", ");

  if (toiletText) {
    if (!text) {
      text = toiletText;
    } else {
      const contrast = hasPain && toilet !== "sulit";
      text += contrast ? `, tetapi ${toiletText}` : `, dan ${toiletText}`;
    }
  }

  return text ? sentence(text) : "";
}

// ---------- Kehamilan (HK-01 + skala HK-02) ----------
function buildPregnancy(answers, scores) {
  const condition = "kehamilan";
  const situation = getAnswer("HK-01", answers, scores, condition);
  if (!situation) return "";

  if (isExclusiveAnswer(situation)) {
    return "Selama beraktivitas, kamu tidak mencatat situasi khusus.";
  }

  const scored = getValidScoredOptions(situation.scoredOptions);
  let text = "";

  if (scored.length > 0) {
    const highest = Math.max(...scored.map((item) => item.score));
    const main = scored.filter((item) => item.score === highest);
    const rest = scored.filter((item) => item.score < highest);

    if (highest === 0) {
      text = `selama beraktivitas kamu mengalami ${describeGroup(scored)}, tetapi tidak memengaruhi aktivitasmu`;
    } else {
      const standsOut = highest >= 2 && main.length <= 2;
      text = standsOut
        ? `selama beraktivitas, ${describeGroup(main)} menjadi situasi yang paling terasa dan ${lower(main[0].scoreLabel)} aktivitasmu`
        : `selama beraktivitas, ${describeGroup(main)} ${lower(main[0].scoreLabel)} aktivitasmu`;
      if (rest.length > 0) {
        const sameLevel = rest.every((item) => item.score === rest[0].score);
        text += sameLevel
          ? `, sementara ${describeGroup(rest)} ${rest[0].score > 0 ? "hanya " : ""}${lower(rest[0].scoreLabel)}`
          : `, sementara ${describeByLevel(rest)}`;
      }
    }
  } else if (situation.value) {
    text = `selama beraktivitas kamu mengalami ${lower(situation.value)}`;
  }

  let result = sentence(text);
  if (situation.other) {
    result += ` ${sentence(`kamu juga mencatat: ${situation.other.replace(/[.!?]+$/, "")}`)}`;
  }
  return result.trim();
}

// ---------- Menyusui (HS-02, HS-03, HS-04) ----------
const BREASTFEEDING_SITUATIONS = {
  lingkungan_panas: "lingkungan terasa panas",
  bayi_menyusu_lebih_sering: "bayi menyusu lebih sering dari biasanya",
  sulit_istirahat: "kamu sulit beristirahat",
  sulit_tempat_nyaman: "kamu sulit mendapat tempat yang nyaman",
  akses_air_terbatas: "akses air minum terbatas",
};

function buildBreastfeeding(answers, scores) {
  const condition = "menyusui";
  const discomfort = getAnswer("HS-02", answers, scores, condition)?.rawValue;
  const severity = getAnswer("HS-03", answers, scores, condition);
  const circumstances = getAnswer("HS-04", answers, scores, condition);

  const parts = [];

  if (discomfort === "ya") {
    parts.push(
      severity?.value
        ? `kamu merasakan ketidaknyamanan saat menyusui atau memompa ASI yang ${lower(severity.value)} aktivitasmu`
        : "kamu merasakan ketidaknyamanan saat menyusui atau memompa ASI"
    );
  } else if (discomfort === "tidak") {
    parts.push("menyusui atau memompa ASI berjalan tanpa rasa tidak nyaman");
  }

  if (circumstances && !isExclusiveAnswer(circumstances)) {
    const raw = Array.isArray(circumstances.rawValue)
      ? circumstances.rawValue
      : [circumstances.rawValue].filter(Boolean);
    const items = raw.map((value) => BREASTFEEDING_SITUATIONS[value]).filter(Boolean);
    if (items.length) parts.push(`selama menyusui atau memompa ASI, ${formatList(items)}`);
  }

  let result = parts.map(sentence).join(" ");
  if (circumstances?.other) {
    result += ` ${sentence(`kamu juga mencatat: ${circumstances.other.replace(/[.!?]+$/, "")}`)}`;
  }
  return result.trim();
}

// ---------- Lingkungan ----------
function heatIndexCategory(value) {
  if (value < 27) return "risiko rendah";
  if (value < 32) return "waspada";
  if (value < 40) return "sangat waspada";
  if (value < 52) return "bahaya";
  return "bahaya ekstrem";
}

function buildEnvironment(snapshot, hasComplaint) {
  const raw = snapshot?.indicators;
  const list = Array.isArray(raw) ? raw : Object.values(raw && typeof raw === "object" ? raw : {});
  const ok = (item) =>
    item && item.status !== "unavailable" && item.value !== null && item.value !== undefined && item.value !== "" &&
    Number.isFinite(Number(item.value));

  const find = (id) => list.find((item) => item?.id === id && ok(item));

  const temperature = find("temperature");
  const humidity = find("humidity");
  const heatIndex = find("heatIndex");
  const air = find("airQuality");
  const uv = find("uv");

  const sentences = [];

  const weather = [];
  if (temperature) weather.push(`suhu udara sekitar ${formatNumber(temperature.value)}°C`);
  if (humidity) weather.push(`${weather.length ? "dengan " : ""}kelembapan ${formatNumber(humidity.value)}%`);

  if (weather.length || heatIndex) {
    let text = `saat itu, ${weather.join(" ")}`.replace(/,\s*$/, "");
    if (heatIndex) {
      const feels = `suhu terasa seperti ${formatNumber(heatIndex.value)}°C dan masuk kategori ${heatIndexCategory(Number(heatIndex.value))}`;
      text = weather.length ? `${text}, sehingga ${feels}` : `saat itu, ${feels}`;
    }
    sentences.push(sentence(text));
  }

  const extra = [];
  if (air?.category?.label) extra.push(`kualitas udara tergolong ${lower(air.category.label)}`);
  if (uv?.category?.label) extra.push(`indeks UV ${lower(uv.category.label)}`);
  if (extra.length) {
    sentences.push(sentence(formatList(extra)));
  }

  if (!sentences.length) return "";

  sentences.push(
    hasComplaint
      ? "Kondisi lingkungan ini merupakan gambaran situasi saat kamu mencatat keluhan, bukan berarti menjadi penyebab dari gejala yang kamu alami."
      : "Kondisi lingkungan ini merupakan gambaran situasi saat kamu mencatat, bukan penilaian atas kondisi tubuhmu."
  );

  return sentences.join(" ");
}

// ==========================================
// GENERATOR UTAMA
// ==========================================

// Cerita pengguna disambung ke paragraf dan ditebalkan (**...**) agar
// terlihat bahwa kalimat itu berasal dari catatan pengguna sendiri.
function buildStory(story) {
  if (typeof story !== "string") return "";
  const text = story.replace(/\*/g, "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const quoted = /[.!?]$/.test(text) ? text : `${text}.`;
  return `Dalam catatanmu, kamu juga menuliskan: **"${quoted}"**`;
}

export function generateHealthTrackerSummary({
  condition,
  answers = {},
  scores = {},
  story = "",
  snapshot = null,
}) {
  const symptoms = getAnswer("HT-02", answers, scores, condition);
  const hasComplaint = Boolean(symptoms && !isExclusiveAnswer(symptoms));

  const branch =
    condition === "menstruasi"
      ? buildMenstruation(answers, scores)
      : condition === "kehamilan"
        ? buildPregnancy(answers, scores)
        : condition === "menyusui"
          ? buildBreastfeeding(answers, scores)
          : "";

  const symptomsText = buildSymptoms(condition, answers, scores);

  const paragraph = [
    buildOpening(condition, answers, scores),
    symptomsText,
    buildActivity(condition, answers, scores),
    branch,
    buildStory(story),
    buildEnvironment(snapshot, hasComplaint),
  ]
    .map(cleanText)
    .filter(Boolean)
    .join(" ");

  return {
    title: "Ringkasan Check-In",
    intro:
      paragraph ||
      "Belum ada jawaban tambahan yang dicatat. Ringkasan ini hanya menggambarkan informasi yang tersedia pada check-in.",
    // Ringkasan kini satu paragraf di `intro`; `sections` dibiarkan kosong agar
    // tampilan Ringkasan, Riwayat, dan data lama tetap kompatibel.
    sections: [],
    // Kalimat keluhan dan situasi khusus dipakai apa adanya oleh Refleksi AI,
    // sehingga tingkat gangguan tidak bisa berubah saat bahasanya dirapikan.
    facts: {
      keluhan: cleanText(symptomsText),
      situasi: cleanText(branch),
    },
    disclaimer:
      "Ringkasan ini menggambarkan jawaban dan konteks yang kamu catat. Informasi ini bukan diagnosis medis dan tidak menggantikan konsultasi dengan tenaga kesehatan.",
  };
}
