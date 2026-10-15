import { EVIDENCE_SOURCES } from "@/content/evidence/sources";
import { APPROVERS } from "@/content/approvers";
import { ARTICLES } from "@/content/education/articles";
import { GENERAL_GUIDANCE } from "@/content/guidance/general";
import { GLOSSARY } from "@/content/education/glossary";
import { resolveReferences, selectVisibleContent, validateContentItem } from "@/lib/content/rules";

const APPROVER = { id: "pj-evidence", name: "Contoh", role: "Penanggung jawab evidence" };
const ctx = { sources: EVIDENCE_SOURCES, approvers: [APPROVER] };

const draft = (overrides = {}) => ({
  id: "uji-01",
  group: "panas",
  text: "Teks uji struktur.",
  reason: "Alasan uji struktur.",
  evidenceIds: ["E16"],
  status: "draft",
  ...overrides,
});

describe("Katalog sumber evidence", () => {
  test("46 sumber unik, semuanya belum disetujui untuk rilis", () => {
    expect(EVIDENCE_SOURCES).toHaveLength(46);
    expect(new Set(EVIDENCE_SOURCES.map((s) => s.id)).size).toBe(46);
    expect(EVIDENCE_SOURCES.every((s) => s.releaseStatus === "not_granted")).toBe(true);
  });

  test("sumber internal & safety draft sesuai audit", () => {
    expect(EVIDENCE_SOURCES.filter((s) => s.internal).map((s) => s.id)).toEqual(["E19", "E31", "E32", "E35", "E45"]);
    expect(EVIDENCE_SOURCES.filter((s) => s.safetyDraft).map((s) => s.id)).toEqual(["E21", "E23", "E24", "E25", "E40", "E41"]);
  });
});

describe("Gerbang konten (CLAUDE.md §10, K-01, T3-5)", () => {
  test("draf dengan referensi sah lolos", () => {
    expect(validateContentItem(draft(), ctx)).toEqual([]);
  });

  test("tanpa referensi ditolak", () => {
    expect(validateContentItem(draft({ evidenceIds: [] }), ctx)).toContain("tanpa_referensi");
  });

  test("referensi internal, safety draft, atau tidak dikenal ditolak", () => {
    expect(validateContentItem(draft({ evidenceIds: ["E31"] }), ctx)).toContain("referensi_internal:E31");
    expect(validateContentItem(draft({ evidenceIds: ["E41"] }), ctx)).toContain("referensi_safety_draft:E41");
    expect(validateContentItem(draft({ evidenceIds: ["E99"] }), ctx)).toContain("referensi_tidak_dikenal:E99");
  });

  test("approved wajib pemberi persetujuan terdaftar & tanggal", () => {
    expect(validateContentItem(draft({ status: "approved" }), ctx)).toEqual(
      expect.arrayContaining(["pemberi_persetujuan_tidak_terdaftar", "tanggal_persetujuan_tidak_valid"])
    );
    expect(validateContentItem(draft({ status: "approved", approvedBy: "pj-evidence", approvedAt: "2026-10-20" }), ctx)).toEqual([]);
  });

  test("selama APPROVERS kosong (T3-5 belum diisi), tidak ada konten approved yang lolos", () => {
    const item = draft({ status: "approved", approvedBy: "siapa-saja", approvedAt: "2026-10-20" });
    expect(validateContentItem(item, { sources: EVIDENCE_SOURCES, approvers: APPROVERS })).toContain("pemberi_persetujuan_tidak_terdaftar");
  });

  test("artikel wajib punya isi & batasan informasi", () => {
    const article = { slug: "uji", category: "panas", title: "Judul", summary: "Ringkasan", evidenceIds: ["E16"], status: "draft" };
    expect(validateContentItem(article, ctx)).toEqual(expect.arrayContaining(["artikel_tanpa_isi", "artikel_tanpa_batasan"]));
    expect(validateContentItem({ ...article, sections: [{ heading: "A", paragraphs: ["B"] }], limitations: "C" }, ctx)).toEqual([]);
  });

  test("kata diagnostik/kausal individual ditolak", () => {
    expect(validateContentItem(draft({ text: "Ini adalah diagnosis untukmu." }), ctx).some((e) => e.startsWith("kata_terlarang"))).toBe(true);
    expect(validateContentItem(draft({ reason: "Panas menyebabkan gejalamu." }), ctx).some((e) => e.startsWith("kata_terlarang"))).toBe(true);
  });

  test("sakelar K-01: draf disembunyikan bila dimatikan", () => {
    const items = [draft(), draft({ id: "uji-02", status: "approved", approvedBy: "pj-evidence", approvedAt: "2026-10-20" })];
    expect(selectVisibleContent(items, { ...ctx, showDraft: true })).toHaveLength(2);
    expect(selectVisibleContent(items, { ...ctx, showDraft: false }).map((i) => i.id)).toEqual(["uji-02"]);
  });

  test("referensi tampil tanpa kode E-xx", () => {
    const refs = resolveReferences(["E16", "E31"], EVIDENCE_SOURCES);
    expect(refs).toHaveLength(1);
    expect(refs[0]).toEqual({ title: "Heat and health", publisher: "WHO", url: expect.stringContaining("who.int") });
    expect(JSON.stringify(refs)).not.toMatch(/E\d{2}/);
  });
});

describe("Berkas konten saat ini", () => {
  test("semua artikel & butir panduan yang ada lolos gerbang (atau berkas masih kosong)", () => {
    for (const item of [...ARTICLES, ...GENERAL_GUIDANCE]) {
      expect({ id: item.id ?? item.slug, errors: validateContentItem(item, { sources: EVIDENCE_SOURCES, approvers: APPROVERS }) }).toEqual({
        id: item.id ?? item.slug,
        errors: [],
      });
    }
  });

  test("slug artikel unik", () => {
    const slugs = ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("glosarium: id unik, tautan istilah terkait valid, tidak menampilkan kode E-xx", () => {
    const ids = GLOSSARY.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const entry of GLOSSARY) {
      for (const related of entry.related) expect(ids).toContain(related);
      expect(`${entry.definition} ${entry.note}`).not.toMatch(/\bE\d{2}\b/);
    }
  });
});
