"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { EVIDENCE_SOURCES } from "@/data/education/references";

const PUBLIC_SOURCES = EVIDENCE_SOURCES.filter(
  (source) => source.forEducation && !source.internal
);

const TOPICS = [
  "Semua topik",
  ...new Set(PUBLIC_SOURCES.flatMap((source) => source.topics ?? [])),
];

const CARDS_PER_PAGE = 4;

// Tombol utama SYCLE
const PRIMARY_BUTTON =
  "inline-flex h-11 items-center justify-center rounded-full border-0 bg-[#B84E73] px-5 text-sm font-bold text-white shadow-sm transition-colors duration-200 hover:bg-[#8E3E5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// Tombol sekunder SYCLE
const SECONDARY_BUTTON =
  "inline-flex h-11 items-center justify-center rounded-full border border-[#E8D5DE] bg-white px-5 text-sm font-bold text-[#8E3E5E] transition-colors duration-200 hover:border-[#B84E73] hover:bg-[#FFF8FB] hover:text-[#8E3E5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// Tombol ikon pagination
const ICON_BUTTON =
  "flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#E7D5DE] bg-white text-[#70495D] transition-colors duration-200 hover:border-[#B84E73] hover:bg-[#FFF4F8] hover:text-[#8E3E5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40";

function getReferenceSummary(source) {
  if (source.usageNote?.trim()) {
    return source.usageNote;
  }

  const topics = source.topics?.filter(Boolean) ?? [];

  if (topics.length > 0) {
    return `Referensi tentang ${topics.join(", ").toLowerCase()} yang dapat ditinjau untuk mendukung materi edukasi Sycle.`;
  }

  return `Sumber dari ${source.publisher || "penerbit terkait"} yang dapat ditinjau relevansinya untuk edukasi kesehatan reproduksi dan lingkungan.`;
}

export default function EducationReferencesPage() {
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("Semua topik");
  const [currentPage, setCurrentPage] = useState(0);

  const filteredSources = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return PUBLIC_SOURCES.filter((source) => {
      const searchableText = [
        source.title,
        source.publisher,
        source.sourceType,
        source.usageNote,
        ...(source.topics ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(keyword);

      const matchesTopic =
        selectedTopic === "Semua topik" ||
        (source.topics ?? []).includes(selectedTopic);

      return matchesSearch && matchesTopic;
    });
  }, [search, selectedTopic]);

  const totalPages = Math.ceil(
    filteredSources.length / CARDS_PER_PAGE
  );

  const safePage = Math.min(
    currentPage,
    Math.max(totalPages - 1, 0)
  );

  const visibleSources = filteredSources.slice(
    safePage * CARDS_PER_PAGE,
    (safePage + 1) * CARDS_PER_PAGE
  );

  function resetFilters() {
    setSearch("");
    setSelectedTopic("Semua topik");
    setCurrentPage(0);
  }

  function changePage(nextPage) {
    setCurrentPage(
      Math.max(0, Math.min(nextPage, totalPages - 1))
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8FB] px-4 py-7 text-[#332A35] sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-sm"
        >
          <Link
            href="/education"
            className="font-semibold text-[#8E3E5E] transition-colors hover:text-[#B84E73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
          >
            Info & Edukasi
          </Link>

          <ChevronRight size={15} className="text-[#B8AAB3]" />

          <span
            aria-current="page"
            className="font-bold text-[#332A35]"
          >
            Referensi
          </span>
        </nav>

        {/* Hero */}
        <section className="relative isolate overflow-hidden rounded-[28px] border border-[#F0DFE7] bg-white p-6 shadow-[0_5px_24px_rgb(120_70_90_/_6%)] sm:p-9 lg:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 -z-10 size-64 rounded-full bg-[#F8E8EF] opacity-80 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 right-36 -z-10 size-56 rounded-full bg-[#E9F2EA] opacity-90 blur-3xl"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_230px] lg:gap-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#EAD7E0] bg-[#FFF8FB] px-3.5 py-2 text-sm font-extrabold text-[#984568]">
                <BookOpen className="size-4" />
                Referensi Sycle
              </div>

              <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.17em] text-[#B84E73]">
                INFO &amp; EDUKASI · REFERENSI
              </p>

              <h1 className="mt-3 max-w-[680px] text-3xl font-extrabold leading-tight tracking-[-0.035em] sm:text-4xl lg:text-[46px]">
                Temukan sumbernya,
                <span className="block text-[#B84E73]">
                  pahami dasarnya.
                </span>
              </h1>

              <p className="mt-5 max-w-[620px] text-base leading-7 text-[#756774] sm:text-lg sm:leading-8">
                Jelajahi berbagai sumber yang menjadi kandidat rujukan
                untuk konten edukasi Sycle tentang kesehatan reproduksi
                dan faktor lingkungan.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#EAD7E0] bg-[#FFF8FB] px-4 py-2 text-sm font-bold text-[#765C6D]">
                <FileText className="size-4 text-[#B84E73]" />
                {PUBLIC_SOURCES.length} kandidat referensi
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden justify-center lg:flex">
              <div className="relative flex size-[210px] items-center justify-center rounded-[34px] border border-white bg-white/70 shadow-[0_12px_40px_rgb(120_70_90_/_8%)] backdrop-blur-sm">
                <div className="absolute inset-4 rounded-[27px] border border-[#D7E6D9] bg-[#F2F7F0]" />

                <div className="relative flex size-28 items-center justify-center rounded-full bg-[#E0EDDF] text-[#52775B]">
                  <FileText
                    className="size-14"
                    strokeWidth={1.5}
                  />
                </div>

                <div className="absolute right-3 top-5 flex size-11 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73] shadow-sm">
                  <BookOpen className="size-5" />
                </div>

                <div className="absolute bottom-5 left-3 flex size-11 items-center justify-center rounded-2xl bg-[#EEEAF8] text-[#76629A] shadow-sm">
                  <Sparkles className="size-5" />
                </div>

                <div className="absolute bottom-5 right-5 flex size-8 items-center justify-center rounded-full border-4 border-white bg-[#D7E6D9] text-[#52775B]">
                  <CheckCircle2 className="size-4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Status referensi */}
        <section
          role="note"
          className="mb-7 mt-8 flex items-start gap-3 rounded-[20px] border border-[#E9D8A6] bg-[#FFF8E8] p-4 sm:p-5"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F8EBCB] text-[#8A641E]">
            <ShieldAlert size={21} />
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-[#72551A]">
              Status peninjauan referensi
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#725F3A]">
              Referensi di halaman ini masih menunggu persetujuan
              rilis. Pencantuman sumber tidak berarti sumber telah
              disetujui untuk publikasi.
            </p>
          </div>
        </section>

        {/* Pencarian dan filter */}
        <section className="mb-8 rounded-[24px] border border-[#F0E3E9] bg-white p-5 shadow-[0_5px_24px_rgb(120_70_90_/_4%)] sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#F8E8EF] text-[#B84E73]">
              <SlidersHorizontal size={20} />
            </div>

            <div>
              <h2 className="font-extrabold">
                Temukan referensi
              </h2>

              <p className="mt-0.5 text-xs text-[#827382]">
                Cari berdasarkan judul, penerbit, atau topik.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
            <div>
              <label
                htmlFor="reference-search"
                className="mb-2 block text-sm font-bold"
              >
                Kata kunci
              </label>

              <div className="flex h-12 items-center gap-3 rounded-xl border border-[#E8DCE3] bg-[#FFFCFE] px-4 transition focus-within:border-[#B84E73] focus-within:ring-4 focus-within:ring-[#B84E73]/10">
                <Search
                  size={19}
                  className="shrink-0 text-[#9B8793]"
                />

                <input
                  id="reference-search"
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(0);
                  }}
                  placeholder="Cari referensi..."
                  className="h-full w-full bg-transparent text-sm outline-none placeholder:text-[#A99AA3]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setCurrentPage(0);
                    }}
                    aria-label="Hapus pencarian"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#9B8793] transition-colors hover:bg-[#F8E8EF] hover:text-[#B84E73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="reference-topic"
                className="mb-2 block text-sm font-bold"
              >
                Topik
              </label>

              <select
                id="reference-topic"
                value={selectedTopic}
                onChange={(event) => {
                  setSelectedTopic(event.target.value);
                  setCurrentPage(0);
                }}
                className="h-12 w-full rounded-xl border border-[#E8DCE3] bg-[#FFFCFE] px-4 text-sm text-[#332A35] outline-none transition focus:border-[#B84E73] focus:ring-4 focus:ring-[#B84E73]/10"
              >
                {TOPICS.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#F2E8ED] pt-4">
            <p
              className="text-sm text-[#786B77]"
              aria-live="polite"
            >
              Menampilkan{" "}
              <span className="font-extrabold text-[#332A35]">
                {filteredSources.length}
              </span>{" "}
              dari {PUBLIC_SOURCES.length} referensi
            </p>

            {(search || selectedTopic !== "Semua topik") && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-bold text-[#B84E73] transition-colors hover:text-[#8E3E5E] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
              >
                Reset filter
              </button>
            )}
          </div>
        </section>

        {/* Daftar referensi */}
        <section aria-label="Daftar referensi">
          {filteredSources.length > 0 ? (
            <>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#332A35]">
                    Daftar referensi
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-[#786B77]">
                    Setiap kartu memuat ringkasan singkat mengenai
                    sumber dan relevansinya untuk edukasi Sycle.
                  </p>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => changePage(safePage - 1)}
                      disabled={safePage === 0}
                      aria-label="Lihat empat referensi sebelumnya"
                      className={ICON_BUTTON}
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <span className="min-w-24 text-center text-xs font-bold text-[#786B77]">
                      {safePage + 1} / {totalPages} halaman
                    </span>

                    <button
                      type="button"
                      onClick={() => changePage(safePage + 1)}
                      disabled={safePage >= totalPages - 1}
                      aria-label="Lihat empat referensi berikutnya"
                      className={ICON_BUTTON}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {visibleSources.map((source) => (
                  <article
                    key={source.id}
                    className="flex min-h-[340px] flex-col rounded-[22px] border border-[#EFE1E8] bg-white p-5 shadow-[0_5px_24px_rgb(120_70_90_/_4%)] transition-all duration-200 hover:-translate-y-1 hover:border-[#E2C2D1] hover:shadow-[0_12px_30px_rgb(120_70_90_/_9%)]"
                  >
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73]">
                      <BookOpen size={22} strokeWidth={1.8} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#F8E8EF] px-2.5 py-1 text-[11px] font-bold text-[#8E3E5E]">
                        {source.sourceType || "Sumber informasi"}
                      </span>

                      {source.safetyDraft && (
                        <span className="rounded-full bg-[#FCE8E6] px-2.5 py-1 text-[10px] font-bold text-[#9A3F35]">
                          Perlu tinjauan keselamatan
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 line-clamp-3 text-base font-extrabold leading-6 text-[#332A35]">
                      {source.title}
                    </h3>

                    {source.publisher && (
                      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-[#8A7A85]">
                        {source.publisher}
                      </p>
                    )}

                    <p className="mt-3 line-clamp-5 text-sm leading-6 text-[#6F6370]">
                      {getReferenceSummary(source)}
                    </p>

                    {(source.topics ?? []).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {source.topics.slice(0, 2).map((topic) => (
                          <span
                            key={topic}
                            className="rounded-lg bg-[#F6F1F5] px-2 py-1 text-[11px] text-[#6F6370]"
                          >
                            {topic}
                          </span>
                        ))}

                        {source.topics.length > 2 && (
                          <span className="px-1 py-1 text-[11px] text-[#827382]">
                            +{source.topics.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto pt-5">
                      <p className="mb-3 text-[11px] font-semibold leading-5 text-[#8A641E]">
                        Menunggu persetujuan rilis
                      </p>

                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-[#B84E73] transition-colors hover:text-[#8E3E5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
                        >
                          Buka sumber asli
                          <ExternalLink size={15} />
                        </a>
                      ) : (
                        <span className="text-xs text-[#827382]">
                          Tautan belum tersedia
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="rounded-[22px] border border-dashed border-[#E4CBD7] bg-white px-6 py-14 text-center">
              <Search
                size={28}
                className="mx-auto mb-3 text-[#B8A7B2]"
              />

              <h2 className="mb-2 font-extrabold">
                Referensi tidak ditemukan
              </h2>

              <p className="text-sm leading-6 text-[#786B77]">
                Coba kata kunci atau topik lain.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className={`mt-6 ${PRIMARY_BUTTON}`}
              >
                Tampilkan semua referensi
              </button>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-[#EEDFE7] py-6 text-center text-sm leading-6 text-[#8A7A85]">
          Referensi ditampilkan untuk peninjauan konten Sycle.
        </footer>
      </div>
    </main>
  );
}