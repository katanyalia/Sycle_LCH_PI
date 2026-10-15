import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookA, FileWarning, Info, Library } from "lucide-react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { ContentStatus } from "@/components/content/ContentStatus";
import { ReferenceList } from "@/components/content/ReferenceList";
import { Button } from "@/components/ui/button";
import { EDUCATION_CATEGORIES } from "@/content/categories";
import { getArticleBySlug, getGlossary, getVisibleArticles, moreReferencesFor, referencesFor } from "@/lib/content";

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
  const terms = getGlossary().filter((entry) => article.terms?.includes(entry.id));
  const isDraft = article.status !== "approved";

  return (
    <PageShell
      eyebrow={`Info & Edukasi · ${category}`}
      title={article.title}
      description={article.summary}
      panel={
        terms.length > 0 && (
          <SupportPanel title="Istilah dalam topik ini">
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
      {isDraft && (
        <div className="flex gap-2 rounded-xl border border-dashed border-primary/40 bg-blush p-4 text-sm">
          <FileWarning className="mt-0.5 size-4 shrink-0 text-primary-pressed" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold">Penjelasan draf — bukan klaim kesehatan yang disetujui untuk rilis</p>
            <p>
              Penjelasan di bawah disusun dari sumber resmi yang tercantum di bagian Referensi terkurasi, tetapi belum
              ditinjau tim. Periksa sumber aslinya untuk informasi lengkap.
            </p>
            {article.author && <p className="text-muted-foreground">Penulis: {article.author}</p>}
          </div>
        </div>
      )}
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
      <section aria-labelledby="judul-referensi" className="space-y-4 rounded-xl border bg-sage/60 p-4 md:p-6">
        <h2 id="judul-referensi" className="flex items-center gap-2 text-xl font-semibold">
          <Library className="size-5 text-primary-pressed" aria-hidden="true" />
          Referensi terkurasi
        </h2>
        <p className="text-sm">
          Sumber asli yang dikumpulkan tim SYCLE. Daftar ini adalah bahan bacaan yang dapat kamu periksa sendiri, bukan
          pernyataan bahwa SYCLE telah menyetujui setiap isinya.
        </p>
        <ReferenceList variant="card" title="Dasar penjelasan topik ini" references={referencesFor(article)} />
        <ReferenceList
          variant="card"
          title="Bacaan lain untuk topik ini"
          description="Tidak dipakai sebagai dasar penjelasan di atas."
          references={moreReferencesFor(article)}
        />
      </section>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="ghost">
          <Link href="/info-edukasi/referensi">
            <Library aria-hidden="true" />
            Semua referensi
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/info-edukasi/glosarium">
            <BookA aria-hidden="true" />
            Glosarium
          </Link>
        </Button>
      </div>
      <Button asChild variant="outline">
        <Link href="/info-edukasi">
          <ArrowLeft aria-hidden="true" />
          Kembali ke Edukasi
        </Link>
      </Button>
    </PageShell>
  );
}
