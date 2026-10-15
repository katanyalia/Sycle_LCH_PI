import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Lupa kata sandi" };

// WF-09 screen 67 — pemulihan akses akun.
export default function LupaPasswordPage() {
  return (
    <PageShell
      eyebrow="Akun"
      title="Pulihkan akses ke akunmu."
      panel={
        <SupportPanel title="Keamanan">
          <p>Instruksi pemulihan dikirim melalui email. SYCLE tidak menampilkan apakah sebuah email terdaftar.</p>
        </SupportPanel>
      }
    >
      <div className="max-w-md">
        <ForgotPasswordForm />
      </div>
    </PageShell>
  );
}
