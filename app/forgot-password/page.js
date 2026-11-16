"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });

      // Batas kirim email dari Supabase (terlalu sering) ditampilkan apa adanya.
      if (resetError && resetError.status === 429) {
        setError("Terlalu banyak permintaan. Tunggu beberapa menit lalu coba lagi.");
        return;
      }

      // Pesan dibuat sama untuk email terdaftar maupun tidak, agar tidak bisa dipakai menebak akun.
      setSent(true);
    } catch {
      setError("Terjadi kendala saat mengirim email. Silakan coba kembali.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-[22px] border border-[#F0E2E9] bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-7 text-center">
          <p className="text-sm font-extrabold uppercase tracking-wider text-[#B84E73]">Lupa Password</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#332A35]">Atur Ulang Password</h1>
          <p className="mt-3 text-sm leading-6 text-[#6F6570]">
            Masukkan email akunmu. Kami akan mengirim tautan untuk membuat password baru.
          </p>
        </div>

        {sent ? (
          <div role="status" className="rounded-xl bg-[#E9F2EA] p-4 text-sm leading-6 text-[#426B4A]">
            Jika email tersebut terdaftar, tautan untuk mengatur ulang password sudah dikirim.
            Periksa kotak masuk atau folder spam, lalu buka tautannya di perangkat ini.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold text-[#332A35]">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-[#E5CCD7] bg-white px-4 py-3 text-sm text-[#332A35] outline-none transition focus:border-[#B84E73] focus:ring-2 focus:ring-[#F8E8EF]"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-[#FCEDEF] px-4 py-3 text-sm leading-6 text-[#9B344D]">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={isLoading} className="w-full">
              {isLoading ? "Mengirim..." : "Kirim Tautan"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#6F6570]">
          Ingat password?{" "}
          <Link href="/login" className="font-extrabold text-[#B84E73] hover:underline">
            Kembali ke Login
          </Link>
        </p>
      </div>
    </section>
  );
}
