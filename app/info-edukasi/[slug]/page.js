import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { ContentStatus } from "@/components/content/ContentStatus";
import { ReferenceList } from "@/components/content/ReferenceList";
import { Button } from "@/components/ui/button";
import { EDUCATION_CATEGORIES } from "@/content/categories";
import { GLOSSARY } from "@/content/education/glossary";
import { getArticleBySlug, getVisibleArticles, referencesFor } from "@/lib/content";

export function generateStaticParams() {
  return getVisibleArticles().map((article) => ({ slug: article.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: getArticleBySlug(slug)?.title ?? "Artikel" };
}

// WF-08 screen 63 — detail artikel. Isi ditulis tim (T3-1) dan lolos gerbang konten.
export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const category = EDUCATION_CATEGORIES.find((c) => c.id === article.category)?.label;
  const terms = GLOSSARY.filter((entry) => article.terms?.includes(entry.id));

  return (
    <PageShell
      eyebrow={`Info & Edukasi · ${category}`}
      title={article.title}
      description={article.summary}
      panel={
        terms.length > 0 && (
          <SupportPanel title="Istilah dalam artikel ini">
            {terms.map((entry) => (
              <p key={entry.id}>
                <Link href={`/info-edukasi/glosarium#${entry.id}`} className="font-semibold text-primary-pressed hover:underline">
                  {entry.term}
                </Link>
                : {entry.definition}
              </p>
            ))}
          </SupportPanel>
        )
      }
    >
      <ContentStatus item={article} />
      <article className="space-y-6">
        {article.sections.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="max-w-prose leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>
      <div className="flex gap-2 rounded-xl border bg-powder p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary-pressed" aria-hidden="true" />
        <div>
          <p className="font-semibold">Batasan informasi</p>
          <p>{article.limitations}</p>
          <p className="mt-1">Informasi ini bersifat edukatif dan tidak menggantikan tenaga kesehatan.</p>
        </div>
      </div>
      <ReferenceList references={referencesFor(article)} />
      <Button asChild variant="outline">
        <Link href="/info-edukasi">
          <ArrowLeft aria-hidden="true" />
          Kembali ke Edukasi
        </Link>
      </Button>
    </PageShell>
  );
}
