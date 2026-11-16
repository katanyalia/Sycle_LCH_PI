"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function ChangeEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ChangeEmailForm />
    </Suspense>
  );
}

function ChangeEmailForm() {
  const searchParams = useSearchParams();
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const verificationReturned =
    searchParams.get("status") === "verification-returned";

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (!error && data?.user) {
        setCurrentEmail(data.user.email || "");
      }

      setChecking(false);
    }

    loadUser();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const email = newEmail.trim().toLowerCase();

    if (!email) {
      setError("Masukkan alamat email baru.");
      return;
    }

    if (email === currentEmail.toLowerCase()) {
      setError("Email baru sama dengan email yang sedang digunakan.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const next = "/profile/security/email?status=verification-returned";
      const emailRedirectTo =
        `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error: updateError } = await supabase.auth.updateUser(
        { email },
        { emailRedirectTo }
      );

      if (updateError) {
        if (updateError.code === "email_exists") {
          setError("Email tersebut sudah digunakan oleh akun lain.");
        } else if (updateError.code === "over_email_send_rate_limit") {
          setError("Terlalu banyak permintaan. Silakan coba lagi beberapa saat.");
        } else if (updateError.code === "same_email") {
          setError("Email baru sama dengan email yang sedang digunakan.");
        } else {
          setError("Permintaan ubah email belum berhasil. Silakan coba kembali.");
        }
        return;
      }

      setSent(true);
      setNewEmail("");
    } catch {
      setError("Terjadi kendala saat mengubah email. Silakan coba kembali.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-6">
        <Link
          href="/profile/security"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#8E3E5E] hover:underline"
        >
          <ArrowLeft size={17} />
          Kembali ke Privasi & Keamanan
        </Link>
      </div>

      <div className="rounded-[22px] border border-[#F0E2E9] bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73]">
            <Mail size={27} />
          </div>

          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#B84E73]">
              Keamanan Akun
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-[#332A35] sm:text-3xl">
              Ubah Email
            </h1>
          </div>
        </div>

        {checking ? (
          <p className="text-sm text-[#6F6570]">Memeriksa akun...</p>
        ) : !currentEmail ? (
          <div className="rounded-xl bg-[#FCEDEF] p-4 text-sm leading-6 text-[#9B344D]">
            Sesi akun tidak ditemukan. Silakan login kembali untuk mengubah email.
            <Link href="/login" className="ml-1 font-extrabold underline">
              Login
            </Link>
          </div>
        ) : verificationReturned ? (
          <div
            role="status"
            className="rounded-xl border border-[#D7E6D9] bg-[#E9F2EA] p-5 text-sm leading-6 text-[#426B4A]"
          >
            <p className="font-extrabold">Tautan konfirmasi telah diproses.</p>
            <p className="mt-1">
              Jika Supabase meminta konfirmasi dari email lama dan email baru,
              pastikan keduanya sudah diselesaikan. Periksa alamat email akun
              setelah proses verifikasi selesai.
            </p>
            <p className="mt-3 font-bold">
              Email akun saat ini: {currentEmail}
            </p>
          </div>
        ) : sent ? (
          <div
            role="status"
            className="rounded-xl border border-[#D7E6D9] bg-[#E9F2EA] p-5 text-sm leading-6 text-[#426B4A]"
          >
            <p className="font-extrabold">Permintaan perubahan email berhasil dikirim.</p>
            <p className="mt-1">
              Silakan periksa email lama dan email baru untuk menyelesaikan
              konfirmasi perubahan alamat email.
            </p>
            <p className="mt-3">
              Email yang saat ini terhubung: <strong>{currentEmail}</strong>
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-4 font-extrabold text-[#426B4A] underline"
            >
              Kembali
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-xl bg-[#F8E8EF] p-4">
              <p className="text-sm font-bold text-[#332A35]">
                Email yang digunakan saat ini
              </p>
              <p className="mt-1 break-all text-sm text-[#6F6570]">
                {currentEmail}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="newEmail"
                  className="mb-2 block text-sm font-bold text-[#332A35]"
                >
                  Alamat email baru
                </label>

                <input
                  id="newEmail"
                  type="email"
                  autoComplete="email"
                  required
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  placeholder="Masukkan email baru"
                  className="w-full rounded-xl border border-[#E8DCE3] bg-white px-4 py-3 text-sm text-[#332A35] outline-none transition focus:border-[#B84E73] focus:ring-2 focus:ring-[#B84E73]/15"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-[#FCEDEF] px-4 py-3 text-sm leading-6 text-[#9B344D]"
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
                {isLoading ? "Mengirim permintaan..." : "Kirim Konfirmasi Email"}
              </Button>
            </form>

            <div className="mt-6 flex gap-3 rounded-xl border border-[#E8F1F7] bg-[#F4F8FB] p-4">
              <ShieldCheck
                size={21}
                className="mt-0.5 shrink-0 text-[#54758A]"
              />
              <p className="text-xs leading-5 text-[#526875]">
                Demi keamanan akun, perubahan email hanya berlaku setelah
                proses konfirmasi melalui Supabase selesai.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}