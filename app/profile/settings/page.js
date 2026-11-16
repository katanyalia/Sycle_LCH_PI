import Link from "next/link";
import {
  UserRoundPen,
  CalendarDays,
  Database,
  ChevronRight,
  ChevronLeft,
  Settings,
} from "lucide-react";

export const metadata = {
  title: "Pengaturan | Sycle",
};

function SettingMenuItem({ icon: Icon, title, description, href }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-[#F0E5EB] bg-white p-4 transition-all hover:border-[#DDB3C3] hover:bg-[#FFFBFD] hover:shadow-sm"
    >
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
    </Link>
  );
}

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <Link
          href="/profile"
          className="font-medium text-[#8A7D89] transition-colors hover:text-[#B84E73]"
        >
          Profile
        </Link>

        <ChevronRight size={15} className="text-[#B8AAB3]" />

        <span className="font-bold text-[#332A35]">
          Pengaturan
        </span>
      </nav>

      {/* Page Heading */}
      <header className="mb-7">
        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73]">
          <Settings size={23} />
        </div>

        <h1 className="text-2xl font-extrabold text-[#332A35] sm:text-3xl">
          Pengaturan
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#6F6570]">
          Kelola informasi pribadi dan data akun SYCLE kamu.
        </p>
      </header>

      {/* Settings Menu */}
      <section className="space-y-3">

        <SettingMenuItem
          icon={UserRoundPen}
          title="Informasi Pribadi"
          description="Kelola nama lengkap, tanggal lahir, domisili, dan pekerjaan."
          href="/profile/complete"
        />

        <SettingMenuItem
          icon={CalendarDays}
          title="Riwayat"
          description="Lihat dan kelola catatan check-in Health Tracker."
          href="/healthtracker/history"
        />

        <SettingMenuItem
          icon={Database}
          title="Penghapusan Data & Akun"
          description="Kelola penghapusan riwayat atau akun SYCLE."
          href="/profile/delete-account"
        />

      </section>

      {/* Back Button */}
      <div className="mt-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-[#8E3E5E] transition-colors hover:bg-[#F8E8EF] hover:text-[#B84E73]"
        >
          <ChevronLeft size={17} />
          Kembali ke Profile
        </Link>
      </div>

    </main>
  );
}