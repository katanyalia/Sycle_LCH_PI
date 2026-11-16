"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Baby,
  BookOpen,
  CalendarHeart,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  HandHeart,
  ShieldCheck,
  Sun,
  SunMedium,
  Wind,
} from "lucide-react";

import { educationArticles } from "@/data/education";
import { EVIDENCE_SOURCES } from "@/data/education/references";
import { GUIDANCE_CATEGORIES } from "@/data/education/guidance";

/* =========================
   BUTTON STYLES
========================= */

const PRIMARY_BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-transparent !bg-[#B84E73] px-5 text-sm font-bold !text-white shadow-sm transition-colors duration-200 hover:!bg-[#8E3E5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2";

const SECONDARY_BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E8D5DE] bg-white px-5 text-sm font-bold text-[#8E3E5E] transition-colors duration-200 hover:border-[#B84E73] hover:bg-[#FFF8FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2";

const SOFT_BUTTON =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#E8D5DE] bg-[#FFF8FB] px-4 text-sm font-bold text-[#8E3E5E] transition-colors duration-200 hover:border-[#B84E73] hover:bg-[#F8E8EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2";

/* =========================
   CATEGORY UI
========================= */

const CATEGORY_UI = {
  panas: {
    label: "Cuaca Panas",
    icon: Sun,
    bg: "#FFF1E5",
    color: "#D78B35",
  },
  "kualitas-udara": {
    label: "Kualitas Udara Buruk",
    icon: Wind,
    bg: "#E8F1F7",
    color: "#4789B2",
  },
  uv: {
    label: "Indeks UV Tinggi",
    icon: SunMedium,
    bg: "#EEEAF8",
    color: "#8066BC",
  },
  menstruasi: {
    label: "Menstruasi",
    icon: CalendarHeart,
    bg: "#F8E8EF",
    color: "#B84E73",
  },
  kehamilan: {
    label: "Kehamilan",
    icon: Baby,
    bg: "#E9F2EA",
    color: "#57936B",
  },
  menyusui: {
    label: "Menyusui",
    icon: HandHeart,
    bg: "#F5EDF8",
    color: "#9A6DB1",
  },
};

/* =========================
   HELPERS
========================= */

function getReferences(referenceIds = []) {
  return referenceIds
    .map((id) => EVIDENCE_SOURCES.find((source) => source.id === id))
    .filter(Boolean);
}

function getArticles(slugs = []) {
  return slugs
    .map((slug) =>
      educationArticles.find((article) => article.slug === slug)
    )
    .filter(Boolean);
}

/* =========================
   GUIDANCE STEP
========================= */

function GuidanceStep({
  step,
  index,
  isOpen,
  onToggle,
  idPrefix,
}) {
  const buttonId = `${idPrefix}-step-${index}`;
  const panelId = `${buttonId}-panel`;
  const Chevron = isOpen ? ChevronUp : ChevronDown;

  return (
    <li className="overflow-hidden rounded-2xl border border-[#F0E3E9] bg-white transition-colors duration-200">
      <h4>
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex min-h-[68px] w-full items-center gap-3 rounded-2xl p-4 text-left transition-colors duration-200 hover:bg-[#FFF8FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B84E73]"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F8E8EF] text-sm font-extrabold text-[#B84E73]">
            {index + 1}
          </span>

          <span className="flex-1 text-sm font-extrabold leading-6 text-[#332A35] sm:text-base">
            {step.action}
          </span>

          <Chevron
            className="size-5 shrink-0 text-[#984568]"
            aria-hidden="true"
          />
        </button>
      </h4>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-4 pb-5 pl-[60px] text-sm leading-7 text-[#6F6370]">
            {step.reason}
          </p>
        </div>
      </div>
    </li>
  );
}

/* =========================
   MAIN PAGE
========================= */

export default function EducationGuidancePage() {
  const [activeId, setActiveId] = useState(null);
  const [openSteps, setOpenSteps] = useState(() => new Set([0]));

  const panelRef = useRef(null);

  const active = GUIDANCE_CATEGORIES.find(
    (category) => category.id === activeId
  );

  const activeUi = active ? CATEGORY_UI[active.id] : null;
  const ActiveIcon = activeUi?.icon;

  const activeArticles = active
    ? getArticles(active.articles)
    : [];

  const activeReferences = active
    ? getReferences(active.references)
    : [];

  function selectCategory(id) {
    setActiveId(id);
    setOpenSteps(new Set([0]));

    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }

  function toggleStep(index) {
    setOpenSteps((previous) => {
      const next = new Set(previous);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  }

  function toggleAllSteps() {
    if (!active) return;

    setOpenSteps((previous) =>
      previous.size === active.steps.length
        ? new Set()
        : new Set(active.steps.map((_, index) => index))
    );
  }

  const allStepsOpen =
    active && openSteps.size === active.steps.length;

  return (
    <main className="min-h-screen bg-[#FFF8FB] px-4 py-8 text-[#332A35] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* BREADCRUMB */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-sm"
        >
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
            Panduan Perlindungan
          </span>
        </nav>

        {/* HERO */}
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
                Panduan Sycle
              </div>

              <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.17em] text-[#B84E73]">
                INFO &amp; EDUKASI · PANDUAN
              </p>

              <h1 className="mt-3 max-w-[680px] text-3xl font-extrabold leading-tight tracking-[-0.035em] sm:text-4xl lg:text-[46px]">
                Kenali paparannya,
                <span className="block text-[#B84E73]">
                  pahami perlindungannya.
                </span>
              </h1>

              <p className="mt-5 max-w-[620px] text-base leading-7 text-[#756774] sm:text-lg sm:leading-8">
                Temukan panduan edukatif mengenai paparan lingkungan,
                cuaca, kualitas udara, dan sinar ultraviolet dalam
                aktivitas sehari-hari.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#EAD7E0] bg-[#FFF8FB] px-4 py-2 text-sm font-bold text-[#765C6D]">
                <ShieldCheck className="size-4 text-[#B84E73]" />
                {GUIDANCE_CATEGORIES.length} panduan berbasis sumber tepercaya
              </div>
            </div>

            <div className="hidden justify-center lg:flex">
              <Image
                src="/brand/guidance-hero.webp"
                alt=""
                width={458}
                height={640}
                priority
                className="h-auto w-[210px] mix-blend-multiply"
              />
            </div>
          </div>
        </section>

        {/* STEP 1: SELECT CATEGORY */}

        <section className="mt-10" aria-labelledby="pilih-kondisi">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#B84E73]">
              LANGKAH 1
            </p>

            <h2
              id="pilih-kondisi"
              className="mt-2 text-xl font-extrabold sm:text-2xl"
            >
              Pilih kondisi, temukan panduan
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#786B77]">
              Pilih kondisi lingkungan atau kondisimu untuk melihat
              langkah perlindungannya.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {GUIDANCE_CATEGORIES.map((category) => {
              const ui = CATEGORY_UI[category.id];

              if (!ui) return null;

              const Icon = ui.icon;
              const selected = category.id === activeId;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(category.id)}
                  aria-pressed={selected}
                  aria-controls="panel-panduan"
                  className={`relative flex min-h-[108px] flex-col items-start gap-3 rounded-[22px] border-2 bg-white p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgb(120_70_90_/_8%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2 sm:min-h-[100px] sm:flex-row sm:items-center sm:p-5 ${
                    selected
                      ? "shadow-[0_10px_26px_rgb(120_70_90_/_10%)]"
                      : "border-[#F0E3E9] hover:border-[#E5C6D4]"
                  }`}
                  style={
                    selected
                      ? { borderColor: ui.color }
                      : undefined
                  }
                >
                  <span
                    className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: ui.bg,
                      color: ui.color,
                    }}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </span>

                  <span className="flex-1 text-sm font-extrabold leading-snug text-[#332A35] sm:text-base">
                    {ui.label}
                  </span>

                  {selected && (
                    <CheckCircle2
                      className="absolute right-3 top-3 size-5 sm:static"
                      style={{ color: ui.color }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* STEP 2: SELECTED GUIDANCE */}

        <section
          id="panel-panduan"
          ref={panelRef}
          aria-live="polite"
          className="mt-9 scroll-mt-24"
        >
          {!active ? (
            <div className="rounded-[24px] border border-dashed border-[#E4CBD7] bg-white px-6 py-12 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#F8E8EF]">
                <ShieldCheck
                  className="size-7 text-[#B84E73]"
                  aria-hidden="true"
                />
              </span>

              <h3 className="mt-4 text-base font-extrabold text-[#332A35]">
                Belum ada kondisi yang dipilih
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#786B77]">
                Pilih salah satu kartu di atas untuk melihat panduan
                perlindungannya.
              </p>
            </div>
          ) : (
            <article
              key={active.id}
              className="animate-in fade-in rounded-[24px] border border-[#F0E3E9] bg-white p-5 shadow-[0_5px_24px_rgb(120_70_90_/_5%)] duration-300 sm:p-7"
              aria-labelledby="judul-panduan"
            >
              {/* GUIDANCE HEADER */}

              <div className="flex items-start gap-4">
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: activeUi.bg,
                    color: activeUi.color,
                  }}
                >
                  {ActiveIcon && (
                    <ActiveIcon className="size-6" aria-hidden="true" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#B84E73]">
                    PANDUAN PERLINDUNGAN
                  </p>

                  <h3
                    id="judul-panduan"
                    className="mt-1 text-xl font-extrabold leading-tight sm:text-2xl"
                  >
                    {active.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-[#6F6370]">
                    {active.description}
                  </p>
                </div>
              </div>

              {/* SAFETY NOTICE */}

              <div
                role="note"
                className="mt-6 flex gap-3 rounded-2xl border border-[#F2D6B8] bg-[#FFF6EC] p-4"
              >
                <AlertTriangle
                  className="mt-0.5 size-5 shrink-0 text-[#A35F2A]"
                  aria-hidden="true"
                />

                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[#7A4A1F]">
                    Kapan perlu bantuan?
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#6E5236]">
                    {active.warning}
                  </p>

                  <Link
                    href="/healthcare"
                    className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-sm font-extrabold text-[#7A4A1F] underline-offset-4 transition-colors hover:text-[#984568] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73]"
                  >
                    Temukan fasilitas kesehatan terdekat
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* PROTECTION STEPS */}

              <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#B84E73]">
                    LANGKAH 2
                  </p>

                  <h4 className="mt-1 text-base font-extrabold text-[#332A35]">
                    Langkah perlindungan
                  </h4>
                </div>

                {active.steps.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAllSteps}
                    aria-expanded={Boolean(allStepsOpen)}
                    className={SOFT_BUTTON}
                  >
                    {allStepsOpen ? (
                      <>
                        <ChevronUp className="size-4" />
                        Tutup semua
                      </>
                    ) : (
                      <>
                        <ChevronDown className="size-4" />
                        Buka semua
                      </>
                    )}
                  </button>
                )}
              </div>

              <ol className="mt-4 space-y-3">
                {active.steps.map((step, index) => (
                  <GuidanceStep
                    key={`${active.id}-${index}`}
                    step={step}
                    index={index}
                    idPrefix={active.id}
                    isOpen={openSteps.has(index)}
                    onToggle={() => toggleStep(index)}
                  />
                ))}
              </ol>

              <div className="mt-8 grid gap-4 border-t border-[#F0E7EC] pt-7 md:grid-cols-2">
                {/* ARTIKEL EDUKASI */}
                {activeArticles.length > 0 && (
                  <section className="rounded-[22px] border border-[#F0E3E9] bg-[#FFFCFE] p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F8E8EF] text-[#B84E73]">
                        <BookOpen className="size-5" />
                      </span>

                      <div>
                        <h4 className="font-extrabold text-[#332A35]">
                          Baca selengkapnya
                        </h4>
                        <p className="mt-1 text-xs leading-5 text-[#887986]">
                          Pelajari lebih lanjut melalui artikel edukasi SYCLE.
                        </p>
                      </div>
                    </div>

                    <ul className="mt-5 space-y-2">
                      {activeArticles.map((article) => (
                        <li key={article.slug}>
                          <Link
                            href={`/education/${article.slug}`}
                            className="group flex min-h-[52px] items-center gap-3 rounded-xl border border-[#F0E3E9] bg-white px-3.5 py-3 text-sm font-bold text-[#8E3E5E] transition-all duration-200 hover:border-[#E5C6D4] hover:bg-[#FFF8FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
                          >
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F8E8EF] text-[#B84E73]">
                              <BookOpen className="size-4" />
                            </span>

                            <span className="min-w-0 flex-1 leading-5">
                              {article.title}
                            </span>

                            <ArrowRight className="size-4 shrink-0 text-[#B84E73] transition-transform group-hover:translate-x-1" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* REFERENSI ILMIAH */}
                <section className="rounded-[22px] border border-[#E1EAF0] bg-[#FBFDFF] p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F1F7] text-[#4789B2]">
                      <ShieldCheck className="size-5" />
                    </span>

                    <div>
                      <h4 className="font-extrabold text-[#332A35]">
                        Referensi ilmiah
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-[#887986]">
                        Sumber tepercaya yang mendukung informasi dalam panduan ini.
                      </p>
                    </div>
                  </div>

                  {activeReferences.length > 0 ? (
                    <ul className="mt-5 space-y-2">
                      {activeReferences.map((source) => (
                        <li key={source.id}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex min-h-[60px] items-start gap-3 rounded-xl border border-[#E5EDF2] bg-white px-3.5 py-3 transition-all duration-200 hover:border-[#B8D2E2] hover:bg-[#F5FAFD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4789B2] focus-visible:ring-offset-2"
                          >
                            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#E8F1F7] text-[#4789B2]">
                              <BookOpen className="size-4" />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block text-xs font-extrabold text-[#4789B2]">
                                {source.publisher}
                              </span>

                              <span className="mt-1 block text-sm leading-5 text-[#514351] transition-colors group-hover:text-[#4789B2]">
                                {source.title}
                              </span>
                            </span>

                            <ExternalLink className="mt-1 size-4 shrink-0 text-[#8BA8BA]" />

                            <span className="sr-only">
                              (buka di tab baru)
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-5 rounded-xl bg-white p-4 text-sm leading-6 text-[#887986]">
                      Belum ada referensi yang ditampilkan untuk panduan ini.
                    </p>
                  )}

                  <Link
                    href="/education/references"
                    className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[#D5E3EC] bg-white px-4 py-2 text-sm font-bold text-[#477B9D] transition-colors hover:border-[#4789B2] hover:bg-[#E8F1F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4789B2] focus-visible:ring-offset-2"
                  >
                    Jelajahi semua referensi
                    <ArrowRight className="size-4" />
                  </Link>
                </section>
              </div>
            </article>
          )}
        </section>

        {/* PERSONALIZATION CTA */}

        <section className="mt-10 flex flex-col gap-5 rounded-[24px] border border-[#D7E6D9] bg-[#E9F2EA] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/80">
              <CheckCircle2
                className="size-5 text-[#52775B]"
                aria-hidden="true"
              />
            </span>

            <div>
              <h3 className="font-extrabold text-[#3F5A45]">
                Ingin panduan yang lebih personal?
              </h3>

              <p className="mt-1 max-w-xl text-sm leading-6 text-[#526B56]">
                Isi personalisasi untuk mendapatkan panduan yang
                mempertimbangkan kondisi dan rencana aktivitasmu hari ini.
              </p>
            </div>
          </div>

          <Link
            href="/assessment"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-transparent !bg-[#52775B] px-5 text-sm font-bold !text-white shadow-sm transition-colors duration-200 hover:!bg-[#41613F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52775B] focus-visible:ring-offset-2"
          >
            <BookOpen className="size-4" />
            Mulai Personalisasi
          </Link>
        </section>

        {/* FOOTER */}

        <footer className="mt-10 border-t border-[#EEDFE7] py-6 text-center text-sm leading-6 text-[#8A7A85]">
          Panduan Sycle bersifat edukatif dan tidak menggantikan
          pemeriksaan atau saran dari tenaga kesehatan.
        </footer>
      </div>
    </main>
  );
}