"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordChecklist from "@/components/auth/PasswordChecklist";
import { isStrongPassword } from "@/lib/auth/passwordRules";

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

export default function SignupPage() {
  return (
    <Suspense fallback={<div />}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = getSafeNextPath(searchParams.get("next"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isHealthTrackerNext = nextPath === "/healthtracker";

  const healthTrackerWelcomePath = isHealthTrackerNext
    ? "/healthtracker?welcome=1"
    : nextPath;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!acceptedPrivacy) {
      setError("Kamu perlu menyetujui Kebijakan Privasi sebelum mendaftar.");
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        "Password belum cukup kuat. Gunakan minimal 8 karakter dengan huruf besar, huruf kecil, angka, dan simbol."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password belum cocok.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              privacy_policy_accepted: true,
              privacy_policy_accepted_at: new Date().toISOString(),
            },
          },
        });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      if (data.session) {
        router.push(healthTrackerWelcomePath);
        router.refresh();
        return;
      }

      setSuccess(
        "Pendaftaran berhasil. Silakan periksa email untuk verifikasi sebelum login."
      );
    } catch {
      setError(
        "Terjadi kendala saat membuat akun. Silakan coba kembali."
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
            Mulai Perjalananmu
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-[#332A35]">
            Daftar Sycle
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6F6570]">
            Buat akun untuk menyimpan Daily Check-In dan
            memantau catatan kesehatanmu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-bold text-[#332A35]"
            >
              Nama
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nama lengkap"
              className="w-full rounded-xl border border-[#E5CCD7] px-4 py-3 text-sm outline-none focus:border-[#B84E73] focus:ring-2 focus:ring-[#F8E8EF]"
            />
          </div>

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
              className="w-full rounded-xl border border-[#E5CCD7] px-4 py-3 text-sm outline-none focus:border-[#B84E73] focus:ring-2 focus:ring-[#F8E8EF]"
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
              autoComplete="new-password"
              minLength={8}
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
              Konfirmasi Password
            </label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Ulangi password"
            />
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-2 text-xs font-semibold text-[#9B344D]">
                Konfirmasi password belum cocok.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[#F0E2E9] bg-[#FFFBFD] p-4">
            <label
              htmlFor="acceptedPrivacy"
              className="flex cursor-pointer items-start gap-3"
            >
              <input
                id="acceptedPrivacy"
                type="checkbox"
                required
                checked={acceptedPrivacy}
                onChange={(event) =>
                  setAcceptedPrivacy(event.target.checked)
                }
                className="mt-1 size-4 shrink-0 accent-[#B84E73]"
              />

              <span className="text-sm leading-6 text-[#6F6570]">
                Saya telah membaca dan menyetujui{" "}
                <Link
                  href="/profile/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="font-extrabold text-[#B84E73] underline underline-offset-2"
                >
                  Kebijakan Privasi Sycle
                </Link>
                .
              </span>
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-[#F8E8EF] p-3 text-sm leading-6 text-[#8E3E5E]"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-xl bg-[#E9F2EA] p-3 text-sm leading-6 text-[#426B4A]"
            >
              {success}{" "}
              <Link
                href={
                  isHealthTrackerNext
                    ? `/login?next=${encodeURIComponent(nextPath)}&welcome=1`
                    : `/login?next=${encodeURIComponent(nextPath)}`
                }
                className="font-extrabold underline"
              >
                Lanjut ke login
              </Link>
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full rounded-full"
          >
            {isLoading ? "Sedang membuat akun..." : "Buat Akun"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6F6570]">
          Sudah punya akun?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            className="font-extrabold text-[#B84E73] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}