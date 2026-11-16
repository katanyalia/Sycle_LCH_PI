"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Heart,
  CalendarDays,
  Clock3,
  ArrowRight,
  ArrowUpRight,
  Activity,
  Sprout,
  ClipboardList,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import StartHealthTrackerButton from "./StartHealthTrackerButton";

function StatCard({ label, value, description, icon: Icon }) {
  return (
    <div className="group rounded-[22px] border border-[#F0E2E9] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgb(120_70_90_/_8%)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#8A7D89]">
          {label}
        </p>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73]">
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-5 break-words text-2xl font-extrabold text-[#332A35] sm:text-3xl">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[#8A7D89] sm:text-sm">
        {description}
      </p>
    </div>
  );
}

export default function TrackerDashboard({
  entries = [],
  loadError = "",
  displayName = "Teman SYCLE",
  isNewUser = false,
}) {
  const router = useRouter();
  const [showWelcome] = useState(isNewUser);

  useEffect(() => {
    if (isNewUser) {
      router.replace("/healthtracker", { scroll: false });
    }
  }, [isNewUser, router]);

  const latestEntry = entries[0] ?? null;

  const totalCheckIns = entries.length;
  const lastCheckIn = latestEntry?.date || "Belum ada";

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 sm:py-10">

      {/* DAILY CHECK-IN */}
      <section className="relative isolate mb-9 overflow-hidden rounded-[28px] border border-[#F0DFE7] bg-white px-6 py-9 shadow-[0_5px_24px_rgb(120_70_90_/_6%)] sm:px-9 sm:py-11 lg:px-12 lg:py-12">

        {/* BACKGROUND DECORATION */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 -z-10 size-64 rounded-full bg-[#F8E8EF] opacity-80 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 right-24 -z-10 size-64 rounded-full bg-[#E9F2EA] opacity-90 blur-3xl"
        />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_300px] lg:gap-12">

          {/* TEXT CONTENT */}
          <div className="max-w-[680px]">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#EAD7E0] bg-[#FFF8FB]/90 px-3.5 py-2 text-sm font-bold text-[#984568]">
              <Heart className="size-4" />
              Daily Check-In
            </div>

            <h2 className="max-w-[650px] text-3xl font-extrabold leading-tight tracking-[-0.035em] text-[#332A35] sm:text-4xl lg:text-[42px]">
              Bagaimana keadaanmu hari ini?
              <span className="block text-[#B84E73]">
                Yuk, kenali tubuhmu.
              </span>
            </h2>

            <p className="mt-5 max-w-[590px] text-base leading-7 text-[#756774] sm:text-lg sm:leading-8">
              Luangkan beberapa menit untuk mencatat pengalaman
              tubuh, aktivitas sehari-hari, dan situasi lingkungan
              yang kamu alami. Setiap cerita berharga untuk
              memahami dirimu.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {/* TOMBOL UTAMA */}
              <StartHealthTrackerButton />

              {/* RIWAYAT */}
              <Button
                nativeButton={false}
                render={<Link href="/healthtracker/history" />}
                variant="outline"
                size="lg"
                className="h-11 min-h-11 rounded-full border-[#E8D5DE] bg-white px-5 text-sm font-bold !text-[#8E3E5E] hover:border-[#B84E73] hover:bg-[#FFF8FB]"
              >
                <CalendarDays size={16} />
                Lihat Riwayat
              </Button>

              {/* RINGKASAN */}
              <Button
                nativeButton={false}
                render={<Link href="/healthtracker/summary" />}
                size="lg"
                className="h-11 min-h-11 rounded-full border-0 bg-[#F8E8EF] px-5 text-sm font-bold !text-[#8E3E5E] hover:bg-[#F0DCE6]"
              >
                <ClipboardList size={16} />
                Lihat Ringkasan
              </Button>
            </div>
          </div>

          {/* HERO ILLUSTRATION */}
          <div className="hidden lg:flex lg:justify-center">
            <div className="relative size-[300px] overflow-hidden rounded-[32px]">
              <Image
                src="/images/healthtracker/daily-illustration.jpg"
                alt="Ilustrasi perempuan dan kepedulian terhadap kesehatan diri"
                fill
                priority
                sizes="300px"
                className="object-contain"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ERROR MESSAGE */}
      {loadError && (
        <div
          role="alert"
          className="mb-7 rounded-2xl border border-[#F0D6A8] bg-[#FFF4E5] p-4 text-sm leading-6 text-[#7A4B00]"
        >
          {loadError}
        </div>
      )}

      {/* STATISTICS */}
      <section className="mb-9">
        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-[#332A35]">
            Perkembangan Catatanmu
          </h2>

          <p className="mt-1.5 text-sm text-[#8A7D89]">
            Perjalanan kecil untuk lebih memahami tubuhmu.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            label="Total Check-In"
            value={totalCheckIns}
            description="Seluruh catatan kesehatan yang tersimpan"
            icon={ClipboardList}
          />

          <StatCard
            label="Check-In Terakhir"
            value={lastCheckIn}
            description={
              latestEntry
                ? "Tanggal pencatatan terakhirmu"
                : "Belum ada aktivitas pencatatan"
            }
            icon={CalendarDays}
          />
        </div>
      </section>

      {/* LATEST ENTRY */}
      <section className="mb-9 overflow-hidden rounded-[24px] border border-[#F0E2E9] bg-white shadow-[0_5px_24px_rgb(120_70_90_/_5%)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F5EAF0] px-6 py-5 sm:px-7">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#B84E73]">
              CATATAN TERBARU
            </p>

            <h2 className="mt-2 text-xl font-extrabold text-[#332A35]">
              Check-In Terakhirmu
            </h2>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F8E8EF] text-[#B84E73]">
            <Clock3 size={21} />
          </div>
        </div>

        {latestEntry ? (
          <div className="p-6 sm:p-7">
            {/* DATE */}
            <div className="flex items-center gap-2 text-[#B84E73]">
              <CalendarDays size={17} />

              <p className="text-base font-extrabold sm:text-lg">
                {latestEntry.date}
              </p>
            </div>

            {/* CONDITION */}
            <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-[#332A35]">
              {latestEntry.condition || "Check-In Harian"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#8A7D89]">
              Catatan kondisi dan pengalaman kesehatanmu.
            </p>

            {/* ACTIVITY & COMFORT */}
            {(latestEntry.activity || latestEntry.comfort) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {latestEntry.activity && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#F8E8EF] px-4 py-2 text-xs font-bold text-[#8E3E5E]">
                    <Activity size={14} />
                    {latestEntry.activity}
                  </span>
                )}

                {latestEntry.comfort && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#E9F2EA] px-4 py-2 text-xs font-bold text-[#426B4A]">
                    <Heart size={14} />
                    {latestEntry.comfort}
                  </span>
                )}
              </div>
            )}

          </div>
        ) : (
          <div className="px-6 py-10 text-center sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73]">
              <Heart size={29} strokeWidth={1.5} />
            </div>

            <h3 className="mt-5 font-extrabold text-[#332A35]">
              Belum Ada Catatan
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6F6570]">
              Cerita dan catatan kesehatan pertamamu akan
              muncul di sini setelah menyelesaikan Daily Check-In.
            </p>
          </div>
        )}
      </section>

      {/* HEALTH JOURNEY */}
      <section className="relative overflow-hidden rounded-[24px] border border-[#D7E6D9] bg-[#E9F2EA] p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 rounded-full border-[28px] border-white/30"
        />

        <div className="relative z-10">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#426B4A]">
              <Sprout size={22} />
            </div>

            <div className="max-w-xl">
              <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#426B4A]">
                PERJALANANMU
              </p>

              <h2 className="mt-2 text-xl font-extrabold text-[#332A35] sm:text-2xl">
                Setiap Catatan Punya Cerita
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#5F7162]">
                Setiap check-in menyimpan pengalaman yang
                berbeda. Lihat kembali catatanmu untuk
                memahami perubahan kondisi tubuh, aktivitas,
                dan lingkungan dari waktu ke waktu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <footer className="mt-9 border-t border-[#F0E2E9] pt-5">
        <p className="text-xs leading-6 text-[#8A7D89]">
          Health Tracker membantu mendokumentasikan pengalaman
          kesehatan dan mengenali pola dari waktu ke waktu.
          Informasi yang ditampilkan bukan merupakan diagnosis
          atau pengganti konsultasi tenaga kesehatan.
        </p>
      </footer>
    </main>
  );
}