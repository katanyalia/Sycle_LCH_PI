// Titik akses konten untuk halaman (Server Component).
import { APPROVERS } from "@/content/approvers";
import { EVIDENCE_SOURCES } from "@/content/evidence/sources";
import { ARTICLES } from "@/content/education/articles";
import { GENERAL_GUIDANCE } from "@/content/guidance/general";
import { GLOSSARY } from "@/content/education/glossary";
import { SHOW_DRAFT_CONTENT } from "@/lib/config";
import { publicSources, resolveReadingList, resolveReferences, selectVisibleContent } from "@/lib/content/rules";

const context = () => ({ sources: EVIDENCE_SOURCES, approvers: APPROVERS, showDraft: SHOW_DRAFT_CONTENT });

export function getVisibleArticles() {
  return selectVisibleContent(ARTICLES, context());
}

export function getArticleBySlug(slug) {
  return getVisibleArticles().find((article) => article.slug === slug) ?? null;
}

export function getVisibleGuidance(groupId) {
  return selectVisibleContent(GENERAL_GUIDANCE, context()).filter((item) => item.group === groupId);
}

export function referencesFor(item) {
  return resolveReferences(item.evidenceIds, EVIDENCE_SOURCES);
}

// Bacaan lain untuk topik (studi populasi, safety draft berlabel) — tidak dipakai sebagai dasar isi.
export function moreReferencesFor(item) {
  return resolveReadingList(item.moreEvidenceIds, EVIDENCE_SOURCES);
}

// Glosarium: istilah draf (E-1) hanya tampil bila sakelar K-01 aktif.
export function getGlossary() {
  return GLOSSARY.filter((entry) => !entry.draft || SHOW_DRAFT_CONTENT);
}

// Katalog referensi (tanpa sumber INTERNAL) + topik artikel yang memakai tiap sumber.
export function getReferenceCatalog() {
  const articles = getVisibleArticles();
  return publicSources(EVIDENCE_SOURCES).map((source) => ({
    title: source.title,
    publisher: source.publisher,
    url: source.url,
    sourceType: source.sourceType,
    topics: source.topics,
    populationStudy: Boolean(source.populationStudy),
    safetyDraft: Boolean(source.safetyDraft),
    articles: articles
      .filter((a) => a.evidenceIds.includes(source.id) || a.moreEvidenceIds?.includes(source.id))
      .map((a) => ({ slug: a.slug, title: a.title })),
  }));
}
