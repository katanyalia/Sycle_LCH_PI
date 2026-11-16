"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  FileText,
  Leaf,
  Search,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { educationArticles } from "@/data/education";

const categories = [
  { label: "Semua topik", value: "semua" },
  { label: "Panas", value: "panas" },
  { label: "Kualitas udara", value: "kualitas-udara" },
  { label: "UV", value: "uv" },
  { label: "Kesehatan perempuan", value: "kesehatan-perempuan" },
];

const CARDS_PER_PAGE = 4;

// Konsistensi tombol utama
const PRIMARY_BUTTON =
  "inline-flex h-11 items-center justify-center rounded-full !border-0 !bg-[#B84E73] !px-5 !text-sm !font-bold !text-white shadow-sm transition-colors duration-200 hover:!bg-[#8E3E5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// Konsistensi tombol sekunder
const SECONDARY_BUTTON =
  "inline-flex h-11 items-center justify-center rounded-full !border !border-[#E8D5DE] !bg-white !px-5 !text-sm !font-bold !text-[#8E3E5E] transition-colors duration-200 hover:!border-[#B84E73] hover:!bg-[#FFF8FB] hover:!text-[#8E3E5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// Tombol khusus bagian disclaimer
const SAGE_BUTTON =
  "inline-flex h-11 shrink-0 items-center justify-center rounded-full !border !border-[#C8DCCB] !bg-white/80 !px-5 !text-sm !font-bold !text-[#48634D] transition-colors duration-200 hover:!bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78977D] focus-visible:ring-offset-2";

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeCategory(value = "") {
  return normalizeText(value)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-");
}

function getCategoryLabel(category = "") {
  const normalized = normalizeCategory(category);

  const labels = {
    "kualitas-udara": "Kualitas udara",
    "kesehatan-perempuan": "Kesehatan perempuan",
    panas: "Panas",
    uv: "UV",
  };

  return labels[normalized] || category || "Edukasi";
}

function getSource(article) {
  return (
    article.sourceUrl ||
    article.sourceURL ||
    article.source ||
    article.pdfUrl ||
    article.pdf ||
    ""
  );
}

function isExternalSource(source = "") {
  return /^https?:\/\//i.test(source);
}

function getSourceType(article) {
  const source = getSource(article);

  if (/\.pdf(?:$|[?#])/i.test(source)) {
    return "Dokumen PDF";
  }

  if (article.references?.length) {
    return `${article.references.length} referensi`;
  }

  return article.sourceType || "Sumber evidence";
}

function getSourceTitle(article) {
  return article.sourceTitle || article.sourceName || "Lihat sumber";
}

function getCategoryStyle(category = "") {
  const normalized = normalizeCategory(category);

  if (normalized === "panas") {
    return "bg-[#FFF0E4] text-[#98562B]";
  }

  if (normalized === "kualitas-udara") {
    return "bg-[#E8F1F7] text-[#41677E]";
  }

  if (normalized === "uv") {
    return "bg-[#F8EEDB] text-[#8B6A26]";
  }

  if (normalized === "kesehatan-perempuan") {
    return "bg-[#F8E8EF] text-[#984568]";
  }

  return "bg-[#EEEAF8] text-[#68558C]";
}

export default function EducationPage() {
  const [activeCategory, setActiveCategory] = useState("semua");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const filteredArticles = useMemo(() => {
    const query = normalizeText(search);

    return educationArticles.filter((article) => {
      const category = normalizeCategory(article.category || "");

      const matchesCategory =
        activeCategory === "semua" ||
        category === activeCategory;

      const searchableText = normalizeText(
        [
          article.title,
          article.summary,
          article.category,
          article.sourceTitle,
          article.sourceType,
          article.sourceName,
        ]
          .filter(Boolean)
          .join(" ")
      );

      const matchesSearch =
        !query || searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const totalPages = Math.ceil(
    filteredArticles.length / CARDS_PER_PAGE
  );

  const safePage = Math.min(
    currentPage,
    Math.max(totalPages - 1, 0)
  );

  const visibleArticles = filteredArticles.slice(
    safePage * CARDS_PER_PAGE,
    safePage * CARDS_PER_PAGE + CARDS_PER_PAGE
  );

  function changeCategory(value) {
    setActiveCategory(value);
    setCurrentPage(0);
  }

  function changeSearch(value) {
    setSearch(value);
    setCurrentPage(0);
  }

  function resetFilters() {
    setSearch("");
    setActiveCategory("semua");
    setCurrentPage(0);
  }

  return (
    <main className="min-h-screen bg-[#FFF8FB] text-[#332A35]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-10">
        {/* Hero */}
        <section className="relative isolate overflow-hidden rounded-[28px] border border-[#F0DFE7] bg-white px-6 py-9 shadow-[0_5px_24px_rgb(120_70_90_/_6%)] sm:px-9 sm:py-11 lg:px-12 lg:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 -z-10 size-64 rounded-full bg-[#F8E8EF] opacity-80 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 right-24 -z-10 size-64 rounded-full bg-[#E9F2EA] opacity-90 blur-3xl"
          />

          <div className="relative grid items-center gap-9 lg:grid-cols-[1fr_300px] lg:gap-12">
            <div className="max-w-[680px]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#EAD7E0] bg-[#FFF8FB]/90 px-3.5 py-2 text-sm font-bold text-[#984568]">
                <Sparkles className="size-4" />
                Ruang belajar Sycle
              </div>

              <h1 className="max-w-[650px] text-3xl font-extrabold leading-tight tracking-[-0.035em] text-[#332A35] sm:text-4xl lg:text-[46px]">
                Kenali tubuhmu,
                <span className="block text-[#B84E73]">
                  pahami lingkunganmu.
                </span>
              </h1>

              <p className="mt-5 max-w-[590px] text-base leading-7 text-[#756774] sm:text-lg sm:leading-8">
                Temukan informasi berbasis evidence tentang
                kesehatan perempuan dan lingkungan. Pelajari
                berbagai faktor yang dapat memengaruhi keseharianmu,
                dengan bahasa yang lebih mudah dipahami.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button
                  nativeButton={false}
                  render={<Link href="/education/references" />}
                  size="lg"
                  className={PRIMARY_BUTTON}
                >
                  Jelajahi referensi
                  <ArrowUpRight className="ml-1 size-4" />
                </Button>

                <Button
                  nativeButton={false}
                  render={<Link href="/education/glossary" />}
                  variant="outline"
                  size="lg"
                  className={SECONDARY_BUTTON}
                >
                  Glosarium
                </Button>

                <Button
                  nativeButton={false}
                  render={<Link href="/education/guidance" />}
                  variant="outline"
                  size="lg"
                  className={SECONDARY_BUTTON}
                >
                  Panduan perlindungan
                </Button>
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:flex lg:justify-center">
              <div className="overflow-hidden rounded-[32px] border border-white/80 shadow-[0_12px_40px_rgb(120_70_90_/_12%)]">
                <video
                  src="/brand/education-hero.mp4"
                  poster="/brand/education-hero-poster.webp"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                  className="block size-[300px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section heading */}
        <section className="mt-12 sm:mt-14">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#B84E73]">
                Perpustakaan edukasi
              </p>

              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#332A35] sm:text-3xl">
                Temukan informasi yang kamu butuhkan
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#827382] sm:text-base">
                Jelajahi artikel berdasarkan topik atau cari
                informasi tertentu.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E5E9E2] bg-[#F3F7F1] px-3.5 py-2 text-sm font-bold text-[#59745D]">
              <BookOpen className="size-4" />
              {filteredArticles.length} artikel
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 rounded-[22px] border border-[#F0DFE7] bg-white p-4 shadow-[0_5px_24px_rgb(120_70_90_/_4%)] sm:p-5">
            <label
              htmlFor="education-search"
              className="mb-2 block text-sm font-bold text-[#514351]"
            >
              Cari topik edukasi
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#A08D9C]" />

              <input
                id="education-search"
                type="search"
                value={search}
                onChange={(event) =>
                  changeSearch(event.target.value)
                }
                placeholder="Cari panas, PM2.5, menstruasi..."
                className="h-12 w-full rounded-xl border border-[#E9DCE3] bg-[#FFFCFD] pl-12 pr-4 text-sm text-[#332A35] outline-none transition placeholder:text-[#B2A2AE] focus:border-[#B84E73] focus:ring-4 focus:ring-[#B84E73]/10"
              />
            </div>

            {/* Category filters */}
            <div className="mt-5">
              <p className="mb-3 text-sm font-bold text-[#514351]">
                Jelajahi berdasarkan topik
              </p>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isActive =
                    activeCategory === category.value;

                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() =>
                        changeCategory(category.value)
                      }
                      aria-pressed={isActive}
                      className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2 ${
                        isActive
                          ? "border-[#B84E73] bg-[#B84E73] text-white shadow-sm"
                          : "border-[#E9DCE3] bg-white text-[#796878] hover:border-[#D7A9BC] hover:bg-[#FFF4F8] hover:text-[#984568]"
                      }`}
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Article grid */}
        <section className="mt-8" aria-live="polite">
          {filteredArticles.length > 0 ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-[#827382]">
                  Menampilkan{" "}
                  <span className="font-bold text-[#514351]">
                    {safePage * CARDS_PER_PAGE + 1}–
                    {Math.min(
                      (safePage + 1) * CARDS_PER_PAGE,
                      filteredArticles.length
                    )}
                  </span>{" "}
                  dari{" "}
                  <span className="font-bold text-[#514351]">
                    {filteredArticles.length}
                  </span>{" "}
                  artikel
                </p>

                {(search || activeCategory !== "semua") && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-sm font-bold text-[#B84E73] underline-offset-4 transition-colors hover:text-[#8E3E5E] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
                  >
                    Hapus filter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
                {visibleArticles.map((article) => {
                  const source = getSource(article);
                  const external = isExternalSource(source);
                  const isDraft = article.status === "draft";

                  return (
                    <article
                      key={article.slug || article.title}
                      className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-[#EFE1E8] bg-white p-5 shadow-[0_5px_24px_rgb(120_70_90_/_4%)] transition-all duration-200 hover:-translate-y-1 hover:border-[#E2C2D1] hover:shadow-[0_12px_32px_rgb(120_70_90_/_9%)] sm:p-6"
                    >
                      {/* Card top */}
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`inline-flex max-w-[75%] items-center rounded-full px-3 py-1.5 text-xs font-extrabold ${getCategoryStyle(
                            article.category
                          )}`}
                        >
                          {getCategoryLabel(article.category)}
                        </span>

                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF2F7] text-[#B84E73] transition-colors group-hover:bg-[#F8E8EF]">
                          <BookOpen className="size-5" />
                        </div>
                      </div>

                      {/* Card content */}
                      <div className="mt-5 flex-1">
                        {isDraft && (
                          <span className="mb-2 inline-flex rounded-md bg-[#FFF2D8] px-2 py-1 text-[11px] font-extrabold text-[#8A6827]">
                            Dalam pengembangan
                          </span>
                        )}

                        <h3 className="text-lg font-extrabold leading-snug text-[#332A35] transition-colors group-hover:text-[#984568] sm:text-xl">
                          {article.title}
                        </h3>

                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#827382]">
                          {article.summary ||
                            "Pelajari informasi terkait kesehatan perempuan dan lingkungan melalui materi edukasi Sycle."}
                        </p>
                      </div>

                      {/* Source info */}
                      <div className="mt-5 border-t border-[#F1E7EC] pt-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#938392]">
                          <FileText className="size-4 shrink-0" />
                          <span>{getSourceType(article)}</span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <Button
                            nativeButton={false}
                            render={
                              <Link
                                href={`/education/${article.slug}`}
                              />
                            }
                            size="sm"
                            className="inline-flex h-11 items-center justify-center rounded-full !border-0 !bg-[#B84E73] !px-5 !text-xs !font-bold !text-white shadow-sm transition-colors duration-200 hover:!bg-[#8E3E5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
                          >
                            Baca selengkapnya
                            <ArrowUpRight className="ml-1 size-3.5" />
                          </Button>

                          {source ? (
                            external ? (
                              <a
                                href={source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex max-w-full items-center gap-1.5 text-xs font-bold text-[#8B6075] transition-colors hover:text-[#B84E73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
                                title={getSourceTitle(article)}
                              >
                                <span className="max-w-[125px] truncate">
                                  {getSourceTitle(article)}
                                </span>
                                <ExternalLink className="size-3.5 shrink-0" />
                              </a>
                            ) : (
                              <Link
                                href={source}
                                className="inline-flex max-w-full items-center gap-1.5 text-xs font-bold text-[#8B6075] transition-colors hover:text-[#B84E73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
                              >
                                <span className="max-w-[125px] truncate">
                                  {getSourceTitle(article)}
                                </span>
                                <ArrowUpRight className="size-3.5 shrink-0" />
                              </Link>
                            )
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  aria-label="Navigasi halaman artikel"
                  className="mt-9 flex flex-wrap items-center justify-center gap-2"
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={safePage === 0}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(page - 1, 0)
                      )
                    }
                    aria-label="Halaman sebelumnya"
                    className="size-10 rounded-xl !border-[#E7D5DE] !bg-white !text-[#70495D] hover:!bg-[#FFF4F8] disabled:opacity-40"
                  >
                    <ArrowLeft className="size-4" />
                  </Button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index
                  ).map((page) => (
                    <Button
                      key={page}
                      type="button"
                      variant={
                        page === safePage
                          ? "default"
                          : "outline"
                      }
                      size="icon"
                      onClick={() => setCurrentPage(page)}
                      aria-label={`Halaman ${page + 1}`}
                      aria-current={
                        page === safePage ? "page" : undefined
                      }
                      className={`size-10 rounded-xl !text-sm !font-bold ${
                        page === safePage
                          ? "!border-[#B84E73] !bg-[#B84E73] !text-white hover:!bg-[#8E3E5E]"
                          : "!border-[#E7D5DE] !bg-white !text-[#70495D] hover:!bg-[#FFF4F8]"
                      }`}
                    >
                      {page + 1}
                    </Button>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={safePage >= totalPages - 1}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(page + 1, totalPages - 1)
                      )
                    }
                    aria-label="Halaman berikutnya"
                    className="size-10 rounded-xl !border-[#E7D5DE] !bg-white !text-[#70495D] hover:!bg-[#FFF4F8] disabled:opacity-40"
                  >
                    <ArrowRight className="size-4" />
                  </Button>
                </nav>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="rounded-[24px] border border-dashed border-[#E4CBD7] bg-white px-6 py-14 text-center sm:py-16">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73]">
                <Search className="size-7" />
              </div>

              <h3 className="mt-5 text-xl font-extrabold text-[#332A35]">
                Artikel belum ditemukan
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#827382]">
                Coba gunakan kata kunci lain atau pilih kategori
                yang berbeda untuk menemukan informasi edukasi.
              </p>

              <Button
                type="button"
                onClick={resetFilters}
                className={`mt-6 ${PRIMARY_BUTTON}`}
              >
                Tampilkan semua artikel
              </Button>
            </div>
          )}
        </section>

        {/* Educational disclaimer */}
        <section className="mt-12 overflow-hidden rounded-[24px] border border-[#D7E6D9] bg-[#E9F2EA] p-6 sm:mt-14 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-[#52775B]">
                <Leaf className="size-6" />
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-[#354A39] sm:text-xl">
                  Informasi untuk memahami, bukan mendiagnosis.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#617465]">
                  Materi Sycle membantu kamu memahami hubungan
                  antara kesehatan perempuan dan faktor lingkungan.
                  Informasi ini bukan pengganti pemeriksaan atau
                  saran dari tenaga kesehatan.
                </p>
              </div>
            </div>

            <Button
              nativeButton={false}
              render={<Link href="/education/references" />}
              variant="outline"
              size="lg"
              className={SAGE_BUTTON}
            >
              Lihat referensi
              <ArrowUpRight className="ml-1 size-4" />
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}