import Link from "next/link";
import {
  Settings,
  ShieldCheck,
  ChevronRight,
  Mail,
  LogOut,
} from "lucide-react";

import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/repositories/profileRepository";

import LogoutButton from "@/components/profile/LogoutButton";

export const metadata = {
  title: "Profil | Sycle",
};

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "S"
  );
}

function formatDate(value) {
  if (!value) return null;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function MenuItem({ icon: Icon, title, description, href }) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-[#F0E5EB] bg-white p-4 transition-all hover:border-[#DDB3C3] hover:bg-[#FFFBFD] hover:shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F8E8EF] text-[#B84E73] transition-colors group-hover:bg-[#F3DCE6]">
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#332A35]">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-[#8A7D89]">
            {description}
          </p>
        </div>

        <ChevronRight
          size={19}
          className="shrink-0 text-[#A99BA5] transition-transform group-hover:translate-x-1 group-hover:text-[#B84E73]"
        />
      </div>
    </Link>
  );
}

async function ProfileContent() {
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const profileResult = await getProfile(supabase, user.id);
  const profile = profileResult.profile ?? {};

  const displayName =
    profile.full_name ||
    profile.display_name ||
    user.displayName ||
    "Pengguna SYCLE";

  const joinedDate = formatDate(profile.created_at);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">

      {/* Page Heading */}
      <header className="mb-6">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#B84E73]">
          Akun Saya
        </p>

        <h1 className="mt-1 text-2xl font-extrabold text-[#332A35] sm:text-3xl">
          Profil Saya
        </h1>

        <p className="mt-2 text-sm text-[#6F6570]">
          Kelola informasi dan pengaturan akun SYCLE.
        </p>
      </header>

      {/* Profile Identity */}
      <section className="relative overflow-hidden rounded-[22px] border border-[#F0DFE7] bg-[#F8E8EF] p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[#B84E73] text-xl font-extrabold text-white shadow-sm">
            {getInitials(displayName)}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="break-words text-lg font-extrabold text-[#332A35] sm:text-xl">
              {displayName}
            </h2>

            <div className="mt-1 flex items-center gap-2 text-sm text-[#6F6570]">
              <Mail size={14} />
              <span className="break-all">{user.email}</span>
            </div>

            {joinedDate && (
              <p className="mt-1 text-xs text-[#8A7D89]">
                Bergabung sejak {joinedDate}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Database Warning */}
      {profileResult.missingTable && (
        <div className="mt-4 rounded-xl border border-[#E8C8D5] bg-[#FFF8FB] p-4">
          <p className="text-sm text-[#8E3E5E]">
            Data profil belum tersedia. Silakan periksa konfigurasi database Supabase.
          </p>
        </div>
      )}

      {/* Main Menu */}
      <section className="mt-7 space-y-3">
        <MenuItem
          icon={Settings}
          title="Pengaturan"
          description="Kelola informasi pribadi, riwayat, dan penghapusan data akun."
          href="/profile/settings"
        />

        <MenuItem
          icon={ShieldCheck}
          title="Privasi & Keamanan"
          description="Kelola password, alamat email, dan keamanan akunmu."
          href="/profile/security"
        />
      </section>

      {/* Logout */}
      <section className="mt-6 flex flex-col gap-3 rounded-[22px] border border-[#F0E5EB] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#F8E8EF] text-[#B84E73]">
            <LogOut size={18} />
          </div>

          <div>
            <p className="text-sm font-bold text-[#332A35]">
              Keluar dari Akun
            </p>

            <p className="mt-1 text-xs text-[#8A7D89]">
              Akhiri sesi akunmu di perangkat ini.
            </p>
          </div>
        </div>

        <LogoutButton />
      </section>

    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
          <p className="text-sm text-[#6F6570]">
            Memuat profil...
          </p>
        </main>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}