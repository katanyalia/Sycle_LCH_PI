import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, UserRound } from "lucide-react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/repositories/profileRepository";

export const metadata = { title: "Profil" };

// WF-10 screen 69 — Profil Member. Guest dialihkan ke /masuk oleh proxy.js; pemeriksaan ulang di sini.
export default async function ProfilPage({ searchParams }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/masuk?next=/profil");

  const { "kata-sandi": passwordStatus } = await searchParams;
  const profileResult = await getProfile(supabase, claims.sub);
  const displayName = profileResult.profile?.display_name ?? claims.user_metadata?.display_name ?? "";
  const joined = profileResult.profile?.created_at
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(profileResult.profile.created_at))
    : null;

  return (
    <PageShell
      eyebrow="Profil"
      title="Kelola akun dan pengaturanmu."
      panel={
        <SupportPanel title="Privasi">
          <p>Informasi profil hanya dapat diakses olehmu.</p>
          <p>Persetujuan AI tidak dianggap permanen hanya karena kamu punya akun.</p>
        </SupportPanel>
      }
    >
      {passwordStatus === "diperbarui" && (
        <StatusMessage variant="success" title="Kata sandi berhasil diperbarui" />
      )}
      {profileResult.missingTable && (
        <StatusMessage variant="partial" title="Tabel profil belum tersedia">
          Migration database profil belum dijalankan. Nama ditampilkan dari data akun.
        </StatusMessage>
      )}

      <section aria-labelledby="judul-akun" className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
        <h2 id="judul-akun" className="flex items-center gap-2 text-lg font-semibold">
          <UserRound className="size-5 text-primary-pressed" aria-hidden="true" />
          Informasi profil
        </h2>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
          <dt className="font-semibold">Email</dt>
          <dd>{claims.email}</dd>
          {joined && (
            <>
              <dt className="font-semibold">Bergabung</dt>
              <dd>{joined}</dd>
            </>
          )}
        </dl>
        <div className="max-w-md">
          <ProfileForm displayName={displayName} />
        </div>
      </section>

      <section aria-labelledby="judul-pengaturan" className="space-y-3 rounded-xl border bg-card p-4 md:p-6">
        <h2 id="judul-pengaturan" className="text-lg font-semibold">Pengaturan akun</h2>
        <Link href="/lupa-password" className="inline-block font-semibold text-primary-pressed hover:underline">
          Ubah kata sandi lewat email
        </Link>
      </section>

      <section aria-labelledby="judul-privasi" className="space-y-3">
        <h2 id="judul-privasi" className="flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck className="size-5 text-primary-pressed" aria-hidden="true" />
          Privasi dan pengelolaan data
        </h2>
        <div className="space-y-3 rounded-xl border bg-card p-4 md:p-6">
          <p className="text-sm text-muted-foreground">
            Penjelasan penyimpanan dan AI, Riwayat catatan, serta penghapusan catatan atau akun.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/profil/privasi">Kelola Data</Link>
          </Button>
        </div>
      </section>

      <LogoutButton />
    </PageShell>
  );
}
