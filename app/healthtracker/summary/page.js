import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Activity,
  Heart,
  Clock3,
  MessageCircle,
  Footprints,
  Sprout,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/session";
import { getMyTrackerEntries } from "@/lib/tracker/records";
import StartNewCheckInButton from "@/components/healthtracker/StartNewCheckInButton";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Ringkasan Hari Ini | Health Tracker",
};

// --------------------------------------------------
// FORMAT TANGGAL JAKARTA
// --------------------------------------------------

function getJakartaDateKey() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

// --------------------------------------------------
// KARTU CATATAN CHECK-IN
// --------------------------------------------------

function SummaryCard({ entry, index }) {
  return (
    <article className="rounded-[22px] border border-[#F0E2E9] bg-white p-5 shadow-[0_5px_24px_rgb(120_70_90_/_6%)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-bold text-[#8E3E5E]">
          <Heart size={14} />
          {entry.condition || "Catatan umum"}
        </span>

        <span className="inline-flex items-center gap-1.5 text-xs text-[#817681]">
          <Clock3 size={14} />
          {entry.time || "Waktu tidak tersedia"}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-extrabold text-[#332A35]">
        Check-In {index + 1}
      </h3>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F1F7] text-[#64869E]">
            <Footprints size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-[#958995]">Aktivitas</p>
            <p className="mt-1 break-words text-sm font-semibold text-[#463C48]">
              {entry.activity || "Belum dicatat"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E9F2EA] text-[#64866A]">
            <Activity size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-[#958995]">
              Kenyamanan tubuh
            </p>
            <p className="mt-1 break-words text-sm font-semibold text-[#463C48]">
              {entry.comfort || "Belum dicatat"}
            </p>
          </div>
        </div>
      </div>

      {entry.story && (
        <div className="mt-5 rounded-2xl bg-[#FFF8FB] p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#463C48]">
            <MessageCircle size={16} className="text-[#B84E73]" />
            Cerita hari ini
          </div>

          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-[#766D78]">
            {entry.story}
          </p>
        </div>
      )}
    </article>
  );
}

// --------------------------------------------------
// KARTU STATISTIK
// --------------------------------------------------

function SummaryStat({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-[20px] border border-[#F0E2E9] bg-white p-5 shadow-[0_5px_24px_rgb(120_70_90_/_6%)]">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F8E8EF] text-[#B84E73]">
          <Icon size={19} />
        </div>

        <p className="text-sm font-semibold text-[#766D78]">
          {label}
        </p>
      </div>

      <p className="mt-4 text-2xl font-extrabold text-[#332A35]">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-[#958995]">
        {description}
      </p>
    </div>
  );
}

// --------------------------------------------------
// HALAMAN RINGKASAN
// --------------------------------------------------

export default function HealthTrackerSummaryPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto min-h-[60vh] max-w-6xl px-5 py-10 sm:px-6">
          <p className="text-sm text-[#817681]">
            Memuat ringkasan hari ini...
          </p>
        </main>
      }
    >
      <Content />
    </Suspense>
  );
}

// --------------------------------------------------
// KONTEN UTAMA
// --------------------------------------------------

async function Content() {
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/healthtracker/summary");
  }

  const { entries = [] } = await getMyTrackerEntries();

  const todayKey = getJakartaDateKey();
  const todayLabel = getTodayLabel();

  // Hanya menampilkan catatan dengan tanggal hari ini.
  const todayEntries = entries.filter(
    (entry) => entry.dateKey === todayKey
  );

  const totalToday = todayEntries.length;

  const recordedConditions = new Set(
    todayEntries
      .map((entry) => entry.condition)
      .filter(Boolean)
  ).size;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 sm:py-10">

      {/* BREADCRUMB */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm"
      >
        <Link
          href="/healthtracker"
          className="font-semibold text-[#8E3E5E] transition-colors hover:text-[#B84E73]"
        >
          Health Tracker
        </Link>

        <ChevronRight
          size={15}
          className="text-[#B8AAB3]"
        />

        <span
          aria-current="page"
          className="font-bold text-[#332A35]"
        >
          Ringkasan
        </span>
      </nav>

      {/* PAGE HEADER */}
      <header className="mt-7">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-bold text-[#8E3E5E]">
          <Sprout size={15} />
          RINGKASAN HARIAN
        </div>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#332A35] sm:text-3xl lg:text-4xl">
          Bagaimana harimu?
        </h1>

        <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#8E3E5E]">
          <CalendarDays size={16} />
          {todayLabel}
        </p>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#766D78] sm:text-base">
          Lihat kembali pengalaman yang sudah kamu catat hari ini.
          Ringkasan ini membantumu mengingat aktivitas, kondisi,
          dan cerita yang kamu bagikan.
        </p>
      </header>

      {/* IKHTISAR HARI INI */}
      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-[#332A35]">
            Ikhtisar Hari Ini
          </h2>

          <p className="mt-1 text-sm text-[#817681]">
            Gambaran dari Check-In yang kamu lakukan hari ini.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryStat
            icon={ClipboardList}
            label="Check-In Hari Ini"
            value={totalToday}
            description="Jumlah catatan yang tersimpan hari ini."
          />

          <SummaryStat
            icon={Heart}
            label="Konteks Kondisi"
            value={recordedConditions}
            description="Jumlah konteks kondisi berbeda yang dicatat."
          />
        </div>
      </section>

      {/* CATATAN HARI INI */}
      <section className="mt-9">
        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-[#332A35]">
            Catatan Hari Ini
          </h2>

          <p className="mt-1 text-sm text-[#817681]">
            {totalToday > 0
              ? `${totalToday} catatan Check-In ditemukan untuk hari ini.`
              : "Belum ada catatan Check-In untuk hari ini."}
          </p>
        </div>

        {todayEntries.length > 0 ? (
          <div className="space-y-4">
            {todayEntries.map((entry, index) => (
              <SummaryCard
                key={entry.id}
                entry={entry}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#E8CBD7] bg-white px-5 py-10 text-center sm:px-8">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73]">
              <CalendarDays
                size={28}
                strokeWidth={1.6}
              />
            </div>

            <h3 className="mt-5 text-lg font-extrabold text-[#332A35]">
              Belum Ada Check-In Hari Ini
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#817681]">
              Belum ada pengalaman yang kamu catat hari ini.
              Kamu bisa mulai dengan check-in untuk mendokumentasikan
              kondisi tubuh dan aktivitasmu.
            </p>
          </div>
        )}
      </section>

      {/* NAVIGASI */}
      <section className="mt-9 rounded-[24px] border border-[#F0DFE7] bg-[#F8E8EF] p-5 sm:p-7">
        <h2 className="text-lg font-extrabold text-[#332A35]">
          Lanjutkan Perjalananmu
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[#766D78]">
          Kamu bisa melihat catatan dari hari-hari sebelumnya
          atau membuat Check-In baru untuk mencatat pengalamanmu.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">

          {/* TOMBOL RIWAYAT */}
          <Button
            nativeButton={false}
            render={<Link href="/healthtracker/history" />}
            variant="outline"
            size="lg"
            className="h-11 min-h-11 w-full rounded-full border-[#DDBBC9] px-5 text-sm font-bold !text-[#8E3E5E] hover:bg-[#FFF8FB] hover:!text-[#8E3E5E] sm:w-auto"
          >
            <CalendarDays size={17} />
            Lihat Riwayat
            <ArrowRight size={16} />
          </Button>

          {/* TOMBOL CHECK-IN BARU */}
          <StartNewCheckInButton />

        </div>
      </section>

      {/* DISCLAIMER */}
      <footer className="mt-8 border-t border-[#F0E2E9] pt-5">
        <p className="text-xs leading-6 text-[#958995]">
          Ringkasan ini menampilkan catatan yang kamu simpan pada
          tanggal hari ini. Informasi yang ditampilkan merupakan
          dokumentasi pengalaman pribadi, bukan diagnosis atau
          pengganti konsultasi tenaga kesehatan.
        </p>
      </footer>
    </main>
  );
}