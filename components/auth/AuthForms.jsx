"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LogIn, Mail, KeyRound, UserPlus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { FormError, FormField } from "@/components/auth/FormField";
import { PASSWORD_MIN_LENGTH } from "@/lib/validations/authValidation";
import { signUpAction } from "@/app/daftar/actions";
import { signInAction } from "@/app/masuk/actions";
import { resendVerificationAction } from "@/app/verifikasi-email/actions";
import { requestPasswordResetAction } from "@/app/lupa-password/actions";
import { updatePasswordAction } from "@/app/reset-password/actions";

const INITIAL = { status: "idle" };

// ---------- Daftar (screen 65) ----------
export function SignUpForm({ next }) {
  const [state, action, pending] = useActionState(signUpAction, INITIAL);

  if (state.status === "verify") return <VerifyEmailNotice email={state.email} />;

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormError message={state.message} />
      <FormField id="displayName" label="Nama panggilan" autoComplete="nickname" defaultValue={state.values?.displayName} error={state.errors?.displayName} required />
      <FormField id="email" label="Email" type="email" autoComplete="email" defaultValue={state.values?.email} error={state.errors?.email} required />
      <FormField id="password" label="Kata sandi" type="password" autoComplete="new-password" hint={`Minimal ${PASSWORD_MIN_LENGTH} karakter.`} error={state.errors?.password} required />
      <FormField id="confirmPassword" label="Ulangi kata sandi" type="password" autoComplete="new-password" error={state.errors?.confirmPassword} required />
      <div className="space-y-1.5">
        <div className="flex items-start gap-3 rounded-xl border bg-card p-3">
          <Checkbox id="acknowledged" name="acknowledged" aria-describedby={state.errors?.acknowledged ? "acknowledged-error" : undefined} className="mt-0.5" />
          <Label htmlFor="acknowledged" className="font-normal leading-snug">
            Saya memahami bahwa SYCLE bersifat edukatif dan tidak memberikan diagnosis, serta catatan Health Tracker
            hanya disimpan bila saya memilih Simpan Catatan.
          </Label>
        </div>
        {state.errors?.acknowledged && (
          <p id="acknowledged-error" className="text-sm font-medium text-destructive">
            {state.errors.acknowledged}
          </p>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Mendaftar tidak sama dengan menyetujui penggunaan AI. Persetujuan AI diminta terpisah dan bersifat opsional.
      </p>
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        <UserPlus aria-hidden="true" />
        {pending ? "Memproses…" : "Daftar"}
      </Button>
      <p className="text-sm">
        Sudah punya akun?{" "}
        <Link href={next ? `/masuk?next=${encodeURIComponent(next)}` : "/masuk"} className="font-semibold text-primary-pressed hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}

// ---------- Verifikasi email ----------
export function VerifyEmailNotice({ email }) {
  return (
    <div className="space-y-4">
      <StatusMessage variant="success" title="Cek emailmu untuk verifikasi">
        Jika alamat {email ? <strong>{email}</strong> : "tersebut"} dapat digunakan, kami telah mengirim tautan verifikasi.
        Buka tautan itu untuk mengaktifkan akunmu, lalu masuk.
      </StatusMessage>
      <ResendVerificationForm defaultEmail={email} />
    </div>
  );
}

export function ResendVerificationForm({ defaultEmail }) {
  const [state, action, pending] = useActionState(resendVerificationAction, INITIAL);
  return (
    <form action={action} className="space-y-3 rounded-xl border bg-card p-4" noValidate>
      <p className="font-semibold">Belum menerima email?</p>
      <p className="text-sm text-muted-foreground">Periksa folder spam, atau kirim ulang tautan verifikasi.</p>
      <FormError message={state.message} />
      {state.status === "sent" && (
        <p role="status" className="rounded-lg bg-sage px-3 py-2 text-sm">
          Jika email terdaftar dan belum diverifikasi, tautan baru sudah dikirim.
        </p>
      )}
      <FormField id="email" label="Email" type="email" autoComplete="email" defaultValue={state.values?.email ?? defaultEmail} error={state.errors?.email} />
      <Button type="submit" variant="outline" disabled={pending}>
        <Send aria-hidden="true" />
        {pending ? "Mengirim…" : "Kirim Ulang Tautan"}
      </Button>
    </form>
  );
}

// ---------- Masuk (screen 66, 68) ----------
export function SignInForm({ next }) {
  const [state, action, pending] = useActionState(signInAction, INITIAL);
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormError message={state.message} />
      {state.code === "email_not_confirmed" && (
        <Link href="/verifikasi-email" className="inline-block text-sm font-semibold text-primary-pressed hover:underline">
          Kirim ulang tautan verifikasi
        </Link>
      )}
      <FormField id="email" label="Email" type="email" autoComplete="email" defaultValue={state.values?.email} error={state.errors?.email} required />
      <FormField id="password" label="Kata sandi" type="password" autoComplete="current-password" error={state.errors?.password} required />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          <LogIn aria-hidden="true" />
          {pending ? "Memproses…" : "Masuk"}
        </Button>
        <Link href="/lupa-password" className="text-sm font-semibold text-primary-pressed hover:underline">
          Lupa kata sandi?
        </Link>
      </div>
      <p className="text-sm">
        Belum punya akun?{" "}
        <Link href={next ? `/daftar?next=${encodeURIComponent(next)}` : "/daftar"} className="font-semibold text-primary-pressed hover:underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}

// ---------- Lupa kata sandi (screen 67) ----------
export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, INITIAL);
  if (state.status === "sent") {
    return (
      <StatusMessage variant="success" title="Periksa emailmu">
        Jika email tersebut terdaftar, instruksi pemulihan kata sandi sudah dikirim. Tautan hanya berlaku sementara.
      </StatusMessage>
    );
  }
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormError message={state.message} />
      <FormField id="email" label="Alamat email akun" type="email" autoComplete="email" defaultValue={state.values?.email} error={state.errors?.email} required />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg" disabled={pending}>
          <Mail aria-hidden="true" />
          {pending ? "Mengirim…" : "Kirim"}
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/masuk">Kembali ke Login</Link>
        </Button>
      </div>
    </form>
  );
}

// ---------- Atur ulang kata sandi ----------
export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, INITIAL);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormError message={state.message} />
      <FormField id="password" label="Kata sandi baru" type="password" autoComplete="new-password" hint={`Minimal ${PASSWORD_MIN_LENGTH} karakter.`} error={state.errors?.password} required />
      <FormField id="confirmPassword" label="Ulangi kata sandi baru" type="password" autoComplete="new-password" error={state.errors?.confirmPassword} required />
      <Button type="submit" size="lg" disabled={pending}>
        <KeyRound aria-hidden="true" />
        {pending ? "Menyimpan…" : "Simpan Kata Sandi"}
      </Button>
    </form>
  );
}
