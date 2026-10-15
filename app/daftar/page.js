import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { SignUpForm } from "@/components/auth/AuthForms";
import { safeNextPath } from "@/lib/auth/redirect";

export const metadata = { title: "Daftar akun" };

// WF-09 screen 65.
export default async function DaftarPage({ searchParams }) {
  const { next } = await searchParams;
  return (
    <PageShell
      eyebrow="Akun"
      title="Buat akun untuk menggunakan Health Tracker."
      panel={
        <SupportPanel title="Manfaat akun Member">
          <p>Mencatat pengalaman tubuh di Health Tracker.</p>
          <p>Menyimpan catatan secara manual dan membukanya kembali di Riwayat.</p>
          <p>Mengunduh PDF dari catatan yang kamu simpan.</p>
          <p>Info lingkungan, Personalisasi, Info & Edukasi, dan Tanya SYCLE tetap bisa dipakai tanpa akun.</p>
        </SupportPanel>
      }
    >
      <div className="max-w-md">
        <SignUpForm next={next ? safeNextPath(next, "/health-tracker") : ""} />
      </div>
    </PageShell>
  );
}
