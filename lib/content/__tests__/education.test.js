// Info & Edukasi (E-1 sampai E-4): topik draf, referensi terkurasi, glosarium.
import { ARTICLES } from "@/content/education/articles";
import { GLOSSARY } from "@/content/education/glossary";
import { EVIDENCE_SOURCES } from "@/content/evidence/sources";
import { REFERENCE_TOPICS, topicIdsOf } from "@/content/education/referenceTopics";
import { publicSources, resolveReadingList, resolveReferences, validateContentItem } from "@/lib/content/rules";
import { getReferenceCatalog, getVisibleArticles } from "@/lib/content";

const source = (id) => EVIDENCE_SOURCES.find((s) => s.id === id);

describe("Topik Info & Edukasi (draf demonstrasi E-1)", () => {
  test("ketujuh topik lolos gerbang konten dan tampil sebagai draf", () => {
    expect(ARTICLES).toHaveLength(7);
    for (const article of ARTICLES) {
      expect(validateContentItem(article, { sources: EVIDENCE_SOURCES, approvers: [] })).toEqual([]);
      expect(article.status).toBe("draft");
      expect(article.author).toMatch(/Draf demonstrasi \(Claude\) — perlu ditinjau tim/);
    }
    expect(getVisibleArticles()).toHaveLength(7);
  });

  test("dasar isi tidak memakai sumber internal atau safety draft; bacaan lain tidak memakai sumber internal", () => {
    for (const article of ARTICLES) {
      for (const id of article.evidenceIds) expect(source(id)).toMatchObject({ internal: false, safetyDraft: false });
      for (const id of article.moreEvidenceIds ?? []) {
        expect(source(id).internal).toBe(false);
        expect(article.evidenceIds).not.toContain(id);
      }
    }
  });

  test("istilah yang dirujuk topik ada di glosarium; teks tanpa kode E-xx", () => {
    const ids = GLOSSARY.map((g) => g.id);
    for (const article of ARTICLES) {
      for (const term of article.terms) expect(ids).toContain(term);
      expect(JSON.stringify(article.sections)).not.toMatch(/\bE\d{2}\b/);
    }
  });

  test("teks topik tidak memuat angka risiko pribadi atau nama obat", () => {
    const text = JSON.stringify(ARTICLES).toLowerCase();
    for (const word of ["ibuprofen", "naproxen", "parasetamol", "acetaminophen", "risikomu", "kamu berisiko"]) {
      expect(text).not.toContain(word);
    }
  });
});

describe("Referensi terkurasi (E-3, E-4)", () => {
  test("katalog berisi 41 sumber: semua kecuali 5 INTERNAL; tidak ada yang hilang dari data", () => {
    expect(EVIDENCE_SOURCES).toHaveLength(46);
    const catalog = getReferenceCatalog();
    expect(catalog).toHaveLength(41);
    expect(publicSources(EVIDENCE_SOURCES).map((s) => s.id)).not.toEqual(expect.arrayContaining(["E19", "E31", "E32", "E35", "E45"]));
    expect(catalog.every((ref) => !("id" in ref))).toBe(true); // kode audit tidak dikirim ke browser
  });

  test("setiap referensi publik masuk minimal satu topik; topik ditunda tetap tampil", () => {
    for (const s of publicSources(EVIDENCE_SOURCES)) expect(topicIdsOf(s).length).toBeGreaterThan(0);
    const deferred = REFERENCE_TOPICS.find((t) => t.deferred);
    const inDeferred = publicSources(EVIDENCE_SOURCES).filter((s) => topicIdsOf(s).includes(deferred.id)).map((s) => s.id);
    // 9 sumber topik ditunda (E-3) + E40 yang juga bertopik kehamilan.
    expect(inDeferred).toEqual(expect.arrayContaining(["E13", "E14", "E15", "E24", "E25", "E28", "E29", "E30", "E44"]));
  });

  test("safety draft: tidak jadi dasar isi, boleh tampil di bacaan dengan label", () => {
    expect(resolveReferences(["E41", "E16"], EVIDENCE_SOURCES)).toHaveLength(1);
    expect(resolveReadingList(["E41", "E35"], EVIDENCE_SOURCES)).toEqual([expect.objectContaining({ safetyDraft: true })]);
  });
});
