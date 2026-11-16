import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  UserRoundPen,
  CheckCircle2,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/repositories/profileRepository";

import { ProfileDetailsForm } from "@/components/auth/ProfileDetailsForm";

export const metadata = {
  title: "Informasi Pribadi | SYCLE",
};

async function CompleteProfileContent() {
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const profileResult = await getProfile(supabase, user.id);

  const profile = profileResult.profile ?? {};

  const completedFields = [
    profile.full_name,
    profile.birth_date,
    profile.domicile,
    profile.occupation,
  ].filter((value) => Boolean(value?.toString().trim())).length;

  const completionPercentage = (completedFields / 4) * 100;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-7 flex flex-wrap items-center gap-2 text-xs font-medium text-[#8A7D89] sm:text-sm"
      >
        <Link
          href="/profile"
          className="transition-colors hover:text-[#B84E73]"
        >
          Profil
        </Link>

        <ChevronRight size={15} />

        <Link
          href="/profile/settings"
          className="transition-colors hover:text-[#B84E73]"
        >
          Pengaturan
        </Link>

        <ChevronRight size={15} />

        <span className="font-bold text-[#B84E73]">
          Informasi Pribadi
        </span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <Link
          href="/profile/settings"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8E3E5E] transition-colors hover:text-[#B84E73]"
        >
          <ArrowLeft size={17} />
          Kembali ke Pengaturan
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73] sm:size-14">
            <UserRoundPen size={25} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#B84E73]">
              Pengaturan Akun
            </p>

            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#332A35] sm:text-3xl">
              Informasi Pribadi
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6F6570]">
              Kelola informasi dasar akunmu agar pengalaman menggunakan
              SYCLE terasa lebih personal. Kamu dapat memperbaruinya
              kapan saja.
            </p>
          </div>
        </div>
      </header>

      {/* Profile Completion */}
      <section className="mb-6 rounded-[22px] border border-[#F0E5EB] bg-white p-5 shadow-[0_5px_24px_rgba(120,70,90,0.04)] sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-[#332A35] sm:text-base">
              Kelengkapan Profil
            </h2>

            <p className="mt-1 text-xs text-[#8A7D89]">
              Informasi dasar akunmu
            </p>
          </div>

          <span className="rounded-full bg-[#F8E8EF] px-3 py-1.5 text-sm font-extrabold tabular-nums text-[#8E3E5E]">
            {completedFields}/4
          </span>
        </div>

        <div
          className="h-2.5 overflow-hidden rounded-full bg-[#F0E5EB]"
          role="progressbar"
          aria-label="Kelengkapan profil"
          aria-valuenow={completedFields}
          aria-valuemin={0}
          aria-valuemax={4}
        >
          <div
            className="h-full rounded-full bg-[#B84E73] transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          {completedFields === 4 ? (
            <>
              <CheckCircle2 size={15} className="text-[#64856B]" />
              <p className="text-xs font-semibold text-[#64856B]">
                Informasi profil sudah lengkap.
              </p>
            </>
          ) : (
            <p className="text-xs leading-5 text-[#8A7D89]">
              {completedFields === 0
                ? "Belum ada informasi yang dilengkapi."
                : `Kamu sudah melengkapi ${completedFields} dari 4 informasi dasar.`}
            </p>
          )}
        </div>
      </section>

      {/* Form */}
      <section className="rounded-[22px] border border-[#F0E5EB] bg-white p-5 shadow-[0_5px_24px_rgba(120,70,90,0.04)] sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold text-[#332A35]">
            Informasi Dasar
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#6F6570]">
            Perbarui informasi berikut sesuai dengan kondisimu.
            Kamu tetap dapat menggunakan SYCLE meskipun belum
            melengkapi seluruh informasi.
          </p>
        </div>

        {profileResult.missingTable ? (
          <div
            role="alert"
            className="rounded-2xl border border-[#E8C9D5] bg-[#FFF8FB] p-4"
          >
            <p className="text-sm font-bold text-[#8E3E5E]">
              Data profil belum tersedia
            </p>
            <p className="mt-1 text-sm leading-6 text-[#6F6570]">
              Tabel profil belum tersedia. Periksa kembali migration
              Supabase.
            </p>
          </div>
        ) : !profileResult.ok ? (
          <div
            role="alert"
            className="rounded-2xl border border-[#E8C9D5] bg-[#FFF8FB] p-4"
          >
            <p className="text-sm font-bold text-[#8E3E5E]">
              Informasi belum dapat dimuat
            </p>
            <p className="mt-1 text-sm leading-6 text-[#6F6570]">
              Terjadi kendala saat mengambil informasi profil.
              Silakan muat ulang halaman atau coba kembali nanti.
            </p>
          </div>
        ) : (
          <ProfileDetailsForm profile={profile} />
        )}
      </section>

      <p className="mt-5 text-center text-xs leading-5 text-[#9A8E98]">
        Informasi pribadi dapat diperbarui melalui halaman Pengaturan.
      </p>
    </main>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-40 rounded-full bg-[#F0E5EB]" />
            <div className="h-14 w-14 rounded-2xl bg-[#F8E8EF]" />
            <div className="h-7 w-56 rounded-lg bg-[#F0E5EB]" />
            <div className="h-4 w-full max-w-lg rounded-lg bg-[#F0E5EB]" />
            <div className="h-28 rounded-[22px] bg-[#F8E8EF]" />
            <div className="h-72 rounded-[22px] bg-[#F0E5EB]" />
          </div>
        </main>
      }
    >
      <CompleteProfileContent />
    </Suspense>
  );
}