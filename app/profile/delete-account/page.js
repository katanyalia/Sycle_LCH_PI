import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  UserRoundX,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "Penghapusan Data atau Akun | Sycle",
};

export default function DeleteAccountPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">

      {/* Back Navigation */}
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#8E3E5E] hover:text-[#B84E73]"
      >
        <ArrowLeft size={18} />
        Kembali ke Profil
      </Link>

      {/* Heading */}
      <header className="mb-7">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#B84E73]">
          Privasi dan Keamanan
        </p>

        <h1 className="mt-2 text-2xl font-extrabold text-[#332A35] sm:text-3xl">
          Penghapusan Data atau Akun
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#6F6570]">
          Kamu memiliki kendali atas data dan akunmu di SYCLE.
          Pilih tindakan yang ingin kamu lakukan.
        </p>
      </header>

      {/* Delete Health Tracker Data */}
      <Link
        href="/healthtracker/history"
        className="group mb-4 flex items-start gap-4 rounded-[22px] border border-[#F0E5EB] bg-white p-5 transition-colors hover:border-[#DDB3C3] hover:bg-[#FFFBFD] sm:p-6"
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73]">
          <ClipboardList size={23} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-extrabold text-[#332A35]">
            Penghapusan Data Health Tracker
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#6F6570]">
            Lihat dan kelola catatan Health Tracker yang
            tersimpan. Kamu dapat menghapus catatan tertentu
            tanpa harus menghapus akun SYCLE.
          </p>

          <p className="mt-3 text-xs font-bold text-[#52765A]">
            Akun tetap aktif
          </p>
        </div>

        <ChevronRight
          size={20}
          className="mt-1 shrink-0 text-[#A99BA5] transition-transform group-hover:translate-x-1"
        />
      </Link>

      {/* Delete Account */}
      <section className="rounded-[22px] border border-[#E8C8D5] bg-white p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73]">
            <UserRoundX size={23} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-extrabold text-[#332A35]">
              Penghapusan Akun SYCLE
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#6F6570]">
              Penghapusan akun akan mengakhiri aksesmu ke SYCLE
              dan melibatkan penghapusan data pribadi serta
              catatan kesehatan yang terkait.
            </p>

            <div className="mt-4 rounded-xl bg-[#FFF8FB] p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-[#B84E73]" />
                <p className="text-xs font-bold text-[#8E3E5E]">
                  Perlu konfirmasi keamanan
                </p>
              </div>

              <p className="mt-1 text-xs leading-5 text-[#6F6570]">
                Penghapusan akun bersifat permanen dan harus
                melalui proses verifikasi serta konfirmasi.
              </p>
            </div>

            <div className="mt-4 inline-flex items-center rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-bold text-[#8E3E5E]">
              Fitur sedang disiapkan
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}