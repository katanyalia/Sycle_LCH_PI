import Link from "next/link";
import {
  KeyRound,
  Mail,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  LockKeyhole,
} from "lucide-react";

export const metadata = {
  title: "Privasi & Keamanan | Sycle",
};

function SecurityMenuItem({
  icon: Icon,
  title,
  description,
  href,
  disabled = false,
}) {
  const className = `flex items-center gap-4 rounded-2xl border border-[#F0E5EB] bg-white p-4 transition-all ${
    disabled
      ? "cursor-not-allowed opacity-65"
      : "group hover:border-[#DDB3C3] hover:bg-[#FFFBFD] hover:shadow-sm"
  }`;

  const content = (
    <>
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F8E8EF] text-[#B84E73] ${
        disabled ? "" : "transition-colors group-hover:bg-[#F3DCE6]"
      }`}>
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#332A35]">
          {title}
        </p>

        <p className={`mt-1 text-xs leading-5 ${
          disabled ? "font-semibold text-[#B84E73]" : "text-[#8A7D89]"
        }`}>
          {description}
        </p>
      </div>

      {!disabled && (
        <ChevronRight
          size={19}
          className="shrink-0 text-[#A99BA5] transition-transform group-hover:translate-x-1 group-hover:text-[#B84E73]"
        />
      )}
    </>
  );

  if (disabled) {
    return (
      <div
        aria-disabled="true"
        className={className}
      >
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export default function SecurityPage() {
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
          Privasi & Keamanan
        </span>
      </nav>

      {/* Page Heading */}
      <header className="mb-7">
        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73]">
          <LockKeyhole size={23} />
        </div>

        <h1 className="text-2xl font-extrabold text-[#332A35] sm:text-3xl">
          Privasi & Keamanan
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#6F6570]">
          Lindungi akun SYCLE dan kelola keamanan informasi pribadimu.
        </p>
      </header>

      {/* Security Menu */}
      <section className="space-y-3">

        <SecurityMenuItem
          icon={KeyRound}
          title="Ubah Password"
          description="Perbarui password untuk menjaga keamanan akunmu."
          href="/reset-password"
        />

        <SecurityMenuItem
          icon={Mail}
          title="Ubah Email"
          description="Perbarui alamat email yang digunakan untuk masuk ke SYCLE."
          href="/profile/security/email"
        />

        <SecurityMenuItem
        icon={ShieldCheck}
        title="Two-Factor Authentication (2FA)"
        description="Dalam pengerjaan"
        disabled
        />

      </section>

      {/* Security Information */}
      <div className="mt-6 rounded-2xl border border-[#E9F2EA] bg-[#F5FAF5] p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-[#52775B]"
          />

          <div>
            <p className="text-sm font-bold text-[#332A35]">
              Jaga keamanan akunmu
            </p>

            <p className="mt-1 text-xs leading-5 text-[#6F6570]">
              Gunakan password yang kuat dan jangan membagikan kode verifikasi kepada orang lain.
            </p>
          </div>
        </div>
      </div>

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