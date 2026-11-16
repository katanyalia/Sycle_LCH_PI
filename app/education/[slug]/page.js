import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronDown, ExternalLink, MapPin } from "lucide-react";
import AskSycleButton from "@/components/education/AskSycleButton";
import {
  getEducationArticleBySlug,
  getArticleReferences,
  getArticleTerms,
  getRelatedArticles,
  educationArticles,
} from "@/data/education";

export function generateStaticParams() {
  return educationArticles.map((article) => ({
    slug: article.slug,
  }));
}

// Konten dibungkus Suspense karena membaca `params` (data URL) — sesuai saran Next.js cacheComponents.
export default function EducationDetailPage({ params }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#FFF8FB]" />}>
      <EducationArticle params={params} />
    </Suspense>
  );
}

async function EducationArticle({ params }) {
  const { slug } = await params;
  const article = getEducationArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const references = getArticleReferences(article);
  const terms = getArticleTerms(article);
  const relatedArticles = getRelatedArticles(article);

  return (
    <main className="min-h-screen bg-[#FFF8FB] px-5 py-10 text-[#332A35] sm:px-8">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/education"
          className="mb-8 inline-flex font-extrabold text-[#B84E73] hover:text-[#8E3E5E]"
        >
          ← Kembali ke edukasi
        </Link>

        <header className="rounded-[22px] border border-[#F0E3E9] bg-white p-6 shadow-[0_5px_24px_rgb(120_70_90_/_6%)] sm:p-9">
          <span className="inline-flex rounded-full bg-[#F8E8EF] px-3 py-1 text-sm font-extrabold text-[#B84E73]">
            {article.category}
          </span>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
            {article.title}
          </h1>

          {article.status === "draft" && (
            <span className="mt-5 inline-flex rounded-full bg-[#FFF1D6] px-3 py-1 text-sm font-extrabold text-[#8A641E]">
              Draf · Perlu ditinjau
            </span>
          )}
        </header>

        {/* Kartu edukasi 5 bagian (Master V2.1 5.7) */}
        <section className="mt-6 space-y-7 rounded-[22px] border border-[#F0E3E9] bg-white p-6 sm:p-9">
          <div>
            <h2 className="text-xl font-extrabold">Ringkasan</h2>
            <p className="mt-3 leading-8 text-[#514451]">
              {article.card?.summary ?? article.summary}
            </p>
          </div>

          {article.card?.actions?.length > 0 && (
            <div>
              <h2 className="text-xl font-extrabold">Yang bisa kamu lakukan</h2>
              <ul className="mt-3 space-y-2">
                {article.card.actions.map((action) => (
                  <li key={action} className="flex gap-3 leading-7 text-[#514451]">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-[#52775B]" aria-hidden="true" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-[#D7E6D9] bg-[#E9F2EA] p-5">
            <h2 className="text-lg font-extrabold">Yang perlu diketahui</h2>
            <p className="mt-2 leading-relaxed text-[#514451]">{article.limitations}</p>
          </div>

          {references.length > 0 && (
            <div>
              <h2 className="text-xl font-extrabold">Sumber</h2>
              <ul className="mt-4 space-y-3">
                {references.map((source) => (
                  <li key={source.id}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between gap-3 rounded-2xl border border-[#F0E3E9] p-4 transition hover:border-[#E3BFD0] hover:bg-[#FFF8FB]"
                    >
                      <span>
                        <span className="block text-sm font-extrabold text-[#B84E73]">
                          {source.publisher}
                        </span>
                        <span className="mt-1 block leading-6 text-[#332A35]">
                          {source.title}
                        </span>
                        {source.sourceType && (
                          <span className="mt-1 block text-xs text-[#806D7B]">
                            {source.sourceType}
                          </span>
                        )}
                      </span>
                      <ExternalLink className="mt-1 size-4 shrink-0 text-[#B84E73]" aria-hidden="true" />
                      <span className="sr-only">(buka di tab baru)</span>
                    </a>
                  </li>
                ))}
              </ul>

              <Link
                href="/education/references"
                className="mt-5 inline-flex text-sm font-extrabold text-[#B84E73] hover:text-[#8E3E5E]"
              >
                Lihat semua referensi →
              </Link>
            </div>
          )}
        </section>

        {/* Isi lengkap artikel, bisa dibuka */}
        <details className="group mt-6 rounded-[22px] border border-[#F0E3E9] bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[22px] p-6 font-extrabold text-[#B84E73] transition hover:bg-[#FFF8FB] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B84E73]/20 sm:px-9 [&::-webkit-details-marker]:hidden">
            Baca selengkapnya
            <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="space-y-6 px-6 pb-6 sm:px-9 sm:pb-9">
            {article.sections.map((section, index) => (
              <section key={`${article.slug}-${index}`}>
                <h2 className="text-xl font-extrabold">
                  {section.heading}
                </h2>

                <div className="mt-3 space-y-4">
                  {(section.paragraphs ?? []).map((paragraph, paragraphIndex) => (
                    <p
                      key={`${article.slug}-${index}-${paragraphIndex}`}
                      className="leading-8 text-[#514451]"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.items?.length > 0 && (
                    <ul className="space-y-2 pl-1">
                      {section.items.map((item, itemIndex) => (
                        <li
                          key={`${article.slug}-${index}-item-${itemIndex}`}
                          className="flex gap-3 leading-7 text-[#514451]"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[11px] size-1.5 shrink-0 rounded-full bg-[#B84E73]"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
        </details>

        {article.healthcareLink && (
          <section className="mt-6 flex flex-col gap-4 rounded-[22px] border border-[#F2D6B8] bg-[#FFF6EC] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold">Perlu memeriksakan diri?</h2>
              <p className="mt-1 leading-relaxed text-[#6E5236]">
                Temukan fasilitas kesehatan terdekat dari lokasimu.
              </p>
            </div>
            <Link
              href="/healthcare"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#A35F2A] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#7A4A1F]"
            >
              <MapPin className="size-4" aria-hidden="true" />
              Lihat Healthcare
            </Link>
          </section>
        )}

        <section className="mt-6 flex flex-col gap-4 rounded-[22px] border border-[#F0E3E9] bg-[#F8E8EF] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Masih ada yang ingin ditanyakan?</h2>
            <p className="mt-1 leading-relaxed text-[#514451]">
              Tanya Sycle menjawab berdasarkan kumpulan sumber evidence Sycle.
            </p>
          </div>
          <AskSycleButton
            question={article.askQuestion || `Jelaskan lebih lanjut tentang ${article.title.toLowerCase()}`}
          />
        </section>

        {terms.length > 0 && (
          <section className="mt-6 rounded-[22px] border border-[#F0E3E9] bg-white p-6 sm:p-9">
            <h2 className="text-xl font-extrabold">Istilah terkait</h2>

            <p className="mt-2 text-sm leading-relaxed text-[#806D7B]">
              Klik istilah untuk membaca penjelasannya di Glosarium.
            </p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {terms.map((term) => (
                <li key={term.id}>
                  <Link
                    href={`/education/glossary?istilah=${term.id}`}
                    className="inline-flex rounded-full border border-[#EAD7E0] bg-[#FFF8FB] px-3.5 py-2 text-sm font-bold text-[#984568] transition hover:border-[#B84E73] hover:bg-[#F8E8EF]"
                  >
                    {term.term}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}



        {relatedArticles.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xl font-extrabold">Artikel terkait</h2>

            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {relatedArticles.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/education/${item.slug}`}
                    className="flex h-full flex-col rounded-2xl border border-[#F0E3E9] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#E3BFD0]"
                  >
                    <span className="text-xs font-extrabold text-[#B84E73]">
                      {item.category}
                    </span>
                    <span className="mt-2 font-extrabold leading-snug text-[#332A35]">
                      {item.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-6 text-sm leading-relaxed text-[#806D7B]">
          Informasi ini bersifat edukatif dan tidak menggantikan konsultasi
          dengan tenaga kesehatan.
        </p>
      </article>
    </main>
  );
}