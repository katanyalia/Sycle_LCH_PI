// Tanya SYCLE tanpa AI (E-2): jawaban hanya dari konten & referensi yang ada; tidak menjawab hal pribadi/darurat.
import { answerQuestion, normalizeQuestion } from "@/lib/services/askService";
import { validateQuestion } from "@/lib/validations/askValidation";
import { getGlossary, getVisibleArticles, referencesFor } from "@/lib/content";
import { EVIDENCE_SOURCES } from "@/content/evidence/sources";

const ctx = { articles: getVisibleArticles(), glossary: getGlossary(), references: referencesFor };
const ask = (q) => answerQuestion(q, ctx);
const catalogUrls = new Set(EVIDENCE_SOURCES.filter((s) => !s.internal && !s.safetyDraft).map((s) => s.url));
const allContentText = JSON.stringify([ctx.articles, ctx.glossary]);

describe("Tanya SYCLE — jawaban (screen 60)", () => {
  test.each([
    ["Apa itu Heat Index?", "glossary", "heat-index"],
    ["Apa bedanya ISPU dan US AQI?", "glossary", "ispu"],
    ["Bagaimana menjaga tubuh saat cuaca panas?", "topic", "panas-dan-tubuh"],
    ["Apakah bayi yang mendapat ASI perlu air putih saat cuaca panas?", "topic", "menyusui-saat-cuaca-panas"],
    ["Kenapa nyeri haid bisa terjadi?", "topic", "menstruasi-suhu-tubuh-dan-cuaca-panas"],
    ["Perlu pakai tabir surya kalau indeks UV tinggi?", "topic", "indeks-uv-dan-perlindungan-matahari"],
    ["Masker apa yang bisa mengurangi paparan PM 2.5?", "topic", "kualitas-udara-dan-pm25"],
  ])("%s", (question, mode, expected) => {
    const r = ask(question);
    expect(r.status).toBe("answer");
    expect(r.mode).toBe(mode);
    if (mode === "glossary") expect(r.terms.map((t) => t.id)).toContain(expected);
    else expect(r.topic.slug).toBe(expected);
  });

  test("semua teks jawaban berasal dari konten yang ada; referensi hanya dari katalog (tanpa safety draft)", () => {
    for (const q of ["Apa itu PM2.5?", "Ibu hamil saat cuaca panas harus bagaimana?", "Apa itu fase luteal?"]) {
      const r = ask(q);
      expect(r.status).toBe("answer");
      for (const p of r.topic?.section?.paragraphs ?? []) expect(allContentText).toContain(JSON.stringify(p).slice(1, -1));
      for (const t of r.terms) expect(allContentText).toContain(JSON.stringify(t.definition).slice(1, -1));
      for (const ref of r.references) expect(catalogUrls.has(ref.url)).toBe(true);
      expect(JSON.stringify(r)).not.toMatch(/\bE\d{2}\b/);
    }
  });
});

describe("Tanya SYCLE — batasan (screen 61, E-4)", () => {
  test("tidak ada topik/istilah cocok → no_evidence tanpa jawaban", () => {
    const r = ask("Siapa presiden pertama Indonesia?");
    expect(r).toEqual({ status: "no_evidence", related: [] });
  });

  test.each(["Apakah saya hamil kalau telat haid?", "Obat apa untuk nyeri haid?", "Berapa dosis parasetamol?", "Lihat catatan saya di tracker"])(
    "pribadi/obat: %s → tidak dijawab",
    (q) => {
      const r = ask(q);
      expect(r.status).toBe("personal");
      expect(r).not.toHaveProperty("topic");
    }
  );

  test.each(["Teman saya pingsan saat panas", "Sesak napas karena asap", "Ibu hamil pendarahan"])("darurat: %s", (q) => {
    expect(ask(q).status).toBe("emergency");
  });

  test("normalisasi PM2.5 & tanda baca", () => {
    expect(normalizeQuestion("Apa itu PM 2,5?!")).toBe(" apa itu pm25 ");
  });

  test("validasi panjang pertanyaan", () => {
    expect(validateQuestion("  ").ok).toBe(false);
    expect(validateQuestion("a".repeat(301)).ok).toBe(false);
    expect(validateQuestion("  Apa   itu UV? ")).toEqual({ ok: true, question: "Apa itu UV?" });
  });
});

describe("Route Handler POST /api/tanya-sycle", () => {
  const { POST } = require("@/app/api/tanya-sycle/route");
  const call = (body) =>
    POST(new Request("http://localhost/api/tanya-sycle", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));

  test("pertanyaan kosong / bukan JSON → 400", async () => {
    expect((await call({ question: "" })).status).toBe(400);
    expect((await call("bukan json")).status).toBe(400);
  });

  test("pertanyaan valid → 200, tanpa cache", async () => {
    const res = await call({ question: "Apa itu ISPU?" });
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect((await res.json()).status).toBe("answer");
  });

  test("tidak menyentuh Supabase / data Health Tracker", () => {
    const fs = require("node:fs");
    for (const file of ["app/api/tanya-sycle/route.js", "lib/services/askService.js"]) {
      const imports = fs.readFileSync(file, "utf8").match(/^import .*$/gm).join("\n");
      expect(imports).not.toMatch(/supabase|tracker|auth/i);
    }
  });
});
