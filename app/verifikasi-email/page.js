import { PageShell } from "@/components/layout/PageShell";
import { ResendVerificationForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Verifikasi email" };

// Verifikasi email (bagian alur WF-09 Daftar → Login).
export default function VerifikasiEmailPage() {
  return (
    <PageShell eyebrow="Akun" title="Verifikasi emailmu." description="Buka tautan verifikasi yang dikirim ke emailmu untuk mengaktifkan akun.">
      <div className="max-w-md">
        <ResendVerificationForm />
      </div>
    </PageShell>
  );
}
