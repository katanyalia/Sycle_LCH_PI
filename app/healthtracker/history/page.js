import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { CalendarDays, ChevronRight  } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/session";
import { getMyTrackerEntries } from "@/lib/tracker/records";
import HistoryCalendar from "@/components/healthtracker/history/HistoryCalendar";

export const metadata = {
  title: "Riwayat Check-In | SYCLE",
  description: "Lihat perjalanan dan catatan Check-In Health Tracker.",
};

function HistoryLoading() {
  return (
    <main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-5">
        <div className="h-6 w-40 rounded bg-[#F0E2E9]" />
        <div className="h-52 rounded-[24px] bg-[#F8E8EF]" />
        <div className="h-40 rounded-[24px] bg-[#F8E8EF]" />
      </div>
    </main>
  );
}

async function HistoryContent() {
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/healthtracker/history");
  }

  const { entries = [], error } = await getMyTrackerEntries();

  return (
    <main className="mx-auto min-h-screen max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm"
      >
        <Link
          href="/healthtracker"
          className="font-semibold text-[#8E3E5E] transition-colors hover:text-[#B84E73]"
        >
          Health Tracker
        </Link>

        <ChevronRight size={15} className="text-[#B8AAB3]" />

        <span
          aria-current="page"
          className="font-bold text-[#332A35]"
        >
          Riwayat
        </span>
      </nav>

      <header className="mt-7 mb-7">
        <div className="flex items-center gap-2 text-[#B84E73]">
          <CalendarDays size={20} />
          <span className="text-sm font-bold">Health Tracker</span>
        </div>

        <h1 className="mt-2 text-2xl font-extrabold text-[#332A35] sm:text-3xl">
          Riwayat Check-In
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#817582]">
          Lihat kembali catatan dan cerita harianmu melalui kalender.
          Pilih tanggal untuk membuka Check-In yang pernah kamu simpan.
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-[#F0D6A8] bg-[#FFF4E5] p-4 text-sm leading-6 text-[#7A4B00]"
        >
          {error}
        </div>
      ) : (
        <HistoryCalendar entries={entries} />
      )}
    </main>
  );
}

export default function HealthTrackerHistoryPage() {
  return (
    <Suspense fallback={<HistoryLoading />}>
      <HistoryContent />
    </Suspense>
  );
}