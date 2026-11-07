"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/auth/PasswordInput";

function getSafeNextPath(path) {
  if (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("\\")
  ) {
    return path;
  }

  return "/";
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = getSafeNextPath(searchParams.get("next"));
  const shouldShowWelcome =
    searchParams.get("welcome") === "1" &&
    nextPath === "/healthtracker";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(
          "Email atau password tidak sesuai. Silakan periksa kembali."
        );
        return;
      }

      const destination = shouldShowWelcome
        ? "/healthtracker?welcome=1"
        : nextPath;

      router.push(destination);
      router.refresh();
    } catch {
      setErrorMessage(
        "Terjadi kendala saat login. Silakan coba kembali."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-[22px] border border-[#F0E2E9] bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-7 text-center">
          <p className="text-sm font-extrabold uppercase tracking-wider text-[#B84E73]">
            Selamat Datang Kembali
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-[#332A35]">
            Login ke Sycle
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6F6570]">
            Masuk untuk melanjutkan catatan kesehatan dan
            Daily Check-In kamu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-bold text-[#332A35]"
            >
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

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-bold text-[#332A35]"
            >
              Password
            </label>

            <PasswordInput
              id="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password"
            />
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-extrabold text-[#B84E73] hover:underline"
              >
                Lupa password?
              </Link>
            </div>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl bg-[#FCEDEF] px-4 py-3 text-sm leading-6 text-[#9B344D]"
            >
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6F6570]">
          Belum punya akun?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(nextPath)}`}
            className="font-extrabold text-[#B84E73] hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </section>
  );
}