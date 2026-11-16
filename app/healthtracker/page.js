import Link from "next/link";

import { LogIn, UserPlus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { Suspense } from "react";
import TrackerDashboard from "@/components/healthtracker/TrackerDashboard";
import { getMyTrackerEntries } from "@/lib/tracker/records";

export const metadata = {
  title: "Health Tracker",
};

export default function HealthTrackerPage({ searchParams }) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
          Memuat Health Tracker...
        </main>
      }
    >
      <HealthTrackerContent searchParams={searchParams} />
    </Suspense>
  );
}

async function HealthTrackerContent({ searchParams }) {
  await connection();

  const user = await getCurrentUser();
  const params = await searchParams;
  const isNewUser = params?.welcome === "1";

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-extrabold uppercase tracking-wider text-[#B84E73]">
            Health Tracker
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-[#332A35]">
            Catat pengalaman tubuhmu secara sukarela.
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-[#6F6570]">
            Kamu bisa menggunakan check-in untuk memahami pengalaman
            tubuh dan konteks lingkunganmu. Masuk atau daftar untuk
            mengakses catatan dan riwayat melalui akunmu.
          </p>
        </div>

        <section className="rounded-[22px] bg-[#F8E8EF] p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold text-[#332A35]">
            Sebelum memulai Health Tracker
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-[#6F6570]">
            Dengan akun Member, kamu dapat menyimpan catatan
            check-in dan melihat riwayatnya kembali.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              render={<Link href="/login?next=/healthtracker" />}
              nativeButton={false}
              variant="syclePrimary"
              size="pill"
            >
              <LogIn size={18} />
              Masuk
            </Button>

            <Button
              render={<Link href="/signup?next=/healthtracker" />}
              nativeButton={false}
              variant="sycleOutline"
              size="pill"
            >
              <UserPlus size={18} />
              Daftar akun
            </Button>

            <Button
              render={<Link href="/" />}
              nativeButton={false}
              variant="sycleGhost"
              size="pill"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </section>

        <p className="mt-5 text-sm leading-6 text-[#8A7D89]">
          Catatan kesehatan bersifat pribadi. Check-in tidak digunakan
          untuk mendiagnosis kondisi medis atau membuktikan
          sebab-akibat lingkungan.
        </p>
      </main>
    );
  }

  const { entries, error } = await getMyTrackerEntries();

  return (
    <TrackerDashboard
      entries={entries}
      loadError={error}
      displayName={user.displayName || "Teman SYCLE"}
      isNewUser={isNewUser}
    />
  );
}