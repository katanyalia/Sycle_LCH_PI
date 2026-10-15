// Tanya SYCLE tanpa AI (E-2, wireframe screen 59–61). Mencocokkan kata kunci pertanyaan dengan topik Info & Edukasi
// dan glosarium, lalu MENYUSUN jawaban hanya dari konten yang sudah ada: ringkasan & bagian topik (draf berlabel),
// definisi istilah, dan referensi dari katalog. Tidak membuat kalimat, angka, atau sumber baru.
// Tidak membaca data Health Tracker dan tidak memerlukan login.
import {
  EMERGENCY_PATTERNS,
  GLOSSARY_KEYWORDS,
  PERSONAL_PATTERNS,
  TOPIC_KEYWORDS,
} from "@/content/questions/askIndex";

export function normalizeQuestion(text) {
  return ` ${String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/pm\s*2[.,]?\s*5/g, "pm25")
    .replace(/meta-analisis/g, "meta analisis")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

// Skor = jumlah kata dalam frasa yang cocok (frasa panjang lebih kuat dari kata tunggal).
function scoreKeywords(normalized, keywords) {
  let score = 0;
  for (const keyword of keywords) {
    if (normalized.includes(` ${keyword} `)) score += keyword.split(" ").length;
  }
  return score;
}

const textOfSection = (section) => normalizeQuestion(`${section.heading} ${section.paragraphs.join(" ")}`);

function pickSection(article, normalized) {
  const words = normalized.trim().split(" ").filter((w) => w.length > 3);
  let best = article.sections[0];
  let bestScore = -1;
  for (const section of article.sections) {
    const text = textOfSection(section);
    const score = words.filter((w) => text.includes(` ${w} `)).length;
    if (score > bestScore) {
      best = section;
      bestScore = score;
    }
  }
  return best;
}

const toTerm = ({ id, term, definition, note, draft }) => ({ id, term, definition, note: note ?? null, draft: Boolean(draft) });

// { status: "answer" | "no_evidence" | "personal" | "emergency", ... }
export function answerQuestion(question, { articles, glossary, references }) {
  const normalized = normalizeQuestion(question);

  // Topik kesehatan perempuan diberi bobot ganda: isinya sudah membahas panas/lingkungan dalam konteks tersebut,
  // sehingga pertanyaan "ASI saat cuaca panas" diarahkan ke topik menyusui, bukan topik panas umum.
  const topicScores = articles
    .map((article) => {
      const base = scoreKeywords(normalized, TOPIC_KEYWORDS[article.slug] ?? []);
      return { article, score: article.category === "kesehatan-perempuan" ? base * 2 : base };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  const glossaryIds = new Set(glossary.map((entry) => entry.id));
  const matchedTerms = Object.entries(GLOSSARY_KEYWORDS)
    .filter(([id, keywords]) => glossaryIds.has(id) && scoreKeywords(normalized, keywords) > 0)
    .map(([id]) => glossary.find((entry) => entry.id === id));

  const related = topicScores.slice(0, 2).map(({ article }) => ({ slug: article.slug, title: article.title }));

  if (EMERGENCY_PATTERNS.some((pattern) => pattern.test(normalized))) return { status: "emergency", related };
  if (PERSONAL_PATTERNS.some((pattern) => pattern.test(normalized))) return { status: "personal", related };
  if (topicScores.length === 0 && matchedTerms.length === 0) return { status: "no_evidence", related: [] };

  // Pertanyaan istilah ("apa itu ISPU") dijawab dengan definisi glosarium bila tidak ada topik yang lebih cocok.
  const top = topicScores[0]?.article ?? articles.find((a) => matchedTerms.some((t) => a.terms?.includes(t.id))) ?? null;
  const termOnly = matchedTerms.length > 0 && (topicScores.length === 0 || /\b(apa itu|arti|maksud|pengertian|bedanya|beda)\b/.test(normalized));

  const terms = [...matchedTerms, ...glossary.filter((entry) => top?.terms?.includes(entry.id))]
    .filter((entry, index, all) => all.findIndex((e) => e.id === entry.id) === index)
    .slice(0, 4)
    .map(toTerm);

  return {
    status: "answer",
    mode: termOnly ? "glossary" : "topic",
    topic: top
      ? {
          slug: top.slug,
          title: top.title,
          summary: top.summary,
          section: termOnly ? null : pickSection(top, normalized),
          limitations: top.limitations,
          author: top.author ?? null,
          status: top.status,
        }
      : null,
    terms,
    references: top ? references(top).slice(0, 4) : [],
    related: related.filter((entry) => entry.slug !== top?.slug),
  };
}
