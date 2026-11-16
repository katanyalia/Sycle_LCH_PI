"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  Leaf,
  Search,
  Sparkles,
  Sun,
  Target,
  Trophy,
  Wind,
  X,
} from "lucide-react";

import { GLOSSARY, GLOSSARY_CATEGORIES } from "@/data/education/glossary";
import { educationArticles } from "@/data/education";
import GlossaryFlashcards from "@/components/education/GlossaryFlashcards";
import GlossaryQuiz from "@/components/education/GlossaryQuiz";

const PAGE_SIZE = 8;

// Standar tombol mengikuti halaman Referensi.
const PRIMARY_BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-transparent !bg-[#B84E73] px-5 text-sm font-bold !text-white shadow-sm transition-colors duration-200 hover:!bg-[#8E3E5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const SECONDARY_BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E8D5DE] bg-white px-5 text-sm font-bold text-[#8E3E5E] transition-colors duration-200 hover:border-[#B84E73] hover:bg-[#FFF8FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const FILTER_BUTTON =
  "inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2";

const SOFT_BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#E1D9F8] bg-white px-4 text-sm font-bold text-[#5E4A86] transition-colors duration-200 hover:border-[#C9B9F0] hover:bg-[#FCFAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2";

// Ikon dan warna mengikuti kategori istilah.
const CATEGORY_STYLE = {
  data: {
    icon: FileText,
    tile: "bg-[#F2EEFF] text-[#7355AD]",
    badge: "bg-[#F2EEFF] text-[#6A4FA0]",
  },
  "panas-uv": {
    icon: Sun,
    tile: "bg-[#FFF1E2] text-[#B0631F]",
    badge: "bg-[#FFF1E2] text-[#9A5A1F]",
  },
  udara: {
    icon: Wind,
    tile: "bg-[#E8F3FB] text-[#2F78A8]",
    badge: "bg-[#E8F3FB] text-[#2D6A93]",
  },
  perempuan: {
    icon: Leaf,
    tile: "bg-[#FDEBF2] text-[#B84E73]",
    badge: "bg-[#FDEBF2] text-[#A6406B]",
  },
  penelitian: {
    icon: BookOpen,
    tile: "bg-[#EAF5EC] text-[#427D55]",
    badge: "bg-[#EAF5EC] text-[#3E6E4B]",
  },
};

function getStyle(category) {
  return CATEGORY_STYLE[category] ?? CATEGORY_STYLE.data;
}

// Ikon kategori: video animasi bila tersedia, selain itu ikon lucide.
function CategoryIcon({
  category,
  className = "",
  iconClassName = "",
}) {
  const style = getStyle(category);

  if (style.media) {
    return (
      <video
        src={style.media}
        poster={style.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className={`shrink-0 object-cover ${className}`}
      />
    );
  }

  const Icon = style.icon;

  return (
    <div
      className={`flex shrink-0 items-center justify-center ${style.tile} ${className}`}
    >
      <Icon className={iconClassName} strokeWidth={1.6} />
    </div>
  );
}

function getCategoryLabel(category) {
  return (
    GLOSSARY_CATEGORIES.find((item) => item.value === category)?.label ??
    "Istilah"
  );
}

// Artikel Info & Edukasi yang memakai istilah ini.
function getArticlesUsingTerm(termId) {
  return educationArticles.filter((article) =>
    (article.terms ?? []).includes(termId)
  );
}

// Istilah pilihan hari ini: berganti setiap hari.
function getTermOfTheDay(date) {
  const dayNumber = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) /
      86400000
  );

  const sorted = [...GLOSSARY].sort((a, b) =>
    a.term.localeCompare(b.term, "id")
  );

  return sorted[dayNumber % sorted.length];
}

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("semua");
  const [sortOrder, setSortOrder] = useState("az");
  const [limit, setLimit] = useState(PAGE_SIZE);

  // "jelajahi" = daftar istilah, "kartu" = Kartu Belajar, "kuis" = Kuis.
  const [mode, setMode] = useState("jelajahi");
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [termOfTheDay, setTermOfTheDay] = useState(null);

  // Progres tidak disimpan dan kembali ke 0 saat halaman dimuat ulang.
  const [understood, setUnderstood] = useState(() => new Set());

  const closeButtonRef = useRef(null);
  const modeSectionRef = useRef(null);

  // Istilah pilihan hari ini dan pembukaan istilah dari URL.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setTermOfTheDay(getTermOfTheDay(new Date()));

      const termId = new URLSearchParams(
        window.location.search
      ).get("istilah");

      const term = GLOSSARY.find((item) => item.id === termId);

      if (term) setSelectedTerm(term);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  // Popup: kunci scroll halaman, tutup dengan Escape, fokus ke tombol tutup.
  useEffect(() => {
    if (!selectedTerm) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedTerm(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    const frame = requestAnimationFrame(() =>
      closeButtonRef.current?.focus()
    );

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(frame);
    };
  }, [selectedTerm]);

  const categoryCounts = useMemo(() => {
    const counts = { semua: GLOSSARY.length };

    for (const item of GLOSSARY) {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    }

    return counts;
  }, []);

  // Istilah pada topik terpilih tanpa pencarian.
  const categoryTerms = useMemo(
    () =>
      GLOSSARY.filter(
        (item) =>
          activeCategory === "semua" ||
          item.category === activeCategory
      ).sort((a, b) => a.term.localeCompare(b.term, "id")),
    [activeCategory]
  );

  const visibleTerms = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const filtered = categoryTerms.filter((item) => {
      if (!keyword) return true;

      const relatedNames = (item.related ?? [])
        .map(
          (id) => GLOSSARY.find((term) => term.id === id)?.term
        )
        .filter(Boolean)
        .join(" ");

      return [
        item.term,
        item.definition,
        item.note,
        relatedNames,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });

    return sortOrder === "za" ? [...filtered].reverse() : filtered;
  }, [categoryTerms, search, sortOrder]);

  const shownTerms = visibleTerms.slice(0, limit);
  const progress = Math.round(
    (understood.size / GLOSSARY.length) * 100
  );

  function changeCategory(value) {
    setActiveCategory(value);
    setLimit(PAGE_SIZE);
  }

  function changeSearch(value) {
    setSearch(value);
    setLimit(PAGE_SIZE);
  }

  function openMode(value) {
    setMode(value);

    requestAnimationFrame(() =>
      modeSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    );
  }

  function toggleUnderstood(termId) {
    setUnderstood((previous) => {
      const next = new Set(previous);

      if (next.has(termId)) {
        next.delete(termId);
      } else {
        next.add(termId);
      }

      return next;
    });
  }

  function openRelatedTerm(relatedId) {
    const term = GLOSSARY.find((item) => item.id === relatedId);

    if (term) setSelectedTerm(term);
  }

  return (
    <main className="min-h-screen bg-[#FFF8FB] text-[#332A35]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/education"
            className="font-semibold text-[#8E3E5E] transition-colors hover:text-[#B84E73]"
          >
            Info &amp; Edukasi
          </Link>

          <ChevronRight className="size-4 text-[#B8AAB3]" />

          <span
            aria-current="page"
            className="font-bold text-[#332A35]"
          >
            Glosarium
          </span>
        </nav>

        {/* Hero */}
        <section className="relative isolate overflow-hidden rounded-[28px] border border-[#F0DFE7] bg-white p-5 shadow-[0_5px_24px_rgb(120_70_90_/_6%)] sm:p-7 lg:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 -z-10 size-64 rounded-full bg-[#F8E8EF] opacity-80 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 right-36 -z-10 size-56 rounded-full bg-[#E9F2EA] opacity-90 blur-3xl"
          />

          <div className="relative grid items-center gap-5 lg:grid-cols-[1fr_320px] lg:gap-6">
            {/* Konten teks */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#EAD7E0] bg-[#FFF8FB] px-3.5 py-2 text-sm font-extrabold text-[#984568]">
                <BookOpen className="size-4" />
                Glosarium Sycle
              </div>

              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.17em] text-[#B84E73]">
                INFO &amp; EDUKASI · GLOSARIUM
              </p>

              <h1 className="mt-3 max-w-[680px] text-3xl font-extrabold leading-tight tracking-[-0.035em] sm:text-4xl lg:text-[42px]">
                Satu istilah,
                <span className="block text-[#B84E73]">
                  satu pemahaman baru.
                </span>
              </h1>

              <p className="mt-4 max-w-[620px] text-base leading-7 text-[#756774] sm:text-lg sm:leading-8">
                Jelajahi istilah kesehatan perempuan dan lingkungan
                dengan cara yang lebih mudah dipahami. Bangun pemahaman
                baru melalui penjelasan, kartu belajar, dan kuis interaktif.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#EAD7E0] bg-[#FFF8FB] px-4 py-2 text-sm font-bold text-[#765C6D]">
                <Sparkles className="size-4 text-[#B84E73]" />
                {GLOSSARY.length} istilah untuk dipelajari
              </div>
            </div>

            {/* Ilustrasi */}
            <div className="hidden items-center justify-center lg:flex">
              <video
                src="/brand/glossary-hero.mp4"
                poster="/brand/glossary-hero-poster.webp"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                className="h-[300px] w-[300px] rounded-[24px] object-cover"
              />
            </div>
          </div>
        </section>

        {/* Istilah pilihan hari ini + progres belajar */}
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="relative overflow-hidden rounded-[24px] border border-[#F6DEC8] bg-[#FFF7EE] p-6 sm:p-7">
            <p className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#B84E73]">
              Istilah Pilihan Hari Ini
              <Sparkles className="size-4 text-[#E2A63B]" />
            </p>

            {termOfTheDay ? (
              <div className="mt-3 flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                    {termOfTheDay.term}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6E5F6C]">
                    {termOfTheDay.definition}
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelectedTerm(termOfTheDay)}
                    className={`mt-5 ${PRIMARY_BUTTON}`}
                  >
                    Pelajari Sekarang
                    <ArrowRight className="size-4" />
                  </button>
                </div>

                <CategoryIcon
                  category={termOfTheDay.category}
                  className="hidden size-24 rounded-[28px] sm:flex"
                  iconClassName="size-12"
                />
              </div>
            ) : (
              <div className="mt-3 h-[124px] animate-pulse rounded-2xl bg-white/60" />
            )}
          </div>

          <div className="rounded-[24px] border border-[#E6DDF6] bg-[#F7F3FD] p-6 sm:p-7">
            <p className="inline-flex items-center gap-2 font-extrabold">
              <Target className="size-5 text-[#B84E73]" />
              Progres Belajar
            </p>

            <p className="mt-3 text-sm text-[#6E5F6C]">
              <span className="text-lg font-extrabold text-[#B84E73]">
                {understood.size}
              </span>{" "}
              dari{" "}
              <span className="font-extrabold">
                {GLOSSARY.length}
              </span>{" "}
              istilah dipahami
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div
                className="h-2.5 flex-1 overflow-hidden rounded-full bg-white"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label="Progres belajar"
              >
                <div
                  className="h-full rounded-full bg-[#B84E73] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="text-sm font-extrabold">
                {progress}%
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => openMode("kartu")}
                className={SOFT_BUTTON}
              >
                <Layers className="size-5 shrink-0" />
                Kartu Belajar
              </button>

              <button
                type="button"
                onClick={() => openMode("kuis")}
                className={SOFT_BUTTON}
              >
                <Trophy className="size-5 shrink-0" />
                Kuis
              </button>
            </div>

            <p className="mt-3 text-xs text-[#8A7A85]">
              Progres tidak disimpan dan kembali ke 0 saat halaman
              dimuat ulang.
            </p>
          </div>
        </section>

        {/* Jelajahi / Kartu Belajar / Kuis */}
        <section
          ref={modeSectionRef}
          className="mt-10 scroll-mt-24"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight">
              {mode === "kartu"
                ? "Kartu Belajar"
                : mode === "kuis"
                  ? "Kuis Istilah"
                  : "Jelajahi semua istilah"}
            </h2>

            {mode !== "jelajahi" && (
              <button
                type="button"
                onClick={() => setMode("jelajahi")}
                className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold text-[#8E3E5E] transition-colors hover:bg-[#F8E8EF] hover:text-[#B84E73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
              >
                <ArrowLeft className="size-4" />
                Kembali ke daftar istilah
              </button>
            )}
          </div>

          {mode === "jelajahi" && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#A08D9C]" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    changeSearch(event.target.value)
                  }
                  placeholder='Cari istilah, misalnya "ISPU", "menopause", atau "UV"'
                  aria-label="Cari istilah glosarium"
                  className="h-12 w-full rounded-full border border-[#E9DCE3] bg-white pl-12 pr-4 text-sm outline-none transition placeholder:text-[#B2A2AE] focus:border-[#B84E73] focus:ring-4 focus:ring-[#B84E73]/10"
                />
              </div>

              <label className="relative">
                <span className="sr-only">Urutkan istilah</span>

                <select
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(event.target.value)
                  }
                  className="h-12 w-full appearance-none rounded-full border border-[#E9DCE3] bg-white pl-5 pr-11 text-sm font-bold text-[#514351] outline-none transition focus:border-[#B84E73] focus:ring-4 focus:ring-[#B84E73]/10 sm:w-auto"
                >
                  <option value="az">Urutkan: A – Z</option>
                  <option value="za">Urutkan: Z – A</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#8A7A85]" />
              </label>
            </div>
          )}

          {/* Filter topik */}
          <div
            className="mt-4 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter topik istilah"
          >
            {[{ value: "semua", label: "Semua" }, ...GLOSSARY_CATEGORIES].map(
              (category) => {
                const active =
                  activeCategory === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() =>
                      changeCategory(category.value)
                    }
                    aria-pressed={active}
                    className={`${FILTER_BUTTON} ${
                      active
                        ? "border-[#B84E73] bg-[#B84E73] text-white"
                        : "border-[#E9DCE3] bg-white text-[#514351] hover:border-[#D7A9BC] hover:text-[#984568]"
                    }`}
                  >
                    {category.label} (
                    {categoryCounts[category.value] ?? 0})
                  </button>
                );
              }
            )}
          </div>

          {/* Kartu Belajar */}
          {mode === "kartu" && (
            <div className="mt-6">
              <GlossaryFlashcards
                key={activeCategory}
                terms={categoryTerms}
                understood={understood}
                onToggleUnderstood={toggleUnderstood}
              />
            </div>
          )}

          {/* Kuis */}
          {mode === "kuis" && (
            <div className="mt-6">
              <GlossaryQuiz
                key={activeCategory}
                terms={categoryTerms}
                allTerms={GLOSSARY}
              />
            </div>
          )}

          {/* Daftar istilah */}
          {mode === "jelajahi" &&
            (visibleTerms.length > 0 ? (
              <>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {shownTerms.map((item) => {
                    const style = getStyle(item.category);
                    const isUnderstood = understood.has(item.id);

                    return (
                      <article
                        key={item.id}
                        className="group relative flex gap-4 rounded-[22px] border border-[#F0E3E9] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#E3BFD0] hover:shadow-[0_10px_28px_rgb(120_70_90_/_8%)] sm:p-5"
                      >
                        <CategoryIcon
                          category={item.category}
                          className="size-16 rounded-[20px] sm:size-20"
                          iconClassName="size-8 sm:size-9"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-extrabold leading-snug">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedTerm(item)
                                }
                                className="text-left after:absolute after:inset-0 after:rounded-[22px] group-hover:text-[#984568] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
                              >
                                {item.term}
                              </button>
                            </h3>

                            <button
                              type="button"
                              onClick={() =>
                                toggleUnderstood(item.id)
                              }
                              aria-pressed={isUnderstood}
                              aria-label={
                                isUnderstood
                                  ? `Batalkan tanda paham untuk ${item.term}`
                                  : `Tandai ${item.term} sudah paham`
                              }
                              title={
                                isUnderstood
                                  ? "Sudah paham"
                                  : "Tandai sudah paham"
                              }
                              className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52775B] focus-visible:ring-offset-2 ${
                                isUnderstood
                                  ? "text-[#52775B]"
                                  : "text-[#C9B4C0] hover:bg-[#EDF6EE] hover:text-[#52775B]"
                              }`}
                            >
                              <CheckCircle2
                                className="size-6"
                                fill={
                                  isUnderstood
                                    ? "#E3F1E6"
                                    : "none"
                                }
                              />
                            </button>
                          </div>

                          <span
                            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ${style.badge}`}
                          >
                            {getCategoryLabel(item.category)}
                          </span>

                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#625666]">
                            {item.definition}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col items-center gap-2">
                  <p
                    className="text-sm text-[#827382]"
                    aria-live="polite"
                  >
                    Menampilkan {shownTerms.length} dari{" "}
                    {visibleTerms.length} istilah
                  </p>

                  {shownTerms.length < visibleTerms.length && (
                    <button
                      type="button"
                      onClick={() =>
                        setLimit((value) => value + PAGE_SIZE)
                      }
                      className={SECONDARY_BUTTON}
                    >
                      Lihat lebih banyak
                      <ChevronDown className="size-4" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-[#E4CBD7] bg-white px-6 py-14 text-center">
                <Search className="mx-auto size-8 text-[#B84E73]" />

                <h3 className="mt-4 text-xl font-extrabold">
                  Istilah tidak ditemukan
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#827382]">
                  Coba kata kunci lain atau pilih topik “Semua”.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    changeSearch("");
                    changeCategory("semua");
                  }}
                  className={`mt-5 ${PRIMARY_BUTTON}`}
                >
                  Tampilkan semua istilah
                </button>
              </div>
            ))}
        </section>

        {/* Catatan */}
        <section className="mt-12 flex gap-3 rounded-[22px] border border-[#D7E6D9] bg-[#E9F2EA] p-5 sm:p-6">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#52775B]" />

          <p className="text-sm leading-6 text-[#4F6553]">
            <span className="font-extrabold text-[#354A39]">
              Informasi untuk memahami, bukan mendiagnosis.
            </span>{" "}
            Penjelasan glosarium bersifat edukatif dan disusun dari
            sumber di halaman{" "}
            <Link
              href="/education/references"
              className="font-extrabold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52775B] focus-visible:ring-offset-2"
            >
              Referensi
            </Link>
            .
          </p>
        </section>
      </div>

      {/* Popup detail istilah */}
      {selectedTerm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#332A35]/45 backdrop-blur-[3px] sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTerm(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="glossary-modal-title"
            className="relative max-h-[90dvh] w-full max-w-[640px] overflow-y-auto rounded-t-[28px] bg-[#FFFDFE] shadow-2xl sm:rounded-[28px]"
          >
            {/* Tombol tutup */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setSelectedTerm(null)}
              aria-label="Tutup"
              className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full text-[#8A7A85] transition-colors hover:bg-[#F8E8EF] hover:text-[#B84E73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-[#F0E3E9] p-6 pr-14 sm:p-7 sm:pr-16">
              {(() => {
                const style = getStyle(selectedTerm.category);

                return (
                  <div className="flex items-start gap-4">
                    <CategoryIcon
                      category={selectedTerm.category}
                      className="size-14 rounded-2xl"
                      iconClassName="size-6"
                    />

                    <div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ${style.badge}`}
                      >
                        {getCategoryLabel(selectedTerm.category)}
                      </span>

                      <h2
                        id="glossary-modal-title"
                        className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl"
                      >
                        {selectedTerm.term}
                      </h2>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="space-y-5 p-6 sm:p-7">
              <p className="text-base leading-7 text-[#3F3540]">
                {selectedTerm.definition}
              </p>

              {selectedTerm.note && (
                <div className="rounded-2xl bg-[#FFF7EE] p-4">
                  <p className="text-sm font-extrabold text-[#7A4A1F]">
                    Perlu diingat
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#6E5236]">
                    {selectedTerm.note}
                  </p>
                </div>
              )}

              {selectedTerm.related?.some((id) =>
                GLOSSARY.some((term) => term.id === id)
              ) && (
                <div>
                  <h3 className="mb-2 text-sm font-extrabold text-[#514351]">
                    Istilah terkait
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {selectedTerm.related.map((id) => {
                      const related = GLOSSARY.find(
                        (term) => term.id === id
                      );

                      if (!related) return null;

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => openRelatedTerm(id)}
                          className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#E7D5DE] bg-white px-4 text-sm font-bold text-[#984568] transition-colors hover:border-[#D7A9BC] hover:bg-[#FFF4F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
                        >
                          {related.term}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {getArticlesUsingTerm(selectedTerm.id).length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-extrabold text-[#514351]">
                    Dipakai di artikel
                  </h3>

                  <ul className="space-y-2">
                    {getArticlesUsingTerm(selectedTerm.id).map(
                      (article) => (
                        <li key={article.slug}>
                          <Link
                            href={`/education/${article.slug}`}
                            className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-[#E7D5DE] bg-white px-4 py-2.5 text-sm font-bold text-[#984568] transition-colors hover:border-[#D7A9BC] hover:bg-[#FFF4F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
                          >
                            {article.title}

                            <ChevronRight className="size-4 shrink-0" />
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {selectedTerm.basis && (
                <p className="text-xs leading-5 text-[#8A7A85]">
                  Sumber: {selectedTerm.basis}
                </p>
              )}

              {/* Aksi popup */}
              <div className="flex flex-wrap justify-end gap-2 border-t border-[#F0E3E9] pt-5">
                <button
                  type="button"
                  onClick={() =>
                    toggleUnderstood(selectedTerm.id)
                  }
                  aria-pressed={understood.has(selectedTerm.id)}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52775B] focus-visible:ring-offset-2 ${
                    understood.has(selectedTerm.id)
                      ? "border-[#52775B] bg-[#52775B] text-white"
                      : "border-[#B7D9BE] bg-white text-[#427D55] hover:bg-[#EDF6EE]"
                  }`}
                >
                  <CheckCircle2 className="size-4" />

                  {understood.has(selectedTerm.id)
                    ? "Sudah paham"
                    : "Tandai sudah paham"}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTerm(null)}
                  className={PRIMARY_BUTTON}
                >
                  Selesai membaca
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}