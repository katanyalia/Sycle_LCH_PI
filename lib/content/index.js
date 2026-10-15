// Titik akses konten untuk halaman (Server Component).
import { APPROVERS } from "@/content/approvers";
import { EVIDENCE_SOURCES } from "@/content/evidence/sources";
import { ARTICLES } from "@/content/education/articles";
import { GENERAL_GUIDANCE } from "@/content/guidance/general";
import { SHOW_DRAFT_CONTENT } from "@/lib/config";
import { resolveReferences, selectVisibleContent } from "@/lib/content/rules";

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
