import Link from "next/link";
import {
  UserRoundPen,
  ShieldCheck,
  UserRoundX,
  ChevronRight,
  KeyRound,
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
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "S";
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

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F8E8EF] text-[#B84E73]">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-[#8A7D89]">{label}</p>
        <p className="mt-1 break-words text-sm font-bold text-[#332A35]">
          {value || "Belum dilengkapi"}
        </p>
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  title,
  description,
  href,
  disabled = false,
}) {
  const content = (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F8E8EF] text-[#B84E73]">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#332A35]">
          {title}
        </p>

        {description && (
          <p className="mt-1 text-xs leading-5 text-[#8A7D89]">
            {description}
          </p>
        )}
      </div>

      {!disabled && (
        <ChevronRight
          size={18}
          className="shrink-0 text-[#A99BA5]"
        />
      )}
    </div>
  );

  const className =
    "block rounded-2xl border border-[#F0E5EB] bg-white p-4 transition-colors";

  if (disabled) {
    return (
      <div className={`${className} opacity-70`}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`${className} hover:border-[#DDB3C3] hover:bg-[#FFFBFD]`}
    >
      {content}
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

  const completedFields = [
    profile.full_name,
    profile.birth_date,
    profile.domicile,
    profile.occupation,
  ].filter((value) => Boolean(value?.trim?.() || value)).length;

  const isProfileComplete = completedFields === 4;

  const joinedDate = formatDate(profile.created_at);
  const birthDate = formatDate(profile.birth_date);

  const settingGroups = [{
    title: "Pengaturan",
    items: [
      {
        title: "Informasi Pribadi",
        description: "Kelola nama, tanggal lahir, domisili, dan pekerjaan.",
        icon: UserRoundPen,
        href: "/profile/complete",
      },
    ],
  },
  {
    title: "Privasi dan Keamanan",
    items: [
      {
        title: "Ubah Password",
        description: "Perbarui password akunmu.",
        icon: KeyRound,
        href: "/reset-password",
      },
      {
        title: "Kebijakan Privasi",
        description: "Pelajari penggunaan dan perlindungan datamu.",
        icon: ShieldCheck,
        href: "/profile/privacy",
      },
      {
        title: "Penghapusan Data atau Akun",
        description: "Kelola penghapusan catatan atau akun SYCLE.",
        icon: UserRoundX,
        href: "/profile/delete-account",
      },
    ],
  },];

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

      {/* Account Settings */}
      {settingGroups.map((group) => (
        <section key={group.title} className="mt-7">
          <h2 className="mb-3 font-extrabold text-[#332A35]">
            {group.title}
          </h2>

          <div className="grid gap-2 sm:grid-cols-2">
            {group.items.map((item) => (
              <MenuItem
                key={item.title}
                {...item}
              />
            ))}
          </div>
        </section>
      ))}

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