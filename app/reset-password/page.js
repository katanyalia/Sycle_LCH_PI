"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordChecklist from "@/components/auth/PasswordChecklist";
import { isStrongPassword } from "@/lib/auth/passwordRules";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkInvalid = searchParams.get("status") === "link-invalid";

  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setHasSession(Boolean(data?.user));
      setChecking(false);
    });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!isStrongPassword(password)) {
      setError("Password belum memenuhi semua syarat.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password belum cocok.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(
          updateError.code === "same_password"
            ? "Password baru harus berbeda dari password lama."
            : "Password belum bisa diubah. Silakan coba kembali."
        );
        return;
      }

      setDone(true);

      setTimeout(() => {
        router.push("/profile");
        router.refresh();
      }, 1500);
    } catch {
      setError("Terjadi kendala saat mengubah password. Silakan coba kembali.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-10">
      {/* Kembali ke Profil */}
      <div className="mb-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#8E3E5E] transition hover:text-[#B84E73] hover:underline"
        >
          <ArrowLeft size={17} />
          Kembali ke Profil
        </Link>
      </div>

      <div className="rounded-[22px] border border-[#F0E2E9] bg-white p-7 shadow-sm sm:p-9">
        {/* Header */}
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73]">
            <KeyRound size={27} />
          </div>

          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#B84E73]">
              Keamanan Akun
            </p>

            <h1 className="mt-1 text-2xl font-extrabold text-[#332A35] sm:text-3xl">
              Ubah Password
            </h1>

            <p className="mt-1 text-sm text-[#6F6570]">
              Buat password baru untuk menjaga keamanan akunmu.
            </p>
          </div>
        </div>

        {/* Memeriksa sesi */}
        {checking ? (
          <div className="rounded-xl bg-[#F8E8EF] p-5 text-center">
            <p className="text-sm text-[#6F6570]">
              Memeriksa sesi akun...
            </p>
          </div>
        ) : !hasSession ? (
          <div className="space-y-4">
            <div
              role="alert"
              className="rounded-xl border border-[#F3D7DE] bg-[#FCEDEF] p-5"
            >
              <p className="text-sm font-bold text-[#9B344D]">
                {linkInvalid
                  ? "Tautan tidak valid atau sudah kedaluwarsa."
                  : "Sesi pemulihan password tidak ditemukan."}
              </p>

              <p className="mt-2 text-sm leading-6 text-[#9B344D]">
                Silakan buka halaman ini melalui tautan pemulihan dari email
                atau login terlebih dahulu.
              </p>
            </div>

            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-[#B84E73] hover:underline"
            >
              Kirim ulang tautan atur ulang password
            </Link>
          </div>
        ) : done ? (
          <div
            role="status"
            className="rounded-xl border border-[#D7E6D9] bg-[#E9F2EA] p-5"
          >
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={23}
                className="mt-0.5 shrink-0 text-[#426B4A]"
              />

              <div>
                <p className="text-sm font-extrabold text-[#426B4A]">
                  Password berhasil diubah!
                </p>

                <p className="mt-1 text-sm leading-6 text-[#426B4A]">
                  Password akunmu sudah diperbarui. Mengarahkan ke halaman
                  Profil...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Informasi */}
            <div className="mb-6 rounded-xl bg-[#F8E8EF] p-4">
              <p className="text-sm leading-6 text-[#6F6570]">
                Gunakan password yang kuat dan berbeda dari password
                sebelumnya. Pastikan kamu mengingat password barumu.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-[#332A35]"
                >
                  Password baru
                </label>

                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Buat password yang kuat"
                />

                <PasswordChecklist value={password} />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-bold text-[#332A35]"
                >
                  Konfirmasi password baru
                </label>

                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Ulangi password baru"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-[#F3D7DE] bg-[#FCEDEF] px-4 py-3 text-sm leading-6 text-[#9B344D]"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
              </Button>
            </form>

            <div className="mt-6 flex gap-3 rounded-xl border border-[#E8F1F7] bg-[#F4F8FB] p-4">
              <ShieldCheck
                size={21}
                className="mt-0.5 shrink-0 text-[#54758A]"
              />

              <p className="text-xs leading-5 text-[#526875]">
                Jangan membagikan password kepada siapa pun. SYCLE tidak
                akan meminta password akunmu melalui pesan pribadi.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}